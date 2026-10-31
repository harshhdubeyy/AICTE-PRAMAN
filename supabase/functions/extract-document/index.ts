/**
 * Supabase Edge Function: extract-document (Deno)
 *
 * Extracts structured statutory fields from uploaded application documents
 * using the latest Gemini Flash model with structured JSON outputs.
 *
 * Security:
 * - Verifies caller JWT and RBAC (Institution may only extract their own documents; Officers/Admins have full access).
 * - Downloads document securely from private storage bucket using Service Role.
 * - API key remains server-side in Edge Function environment (GEMINI_API_KEY).
 *
 * Rule:
 * - Gemini ONLY extracts. It never decides pass or fail.
 * - Fields with confidence < 0.70 are flagged with low_confidence and status 'needs_manual_review'.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestPayload {
  document_id: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
    const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not set. Configure it via 'supabase secrets set GEMINI_API_KEY=...'",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify caller authorization JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized caller token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { document_id }: RequestPayload = await req.json();
    if (!document_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: document_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Query document metadata and verify access
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: docData, error: docError } = await adminClient
      .from("documents")
      .select("*, applications!inner(institution_id)")
      .eq("id", document_id)
      .single();

    if (docError || !docData) {
      return new Response(
        JSON.stringify({ error: `Document ${document_id} not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile to check role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, institution_id")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "institution";
    const userInstitutionId = profile?.institution_id;

    if (userRole === "institution" && userInstitutionId !== docData.applications.institution_id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You do not have permission to access this document." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Download document bytes from private storage bucket "documents"
    const storagePath = docData.storage_path;
    const { data: fileBlob, error: downloadError } = await adminClient.storage
      .from("documents")
      .download(storagePath);

    if (downloadError || !fileBlob) {
      return new Response(
        JSON.stringify({ error: `Failed to download document from storage: ${downloadError?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to base64
    const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());
    let binary = "";
    const len = fileBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(fileBytes[i]);
    }
    const base64Data = btoa(binary);
    const mimeType = docData.mime_type || "application/pdf";

    // 4. Call Gemini Flash with structured JSON schema
    const prompt = `You are a specialized OCR extraction engine for the All India Council for Technical Education (AICTE) PRAMAN portal.
Your task is to extract factual text fields from this official statutory document according to the provided schema.

CRITICAL INSTRUCTIONS:
1. Extract ONLY information explicitly present in the document.
2. Return null for any field not present. NEVER guess, assume, or hallucinate.
3. Assess field extraction confidence between 0.0 and 1.0 based on legibility, seal clarity, and OCR certainty.
4. Estimate normalized bounding boxes {x, y, width, height} in pixels relative to page dimensions.
5. You are an extraction engine ONLY. You must NEVER decide pass or fail.

Recognized field keys to check:
- institution_name
- address
- document_number
- issuing_authority
- issue_date
- expiry_date
- signatory
- land_survey_no
- total_land_area
- total_built_up_area
- structural_engineer_reg_no
- epf_challan_number`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            doc_type: {
              type: "STRING",
              enum: [
                "Land Deed",
                "Building Plan",
                "Fire NOC",
                "Trust Deed",
                "Affidavit",
                "Faculty List",
                "Sanction Plan",
                "Other",
              ],
            },
            fields: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  field_key: { type: "STRING" },
                  value: { type: "STRING", nullable: true },
                  confidence: { type: "NUMBER" },
                  page: { type: "INTEGER" },
                  bbox: {
                    type: "OBJECT",
                    properties: {
                      x: { type: "NUMBER" },
                      y: { type: "NUMBER" },
                      width: { type: "NUMBER" },
                      height: { type: "NUMBER" },
                    },
                    required: ["x", "y", "width", "height"],
                  },
                },
                required: ["field_key", "confidence", "page"],
              },
            },
          },
          required: ["doc_type", "fields"],
        },
      },
    };

    // Execute Gemini call with 1 retry on transient failure
    let geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok && (geminiResponse.status === 429 || geminiResponse.status >= 500)) {
      // Exponential backoff retry once
      await new Promise((resolve) => setTimeout(resolve, 1500));
      geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });
    }

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error (${geminiResponse.status}): ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiJson = await geminiResponse.json();
    const candidateText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return new Response(
        JSON.stringify({ error: "Gemini did not return any candidate content" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsedExtraction = JSON.parse(candidateText);
    const { doc_type, fields = [] } = parsedExtraction;

    // 5. Insert results into extracted_fields table
    // Delete existing machine-extracted fields for this document to avoid duplicates
    await adminClient
      .from("extracted_fields")
      .delete()
      .eq("document_id", document_id)
      .neq("source", "manual");

    const fieldsToInsert = fields
      .filter((f: any) => f.value !== null && f.value !== undefined)
      .map((f: any) => {
        const isLowConfidence = (f.confidence ?? 1.0) < 0.70;
        return {
          document_id,
          field_key: f.field_key,
          value: String(f.value),
          confidence: Number(f.confidence ?? 0.95),
          page: Number(f.page ?? 1),
          bbox: f.bbox ? { ...f.bbox, is_approximate_region: true } : null,
          source: `Gemini Flash (${geminiModel})`,
          status: isLowConfidence ? "needs_manual_review" : "passed",
          notes: isLowConfidence ? "Low extraction confidence (< 70%). Manual review required." : null,
        };
      });

    if (fieldsToInsert.length > 0) {
      const { error: insertError } = await adminClient
        .from("extracted_fields")
        .insert(fieldsToInsert);

      if (insertError) {
        console.error("Error inserting extracted fields:", insertError);
      }
    }

    // 6. Update document status and OCR confidence in documents table
    const avgConfidence = fields.length > 0
      ? fields.reduce((acc: number, f: any) => acc + (f.confidence || 0), 0) / fields.length
      : 0.95;

    await adminClient
      .from("documents")
      .update({
        ocr_status: "Extracted",
        ocr_confidence: avgConfidence,
        doc_type: doc_type || docData.doc_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", document_id);

    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        doc_type,
        extracted_fields_count: fieldsToInsert.length,
        fields: fieldsToInsert,
        average_confidence: avgConfidence,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
