import { supabase, isSupabaseConfigured, getUseSeedData } from './supabaseClient';
import { Application, ApplicationType, ValidationStatus } from '../types';
import { SEED_APPLICATIONS } from '../data/seedData';

export const applicationsService = {
  /**
   * Fetch applications, optionally filtered by institution ID.
   */
  async getApplications(institutionId?: string): Promise<Application[]> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        let query = supabase.from('applications').select(`
          id,
          application_number,
          institution_id,
          application_type,
          academic_year,
          status,
          stage,
          overall_confidence,
          recommended_action,
          officer_observation,
          assigned_officer,
          submitted_at,
          institutions (
            name
          ),
          documents (
            id,
            status
          )
        `);

        if (institutionId) {
          query = query.eq('institution_id', institutionId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item: any): Application => {
            const statusMap: Record<string, ValidationStatus> = {
              draft: 'Passed',
              submitted: 'Passed',
              in_validation: 'Passed',
              under_review: 'Needs Manual Review',
              clarification_requested: 'Mismatch',
              inspection_requested: 'Suspicious',
              approved: 'Passed',
              rejected: 'Missing',
            };

            const appStatus: ValidationStatus = statusMap[item.status] || 'Passed';
            const docs = item.documents || [];
            const uploadedCount = docs.length;

            return {
              id: item.id,
              applicationNumber: item.application_number,
              institutionId: item.institution_id,
              institutionName: item.institutions?.name || 'Accredited Technical Institute',
              academicYear: item.academic_year || 'AY 2026-27',
              applicationType: item.application_type as ApplicationType,
              submittedAt: new Date(item.submitted_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
              status: appStatus,
              stage: item.stage || 'Submitted',
              overallConfidence: Number(item.overall_confidence) || 0.95,
              recommendedAction: item.recommended_action || 'Approve to Next Stage',
              documentCounts: {
                uploaded: uploadedCount,
                totalRequired: Math.max(uploadedCount, 32),
              },
              completenessPercentage: Math.min(100, Math.round((uploadedCount / 32) * 100)) || 75,
              latestRun: {
                runId: `run-${item.id.substring(0, 8)}`,
                timestamp: 'Just now',
                ruleVersion: '2026-27-v1',
                findingsCount: {
                  passed: uploadedCount > 0 ? uploadedCount - 1 : 28,
                  missing: item.status === 'rejected' ? 1 : 0,
                  mismatch: item.status === 'clarification_requested' ? 1 : 0,
                  expired: 0,
                  suspicious: item.status === 'inspection_requested' ? 1 : 0,
                  needsReview: item.status === 'under_review' ? 1 : 0,
                },
                overallConfidence: Number(item.overall_confidence) || 0.95,
                recommendedAction: item.recommended_action || 'Approve to Next Stage',
                findings: [],
              },
              runHistory: [],
              officerObservation: item.officer_observation,
              assignedOfficer: item.assigned_officer,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getApplications error, falling back:', err);
      }
    }

    // Seed Data Fallback
    if (institutionId) {
      return SEED_APPLICATIONS.filter(a => a.institutionId === institutionId);
    }
    return SEED_APPLICATIONS;
  },

  /**
   * Get single application details
   */
  async getApplicationById(id: string): Promise<Application | null> {
    const list = await this.getApplications();
    return list.find(a => a.id === id) || null;
  },

  /**
   * Create a new regulatory application
   */
  async createApplication(data: {
    institutionId: string;
    institutionName: string;
    applicationType: ApplicationType;
    academicYear?: string;
  }): Promise<{ application: Application | null; error?: string | null }> {
    const appNumber = `AICTE-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('applications')
          .insert({
            application_number: appNumber,
            institution_id: data.institutionId,
            application_type: data.applicationType,
            academic_year: data.academicYear || 'AY 2026-27',
            status: 'submitted',
            stage: 'Submitted',
            overall_confidence: 0.95,
            recommended_action: 'Approve to Next Stage',
          })
          .select(`*, institutions(name)`)
          .single();

        if (!error && inserted) {
          const newApp: Application = {
            id: inserted.id,
            applicationNumber: inserted.application_number,
            institutionId: inserted.institution_id,
            institutionName: data.institutionName,
            academicYear: inserted.academic_year,
            applicationType: inserted.application_type,
            submittedAt: 'Today',
            status: 'Passed',
            stage: 'Submitted',
            overallConfidence: 0.95,
            recommendedAction: 'Approve to Next Stage',
            documentCounts: {
              uploaded: 4,
              totalRequired: 32,
            },
            completenessPercentage: 12,
            latestRun: {
              runId: `run-${inserted.id.substring(0, 8)}`,
              timestamp: 'Just now',
              ruleVersion: '2026-27-v1',
              findingsCount: {
                passed: 4,
                missing: 0,
                mismatch: 0,
                expired: 0,
                suspicious: 0,
                needsReview: 0,
              },
              overallConfidence: 0.95,
              recommendedAction: 'Approve to Next Stage',
              findings: [],
            },
            runHistory: [],
          };
          return { application: newApp, error: null };
        }
      } catch (err: any) {
        console.warn('Supabase createApplication error:', err);
      }
    }

    // Fallback in-memory application
    const mockApp: Application = {
      id: `app-${Date.now().toString(36)}`,
      applicationNumber: appNumber,
      institutionId: data.institutionId,
      institutionName: data.institutionName,
      academicYear: data.academicYear || 'AY 2026-27',
      applicationType: data.applicationType,
      submittedAt: 'Today',
      status: 'Passed',
      stage: 'Submitted',
      overallConfidence: 0.96,
      recommendedAction: 'Approve to Next Stage',
      documentCounts: {
        uploaded: 4,
        totalRequired: 32,
      },
      completenessPercentage: 12,
      latestRun: {
        runId: `run-${Date.now()}`,
        timestamp: 'Just now',
        ruleVersion: '2026-27-v1',
        findingsCount: {
          passed: 4,
          missing: 0,
          mismatch: 0,
          expired: 0,
          suspicious: 0,
          needsReview: 0,
        },
        overallConfidence: 0.96,
        recommendedAction: 'Approve to Next Stage',
        findings: [],
      },
      runHistory: [],
    };

    return { application: mockApp, error: null };
  },

  /**
   * Update application status / officer decision
   */
  async updateStatus(
    applicationId: string,
    status: ValidationStatus,
    observation?: string
  ): Promise<boolean> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const dbStatus =
          status === 'Passed' ? 'approved' :
          status === 'Mismatch' ? 'clarification_requested' :
          status === 'Suspicious' ? 'inspection_requested' :
          status === 'Needs Manual Review' ? 'under_review' : 'submitted';

        const { error } = await supabase
          .from('applications')
          .update({
            status: dbStatus,
            officer_observation: observation,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        return !error;
      } catch (err) {
        console.warn('Supabase updateStatus error:', err);
      }
    }
    return true;
  },
};
