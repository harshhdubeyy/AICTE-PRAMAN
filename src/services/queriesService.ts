import { supabase, isSupabaseConfigured, getUseSeedData } from './supabaseClient';
import { ClarificationQuery, UserRole } from '../types';
import { SEED_QUERIES } from '../data/seedData';

export const queriesService = {
  /**
   * Fetch clarification queries, optionally filtered by application ID or institution ID
   */
  async getQueries(applicationId?: string): Promise<ClarificationQuery[]> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        let query = supabase.from('queries').select(`
          id,
          application_id,
          sender_name,
          sender_role,
          recipient_role,
          subject,
          message,
          attachment_name,
          status,
          replies,
          created_at,
          applications (
            application_number,
            institution_id,
            institutions (name)
          )
        `);

        if (applicationId) {
          query = query.eq('application_id', applicationId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((q: any): ClarificationQuery => ({
            id: q.id,
            applicationId: q.application_id,
            applicationNumber: q.applications?.application_number || 'AICTE-2026',
            institutionId: q.applications?.institution_id || 'inst-1',
            institutionName: q.applications?.institutions?.name || 'Accredited Institution',
            officerName: q.sender_name || 'Sara Abraham (Scrutiny Officer)',
            subject: q.subject || 'Statutory Verification Inquiry',
            queryText: q.message,
            createdAt: new Date(q.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
            status: q.status as 'Open' | 'Replied' | 'Resolved',
            replies: (q.replies || []).map((r: any) => ({
              id: r.id || `rep-${Math.random()}`,
              senderRole: r.sender_role as UserRole,
              senderName: r.sender_name,
              message: r.message,
              timestamp: r.timestamp || 'Recent',
              attachmentName: r.attachment_name,
            })),
          }));
        }
      } catch (err) {
        console.warn('Supabase getQueries error, falling back:', err);
      }
    }

    if (applicationId) {
      return SEED_QUERIES.filter(q => q.applicationId === applicationId);
    }
    return SEED_QUERIES;
  },

  /**
   * Dispatch a new clarification inquiry
   */
  async sendQuery(params: {
    applicationId: string;
    senderName: string;
    senderRole?: UserRole;
    subject: string;
    queryText: string;
    fieldReference?: string;
  }): Promise<ClarificationQuery> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data, error } = await supabase
          .from('queries')
          .insert({
            application_id: params.applicationId,
            sender_name: params.senderName,
            sender_role: params.senderRole || 'officer',
            recipient_role: 'institution',
            subject: params.subject,
            message: params.queryText,
            status: 'Open',
            replies: [],
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            applicationId: params.applicationId,
            applicationNumber: 'AICTE-2026',
            institutionId: 'inst-1',
            institutionName: 'Accredited Institution',
            officerName: params.senderName,
            subject: params.subject,
            queryText: params.queryText,
            fieldReference: params.fieldReference,
            createdAt: 'Just now',
            status: 'Open',
            replies: [],
          };
        }
      } catch (err) {
        console.warn('Supabase sendQuery error:', err);
      }
    }

    // Fallback in-memory query
    return {
      id: `qry-${Date.now().toString(36)}`,
      applicationId: params.applicationId,
      applicationNumber: 'AICTE-2026-04821',
      institutionId: 'inst-1',
      institutionName: 'Sri Venkateswara Institute of Technology, Pune',
      officerName: params.senderName,
      subject: params.subject,
      queryText: params.queryText,
      fieldReference: params.fieldReference,
      createdAt: 'Just now',
      status: 'Open',
      replies: [],
    };
  },

  /**
   * Reply to a clarification inquiry
   */
  async replyQuery(params: {
    queryId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    attachmentName?: string;
  }): Promise<boolean> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data: current } = await supabase
          .from('queries')
          .select('replies')
          .eq('id', params.queryId)
          .single();

        const currentReplies = current?.replies || [];
        const newReply = {
          id: `rep-${Date.now()}`,
          sender_name: params.senderName,
          sender_role: params.senderRole,
          message: params.message,
          attachment_name: params.attachmentName,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        };

        const { error } = await supabase
          .from('queries')
          .update({
            replies: [...currentReplies, newReply],
            status: 'Replied',
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.queryId);

        return !error;
      } catch (err) {
        console.warn('Supabase replyQuery error:', err);
      }
    }
    return true;
  },
};
