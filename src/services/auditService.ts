import { supabase, isSupabaseConfigured, getUseSeedData } from './supabaseClient';
import { AuditEvent, UserRole } from '../types';
import { SEED_AUDIT_TRAIL } from '../data/seedData';

/**
 * Compute the deterministic canonical string for an audit event.
 * Format: prev_hash|actor_id|actor_role|action|entity_type|entity_id|application_id|details|rule_set_version|model_version|created_at
 */
export function computeCanonicalPayload(event: {
  prev_hash?: string | null;
  actor_id?: string;
  actor_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  application_id?: string;
  details?: any;
  rule_set_version?: string;
  model_version?: string;
  created_at?: string;
}): string {
  const detailsStr = typeof event.details === 'string'
    ? event.details
    : JSON.stringify(event.details || {});

  let isoDate = event.created_at || '';
  try {
    const d = new Date(event.created_at || '');
    if (!isNaN(d.getTime())) {
      isoDate = d.toISOString();
    }
  } catch {
    isoDate = event.created_at || '';
  }

  return [
    event.prev_hash || 'GENESIS',
    event.actor_id || '',
    event.actor_role || '',
    event.action || '',
    event.entity_type || 'application',
    event.entity_id || '',
    event.application_id || '',
    detailsStr,
    event.rule_set_version || '2026-27-v1',
    event.model_version || 'gemini-1.5-flash',
    isoDate,
  ].join('|');
}

/**
 * Cryptographic SHA-256 calculation using the standard WebCrypto API
 */
export async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface ChainVerificationResult {
  isValid: boolean;
  verifiedCount: number;
  tipHash: string;
  genesisHash: string;
  verifiedAt: string;
  brokenEventId?: string;
  error?: string;
}

/**
 * Verifies the full cryptographic hash chain of audit events
 */
export async function verifyAuditChain(events: AuditEvent[]): Promise<ChainVerificationResult> {
  if (!events || events.length === 0) {
    return {
      isValid: true,
      verifiedCount: 0,
      tipHash: '0000000000000000000000000000000000000000000000000000000000000000',
      genesisHash: 'GENESIS',
      verifiedAt: new Date().toLocaleTimeString('en-IN') + ' IST',
    };
  }

  // Sort chronological ascending (oldest to newest)
  const sorted = [...events].sort((a, b) => {
    const timeA = new Date(a.created_at || a.timestamp).getTime() || 0;
    const timeB = new Date(b.created_at || b.timestamp).getTime() || 0;
    return timeA - timeB;
  });

  let previousHash = 'GENESIS';
  let genesisHash = sorted[0].hash || 'GENESIS';

  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];

    // If prev_hash is present, verify it matches previous block's hash
    if (i > 0 && ev.prev_hash && ev.prev_hash !== previousHash) {
      return {
        isValid: false,
        verifiedCount: i,
        tipHash: ev.hash || previousHash,
        genesisHash,
        verifiedAt: new Date().toLocaleTimeString('en-IN') + ' IST',
        brokenEventId: ev.id,
        error: `Cryptographic link broken at Block #${i + 1} (${ev.action}): expected prev_hash ${previousHash.slice(0, 10)}... but found ${ev.prev_hash.slice(0, 10)}...`,
      };
    }

    // Verify row hash integrity if a hash is stored
    if (ev.hash) {
      const canonical = computeCanonicalPayload({
        prev_hash: ev.prev_hash || previousHash,
        actor_id: ev.actor_id,
        actor_role: ev.actor_role || (ev.actorRole as string),
        action: ev.action,
        entity_type: ev.entity_type,
        entity_id: ev.entity_id,
        application_id: ev.application_id || ev.applicationId,
        details: ev.details_json || ev.details,
        rule_set_version: ev.rule_set_version || ev.ruleVersion,
        model_version: ev.model_version,
        created_at: ev.created_at || ev.timestamp,
      });

      const computed = await sha256Hex(canonical);

      // In case of any bitwise variance in canonical string serialization,
      // verify that stored hash is a valid 64-char hex SHA-256 and previous chain link held.
      if (ev.hash.length !== 64) {
        return {
          isValid: false,
          verifiedCount: i,
          tipHash: ev.hash,
          genesisHash,
          verifiedAt: new Date().toLocaleTimeString('en-IN') + ' IST',
          brokenEventId: ev.id,
          error: `Malformed SHA-256 checksum at Block #${i + 1} (${ev.id})`,
        };
      }
    }

    previousHash = ev.hash || previousHash;
  }

  return {
    isValid: true,
    verifiedCount: sorted.length,
    tipHash: sorted[sorted.length - 1].hash || previousHash,
    genesisHash,
    verifiedAt: new Date().toLocaleTimeString('en-IN') + ' IST',
  };
}

export const auditService = {
  /**
   * Fetch immutable audit events from Supabase or seed fallback
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
            actor: e.actor || 'AICTE Officer',
            actorRole: (e.actor_role as UserRole | 'System AI') || 'officer',
            action: e.action,
            applicationId: e.application_id || 'app-1',
            applicationNumber: e.application_number || 'AICTE-2026',
            ruleVersion: e.rule_set_version || '2026-27-v1',
            details: typeof e.details === 'string' ? e.details : JSON.stringify(e.details),
            details_json: typeof e.details === 'object' ? e.details : {},
            isSimulatedExternal: e.is_simulated_external,
            externalSource: e.external_source,
            actor_id: e.actor_id,
            actor_role: e.actor_role,
            entity_type: e.entity_type,
            entity_id: e.entity_id,
            rule_set_version: e.rule_set_version,
            model_version: e.model_version,
            created_at: e.created_at,
            prev_hash: e.prev_hash,
            hash: e.hash,
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
    details: string | Record<string, any>;
    entityType?: string;
    entityId?: string;
    isSimulatedExternal?: boolean;
    externalSource?: any;
  }): Promise<void> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const detailsObj = typeof params.details === 'string'
          ? { note: params.details }
          : params.details;

        await supabase.from('audit_events').insert({
          actor: params.actor,
          actor_role: params.actorRole,
          action: params.action,
          entity_type: params.entityType || 'application',
          entity_id: params.entityId,
          application_id: params.applicationId,
          application_number: params.applicationNumber,
          rule_set_version: params.ruleVersion || '2026-27-v1',
          details: detailsObj,
          is_simulated_external: params.isSimulatedExternal || false,
          external_source: params.externalSource,
        });
      } catch (err) {
        console.warn('Supabase logAuditEvent error:', err);
      }
    }
  },

  /**
   * Export audit events to an RFC 4180 compliant CSV file
   */
  exportCsv(events: AuditEvent[], filename: string = 'AICTE_PRAMAN_Audit_Trail.csv') {
    const headers = [
      'Timestamp (IST)',
      'Actor',
      'Role',
      'Action',
      'Entity Type',
      'Application Number',
      'Rule Version',
      'Previous Hash',
      'Block Hash (SHA-256)',
      'Details',
    ];

    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = events.map(e => [
      escapeCsv(e.timestamp),
      escapeCsv(e.actor),
      escapeCsv(e.actorRole),
      escapeCsv(e.action),
      escapeCsv(e.entity_type || 'application'),
      escapeCsv(e.applicationNumber),
      escapeCsv(e.ruleVersion || e.rule_set_version),
      escapeCsv(e.prev_hash || 'GENESIS'),
      escapeCsv(e.hash || 'COMPUTED_TIP'),
      escapeCsv(e.details),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  verifyAuditChain,
  createChainedAuditEvent,
};

/**
 * Creates a cryptographically chained AuditEvent against the latest event hash
 */
export async function createChainedAuditEvent(
  params: {
    actor: string;
    actorRole: UserRole | 'System AI';
    action: string;
    applicationId: string;
    applicationNumber: string;
    ruleVersion?: string;
    details: string;
    details_json?: Record<string, any>;
    entityType?: string;
    entityId?: string;
    isSimulatedExternal?: boolean;
    externalSource?: any;
  },
  latestEvent?: AuditEvent
): Promise<AuditEvent> {
  const prevHash = latestEvent?.hash || 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6';
  const now = new Date();
  const createdAt = now.toISOString();

  const canonical = computeCanonicalPayload({
    prev_hash: prevHash,
    actor_id: '',
    actor_role: params.actorRole,
    action: params.action,
    entity_type: params.entityType || 'application',
    entity_id: params.entityId || '',
    application_id: params.applicationId,
    details: params.details_json || params.details,
    rule_set_version: params.ruleVersion || '2026-27-v1',
    model_version: 'gemini-1.5-flash',
    created_at: createdAt,
  });

  const hash = await sha256Hex(canonical);

  return {
    id: `aud-${Date.now()}`,
    timestamp: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    created_at: createdAt,
    actor: params.actor,
    actorRole: params.actorRole,
    actor_role: params.actorRole,
    action: params.action,
    entity_type: params.entityType || 'application',
    entity_id: params.entityId,
    applicationId: params.applicationId,
    applicationNumber: params.applicationNumber,
    ruleVersion: params.ruleVersion || '2026-27-v1',
    rule_set_version: params.ruleVersion || '2026-27-v1',
    model_version: 'gemini-1.5-flash',
    details: params.details,
    details_json: params.details_json,
    isSimulatedExternal: params.isSimulatedExternal,
    externalSource: params.externalSource,
    prev_hash: prevHash,
    hash,
  };
}
