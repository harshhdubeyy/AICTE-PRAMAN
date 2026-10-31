/**
 * Supabase Edge Function: explain-finding (Deno)
 *
 * Takes a structured finding (rule_code, rule_title, field_key, values, status, explanation)
 * and uses Gemini Flash to generate a plain-language explanation and recommended remediation steps.
 *
 * PRIVACY & BOUNDARY:
 * Receives ONLY the structured finding metadata, NOT raw documents or PII.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ExplainFindingPayload {
  finding: {
    rule_code: string;
    rule_title: string;
    status: string;
    field_key?: string;
    value_a?: string;
    value_b?: string;
    explanation?: string;
    source_reference?: string;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
    const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { finding }: ExplainFindingPayload = await req.json();
    if (!finding) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: finding" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a statutory compliance advisor for the All India Council for Technical Education (AICTE) PRAMAN platform.
Given this structured finding, produce an objective, plain-language explanation and concrete next steps.
Note: AI results are decision support. Final decision rests with the authorized scrutiny officer. Never use the word "fraud".

Structured Finding:
- Rule: ${finding.rule_code} (${finding.rule_title})
- Status: ${finding.status}
- Field: ${finding.field_key || "N/A"}
- Extracted Value: ${finding.value_a || "N/A"}
- Reference / Baseline: ${finding.value_b || "N/A"}
- Preliminary Reason: ${finding.explanation || "N/A"}
- Statutory Citation: ${finding.source_reference || "AICTE APH 2024-27"}

Return JSON with:
1. plain_explanation: Clear, non-technical explanation of the regulatory gap or variance.
2. next_steps: Step-by-step actionable remediation advice for the institution and officer.
3. statutory_significance: Why this rule matters under the AICTE Approval Process Handbook.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              plain_explanation: { type: "STRING" },
              next_steps: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              statutory_significance: { type: "STRING" },
            },
            required: ["plain_explanation", "next_steps", "statutory_significance"],
          },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiJson = await geminiResponse.json();
    const candidateText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = candidateText ? JSON.parse(candidateText) : {};

    return new Response(
      JSON.stringify({
        success: true,
        finding_id: finding.rule_code,
        explanation: parsed.plain_explanation,
        next_steps: parsed.next_steps,
        statutory_significance: parsed.statutory_significance,
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
