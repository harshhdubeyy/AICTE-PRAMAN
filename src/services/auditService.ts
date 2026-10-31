import { supabase, isSupabaseConfigured, getUseSeedData } from './supabaseClient';
import { AuditEvent, UserRole } from '../types';
import { SEED_AUDIT_TRAIL } from '../data/seedData';

export const auditService = {
  /**
   * Fetch immutable audit events
   */
  async getAuditEvents(applicationId?: string): Promise<AuditEvent[]> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        let query = supabase
          .from('audit_events')
          .select('*')
          .order('created_at', { ascending: false });

        if (applicationId) {
          query = query.eq('application_id', applicationId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((e: any): AuditEvent => ({
            id: e.id,
            timestamp: new Date(e.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
            actor: e.actor,
            actorRole: e.actor_role as UserRole | 'System AI',
            action: e.action,
            applicationId: e.application_id || 'app-1',
            applicationNumber: e.application_number || 'AICTE-2026',
            ruleVersion: e.rule_version || '2026-27-v1',
            details: e.details || '',
            isSimulatedExternal: e.is_simulated_external,
            externalSource: e.external_source,
          }));
        }
      } catch (err) {
        console.warn('Supabase getAuditEvents error, falling back:', err);
      }
    }

    if (applicationId) {
      return SEED_AUDIT_TRAIL.filter(a => a.applicationId === applicationId);
    }
    return SEED_AUDIT_TRAIL;
  },

  /**
   * Append an immutable audit event
   */
  async logAuditEvent(params: {
    actor: string;
    actorRole: string;
    action: string;
    applicationId?: string;
    applicationNumber?: string;
    ruleVersion?: string;
    details: string;
    isSimulatedExternal?: boolean;
    externalSource?: any;
  }): Promise<void> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        await supabase.from('audit_events').insert({
          actor: params.actor,
          actor_role: params.actorRole,
          action: params.action,
          application_id: params.applicationId,
          application_number: params.applicationNumber,
          rule_version: params.ruleVersion || '2026-27-v1',
          details: params.details,
          is_simulated_external: params.isSimulatedExternal || false,
          external_source: params.externalSource,
        });
      } catch (err) {
        console.warn('Supabase logAuditEvent error:', err);
      }
    }
  },
};
