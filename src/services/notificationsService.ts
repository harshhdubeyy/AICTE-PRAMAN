import { supabase, isSupabaseConfigured, getUseSeedData } from './supabaseClient';
import { NotificationItem, UserRole } from '../types';

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    role: 'institution',
    application_id: 'app-1',
    title: 'Clarification Inquiry Dispatched',
    message: 'Senior Scrutiny Officer issued inquiry #qry-1 regarding Land Survey 44/A vs 44/B discrepancy.',
    type: 'action_required',
    read: false,
    link_nav: 'queries',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'notif-2',
    role: 'officer',
    application_id: 'app-1',
    title: 'Document Resubmission Uploaded',
    message: 'SVIT Pune uploaded Affidavit_Annexure_IV_v3.1.pdf for AI re-validation.',
    type: 'info',
    read: false,
    link_nav: 'validation-reports',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    role: 'officer',
    application_id: 'app-5',
    title: 'Duplicate Blueprint Flagged',
    message: 'PRAMAN Spatial Engine flagged exact AutoCAD duplicate in Gomti Institute of Pharmacy (#05189).',
    type: 'warning',
    read: false,
    link_nav: 'ai-findings',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'notif-4',
    role: 'institution',
    application_id: 'app-6',
    title: 'Approval Recommendation Approved',
    message: 'Aravali Technical Campus (#06830) moved to Final Approval Decision docket.',
    type: 'success',
    read: true,
    link_nav: 'track-status',
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

export const notificationsService = {
  /**
   * Fetch active notifications for current user/role
   */
  async getNotifications(role?: UserRole): Promise<NotificationItem[]> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (role) {
          query = query.or(`role.eq.${role},role.is.null`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((n: any): NotificationItem => ({
            id: n.id,
            user_id: n.user_id,
            role: n.role as UserRole,
            application_id: n.application_id,
            title: n.title,
            message: n.message,
            type: n.type || 'info',
            read: Boolean(n.read),
            link_nav: n.link_nav,
            created_at: n.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getNotifications error, using seed fallback:', err);
      }
    }

    if (role) {
      return SEED_NOTIFICATIONS.filter(n => !n.role || n.role === role);
    }
    return SEED_NOTIFICATIONS;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase markAsRead error:', err);
      }
    }
  },

  /**
   * Mark all notifications as read for role
   */
  async markAllAsRead(role?: UserRole): Promise<void> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        let query = supabase
          .from('notifications')
          .update({ read: true })
          .eq('read', false);

        if (role) {
          query = query.eq('role', role);
        }

        await query;
      } catch (err) {
        console.warn('Supabase markAllAsRead error:', err);
      }
    }
  },
};
