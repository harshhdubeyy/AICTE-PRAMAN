import { Institution, Application, AppDocument, ClarificationQuery, InspectionSchedule, AuditEvent, InfrastructureFacility } from '../types';
import { evaluateApplication } from '../rules/rules';

export const SEED_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    name: 'Sri Venkateswara Institute of Technology, Pune',
    code: 'SVIT-48291',
    state: 'Maharashtra',
    city: 'Pune',
    type: 'Private Unaided Engineering',
    trustName: 'Venkateswara Charitable & Educational Trust',
    landSurveyNo: 'Survey 44/A',
    address: 'Survey No. 44/A, Maan Village Road, Mulshi, Pune - 411057',
    pincode: '411057',
    establishedYear: 2008
  },
  {
    id: 'inst-2',
    name: 'Sahyadri College of Engineering, Mangalore',
    code: 'SCE-39180',
    state: 'Karnataka',
    city: 'Mangalore',
    type: 'Private Autonomous College',
    trustName: 'Bhandary Foundation',
    landSurveyNo: 'Survey 112/4',
    address: 'Adyar, Sahyadri Campus, Mangalore - 575007',
    pincode: '575007',
    establishedYear: 2007
  },
  {
    id: 'inst-3',
    name: 'Narmada Institute of Management, Bhopal',
    code: 'NIM-12040',
    state: 'Madhya Pradesh',
    city: 'Bhopal',
    type: 'Management Institute',
    trustName: 'Narmada Education Society',
    landSurveyNo: 'Khasra 218/1',
    address: 'Hoshangabad Road, Near Ratanpur, Bhopal - 462026',
    pincode: '462026',
    establishedYear: 2012
  },
  {
    id: 'inst-4',
    name: 'Kaveri Polytechnic, Madurai',
    code: 'KP-27550',
    state: 'Tamil Nadu',
    city: 'Madurai',
    type: 'Polytechnic Diploma',
    trustName: 'Kaveri Educational Trust',
    landSurveyNo: 'SF No. 34/2B',
    address: 'Melur High Road, Madurai - 625106',
    pincode: '625106',
    establishedYear: 2015
  },
  {
    id: 'inst-5',
    name: 'Gomti Institute of Pharmacy, Lucknow',
    code: 'GIP-51890',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    type: 'Pharmacy College',
    trustName: 'Gomti Welfare & Health Trust',
    landSurveyNo: 'Plot 72, Sector 8',
    address: 'Faizabad Road, Gomti Nagar Extension, Lucknow - 226028',
    pincode: '226028',
    establishedYear: 2019
  },
  {
    id: 'inst-6',
    name: 'Aravali Technical Campus, Jaipur',
    code: 'ATC-68300',
    state: 'Rajasthan',
    city: 'Jaipur',
    type: 'Technical Campus',
    trustName: 'Aravali Shiksha Samiti',
    landSurveyNo: 'Khasra 90/3',
    address: 'RIICO Industrial Area, Sitapura, Jaipur - 302022',
    pincode: '302022',
    establishedYear: 2004
  }
];

export const SEED_DOCUMENTS: AppDocument[] = [
  // SVIT Pune (inst-1 / app-1)
  {
    id: 'doc-svit-01',
    applicationId: 'app-1',
    name: 'Registered Land Title Deed',
    category: 'Land & Ownership',
    documentType: 'Legal / Ownership',
    fileName: 'Land_Title_Deed_Registered_Haveli.pdf',
    fileSize: '4.2 MB',
    version: 'v2.0',
    uploadedAt: '12 Oct 2026 14:22 IST',
    ocrStatus: 'Extracted',
    ocrConfidence: 0.94,
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'Passed',
    externalVerification: {
      source: 'State Revenue',
      isSimulated: true,
      timestamp: '12 Oct 2026 14:25 IST',
      verified: true
    },
    extractedFields: [
      {
        fieldName: 'Land Survey No',
        extractedValue: 'Survey No. 44/A',
        claimedValue: 'Survey 44/A',
        confidence: 0.96,
        pageNumber: 1,
        status: 'Passed'
      },
      {
        fieldName: 'Contiguous Acreage',
        extractedValue: '3.10 Acres',
        claimedValue: '3.10 Acres (Norm ≥ 2.5 Acres)',
        confidence: 0.95,
        pageNumber: 2,
        status: 'Passed'
      }
    ]
  },
  {
    id: 'doc-svit-02',
    applicationId: 'app-1',
    name: 'Notarized Sworn Affidavit',
    category: 'Legal & Governance',
    documentType: 'Statutory Legal',
    fileName: 'Affidavit_Annexure_IV_v3.1.pdf',
    fileSize: '1.4 MB',
    version: 'v3.1 (Latest)',
    uploadedAt: '14 Oct 2026 11:05 IST',
    ocrStatus: 'Low Confidence',
    ocrConfidence: 0.62,
    fileHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    status: 'Mismatch',
    externalVerification: {
      source: 'DigiLocker',
      isSimulated: true,
      timestamp: '14 Oct 2026 11:06 IST',
      verified: true
    },
    extractedFields: [
      {
        fieldName: 'Land Survey / Plot ID',
        extractedValue: 'Plot No. 44/B, Hinjawadi Phase-1',
        claimedValue: 'Survey 44/A',
        confidence: 0.92,
        pageNumber: 2,
        boundingBox: { x: 142, y: 310, width: 260, height: 45 },
        status: 'Mismatch',
        notes: 'Spatial OCR identified Plot 44/B in Sworn Affidavit whereas Title Deed specifies Survey 44/A. Possible parcel subdivision mismatch.'
      },
      {
        fieldName: 'Floor Space Index (FSI)',
        extractedValue: '14,200 sq.m',
        claimedValue: '14,200 sq.m',
        confidence: 0.98,
        pageNumber: 3,
        boundingBox: { x: 142, y: 420, width: 240, height: 35 },
        status: 'Passed'
      }
    ]
  },
  {
    id: 'doc-svit-03',
    applicationId: 'app-1',
    name: 'Fire Safety NOC',
    category: 'Building & Safety',
    documentType: 'Safety Clearance',
    fileName: 'Fire_Safety_NOC_Pune_Rural.pdf',
    fileSize: '890 KB',
    version: 'v1.2',
    uploadedAt: '14 Oct 2026 09:14 IST',
    ocrStatus: 'Extracted',
    ocrConfidence: 0.98,
    fileHash: '872e4e50ce9990d8b041330c47c9ddd11bec6b503ae9386a99da8584e9bb12c4',
    validUntil: '2026-03-12',
    status: 'Expired',
    externalVerification: {
      source: 'DigiLocker',
      isSimulated: true,
      timestamp: '14 Oct 2026 09:15 IST',
      verified: false
    },
    extractedFields: [
      {
        fieldName: 'NOC Validity End Date',
        extractedValue: '12 Mar 2026',
        claimedValue: 'Active for AY 2026-27',
        confidence: 0.98,
        pageNumber: 1,
        status: 'Expired',
        notes: 'Certificate expired on 12 Mar 2026. State Fire Advisory requires minimum 12 months validity remaining.'
      }
    ]
  },
  {
    id: 'doc-svit-04',
    applicationId: 'app-1',
    name: 'Building Sanction Plan',
    category: 'Infrastructure',
    documentType: 'Infrastructure',
    fileName: 'Municipal_Sanction_Plan_PMC.pdf',
    fileSize: '12.6 MB',
    version: 'v1.0',
    uploadedAt: '14 Oct 2026 16:45 IST',
    ocrStatus: 'Processing',
    ocrConfidence: 0.73,
    fileHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    status: 'Suspicious',
    extractedFields: [
      {
        fieldName: 'Architectural Blueprint Layout',
        extractedValue: '73% Structural Match with App AICTE-2026-04112',
        claimedValue: 'Original Architectural Plan',
        confidence: 0.73,
        pageNumber: 2,
        status: 'Suspicious',
        notes: '73% structural similarity detected with Pune Institute App #04112. Requires manual architectural review.'
      }
    ]
  },
  {
    id: 'doc-svit-05',
    applicationId: 'app-1',
    name: 'Trust Registration Deed',
    category: 'Legal & Governance',
    documentType: 'Governance',
    fileName: 'Trust_Deed_Charity_Commissioner.pdf',
    fileSize: '3.8 MB',
    version: 'v1.0',
    uploadedAt: '10 Oct 2026 10:12 IST',
    ocrStatus: 'Extracted',
    ocrConfidence: 0.96,
    fileHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    status: 'Passed',
    externalVerification: {
      source: 'State Sub-Registrar',
      isSimulated: true,
      timestamp: '10 Oct 2026 10:15 IST',
      verified: true
    },
    extractedFields: [
      {
        fieldName: 'Trust Registration Status',
        extractedValue: 'Registered (No. E-4819/Pune)',
        claimedValue: 'Active Non-Profit Trust',
        confidence: 0.96,
        pageNumber: 1,
        status: 'Passed'
      }
    ]
  },
  {
    id: 'doc-svit-06',
    applicationId: 'app-1',
    name: 'Faculty List & Scaled Pay Matrix',
    category: 'Faculty & Pay',
    documentType: 'Academic Staff',
    fileName: 'Faculty_Matrix_AY2026.xlsx',
    fileSize: '2.1 MB',
    version: 'v2.4',
    uploadedAt: '13 Oct 2026 18:30 IST',
    ocrStatus: 'Extracted',
    ocrConfidence: 0.81,
    fileHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    status: 'Needs Manual Review',
    externalVerification: {
      source: 'UGC',
      isSimulated: true,
      timestamp: '13 Oct 2026 18:35 IST',
      verified: true
    },
    extractedFields: [
      {
        fieldName: 'Cadre Ratio (Professor : Assoc : Asst)',
        extractedValue: '1:2.8 (Norm requires 1:2:6)',
        claimedValue: '1:15 Overall Cadre Satisfied',
        confidence: 0.81,
        pageNumber: 4,
        status: 'Needs Manual Review',
        notes: 'Computer Science Dept has 1:2.8 cadre ratio; 2 additional Assistant Professors needed to fulfill norms.'
      }
    ]
  },
  {
    id: 'doc-svit-07',
    applicationId: 'app-1',
    name: 'Geotagged Computer Lab Photos',
    category: 'Infrastructure',
    documentType: 'Infrastructure',
    fileName: 'Lab_Photos_Geotagged_Batch.zip',
    fileSize: '6.4 MB',
    version: 'v1.1',
    uploadedAt: '06 Oct 2026 17:19 IST',
    ocrStatus: 'Low Confidence',
    ocrConfidence: 0.58,
    fileHash: 'c6f3e1a0b3f5e9c0b1a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    status: 'Verification Unavailable',
    extractedFields: [
      {
        fieldName: 'Lab GPS EXIF Accuracy',
        extractedValue: '±14.2m Variance',
        claimedValue: 'Within 5m NBC 2016 Norm',
        confidence: 0.58,
        pageNumber: 1,
        status: 'Needs Manual Review',
        notes: 'Low spatial confidence on lab equipment layout. Recommend physical inspection.'
      }
    ]
  }
];

export const SEED_FACILITIES: InfrastructureFacility[] = [
  {
    id: 'fac-1',
    name: 'Advanced Computing & Engineering Labs',
    unitsActive: '14 Units Active',
    subtitle: 'Computer Science, Mechanical Workshop, IoT Systems, & Nano-materials Facility',
    status: 'AI Compliant / Verified',
    submissionRate: 92,
    statsText: '92% Complete • 14/14 Photo Sets • 4 Video Scans',
    media: [
      {
        title: 'Lab 402 - Cloud Compute Cell',
        type: 'geotagged',
        badge: 'CAD Wireframe Synced',
        subtitle: 'Captured: 12 Mar 2026, 11:24 IST • ±1.8m accuracy',
        metaInfo: '18.5912° N, 73.7389° E',
        coordinates: '18.5912° N, 73.7389° E',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Heavy Machinery Lab Bay A',
        type: 'video',
        badge: '4K 60fps',
        subtitle: 'Walkthrough Scan • 02:45 min',
        metaInfo: 'Automated Robotic Arm Cells',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Building Core B - Level 4 Plan',
        type: 'cad',
        badge: 'Setback Verified',
        subtitle: 'PMC Sanction Ref: PMC/BLD/2022/981',
        metaInfo: 'Sanctioned CAD v3.2',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
      }
    ],
    metrics: [
      { label: 'Carpet Area', value: '1,240 sq.m', normInfo: 'AICTE Norm: ≥ 900 sq.m', isPass: true },
      { label: 'Equipment Inventory', value: '98.4%', normInfo: 'Norm Fulfilled', isPass: true }
    ]
  },
  {
    id: 'fac-2',
    name: 'Smart Classrooms & Lecture Theatres',
    unitsActive: '32 Rooms',
    subtitle: 'Tiered Lecture Theatres, Smart Podiums, Interactive Flat Panels & Acoustic Baffles',
    status: 'AI Compliant / Verified',
    submissionRate: 88,
    statsText: '88% Complete • 32/32 Photo Proofs • 2 Panoramic 360° Tours',
    media: [
      {
        title: 'Hall 201 - Auditorium A',
        type: 'geotagged',
        badge: 'Acoustic Baffle Pass',
        subtitle: 'Dual IFP Display Detected',
        metaInfo: '18.5915° N, 73.7392° E',
        coordinates: '18.5915° N, 73.7392° E',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Smart Lecture Block C',
        type: 'video',
        badge: 'WebXR Ready',
        subtitle: 'Interactive 360° • 6 Camera Nodes',
        metaInfo: 'Panoramic Tour',
        imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Academic Block East Wing',
        type: 'cad',
        badge: 'ADA Compliant',
        subtitle: 'Stairway Width > 2.0m Confirmed',
        metaInfo: 'Level 2 & 3 Wing Plan',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
      }
    ],
    metrics: [
      { label: 'Avg Room Area', value: '72 sq.m', normInfo: 'AICTE Norm: ≥ 66 sq.m', isPass: true },
      { label: 'Dual Projector & CCTV Coverage', value: '100%', normInfo: 'Norm Met', isPass: true }
    ]
  },
  {
    id: 'fac-3',
    name: 'Central Library & Digital Knowledge Center',
    unitsActive: '850 Seating',
    subtitle: 'Stacks, Digital Reading Carrels, Reprography Section, National Digital Library (NDL) Node',
    status: 'Needs Review (Deficiency Flagged)',
    submissionRate: 74,
    statsText: '74% Complete • Low Confidence on Digital Terminals Count',
    media: [
      {
        title: 'Main Reading Hall & Stacks',
        type: 'geotagged',
        badge: 'RFID Scanners OK',
        subtitle: 'Barcode OCR: 42,500 titles indexed',
        metaInfo: '18.5908° N, 73.7384° E',
        coordinates: '18.5908° N, 73.7384° E',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'E-Journal Terminal Room',
        type: 'geotagged',
        badge: 'Norm Gap: -2 Units',
        subtitle: 'Detected 18/20 mandated IEEE subscription terminals',
        metaInfo: '18 Active Nodes Found',
        imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Ground Floor East Wing',
        type: 'cad',
        badge: 'NOC Cleared',
        subtitle: 'Dual Emergency Exit Doors width 2.4m',
        metaInfo: 'Fire Egress Layout',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
      }
    ],
    metrics: [
      { label: 'Carpet Area', value: '610 sq.m', normInfo: 'AICTE Norm: ≥ 600 sq.m', isPass: true },
      { label: 'Indexed Volumes', value: '42,500', normInfo: 'Norm Exceeded', isPass: true },
      { label: 'Digital Terminals', value: '18 Terminals', normInfo: 'Norm: ≥ 20 terminals, Attention Required', isWarning: true }
    ]
  },
  {
    id: 'fac-4',
    name: 'Hostels & Residential Campus Amenities',
    unitsActive: '1,200 Capacity',
    subtitle: 'Boys Block A, Girls Block B, Centralized Mess, RO Water Plant, Dispensary & 24/7 Wardens',
    status: 'AI Compliant / Verified',
    submissionRate: 82,
    statsText: '82% Complete • Drone Geotagged Polygon Submitted • Hygiene Scan Done',
    media: [
      {
        title: 'Campus Zone IV - Hostel Boundary',
        type: 'drone',
        badge: 'Boundary Locked',
        subtitle: 'Survey of India Datum WGS84 Validated',
        metaInfo: 'Drone Survey Orthomosaic',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Central Dining Facility',
        type: 'video',
        badge: 'FSSAI Attached',
        subtitle: 'Dining Hygiene Scan • 01:30 min',
        metaInfo: 'Kitchen Inspection',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Seismic Zone III Proof',
        type: 'certificate',
        badge: 'IIT Vetted',
        subtitle: 'Chartered Structural Engineer Registry #SE-99120',
        metaInfo: 'Structural Stability Certificate',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
      }
    ],
    metrics: [
      { label: 'Dining Capacity', value: '400 Concurrent', normInfo: 'Norm Met', isPass: true },
      { label: 'Solar Water Heating', value: 'Verified', normInfo: 'Green Norm Pass', isPass: true },
      { label: 'Medical & Resident Doctor', value: '24/7 Ambulance Confirmed', normInfo: 'Statutory Met', isPass: true }
    ]
  }
];

// Generate initial validation run for app-1 (SVIT Pune)
const initialSvitRun = evaluateApplication('app-1', 'Extension of Approval', SEED_DOCUMENTS);

export const SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    institutionId: 'inst-1',
    institutionName: 'Sri Venkateswara Institute of Technology, Pune',
    academicYear: 'AY 2026-27',
    applicationType: 'Extension of Approval',
    submittedAt: '14 Oct 2026',
    status: 'Needs Manual Review',
    stage: 'AI Validation',
    overallConfidence: 87,
    recommendedAction: 'Seek Clarification',
    documentCounts: {
      uploaded: 32,
      totalRequired: 36
    },
    completenessPercentage: 78,
    latestRun: initialSvitRun,
    runHistory: [initialSvitRun],
    officerObservation: 'Discrepancy noted in Land Survey Number between Sworn Affidavit (44/B) and Title Deed (44/A). Fire NOC validity lapsed on 12 Mar 2026.',
    assignedOfficer: 'Sara Abraham'
  },
  {
    id: 'app-2',
    applicationNumber: 'AICTE-2026-03918',
    institutionId: 'inst-2',
    institutionName: 'Sahyadri College of Engineering, Mangalore',
    academicYear: 'AY 2026-27',
    applicationType: 'New Institution',
    submittedAt: '11 Oct 2026',
    status: 'Mismatch',
    stage: 'AI Validation',
    overallConfidence: 64,
    recommendedAction: 'Seek Clarification',
    documentCounts: {
      uploaded: 28,
      totalRequired: 34
    },
    completenessPercentage: 64,
    latestRun: {
      runId: 'run-sce-01',
      timestamp: '2026-10-11T10:00:00Z',
      ruleVersion: 'v4.11.2 (AY 2026-27)',
      findingsCount: { passed: 22, missing: 3, mismatch: 4, expired: 0, suspicious: 0, needsReview: 2 },
      overallConfidence: 64,
      recommendedAction: 'Seek Clarification',
      findings: [
        {
          id: 'fnd-sce-01',
          applicationId: 'app-2',
          status: 'Mismatch',
          rule_code: 'APH-4.2',
          ruleTitle: 'Trust Registered Address Variance',
          documentName: 'Trust Registration Certificate',
          documentId: 'doc-sce-01',
          page: 1,
          field: 'Registered Office Pin Code',
          extractedValue: '575001',
          claimedValue: '575007',
          confidence: 0.94,
          explanation: 'Trust registered address postal code does not match application portal entry.',
          suggestedAction: 'Request registered trust amendment or proof of office shift.',
          whyLine: 'Pin code 575001 does not match claimed 575007.',
          severity: 'HIGH',
          sourceReference: 'AICTE APH 2026-27'
        }
      ]
    },
    runHistory: [],
    assignedOfficer: 'Sara Abraham'
  },
  {
    id: 'app-3',
    applicationNumber: 'AICTE-2026-01204',
    institutionId: 'inst-3',
    institutionName: 'Narmada Institute of Management, Bhopal',
    academicYear: 'AY 2026-27',
    applicationType: 'Change in Program',
    submittedAt: '08 Oct 2026',
    status: 'Passed',
    stage: 'Officer Review',
    overallConfidence: 94,
    recommendedAction: 'Approve to Next Stage',
    documentCounts: {
      uploaded: 18,
      totalRequired: 18
    },
    completenessPercentage: 100,
    latestRun: {
      runId: 'run-nim-01',
      timestamp: '2026-10-08T12:00:00Z',
      ruleVersion: 'v4.11.2 (AY 2026-27)',
      findingsCount: { passed: 28, missing: 0, mismatch: 0, expired: 0, suspicious: 0, needsReview: 0 },
      overallConfidence: 94,
      recommendedAction: 'Approve to Next Stage',
      findings: []
    },
    runHistory: [],
    assignedOfficer: 'Sara Abraham'
  },
  {
    id: 'app-4',
    applicationNumber: 'AICTE-2026-02755',
    institutionId: 'inst-4',
    institutionName: 'Kaveri Polytechnic, Madurai',
    academicYear: 'AY 2026-27',
    applicationType: 'Extension of Approval',
    submittedAt: '09 Oct 2026',
    status: 'Missing',
    stage: 'AI Validation',
    overallConfidence: 58,
    recommendedAction: 'Seek Clarification',
    documentCounts: {
      uploaded: 21,
      totalRequired: 30
    },
    completenessPercentage: 58,
    latestRun: {
      runId: 'run-kp-01',
      timestamp: '2026-10-09T14:00:00Z',
      ruleVersion: 'v4.11.2 (AY 2026-27)',
      findingsCount: { passed: 18, missing: 4, mismatch: 1, expired: 1, suspicious: 0, needsReview: 1 },
      overallConfidence: 58,
      recommendedAction: 'Seek Clarification',
      findings: [
        {
          id: 'fnd-kp-01',
          applicationId: 'app-4',
          status: 'Missing',
          rule_code: 'APH-3.4',
          ruleTitle: 'Building Sanction Plan Missing',
          documentName: 'Building Sanction Plan',
          documentId: '',
          page: 1,
          field: 'Checklist Item 9',
          extractedValue: 'NOT_FOUND',
          claimedValue: 'Mandatory Submission',
          confidence: 1.0,
          explanation: 'Building Sanction Plan missing from submitted dossier.',
          suggestedAction: 'Upload certified municipal sanction plan.',
          whyLine: 'Checklist item 9 is mandatory for polytechnic approval.',
          severity: 'CRITICAL',
          sourceReference: 'AICTE APH 2026-27'
        }
      ]
    },
    runHistory: [],
    assignedOfficer: 'Sara Abraham'
  },
  {
    id: 'app-5',
    applicationNumber: 'AICTE-2026-05189',
    institutionId: 'inst-5',
    institutionName: 'Gomti Institute of Pharmacy, Lucknow',
    academicYear: 'AY 2026-27',
    applicationType: 'New Institution',
    submittedAt: '12 Oct 2026',
    status: 'Suspicious',
    stage: 'Officer Review',
    overallConfidence: 71,
    recommendedAction: 'Needs Manual Review',
    documentCounts: {
      uploaded: 30,
      totalRequired: 33
    },
    completenessPercentage: 71,
    latestRun: {
      runId: 'run-gip-01',
      timestamp: '2026-10-12T16:00:00Z',
      ruleVersion: 'v4.11.2 (AY 2026-27)',
      findingsCount: { passed: 24, missing: 1, mismatch: 0, expired: 0, suspicious: 2, needsReview: 1 },
      overallConfidence: 71,
      recommendedAction: 'Needs Manual Review',
      findings: [
        {
          id: 'fnd-gip-01',
          applicationId: 'app-5',
          status: 'Suspicious',
          rule_code: 'DUP-CHK-01',
          ruleTitle: 'Exact Drawing Duplicate in Another Application',
          documentName: 'Laboratory Layout Plan',
          documentId: 'doc-gip-02',
          page: 1,
          field: 'AutoCAD Hash',
          extractedValue: 'Bitwise Duplicate of App #03810',
          claimedValue: 'Original Drawing',
          confidence: 0.98,
          explanation: 'Laboratory layout blueprint matches file hash of an existing private college in Kanpur.',
          suggestedAction: 'Mark for authenticity audit and summon original physical architect stamp.',
          whyLine: 'Exact architectural floorplan match detected.',
          severity: 'CRITICAL',
          sourceReference: 'AICTE Digital Integrity Directive 2026'
        }
      ]
    },
    runHistory: [],
    assignedOfficer: 'Sara Abraham'
  },
  {
    id: 'app-6',
    applicationNumber: 'AICTE-2026-06830',
    institutionId: 'inst-6',
    institutionName: 'Aravali Technical Campus, Jaipur',
    academicYear: 'AY 2026-27',
    applicationType: 'Extension of Approval',
    submittedAt: '13 Oct 2026',
    status: 'Ready for Decision',
    stage: 'Final Decision',
    overallConfidence: 91,
    recommendedAction: 'Approve to Next Stage',
    documentCounts: {
      uploaded: 33,
      totalRequired: 33
    },
    completenessPercentage: 91,
    latestRun: {
      runId: 'run-atc-01',
      timestamp: '2026-10-13T18:00:00Z',
      ruleVersion: 'v4.11.2 (AY 2026-27)',
      findingsCount: { passed: 31, missing: 0, mismatch: 0, expired: 0, suspicious: 0, needsReview: 0 },
      overallConfidence: 91,
      recommendedAction: 'Approve to Next Stage',
      findings: []
    },
    runHistory: [],
    assignedOfficer: 'Sara Abraham'
  }
];

export const SEED_QUERIES: ClarificationQuery[] = [
  {
    id: 'qry-1',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    institutionId: 'inst-1',
    institutionName: 'Sri Venkateswara Institute of Technology, Pune',
    officerName: 'Regional Officer (Western)',
    subject: 'Address & Land Survey Number Discrepancy',
    queryText: 'Please clarify discrepancy between Land Survey 44/A in Title Deed and Municipal Sanction Plan 44/B before inspection.',
    fieldReference: 'Land Survey / Plot ID (Rule APH-4.2)',
    createdAt: '14 Oct 2026, 09:30 AM',
    status: 'Open',
    replies: []
  },
  {
    id: 'qry-2',
    applicationId: 'app-2',
    applicationNumber: 'AICTE-2026-03918',
    institutionId: 'inst-2',
    institutionName: 'Sahyadri College of Engineering, Mangalore',
    officerName: 'Sara Abraham (Senior Scrutiny Officer)',
    subject: 'Query on faculty cadre ratio in Computer Science',
    queryText: 'Cadre ratio currently reflects 1:2.8 instead of 1:2:6 mandated norm. Provide certified appointment orders for Assistant Professors.',
    fieldReference: 'Faculty Cadre Ratio (Rule APH-5.3)',
    createdAt: '13 Oct 2026, 14:15 PM',
    status: 'Open',
    replies: []
  },
  {
    id: 'qry-3',
    applicationId: 'app-3',
    applicationNumber: 'AICTE-2026-01204',
    institutionId: 'inst-3',
    institutionName: 'Narmada Institute of Management, Bhopal',
    officerName: 'Sara Abraham (Senior Scrutiny Officer)',
    subject: 'Affiliation Letter Endorsement',
    queryText: 'University affiliation endorsement verification completed successfully via UGC digital API.',
    fieldReference: 'University Affiliation (Rule APH-2.1)',
    createdAt: '10 Oct 2026, 11:00 AM',
    status: 'Resolved',
    replies: [
      {
        id: 'rep-nim-1',
        senderRole: 'institution',
        senderName: 'Director, NIM Bhopal',
        message: 'Thank you. We have attached the updated academic council resolution.',
        timestamp: '10 Oct 2026, 15:30 PM',
        attachmentName: 'Academic_Council_Resolution_2026.pdf'
      }
    ]
  }
];

export const SEED_INSPECTIONS: InspectionSchedule[] = [
  {
    id: 'insp-1',
    applicationId: 'app-1',
    institutionName: 'Sri Venkateswara Institute of Technology, Pune',
    date: '22 May 2026',
    committeeLead: 'Prof. R. K. Singhal (IIT Bombay)',
    status: 'Scheduled',
    purpose: 'Physical verification of Lab computing clusters & Fire Safety egress',
    location: 'Hinjawadi Phase-1, Mulshi, Pune',
    notes: 'Spatial OCR flagged GPS variance > 10m on Level 4 engineering workshops.'
  },
  {
    id: 'insp-2',
    applicationId: 'app-5',
    institutionName: 'Gomti Institute of Pharmacy, Lucknow',
    date: '24 May 2026',
    committeeLead: 'Dr. Pratibha Verma (NIPER)',
    status: 'Scheduled',
    purpose: 'Special Scrutiny for Machine Room and Laboratory Floorplan overlap',
    location: 'Faizabad Road, Lucknow',
    notes: 'Verify physical presence of autoclave, HPLC and rotary tablet machines.'
  }
];

export const SEED_AUDIT_TRAIL: AuditEvent[] = [
  {
    id: 'aud-1',
    timestamp: '14 Oct 2026, 16:45:12 IST',
    actor: 'PRAMAN Spatial OCR Engine',
    actorRole: 'System AI',
    action: 'Document Ingestion & Spatial Coordinate Parsing',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    ruleVersion: 'v4.11.2 (AY 2026-27)',
    details: 'Completed neural coordinate extraction on 32 documents. Flagged 1 Mismatch (Plot 44/B vs 44/A), 1 Expired (Fire NOC), 1 Suspicious layout.'
  },
  {
    id: 'aud-2',
    timestamp: '14 Oct 2026, 16:40:05 IST',
    actor: 'DigiLocker Gateway',
    actorRole: 'System AI',
    action: 'PKI Certificate Verification',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    ruleVersion: 'v4.11.2 (AY 2026-27)',
    details: 'Public Key Infrastructure digital signature verified for Notarized Sworn Affidavit.',
    isSimulatedExternal: true,
    externalSource: 'DigiLocker'
  },
  {
    id: 'aud-3',
    timestamp: '14 Oct 2026, 11:05:22 IST',
    actor: 'Dr. V. Kulkarni (Principal SVIT)',
    actorRole: 'institution',
    action: 'Document Upload (Affidavit v3.1)',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    ruleVersion: 'v4.11.2 (AY 2026-27)',
    details: 'Uploaded updated Affidavit_Annexure_IV_v3.1.pdf replacing older v3.0.'
  },
  {
    id: 'aud-4',
    timestamp: '14 Oct 2026, 09:30:15 IST',
    actor: 'Regional Officer (Western)',
    actorRole: 'officer',
    action: 'Dispatched Formal Clarification Notice',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    ruleVersion: 'v4.11.2 (AY 2026-27)',
    details: 'Sent clarification ticket #qry-1 regarding Land Survey 44/A vs 44/B.'
  },
  {
    id: 'aud-5',
    timestamp: '13 Oct 2026, 18:35:00 IST',
    actor: 'UGC National Faculty Database',
    actorRole: 'System AI',
    action: 'External Faculty Cadre Cross-Verification',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    ruleVersion: 'v4.11.2 (AY 2026-27)',
    details: 'Cross-checked 84 faculty PAN/Aadhaar credentials against national university ledger.',
    isSimulatedExternal: true,
    externalSource: 'UGC'
  },
  {
    id: 'aud-6',
    timestamp: '10 Oct 2026, 10:15:44 IST',
    actor: 'Maharashtra State Land Records (e-Mahabhumi)',
    actorRole: 'System AI',
    action: 'Sub-Registrar Title Deed Verification',
    applicationId: 'app-1',
    applicationNumber: 'AICTE-2026-04821',
    ruleVersion: 'v4.11.2 (AY 2026-27)',
    details: 'Survey 44/A verified as encumbrance-free contiguous educational parcel.',
    isSimulatedExternal: true,
    externalSource: 'State Sub-Registrar'
  }
];
