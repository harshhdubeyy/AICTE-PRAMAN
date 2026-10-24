# AICTE PRAMAN

### AI-Powered Regulatory Application Validation & Compliance Platform

AICTE PRAMAN is a regulatory workflow platform concept designed to simplify institutional application scrutiny, document verification, compliance monitoring, and approval tracking for the All India Council for Technical Education (AICTE).

The platform provides dedicated workspaces for regulatory officers and institutional applicants, bringing application management, validation findings, clarification requests, inspection scheduling, and decision tracking into a unified interface.

## Key Features

### 1. Officer Dashboard
- Overview of institutional applications and review activities.
- Application register with selectable application records.
- Access to detailed validation reports and compliance findings.
- Monitoring of pending clarifications and inspections.

### 2. Institution Dashboard
- Dedicated portal for institutional applicants.
- Application creation and application status tracking.
- Document organization and submission management.
- Infrastructure information and validation report views.

### 3. Document Validation & Compliance
- Rule-based checks for mandatory document availability.
- Identification of expired certificates.
- Detection of discrepancies in extracted and claimed document fields.
- Flagging of suspicious records and cases requiring manual review.
- Compliance findings with severity levels, explanations, and suggested corrective actions.

### 4. Clarification Management
- Submission of clarification requests.
- Responses to regulatory queries.
- Document resubmission workflows.
- Tracking of clarification status.

### 5. Inspection & Decision Management
- Inspection scheduling and review workflows.
- Manual review flags for applications requiring additional scrutiny.
- Application approval and decision management.
- Officer notes and review history.

### 6. Audit Trail
- Structured audit trail interface for review activities.
- Application-level traceability and decision history.
- Improved visibility into the regulatory review process.

### 7. Compliance Rules Engine
- Configurable application-type-specific mandatory document checklists.
- Rule-based validation findings.
- Severity classification and rule references.
- Support for multiple application categories, including new institutions, extension of approval, changes in programmes, intake increases, and programme closure.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Animations | Motion |
| Charts | Recharts |
| AI integration dependency | Google GenAI SDK |

## Project Structure

```text
aicte-praman/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── DataTable.tsx
│   │   ├── DocumentViewer.tsx
│   │   ├── FindingRow.tsx
│   │   └── ...
│   ├── data/
│   │   └── seedData.ts
│   ├── rules/
│   │   └── rules.ts
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── OfficerDashboard.tsx
│   │   ├── InstitutionDashboard.tsx
│   │   └── ...
│   ├── store/
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js and npm
- A code editor such as Visual Studio Code
- A Google Gemini API key if you enable the corresponding AI integration

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd aicte-praman
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root if you are using the Gemini integration.

```env
GEMINI_API_KEY=your_gemini_api_key
```

Keep API keys private. Do not commit `.env.local` or expose secret keys in browser-side code. Any production AI integration should route secret-bearing requests through a secure backend.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal. The project's Vite configuration uses port `3000` by default.

### 5. Build for production

```bash
npm run build
```

The production build is generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

To check TypeScript errors:

```bash
npm run lint
```

## Application Workflow

1. **Application submission:** An institution creates an application for the relevant approval category.
2. **Document management:** The institution organizes and submits the required supporting documents.
3. **Compliance validation:** The validation engine checks mandatory document presence and evaluates available document fields.
4. **Findings generation:** Missing, expired, mismatched, suspicious, or uncertain records are flagged for appropriate action.
5. **Clarification and resubmission:** The institution responds to queries and submits corrected information.
6. **Officer scrutiny:** Regulatory officers examine reports, request inspections, and review flagged cases.
7. **Decision and tracking:** Application decisions and review activities are managed through the platform.

## Current Implementation Scope

The supplied project includes the React user interface, application state management, seeded demonstration data, application workflow screens, and a deterministic rule-based validation engine.

**Important:** The current code should be treated as a prototype or demonstration unless the relevant production services are separately implemented and connected. The presence of an AI SDK dependency or environment variable does not by itself establish that live OCR, document authenticity verification, or Gemini-powered analysis is operational.

A production deployment would require appropriate backend APIs, secure authentication and role-based authorization, persistent database storage, real document processing, verified regulatory rule sources, and security and privacy controls.

The seeded data and rule references should be validated against official AICTE publications before they are used for real regulatory decisions. Automated findings should support, rather than replace, authorized human review.

## Future Enhancements

- Backend API integration and persistent database storage.
- OCR-based extraction of fields from uploaded documents.
- AI-assisted document classification and cross-document verification.
- Document integrity checks and duplicate detection.
- Secure officer and institution authentication.
- Notifications for pending clarifications and expiring documents.
- Production audit logging, reporting, and deployment monitoring.

## Intended Impact

AICTE PRAMAN aims to reduce repetitive manual scrutiny, improve the consistency of application checks, make missing documentation easier to identify, and provide institutions and officers with clearer visibility into the approval workflow.

## Disclaimer

AICTE PRAMAN is a project prototype and is not an official AICTE service unless formally authorized. References to regulatory rules and approval processes must be verified against current official documentation. The prototype's outputs are not official approval decisions.

## License

Choose an appropriate license before distributing the repository publicly. If no license is provided, the default copyright restrictions apply.

