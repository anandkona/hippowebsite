import { query } from './db';

export async function logAudit({
  userEmail,
  userName = 'System',
  action,
  entity,
  entityId,
  details = {}
}: {
  userEmail: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
}) {
  try {
    await query(
      `INSERT INTO audit_logs (user_email, user_name, action, entity, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userEmail, userName, action, entity, entityId || null, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

export async function createNotification({
  userType = 'candidate',
  candidateId,
  title,
  message,
  link
}: {
  userType?: string;
  candidateId: number;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await query(
      `INSERT INTO notifications (user_type, candidate_id, title, message, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userType, candidateId, title, message, link || null]
    );
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
}

