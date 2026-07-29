import {
  UserAccount,
  AuthSession,
  Announcement,
  SecurityAuditLog,
  DirectStudentMessage,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'smart_study_users_v2',
  SESSION: 'smart_study_auth_session_v2',
  ANNOUNCEMENTS: 'smart_study_announcements_v3',
  AUDIT_LOGS: 'smart_study_audit_logs_v2',
  FAILED_ATTEMPTS: 'smart_study_failed_login_attempts',
  DIRECT_MESSAGES: 'smart_study_direct_messages_v3',
};

export const SUPERADMIN_SECRET_KEY = 'SUPERADMIN2026!';


// Simple secure encoder for client storage simulation
export const hashPassword = (password: string): string => {
  return btoa(`salt_smartstudy_v1_${password}`);
};

// Initial Default Users (Admin sistem sekolah)
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-01',
    email: 'admin@sekolah.sch.id',
    name: 'Administrator Sekolah',
    role: 'ADMIN',
    passwordHash: hashPassword('AdminPassword123!'),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

// Helper: Sanitize string against XSS script tags
export const sanitizeInput = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Password policy validator
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password minimal 8 karakter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung huruf besar (A-Z)' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung huruf kecil (a-z)' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung setidaknya 1 angka' };
  }
  return { isValid: true };
};

// Users Store
export const getUsers = (): UserAccount[] => {
  const defaultAdminPasswordHash = hashPassword('AdminPassword123!');
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  let users: UserAccount[] = [];

  if (!data) {
    users = INITIAL_USERS;
  } else {
    try {
      users = JSON.parse(data);
    } catch {
      users = INITIAL_USERS;
    }
  }

  // Ensure default admin always exists and has valid password
  const adminIndex = users.findIndex((u) => u.email === 'admin@sekolah.sch.id');
  if (adminIndex === -1) {
    users.unshift({
      id: 'user-admin-01',
      email: 'admin@sekolah.sch.id',
      name: 'Administrator Sekolah',
      role: 'ADMIN',
      passwordHash: defaultAdminPasswordHash,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } else if (users[adminIndex].passwordHash !== defaultAdminPasswordHash) {
    users[adminIndex].passwordHash = defaultAdminPasswordHash;
    users[adminIndex].role = 'ADMIN';
    users[adminIndex].status = 'ACTIVE';
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  return users;
};

export const saveUsers = (users: UserAccount[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Session Store
export const getCurrentSession = (): AuthSession | null => {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    const session: AuthSession = JSON.parse(data);
    // Check session expiry (e.g. 8 hours)
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
};

export const createSession = (user: UserAccount): AuthSession => {
  const session: AuthSession = {
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(), // 8 jam validasi
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

  // Record Audit Log
  recordAuditLog({
    action: 'LOGIN_SUCCESS',
    userEmail: user.email,
    role: user.role,
    status: 'SUCCESS',
    details: `Pengguna berhasil login sebagai ${user.role}`,
  });

  return session;
};

export const clearSession = () => {
  const session = getCurrentSession();
  if (session) {
    recordAuditLog({
      action: 'LOGOUT',
      userEmail: session.email,
      role: session.role,
      status: 'SUCCESS',
      details: 'Sesi berakhir / logout pengguna',
    });
  }
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

// Rate Limiting & Lockout logic
export const getFailedAttempts = (email: string): { count: number; lockUntil?: number } => {
  const data = localStorage.getItem(`${STORAGE_KEYS.FAILED_ATTEMPTS}_${email}`);
  if (!data) return { count: 0 };
  try {
    return JSON.parse(data);
  } catch {
    return { count: 0 };
  }
};

export const recordFailedAttempt = (email: string) => {
  const current = getFailedAttempts(email);
  const newCount = current.count + 1;
  let lockUntil: number | undefined = undefined;

  if (newCount >= 5) {
    lockUntil = Date.now() + 30000; // 30 seconds cooldown lockout
  }

  localStorage.setItem(
    `${STORAGE_KEYS.FAILED_ATTEMPTS}_${email}`,
    JSON.stringify({ count: newCount, lockUntil })
  );

  recordAuditLog({
    action: 'LOGIN_FAILED',
    userEmail: email,
    role: 'UNKNOWN',
    status: newCount >= 5 ? 'BLOCKED' : 'FAILED',
    details: `Percobaan login gagal ke-${newCount} ${newCount >= 5 ? '(Akun Terkunci Sementara 30 detik)' : ''}`,
  });
};

export const clearFailedAttempts = (email: string) => {
  localStorage.removeItem(`${STORAGE_KEYS.FAILED_ATTEMPTS}_${email}`);
};

// Audit Trail Storage
export const getAuditLogs = (): SecurityAuditLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const recordAuditLog = (log: Omit<SecurityAuditLog, 'id' | 'timestamp' | 'ipAddress'>) => {
  const logs = getAuditLogs();
  const newLog: SecurityAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1 (Secure Local Session)',
    ...log,
  };
  const updatedLogs = [newLog, ...logs].slice(0, 100); // keep last 100 logs
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updatedLogs));
};

// Global Announcements Manager
export const getAnnouncements = (): Announcement[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    return INITIAL_ANNOUNCEMENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ANNOUNCEMENTS;
  }
};

export const saveAnnouncements = (announcements: Announcement[]) => {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
};

// Initial Direct Messages
const INITIAL_DIRECT_MESSAGES: DirectStudentMessage[] = [];

// Direct Student Messages Store
export const getDirectMessages = (): DirectStudentMessage[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES);
  if (!data) {
    localStorage.setItem(
      STORAGE_KEYS.DIRECT_MESSAGES,
      JSON.stringify(INITIAL_DIRECT_MESSAGES)
    );
    return INITIAL_DIRECT_MESSAGES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DIRECT_MESSAGES;
  }
};

export const saveDirectMessages = (messages: DirectStudentMessage[]) => {
  localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(messages));
};

export const getStudentInbox = (studentEmail: string): DirectStudentMessage[] => {
  const all = getDirectMessages();
  return all.filter(
    (m) => m.recipientEmail === 'ALL' || m.recipientEmail === studentEmail
  );
};

export const markMessageAsRead = (messageId: string) => {
  const all = getDirectMessages();
  const updated = all.map((m) => (m.id === messageId ? { ...m, isRead: true } : m));
  saveDirectMessages(updated);
};

