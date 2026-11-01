import { describe, it, expect } from 'vitest';
import {
  computeCanonicalPayload,
  sha256Hex,
  verifyAuditChain,
  createChainedAuditEvent
} from '../src/services/auditService';
import { AuditEvent } from '../src/types';

describe('Audit Trail Tamper-Evident Cryptographic Hash Chain', () => {
  it('computes canonical pipe-delimited payload string deterministically', () => {
    const payload = computeCanonicalPayload({
      prev_hash: 'GENESIS',
      actor_id: 'user-123',
      actor_role: 'officer',
      action: 'Application Status Transition',
      entity_type: 'application',
      entity_id: 'app-1',
      application_id: 'app-1',
      details: { old_status: 'submitted', new_status: 'in_validation' },
      rule_set_version: '2026-27-v1',
      model_version: 'gemini-1.5-flash',
      created_at: '2026-10-14T10:00:00.000Z',
    });

    expect(payload).toContain('GENESIS|user-123|officer|Application Status Transition|application|app-1|app-1|');
    expect(payload).toContain('2026-27-v1|gemini-1.5-flash|2026-10-14T10:00:00.000Z');
  });

  it('generates a valid 64-character hex SHA-256 digest', async () => {
    const hash = await sha256Hex('test payload data');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it('validates a pristine cryptographic chain', async () => {
    const sampleEvents: AuditEvent[] = [
      {
        id: 'aud-block-1',
        timestamp: '10 Oct 2026, 10:00:00 IST',
        created_at: '2026-10-10T04:30:00.000Z',
        actor: 'Officer Abraham',
        actorRole: 'officer',
        action: 'Application Submitted',
        applicationId: 'app-1',
        applicationNumber: 'AICTE-2026-001',
        ruleVersion: '2026-27-v1',
        details: 'Initial submission',
        prev_hash: 'GENESIS',
        hash: '1111111111111111111111111111111111111111111111111111111111111111',
      },
      {
        id: 'aud-block-2',
        timestamp: '11 Oct 2026, 11:00:00 IST',
        created_at: '2026-10-11T05:30:00.000Z',
        actor: 'PRAMAN Spatial OCR',
        actorRole: 'System AI',
        action: 'Document Ingestion',
        applicationId: 'app-1',
        applicationNumber: 'AICTE-2026-001',
        ruleVersion: '2026-27-v1',
        details: 'Coordinates extracted',
        prev_hash: '1111111111111111111111111111111111111111111111111111111111111111',
        hash: '2222222222222222222222222222222222222222222222222222222222222222',
      },
      {
        id: 'aud-block-3',
        timestamp: '12 Oct 2026, 14:00:00 IST',
        created_at: '2026-10-12T08:30:00.000Z',
        actor: 'Officer Abraham',
        actorRole: 'officer',
        action: 'Clarification Issued',
        applicationId: 'app-1',
        applicationNumber: 'AICTE-2026-001',
        ruleVersion: '2026-27-v1',
        details: 'Clarification inquiry sent',
        prev_hash: '2222222222222222222222222222222222222222222222222222222222222222',
        hash: '3333333333333333333333333333333333333333333333333333333333333333',
      },
    ];

    const result = await verifyAuditChain(sampleEvents);
    expect(result.isValid).toBe(true);
    expect(result.verifiedCount).toBe(3);
    expect(result.tipHash).toBe('3333333333333333333333333333333333333333333333333333333333333333');
  });

  it('detects a broken or tampered link in the hash chain', async () => {
    const tamperedEvents: AuditEvent[] = [
      {
        id: 'aud-block-1',
        timestamp: '10 Oct 2026, 10:00:00 IST',
        created_at: '2026-10-10T04:30:00.000Z',
        actor: 'Officer Abraham',
        actorRole: 'officer',
        action: 'Application Submitted',
        applicationId: 'app-1',
        applicationNumber: 'AICTE-2026-001',
        ruleVersion: '2026-27-v1',
        details: 'Initial submission',
        prev_hash: 'GENESIS',
        hash: '1111111111111111111111111111111111111111111111111111111111111111',
      },
      {
        id: 'aud-block-2',
        timestamp: '11 Oct 2026, 11:00:00 IST',
        created_at: '2026-10-11T05:30:00.000Z',
        actor: 'Adversary Tamperer',
        actorRole: 'officer',
        action: 'Illegal Record Injected',
        applicationId: 'app-1',
        applicationNumber: 'AICTE-2026-001',
        ruleVersion: '2026-27-v1',
        details: 'Tampered record with bad prev_hash link',
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000', // Broken!
        hash: '9999999999999999999999999999999999999999999999999999999999999999',
      },
    ];

    const result = await verifyAuditChain(tamperedEvents);
    expect(result.isValid).toBe(false);
    expect(result.brokenEventId).toBe('aud-block-2');
    expect(result.error).toContain('Cryptographic link broken');
  });

  it('createChainedAuditEvent extends the chain from the previous event', async () => {
    const genesisEvent: AuditEvent = {
      id: 'aud-prev',
      timestamp: '14 Oct 2026, 12:00:00 IST',
      created_at: '2026-10-14T06:30:00.000Z',
      actor: 'System AI',
      actorRole: 'System AI',
      action: 'Validation Run',
      applicationId: 'app-1',
      applicationNumber: 'AICTE-2026-04821',
      ruleVersion: '2026-27-v1',
      details: 'Evaluated rules',
      prev_hash: 'GENESIS',
      hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    };

    const newEvent = await createChainedAuditEvent(
      {
        actor: 'Sara Abraham',
        actorRole: 'officer',
        action: 'Approval Recommended to Executive Committee',
        applicationId: 'app-1',
        applicationNumber: 'AICTE-2026-04821',
        ruleVersion: '2026-27-v1',
        details: 'All statutory criteria met.',
      },
      genesisEvent
    );

    expect(newEvent.prev_hash).toBe(genesisEvent.hash);
    expect(newEvent.hash).toHaveLength(64);

    // Verify the 2-block chain
    const chainResult = await verifyAuditChain([genesisEvent, newEvent]);
    expect(chainResult.isValid).toBe(true);
    expect(chainResult.verifiedCount).toBe(2);
    expect(chainResult.tipHash).toBe(newEvent.hash);
  });
});
