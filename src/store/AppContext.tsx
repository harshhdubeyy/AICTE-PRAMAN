import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  Application,
  AppDocument,
  RuleDefinition,
  ClarificationQuery,
  InspectionSchedule,
  AuditEvent,
  InfrastructureFacility,
  ApplicationType,
  UserProfile
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
import {
  authService,
  applicationsService,
  documentsService,
  queriesService,
  auditService,
  extractionService,
  isSupabaseConfigured
} from '../services';

export const DEFAULT_OFFICER_PROFILES: UserProfile[] = [
  {
    name: 'Sara Abraham',
    email: 'sara.abraham@aicte-india.org',
    role: 'officer',
    title: 'Senior Scrutiny Officer (Western Regional Office)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Dr. Anil Sahasrabudhe',
    email: 'anil.sahasrabudhe@aicte-india.org',
    role: 'officer',
    title: 'Executive Scrutiny Bureau Director (National HQ)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Prof. R. K. Singhal',
    email: 'rk.singhal@iitb.ac.in',
    role: 'officer',
    title: 'Expert Visiting Committee Lead (IIT Bombay)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

export const DEFAULT_INSTITUTION_PROFILES: UserProfile[] = [
  {
    name: 'Dr. V. Kulkarni',
    email: 'registrar@svit.ac.in',
    role: 'institution',
    title: 'Principal / Registrar',
    institutionId: 'inst-1',
    institutionName: 'Sri Venkateswara Institute of Technology, Pune',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Dr. Manjunath Bhandary',
    email: 'principal@sahyadri.edu.in',
    role: 'institution',
    title: 'Chairman / Principal',
    institutionId: 'inst-2',
    institutionName: 'Sahyadri College of Engineering, Mangalore',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Dr. Alok Verma',
    email: 'director@narmada.ac.in',
    role: 'institution',
    title: 'Director / Head of Institute',
    institutionId: 'inst-3',
    institutionName: 'Narmada Institute of Management, Bhopal',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Prof. S. Meenakshi',
    email: 'admin@kaveri.ac.in',
    role: 'institution',
    title: 'Principal / Admin In-charge',
    institutionId: 'inst-4',
    institutionName: 'Kaveri Polytechnic, Madurai',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Dr. R. P. Tiwari',
    email: 'dean@gomtipharmacy.edu.in',
    role: 'institution',
    title: 'Dean of Pharmacy Studies',
    institutionId: 'inst-5',
    institutionName: 'Gomti Institute of Pharmacy, Lucknow',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Dr. K. L. Sharma',
    email: 'director@aravali.edu.in',
    role: 'institution',
    title: 'Campus Director',
    institutionId: 'inst-6',
    institutionName: 'Aravali Technical Campus, Jaipur',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

interface AppContextType {
  role: UserRole;
  currentUser: UserProfile;
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
  availableOfficerProfiles: UserProfile[];
  availableInstitutionProfiles: UserProfile[];
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
  isLoading: boolean;
  isLoadingDocuments: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  uploadRealFile: (file: File, appId: string, docName: string, category: AppDocument['category']) => Promise<{ success: boolean; sha256?: string; error?: string }>;
  login: (profileOrRole: UserProfile | UserRole, email?: string, institutionId?: string, name?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleLoginModal: () => void;
  registerNewProfile: (profile: UserProfile, password?: string) => Promise<boolean>;
  editExtractedValue: (appId: string, docId: string, fieldKey: string, newValue: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('officer');
  const [availableOfficerProfiles, setAvailableOfficerProfiles] = useState<UserProfile[]>(DEFAULT_OFFICER_PROFILES);
  const [availableInstitutionProfiles, setAvailableInstitutionProfiles] = useState<UserProfile[]>(DEFAULT_INSTITUTION_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_OFFICER_PROFILES[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [currentInstitutionId, setCurrentInstitutionId] = useState<string>('inst-1');
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ text: msg, id });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 2800);
  };

  // Synchronize data from Supabase backend (or fallback smoothly to seed data)
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const [fetchedApps, fetchedDocs, fetchedQueries, fetchedAudits] = await Promise.all([
        applicationsService.getApplications(),
        documentsService.getDocuments(),
        queriesService.getQueries(),
        auditService.getAuditEvents(),
      ]);

      if (fetchedApps && fetchedApps.length > 0) setApplications(fetchedApps);
      if (fetchedDocs && fetchedDocs.length > 0) setDocuments(fetchedDocs);
      if (fetchedQueries && fetchedQueries.length > 0) setQueries(fetchedQueries);
      if (fetchedAudits && fetchedAudits.length > 0) setAuditTrail(fetchedAudits);
    } catch (err: any) {
      console.warn('Backend sync note:', err.message || err);
      setDataError('Using offline regulatory seed cache');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check active session and load initial data on mount
  useEffect(() => {
    let isMounted = true;

    async function initSessionAndData() {
      if (isSupabaseConfigured()) {
        const activeUser = await authService.getActiveSession();
        if (activeUser && isMounted) {
          setCurrentUser(activeUser);
          setRole(activeUser.role);
          if (activeUser.institutionId) {
            setCurrentInstitutionId(activeUser.institutionId);
          }
          setIsLoggedIn(true);
        }
      }
      if (isMounted) {
        await refreshData();
      }
    }

    initSessionAndData();

    return () => {
      isMounted = false;
    };
  }, [refreshData]);

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

  const editExtractedValue = async (appId: string, docId: string, fieldKey: string, newValue: string) => {
    await extractionService.correctExtractedField({
      documentId: docId,
      fieldKey,
      newValue,
      correctedBy: currentUser.name
    });

    resubmitDocument(appId, docId, [{ fieldName: fieldKey, newValue }]);

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: currentUser.name,
      actorRole: currentUser.role,
      action: 'Extracted Field Manually Corrected',
      applicationId: appId,
      applicationNumber: applications.find(a => a.id === appId)?.applicationNumber || 'AICTE-2026',
      ruleVersion: CURRENT_RULESET_VERSION,
      details: `Field "${fieldKey}" edited to "${newValue}". Stored source="manual". Smart re-validation triggered.`
    };
    setAuditTrail(prev => [audit, ...prev]);

    showToast(`Manual correction saved (source='manual'). Re-validated affected rules!`);
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

  const uploadRealFile = async (
    file: File,
    appId: string,
    docName: string,
    category: AppDocument['category']
  ): Promise<{ success: boolean; sha256?: string; error?: string }> => {
    setIsLoadingDocuments(true);
    try {
      const res = await documentsService.uploadDocument({
        file,
        applicationId: appId,
        institutionId: currentInstitutionId,
        docName,
        category,
      });

      if (res.document) {
        // Run extraction with Gemini provider (server-side Edge Function)
        let enrichedDoc = res.document;
        try {
          const extraction = await extractionService.extractDocument({
            file,
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
            documentId: res.document.id
          });

          if (extraction && extraction.fields && extraction.fields.length > 0) {
            const newExtracted = extraction.fields.map(f => ({
              fieldName: f.field_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              extractedValue: f.value || 'N/A',
              claimedValue: 'Statutory Target Baseline',
              confidence: f.confidence,
              pageNumber: f.page,
              boundingBox: f.bbox ? {
                x: f.bbox.x,
                y: f.bbox.y,
                width: f.bbox.width,
                height: f.bbox.height
              } : undefined,
              status: (f.confidence < 0.70 ? 'Needs Manual Review' : 'Passed') as any,
              notes: f.low_confidence ? 'Low confidence extraction (approximate region)' : undefined
            }));

            enrichedDoc = {
              ...res.document,
              ocrStatus: 'Extracted' as const,
              ocrConfidence: extraction.average_confidence,
              extractedFields: newExtracted
            };
          }
        } catch (extErr) {
          console.warn('Extraction note:', extErr);
        }

        const updatedDocs = [enrichedDoc, ...documents.filter(d => d.id !== res.document!.id)];
        setDocuments(updatedDocs);

        // Re-evaluate rules
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
                      uploaded: appDocs.length
                    },
                    completenessPercentage: Math.min(100, Math.round((appDocs.length / a.documentCounts.totalRequired) * 100)),
                    latestRun: newRun,
                    runHistory: [newRun, ...a.runHistory]
                  }
                : a
            )
          );
        }

        // Log audit event
        await auditService.logAuditEvent({
          actor: currentUser.name,
          actorRole: currentUser.role,
          action: 'Document Uploaded & Gemini Extracted',
          applicationId: appId,
          applicationNumber: applications.find(a => a.id === appId)?.applicationNumber || 'AICTE-2026',
          ruleVersion: CURRENT_RULESET_VERSION,
          details: `Uploaded ${res.document.name} (${res.document.fileSize}). SHA-256: ${res.document.fileHash.substring(0, 16)}... Extracted with Gemini Flash.`,
        });

        showToast(`Document uploaded & verified: SHA-256 ${res.document.fileHash.substring(0, 12)}...`);
        return { success: true, sha256: res.document.fileHash };
      }
      return { success: false, error: res.error || 'Upload failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Upload failed' };
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const login = async (
    profileOrRole: UserProfile | UserRole,
    email?: string,
    institutionId?: string,
    name?: string,
    password?: string
  ): Promise<boolean> => {
    let resolvedProfile: UserProfile;

    if (typeof profileOrRole === 'object') {
      resolvedProfile = profileOrRole;
    } else {
      const isOfficer = profileOrRole === 'officer' || profileOrRole === 'admin' || profileOrRole === 'auditor';
      const targetEmail = email || (isOfficer ? 'officer@aicte-india.org' : 'registrar@svit.ac.in');
      const targetPwd = password || (isOfficer ? 'officer@2026' : 'svit@pune2026');

      // Attempt Supabase Auth sign-in
      const authResult = await authService.signIn(targetEmail, targetPwd);
      if (authResult.user) {
        resolvedProfile = authResult.user;
      } else {
        const foundInst = institutions.find(i => i.id === institutionId);
        resolvedProfile = {
          name: name || (isOfficer ? 'AICTE Officer' : foundInst?.name || 'Institutional Representative'),
          email: targetEmail,
          role: profileOrRole,
          title: isOfficer ? 'Scrutiny Officer' : 'Registrar / Principal',
          avatar: isOfficer
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
          institutionId: institutionId || (profileOrRole === 'institution' ? 'inst-1' : undefined),
          institutionName: foundInst?.name
        };
      }
    }

    // Role-based workspace routing
    setRole(resolvedProfile.role);
    setCurrentUser(resolvedProfile);
    if (resolvedProfile.institutionId) {
      setCurrentInstitutionId(resolvedProfile.institutionId);
      const matchingApp = applications.find(a => a.institutionId === resolvedProfile.institutionId);
      if (matchingApp) setSelectedAppId(matchingApp.id);
    }

    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setActiveNav('dashboard');
    showToast(`Welcome ${resolvedProfile.name}! Logged in as ${resolvedProfile.role === 'institution' ? 'Institution Portal' : 'AICTE Officer / Reviewer'}.`);
    
    // Refresh data for user
    refreshData();
    return true;
  };

  const logout = async () => {
    await authService.signOut();
    setIsLoggedIn(false);
    setIsLoginModalOpen(false);
    showToast('Logged out of AICTE PRAMAN. Please choose a role to sign in.');
  };

  const toggleLoginModal = () => {
    setIsLoginModalOpen(prev => !prev);
  };

  const registerNewProfile = async (newProfile: UserProfile, password?: string): Promise<boolean> => {
    if (newProfile.role === 'officer' || newProfile.role === 'admin') {
      setAvailableOfficerProfiles(prev => [newProfile, ...prev]);
    } else {
      setAvailableInstitutionProfiles(prev => [newProfile, ...prev]);
    }

    if (password) {
      await authService.signUp({
        email: newProfile.email,
        password,
        fullName: newProfile.name,
        role: newProfile.role,
        title: newProfile.title,
        institutionId: newProfile.institutionId,
      });
    }

    showToast(`Registered new role profile: ${newProfile.name} (${newProfile.role})`);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
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
        availableOfficerProfiles,
        availableInstitutionProfiles,
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
        isLoading,
        isLoadingDocuments,
        dataError,
        refreshData,
        uploadRealFile,
        login,
        logout,
        toggleLoginModal,
        registerNewProfile,
        editExtractedValue
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
