# Supabase Edge Functions: Server-Side Gemini Extraction & Explanation

This guide explains how the AICTE PRAMAN platform uses server-side Supabase Edge Functions with Gemini Flash to securely extract statutory documents and explain regulatory findings without ever exposing the Gemini API key to client browsers.

---

## 1. Edge Functions Overview

| Function Name | Path | Trigger & Input | Purpose |
|---|---|---|---|
| **`extract-document`** | `/supabase/functions/extract-document/index.ts` | POST `{ "document_id": "<uuid>" }` + Caller JWT | Verifies caller authorization/RBAC, securely downloads file from private storage bucket using Service Role, calls Gemini Flash with structured JSON schema, inserts extracted fields into `public.extracted_fields`, and triggers rules engine. |
| **`explain-finding`** | `/supabase/functions/explain-finding/index.ts` | POST `{ "finding": { ... } }` | Takes structured finding metadata (never raw documents), calls Gemini Flash to generate plain-language explanation and recommended remediation next steps for institutions and scrutiny officers. |

---

## 2. Setting Environment Variables & Secrets

The Gemini API key stays strictly server-side inside Supabase's secure environment.

### Using the Supabase CLI:
From your terminal in the project directory, run:

```bash
# Set your Gemini API key (from Google AI Studio)
supabase secrets set GEMINI_API_KEY="AIzaSy..."

# (Optional) Set the target Gemini Flash model name (defaults to gemini-2.5-flash)
supabase secrets set GEMINI_MODEL="gemini-2.5-flash"
```

To list and verify configured secrets:
```bash
supabase secrets list
```

### Using the Supabase Dashboard:
1. Go to your **Supabase Project Dashboard** (`https://supabase.com/dashboard/project/<your-project-id>`).
2. In the left navigation, click on **Edge Functions**.
3. Click on the **Secrets** tab (or **Project Settings** → **Vault / Secrets**).
4. Add:
   - Name: `GEMINI_API_KEY` | Value: `your-api-key`
   - Name: `GEMINI_MODEL` | Value: `gemini-2.5-flash`

---

## 3. Deploying the Edge Functions

### Option A: Using the Supabase CLI (Recommended)

1. **Log in to Supabase CLI**:
   ```bash
   supabase login
   supabase link --project-ref <your-supabase-project-id>
   ```

2. **Deploy the `extract-document` function**:
   ```bash
   supabase functions deploy extract-document
   ```

3. **Deploy the `explain-finding` function**:
   ```bash
   supabase functions deploy explain-finding
   ```

### Option B: Deploying via Supabase Dashboard
1. Open **Edge Functions** in your Supabase project dashboard.
2. Click **Create Function**.
3. Enter `extract-document` and paste the contents of `/supabase/functions/extract-document/index.ts`.
4. Click **Deploy**. Repeat for `explain-finding`.

---

## 4. Swapping Extraction Providers (FastAPI + PaddleOCR)

The client application implements a clean provider abstraction:

```ts
// /src/services/extraction/types.ts
export interface ExtractionProvider {
  readonly name: string;
  readonly version: string;
  extract(payload: ExtractionFilePayload): Promise<ExtractionResult>;
}
```

Two concrete implementations are provided out-of-the-box in `/src/services/extraction/providers.ts`:
1. **`GeminiProvider`** (Default): Calls the Supabase Edge Function with structured JSON output and approximate region bounding boxes.
2. **`PaddleOcrFastApiProvider`**: Ready to connect to your on-premises or cloud FastAPI + PaddleOCR container.

### How to activate your FastAPI + PaddleOCR microservice:
1. Run your FastAPI + PaddleOCR service at an accessible endpoint (e.g., `http://localhost:8000/api/ocr-extract`).
2. Set the environment variable in your `.env`:
   ```env
   VITE_OCR_SERVICE_URL="http://localhost:8000/api/ocr-extract"
   ```
3. In `/src/services/extraction/providers.ts`, switch the default in `getExtractionProvider`:
   ```ts
   export function getExtractionProvider(providerType: 'gemini' | 'paddle_ocr' = 'paddle_ocr'): ExtractionProvider { ... }
   ```
   **No UI or rules engine code needs to be altered!**

---

## 5. Security & Boundary Rules Enforced

1. **Service Role Security**: The service role key is used solely inside the serverless edge function runtime to read the private storage bucket. The frontend client uses only `VITE_SUPABASE_ANON_KEY`.
2. **RBAC Isolation**: Institution callers can only extract documents belonging to their own institution (`applications.institution_id === user.institution_id`). Scrutiny officers and admins can extract all submissions.
3. **Structured Output Only**: Gemini returns strict schema adhering to `doc_type` and `fields` array.
4. **Abstain Threshold**: Any field with confidence `< 0.70` is stored with `status = 'needs_manual_review'` and labeled as approximate region.
5. **No Decision Making by AI**: Gemini only extracts text and coordinates. Pass/fail decisions are strictly executed by the deterministic versioned rules engine (`/src/rules/engine.ts`).
6. **Immutable Manual Correction**: When an officer or institution edits a field value, it is tagged with `source = 'manual'`, triggering smart re-validation of affected rules while preserving audit history.
