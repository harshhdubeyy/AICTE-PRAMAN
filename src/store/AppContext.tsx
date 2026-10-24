import React, { createContext, useContext, useState } from 'react';
import {
  UserRole,
  Application,
  AppDocument,
  RuleDefinition,
  ClarificationQuery,
  InspectionSchedule,
  AuditEvent,
  InfrastructureFacility,
  ApplicationType
} from '../types';
import {
  SEED_INSTITUTIONS,
  SEED_APPLICATIONS,
  SEED_DOCUMENTS,
  SEED_QUERIES,
  SEED_INSPECTIONS,
  SEED_AUDIT_TRAIL,
  SEED_FACILITIES
} from '../data/seedData';
import { AICTE_RULES, CURRENT_RULESET_VERSION, evaluateApplication } from '../rules/rules';

interface AppContextType {
  role: UserRole;
  isLoggedIn: boolean;
  activeNav: string;
  currentInstitutionId: string;
  selectedAppId: string;
  institutions: typeof SEED_INSTITUTIONS;
  applications: Application[];
  documents: AppDocument[];
  rules: RuleDefinition[];
  queries: ClarificationQuery[];
  inspections: InspectionSchedule[];
  auditTrail: AuditEvent[];
  facilities: InfrastructureFacility[];
  toast: { text: string; id: number } | null;
  // UI states
  isReportModalOpen: boolean;
  isLoginModalOpen: boolean;
  selectedFindingId: string | null;
  // Methods
  switchRole: (role: UserRole) => void;
  setActiveNav: (nav: string) => void;
  selectApplication: (appId: string) => void;
  openReportModal: (appId?: string) => void;
  closeReportModal: () => void;
  setSelectedFindingId: (findingId: string | null) => void;
  sendClarification: (appId: string, queryText: string, fieldRef?: string) => void;
  replyClarification: (queryId: string, replyText: string, attachmentName?: string) => void;
  requestInspection: (appId: string, notes?: string) => void;
  flagManualReview: (appId: string, reason: string) => void;
  approveApplication: (appId: string, notes?: string) => void;
  uploadDocument: (appId: string, docName: string, category: AppDocument['category'], fileSize?: string) => void;
  resubmitDocument: (appId: string, docId: string, updatedFields?: { fieldName: string; newValue: string }[]) => void;
  addNewApplication: (data: {
    institutionName: string;
    applicationType: ApplicationType;
    academicYear: string;
  }) => void;
  postOfficerNote: (appId: string, note: string) => void;
  applyAiSuggestion: (desc: string) => void;
  showToast: (msg: string) => void;
  login: (role: UserRole, email: string) => void;
  logout: () => void;
  toggleLoginModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('officer');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [currentInstitutionId] = useState<string>('inst-1');
  const [selectedAppId, setSelectedAppId] = useState<string>('app-1');
  const [institutions] = useState(SEED_INSTITUTIONS);
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);
  const [documents, setDocuments] = useState<AppDocument[]>(SEED_DOCUMENTS);
  const [rules] = useState<RuleDefinition[]>(AICTE_RULES);
  const [queries, setQueries] = useState<ClarificationQuery[]>(SEED_QUERIES);
  const [inspections, setInspections] = useState<InspectionSchedule[]>(SEED_INSPECTIONS);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(SEED_AUDIT_TRAIL);
  const [facilities, setFacilities] = useState<InfrastructureFacility[]>(SEED_FACILITIES);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>('fnd-mismatch-doc-svit-02-Land Survey / Plot ID');

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ text: msg, id });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 2800);
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setActiveNav('dashboard');
    showToast(`Switched perspective to ${newRole === 'officer' ? 'AICTE Officer' : 'Institution Portal'}`);
  };

  const selectApplication = (appId: string) => {
    setSelectedAppId(appId);
  };

  const openReportModal = (appId?: string) => {
    if (appId) setSelectedAppId(appId);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  const sendClarification = (appId: string, queryText: string, fieldRef?: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const newQuery: ClarificationQuery = {
      id: `qry-${Date.now().toString(36)}`,
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      officerName: 'Sara Abraham (Senior Scrutiny Officer)',
      subject: `Notice: Clarification required for ${fieldRef || app.applicationNumber}`,
      queryText,
      fieldReference: fieldRef,
      createdAt: 'Just now',
      status: 'Open',
      replies: []
    };

    setQueries(prev => [newQuery, ...prev]);

    // Update app status
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status: 'Mismatch', recommendedAction: 'Seek Clarification' }
          : a
      )
    );

    // Write audit event
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Sara Abraham (Senior Scrutiny Officer)',
      actorRole: 'officer',
      action: 'Dispatched Formal Clarification Notice',
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Clarification notice sent to institution regarding: "${queryText.substring(0, 80)}..."`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Clarification notice dispatched to Institution dashboard');
  };

  const replyClarification = (queryId: string, replyText: string, attachmentName?: string) => {
    setQueries(prev =>
      prev.map(q => {
        if (q.id === queryId) {
          return {
            ...q,
            status: 'Replied',
            replies: [
              ...q.replies,
              {
                id: `rep-${Date.now()}`,
                senderRole: role,
                senderName: role === 'institution' ? 'Dr. V. Kulkarni (Principal SVIT)' : 'Sara Abraham',
                message: replyText,
                timestamp: 'Just now',
                attachmentName
              }
            ]
          };
        }
        return q;
      })
    );

    // Audit event
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: role === 'institution' ? 'Dr. V. Kulkarni (Principal SVIT)' : 'Sara Abraham',
      actorRole: role,
      action: 'Clarification Response Submitted',
      applicationId: selectedAppId,
      applicationNumber: 'AICTE-2026-04821',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Response posted with message: "${replyText.substring(0, 70)}..." ${attachmentName ? `(Attached: ${attachmentName})` : ''}`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Clarification response sent to AICTE Scrutiny Bureau');
  };

  const requestInspection = (appId: string, notes?: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const newInsp: InspectionSchedule = {
      id: `insp-${Date.now()}`,
      applicationId: app.id,
      institutionName: app.institutionName,
      date: '28 May 2026',
      committeeLead: 'Prof. S. R. Joshi (Expert Committee Lead)',
      status: 'Scheduled',
      purpose: notes || 'Physical infrastructure & Spatial coordinate ground truth audit',
      location: 'Institutional Campus'
    };
    setInspections(prev => [newInsp, ...prev]);

    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status: 'Needs Manual Review', stage: 'Officer Review' }
          : a
      )
    );

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Sara Abraham (Senior Scrutiny Officer)',
      actorRole: 'officer',
      action: 'Expert Committee Physical Inspection Scheduled',
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Scheduled physical inspection on 28 May 2026: ${notes || 'Ground verification'}`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Physical Inspection Committee scheduled in docket');
  };

  const flagManualReview = (appId: string, reason: string) => {
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status: 'Needs Manual Review', officerObservation: reason }
          : a
      )
    );

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Sara Abraham (Senior Scrutiny Officer)',
      actorRole: 'officer',
      action: 'Flagged for Bureau Committee Manual Verification',
      applicationId: appId,
      applicationNumber: applications.find(a => a.id === appId)?.applicationNumber || '',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: reason
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Application flagged for Manual Verification');
  };

  const approveApplication = (appId: string, notes?: string) => {
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: 'Ready for Decision',
              stage: 'Final Decision',
              recommendedAction: 'Approve to Next Stage',
              officerObservation: notes || 'All preliminary automated & spatial criteria satisfied.'
            }
          : a
      )
    );

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Sara Abraham (Senior Scrutiny Officer)',
      actorRole: 'officer',
      action: 'Approval Recommended to Executive Committee',
      applicationId: appId,
      applicationNumber: applications.find(a => a.id === appId)?.applicationNumber || '',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: notes || 'Passed scrutiny review. Forwarded to Executive Committee for Digital EoA dispatch.'
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Application approved & advanced to Final Executive Committee');
  };

  const uploadDocument = (appId: string, docName: string, category: AppDocument['category'], fileSize = '2.4 MB') => {
    const newDoc: AppDocument = {
      id: `doc-${Date.now()}`,
      applicationId: appId,
      name: docName,
      category,
      documentType: 'Statutory Upload',
      fileName: `${docName.replace(/\s+/g, '_')}_v1.0.pdf`,
      fileSize,
      version: 'v1.0',
      uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      ocrStatus: 'Extracted',
      ocrConfidence: 0.94,
      fileHash: 'sha256_' + Math.random().toString(36).substring(2, 14),
      status: 'Passed',
      extractedFields: [
        {
          fieldName: 'Document Authenticity Seal',
          extractedValue: 'Digital Signature OK',
          claimedValue: 'Original Notarized',
          confidence: 0.96,
          pageNumber: 1,
          status: 'Passed'
        }
      ]
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);

    // Re-evaluate application
    const app = applications.find(a => a.id === appId);
    if (app) {
      const appDocs = updatedDocs.filter(d => d.applicationId === appId);
      const newRun = evaluateApplication(appId, app.applicationType, appDocs, updatedDocs);
      setApplications(prev =>
        prev.map(a =>
          a.id === appId
            ? {
                ...a,
                documentCounts: {
                  ...a.documentCounts,
                  uploaded: a.documentCounts.uploaded + 1
                },
                latestRun: newRun,
                runHistory: [newRun, ...a.runHistory]
              }
            : a
        )
      );
    }

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: role === 'institution' ? 'SVIT Pune Administrator' : 'Officer',
      actorRole: role,
      action: 'Document Upload & Automated OCR Ingestion',
      applicationId: appId,
      applicationNumber: 'AICTE-2026-04821',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Uploaded ${docName} (${fileSize}). Auto-OCR extracted anchors with 94% confidence.`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast(`Uploaded ${docName} successfully. Spatial OCR parsed anchors.`);
  };

  const resubmitDocument = (appId: string, docId: string, updatedFields?: { fieldName: string; newValue: string }[]) => {
    // Increment version, fix affected mismatch
    const updatedDocs = documents.map(d => {
      if (d.id === docId) {
        const nextVer = d.version.startsWith('v') ? `v${(parseFloat(d.version.replace('v', '')) + 0.1).toFixed(1)}` : 'v2.0';
        const revisedFields = d.extractedFields.map(f => {
          if (updatedFields) {
            const match = updatedFields.find(u => u.fieldName === f.fieldName);
            if (match) {
              return { ...f, extractedValue: match.newValue, status: 'Passed' as const };
            }
          }
          if (f.status === 'Mismatch') {
            return {
              ...f,
              extractedValue: 'Survey No. 44/A, Maan Road (Amended)',
              claimedValue: 'Survey 44/A',
              status: 'Passed' as const
            };
          }
          return f;
        });

        return {
          ...d,
          version: `${nextVer} (Rectified)`,
          uploadedAt: 'Just now (Resubmission)',
          ocrStatus: 'Extracted' as const,
          ocrConfidence: 0.98,
          status: 'Passed' as const,
          extractedFields: revisedFields
        };
      }
      return d;
    });

    setDocuments(updatedDocs);

    // Re-run rules engine on affected app
    const app = applications.find(a => a.id === appId);
    if (app) {
      const appDocs = updatedDocs.filter(doc => doc.applicationId === appId);
      const newRun = evaluateApplication(appId, app.applicationType, appDocs, updatedDocs);
      
      setApplications(prev =>
        prev.map(a =>
          a.id === appId
            ? {
                ...a,
                status: newRun.findingsCount.mismatch === 0 ? 'Passed' : a.status,
                overallConfidence: newRun.overallConfidence,
                latestRun: newRun,
                runHistory: [newRun, ...a.runHistory]
              }
            : a
        )
      );
    }

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Dr. V. Kulkarni (Principal SVIT)',
      actorRole: 'institution',
      action: 'Document Resubmission & Rule Re-validation',
      applicationId: appId,
      applicationNumber: 'AICTE-2026-04821',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Re-ran validation rules engine on rectified document. Address mismatch resolved.`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Document resubmitted! Validation rules re-executed and findings updated.');
  };

  const addNewApplication = (data: {
    institutionName: string;
    applicationType: ApplicationType;
    academicYear: string;
  }) => {
    const newAppNumber = `AICTE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newAppId = `app-${Date.now().toString(36)}`;

    const newApp: Application = {
      id: newAppId,
      applicationNumber: newAppNumber,
      institutionId: 'inst-1',
      institutionName: data.institutionName,
      academicYear: data.academicYear,
      applicationType: data.applicationType,
      submittedAt: 'Today',
      status: 'Passed',
      stage: 'Submitted',
      overallConfidence: 92,
      recommendedAction: 'Approve to Next Stage',
      documentCounts: {
        uploaded: 12,
        totalRequired: 16
      },
      completenessPercentage: 75,
      latestRun: {
        runId: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ruleVersion: CURRENT_RULESET_VERSION,
        findingsCount: { passed: 24, missing: 0, mismatch: 0, expired: 0, suspicious: 0, needsReview: 0 },
        overallConfidence: 92,
        recommendedAction: 'Approve to Next Stage',
        findings: []
      },
      runHistory: [],
      assignedOfficer: 'Sara Abraham'
    };

    setApplications(prev => [newApp, ...prev]);

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Institution Officer',
      actorRole: 'institution',
      action: 'New Approval Application Created',
      applicationId: newAppId,
      applicationNumber: newAppNumber,
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Created new application for ${data.applicationType} (${data.academicYear}).`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast(`Application ${newAppNumber} initialized and submitted for scrutiny!`);
  };

  const postOfficerNote = (appId: string, note: string) => {
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, officerObservation: note }
          : a
      )
    );

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: 'Sara Abraham (Senior Scrutiny Officer)',
      actorRole: 'officer',
      action: 'Observation Note Appended',
      applicationId: appId,
      applicationNumber: applications.find(a => a.id === appId)?.applicationNumber || '',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Officer observation recorded: "${note}"`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast('Observation recorded in immutable scrutiny trail');
  };

  const applyAiSuggestion = (desc: string) => {
    if (desc.toLowerCase().includes('clarification') || desc.toLowerCase().includes('address')) {
      sendClarification(
        selectedAppId,
        'Spatial boundary survey identifiers in self-attested affidavit (Plot 44/B) conflict with registered revenue deed records (Survey 44/A). Please provide certified Sub-Registrar amendment.',
        'Land Survey / Plot ID'
      );
    } else if (desc.toLowerCase().includes('fire')) {
      sendClarification(
        selectedAppId,
        'Fire NOC certificate validity lapsed on 12 Mar 2026. Please submit an unexpired certificate valid through AY 2026-27.',
        'Fire NOC Certificate'
      );
    } else if (desc.toLowerCase().includes('inspection')) {
      requestInspection(selectedAppId, 'Ground physical verification for lab equipment spatial confidence');
    } else if (desc.toLowerCase().includes('duplicate') || desc.toLowerCase().includes('sanction')) {
      flagManualReview(selectedAppId, 'Sanction Plan structural pattern overlap detected. Summon physical architect blueprint.');
    } else {
      showToast(`AI Suggestion applied: ${desc}`);
    }
  };

  const login = (newRole: UserRole, email: string) => {
    setRole(newRole);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    showToast(`Logged in as ${email} (${newRole === 'officer' ? 'AICTE Officer' : 'Institution Portal'})`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsLoginModalOpen(true);
    showToast('Session ended. Please login to continue.');
  };

  const toggleLoginModal = () => {
    setIsLoginModalOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        isLoggedIn,
        activeNav,
        currentInstitutionId,
        selectedAppId,
        institutions,
        applications,
        documents,
        rules,
        queries,
        inspections,
        auditTrail,
        facilities,
        toast,
        isReportModalOpen,
        isLoginModalOpen,
        selectedFindingId,
        switchRole,
        setActiveNav,
        selectApplication,
        openReportModal,
        closeReportModal,
        setSelectedFindingId,
        sendClarification,
        replyClarification,
        requestInspection,
        flagManualReview,
        approveApplication,
        uploadDocument,
        resubmitDocument,
        addNewApplication,
        postOfficerNote,
        applyAiSuggestion,
        showToast,
        login,
        logout,
        toggleLoginModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
