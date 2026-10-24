export type UserRole = 'officer' | 'institution';

export type ValidationStatus =
  | 'Passed'
  | 'Missing'
  | 'Mismatch'
  | 'Expired'
  | 'Suspicious'
  | 'Needs Manual Review'
  | 'Verification Unavailable'
  | 'Ready for Decision';

export type ApplicationType =
  | 'Extension of Approval'
  | 'New Institution'
  | 'Change in Program'
  | 'Increase in Intake'
  | 'Closure of Program';

export interface Institution {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  type: string;
  trustName: string;
  landSurveyNo: string;
  address: string;
  pincode: string;
  establishedYear: number;
}

export interface ExtractedField {
  fieldName: string;
  extractedValue: string;
  claimedValue: string;
  confidence: number;
  pageNumber: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  status: ValidationStatus;
  notes?: string;
}

export interface AppDocument {
  id: string;
  applicationId: string;
  name: string;
  category: 'Land & Ownership' | 'Building & Safety' | 'Faculty & Pay' | 'Financial Documents' | 'Infrastructure' | 'Legal & Governance';
  documentType: string;
  fileName: string;
  fileSize: string;
  version: string;
  uploadedAt: string;
  ocrStatus: 'Extracted' | 'Processing' | 'Failed' | 'Low Confidence';
  ocrConfidence: number;
  fileHash: string; // SHA-256 for duplicate checking
  extractedFields: ExtractedField[];
  validUntil?: string; // e.g., '2026-03-12'
  status: ValidationStatus;
  externalVerification?: {
    source: 'DigiLocker' | 'UGC' | 'NAAC' | 'State Revenue' | 'State Sub-Registrar';
    isSimulated: boolean;
    timestamp: string;
    verified: boolean;
  };
}

export interface RuleDefinition {
  rule_code: string;
  title: string;
  description: string;
  application_type: 'ALL' | ApplicationType;
  version: string;
  effective_from: string;
  source_reference: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

export interface ValidationFinding {
  id: string;
  applicationId: string;
  status: ValidationStatus;
  rule_code: string;
  ruleTitle: string;
  documentName: string;
  documentId: string;
  page: number;
  field: string;
  extractedValue: string;
  claimedValue: string;
  confidence: number;
  explanation: string;
  suggestedAction: string;
  whyLine?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sourceReference: string;
}

export interface ValidationRun {
  runId: string;
  timestamp: string;
  ruleVersion: string;
  findingsCount: {
    passed: number;
    missing: number;
    mismatch: number;
    expired: number;
    suspicious: number;
    needsReview: number;
  };
  overallConfidence: number;
  recommendedAction: string;
  findings: ValidationFinding[];
}

export interface Application {
  id: string;
  applicationNumber: string;
  institutionId: string;
  institutionName: string;
  academicYear: string;
  applicationType: ApplicationType;
  submittedAt: string;
  status: ValidationStatus;
  stage: 'Submitted' | 'AI Validation' | 'Officer Review' | 'Final Decision';
  overallConfidence: number;
  recommendedAction: 'Approve to Next Stage' | 'Seek Clarification' | 'Request Inspection' | 'Needs Manual Review';
  documentCounts: {
    uploaded: number;
    totalRequired: number;
  };
  completenessPercentage: number;
  latestRun: ValidationRun;
  runHistory: ValidationRun[];
  officerObservation?: string;
  assignedOfficer?: string;
}

export interface ClarificationQuery {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionId: string;
  institutionName: string;
  officerName: string;
  subject: string;
  queryText: string;
  fieldReference?: string;
  createdAt: string;
  status: 'Open' | 'Replied' | 'Resolved';
  replies: {
    id: string;
    senderRole: UserRole;
    senderName: string;
    message: string;
    timestamp: string;
    attachmentName?: string;
  }[];
}

export interface InspectionSchedule {
  id: string;
  applicationId: string;
  institutionName: string;
  date: string;
  committeeLead: string;
  status: 'Scheduled' | 'Completed' | 'Report Submitted';
  purpose: string;
  location: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | 'System AI';
  action: string;
  applicationId: string;
  applicationNumber: string;
  ruleVersion: string;
  details: string;
  isSimulatedExternal?: boolean; // For DigiLocker / UGC mock external checks
  externalSource?: 'DigiLocker' | 'UGC' | 'NAAC' | 'State Sub-Registrar';
}

export interface InfrastructureFacility {
  id: string;
  name: string;
  unitsActive: string;
  subtitle: string;
  status: 'AI Compliant / Verified' | 'Needs Review (Deficiency Flagged)';
  submissionRate: number;
  statsText: string;
  media: {
    title: string;
    type: 'geotagged' | 'video' | 'cad' | 'drone' | 'certificate';
    badge: string;
    subtitle: string;
    metaInfo: string;
    coordinates?: string;
    imageUrl: string;
  }[];
  metrics: {
    label: string;
    value: string;
    normInfo: string;
    isPass?: boolean;
    isWarning?: boolean;
  }[];
}
