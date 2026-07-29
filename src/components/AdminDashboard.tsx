import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Megaphone,
  Activity,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Lock,
  Search,
  CheckCircle,
  AlertOctagon,
  Info,
  Clock,
  Key,
  Send,
  Mail,
  Inbox,
} from 'lucide-react';
import {
  getUsers,
  saveUsers,
  getAnnouncements,
  saveAnnouncements,
  getAuditLogs,
  hashPassword,
  recordAuditLog,
  getDirectMessages,
  saveDirectMessages,
} from '../utils/auth';
import { UserAccount, Announcement, SecurityAuditLog, DirectStudentMessage } from '../types';

interface AdminDashboardProps {
  adminEmail: string;
  adminName: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  adminName,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'USERS' | 'ANNOUNCEMENTS' | 'MESSAGES' | 'SECURITY'>(
    'USERS'
  );

  // States
  const [users, setUsers] = useState<UserAccount[]>(getUsers());
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [auditLogs] = useState<SecurityAuditLog[]>(getAuditLogs());
  const [directMessages, setDirectMessages] = useState<DirectStudentMessage[]>(getDirectMessages());

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Direct Message Modal State
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('ALL');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgPriority, setMsgPriority] = useState<'NORMAL' | 'HIGH'>('NORMAL');

  // Announcement Modal Form State
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'INFO' | 'WARNING' | 'IMPORTANT'>('IMPORTANT');

  // Password Reset State
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Stats calculation
  const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
  const activeStudents = users.filter((u) => u.role === 'STUDENT' && u.status === 'ACTIVE').length;

  // Toggle user status (Active / Suspended)
  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const newStatus: 'ACTIVE' | 'SUSPENDED' = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        recordAuditLog({
          action: 'ADMIN_UPDATE_USER_STATUS',
          userEmail: adminEmail,
          role: 'ADMIN',
          status: 'SUCCESS',
          details: `Mengubah status user ${u.email} menjadi ${newStatus}`,
        });
        return { ...u, status: newStatus };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    onShowToast('Status akun pengguna berhasil diperbarui!');
  };

  // Send Direct Message / Email to Student Inbox
  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject || !msgBody) return;

    const newMsg: DirectStudentMessage = {
      id: `msg-${Date.now()}`,
      recipientEmail,
      senderName: adminName,
      subject: msgSubject,
      body: msgBody,
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: msgPriority,
    };

    const updated = [newMsg, ...directMessages];
    setDirectMessages(updated);
    saveDirectMessages(updated);

    recordAuditLog({
      action: 'ADMIN_SEND_DIRECT_MESSAGE',
      userEmail: adminEmail,
      role: 'ADMIN',
      status: 'SUCCESS',
      details: `Mengirim pesan langsung/email ke ${recipientEmail}: ${msgSubject}`,
    });

    setIsMsgModalOpen(false);
    setMsgSubject('');
    setMsgBody('');
    onShowToast(`Surat/pesan resmi berhasil dikirimkan ke kotak masuk ${recipientEmail}!`);
  };

  // Reset password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !newPassword) return;

    const updated = users.map((u) => {
      if (u.id === resetUserId) {
        recordAuditLog({
          action: 'ADMIN_RESET_PASSWORD',
          userEmail: adminEmail,
          role: 'ADMIN',
          status: 'SUCCESS',
          details: `Admin mereset password untuk akun ${u.email}`,
        });
        return { ...u, passwordHash: hashPassword(newPassword) };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    setResetUserId(null);
    setNewPassword('');
    onShowToast('Password siswa berhasil di-reset!');
  };

  // Create Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle,
      content: annContent,
      type: annType,
      createdAt: new Date().toISOString(),
      createdBy: adminName,
      active: true,
    };

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    saveAnnouncements(updated);

    recordAuditLog({
      action: 'ADMIN_CREATE_ANNOUNCEMENT',
      userEmail: adminEmail,
      role: 'ADMIN',
      status: 'SUCCESS',
      details: `Membuat pengumuman sistem: ${annTitle}`,
    });

    setIsAnnModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    onShowToast('Pengumuman sistem berhasil ditambahkan!');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    saveAnnouncements(updated);
    onShowToast('Pengumuman dihapus.', 'info');
  };

  const filteredStudents = users
    .filter((u) => u.role === 'STUDENT')
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.schoolName && u.schoolName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Panel Kontrol Administrator
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data akun siswa, kirim pemberitahuan resmi, dan pantau aktivitas log keamanan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Akun Siswa</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStudents}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">{activeStudents} Aktif</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pengumuman Sistem</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">{announcements.length}</h3>
            <span className="text-[11px] text-slate-500">Banner Informasi</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pesan Masuk Siswa</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{directMessages.length}</h3>
            <span className="text-[11px] text-slate-500">Terkirim</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium">Log Keamanan</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{auditLogs.length}</h3>
            <span className="text-[11px] text-slate-500">Aktivitas Sesi</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('USERS')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'USERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Akun Siswa ({totalStudents})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MESSAGES')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'MESSAGES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Pesan Siswa ({directMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ANNOUNCEMENTS')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'ANNOUNCEMENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Pengumuman Sekolah ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SECURITY')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'SECURITY'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log Keamanan</span>
        </button>
      </div>

      {/* SUB TAB 1: USER MANAGEMENT */}
      {activeSubTab === 'USERS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, email, sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <p className="text-xs text-slate-500">
              Siswa ditangguhkan tidak dapat masuk ke portal.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-3">Siswa & Email</th>
                  <th className="p-3">Sekolah & Kelas</th>
                  <th className="p-3">Status Akun</th>
                  <th className="p-3">Tanggal Terdaftar</th>
                  <th className="p-3 text-right">Aksi Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">
                      <div>{st.name}</div>
                      <div className="text-[10px] text-slate-500">{st.email}</div>
                    </td>
                    <td className="p-3">
                      <div>{st.schoolName || '-'}</div>
                      <div className="text-[10px] text-blue-600 font-medium">{st.gradeClass || '-'}</div>
                    </td>
                    <td className="p-3">
                      {st.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                          <UserCheck className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold">
                          <UserX className="w-3 h-3" />
                          <span>Ditangguhkan</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(st.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setRecipientEmail(st.email);
                          setIsMsgModalOpen(true);
                        }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-semibold border border-blue-200"
                        title="Kirim Pesan Ke Inbox Siswa Ini"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResetUserId(st.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200"
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          st.status === 'ACTIVE'
                            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {st.status === 'ACTIVE' ? 'Tangguhkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 2: DIRECT MESSAGES TO INBOX */}
      {activeSubTab === 'MESSAGES' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pemberitahuan Langsung ke Inbox Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesan ini dikirim langsung ke pesan masuk akun siswa.
              </p>
            </div>
            <button
              onClick={() => {
                setRecipientEmail('ALL');
                setIsMsgModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tulis Pesan Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {directMessages.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 font-medium">Belum ada pesan yang dikirim ke siswa.</p>
              </div>
            ) : (
              directMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                        Ke: {msg.recipientEmail === 'ALL' ? 'SELURUH SISWA' : msg.recipientEmail}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{msg.subject}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{msg.body}</p>
                    <p className="text-[10px] text-slate-400">
                      Pengirim: {msg.senderName} |{' '}
                      {new Date(msg.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 3: ANNOUNCEMENTS */}
      {activeSubTab === 'ANNOUNCEMENTS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kelola Banner Pengumuman Sekolah</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengumuman disiarkan di bagian atas dashboard seluruh siswa.
              </p>
            </div>
            <button
              onClick={() => setIsAnnModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pengumuman</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 font-medium">Belum ada banner pengumuman sistem.</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                        {ann.type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <p className="text-[10px] text-slate-400">
                      Oleh: {ann.createdBy} | {new Date(ann.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Pengumuman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 4: AUDIT LOGS */}
      {activeSubTab === 'SECURITY' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Catatan Audit Keamanan</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan autentikasi, hak akses, dan riwayat aktivitas sistem.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="p-2.5">Waktu</th>
                  <th className="p-2.5">Aksi / Event</th>
                  <th className="p-2.5">Email / User</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Detail Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">{log.action}</td>
                    <td className="p-2.5 text-slate-700">{log.userEmail}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700 font-medium">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {log.status === 'SUCCESS' ? (
                        <span className="text-emerald-700 font-bold">[SUCCESS]</span>
                      ) : log.status === 'BLOCKED' ? (
                        <span className="text-red-700 font-bold">[BLOCKED]</span>
                      ) : (
                        <span className="text-amber-700 font-bold">[FAILED]</span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-500 truncate max-w-xs">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Direct Message */}
      {isMsgModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl text-slate-800">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Kirim Pesan ke Inbox Siswa</span>
            </h3>
            <form onSubmit={handleSendDirectMessage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tujuan Penerima</label>
                <select
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">📢 Seluruh Siswa (Broadcast)</option>
                  {users
                    .filter((u) => u.role === 'STUDENT')
                    .map((s) => (
                      <option key={s.id} value={s.email}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Subjek Pesan</label>
                <input
                  type="text"
                  required
                  placeholder="Subjek pesan..."
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Prioritas Pesan</label>
                <select
                  value={msgPriority}
                  onChange={(e) => setMsgPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="NORMAL">Biasa / Normal</option>
                  <option value="HIGH">Penting / High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Isi Pesan</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan isi pesan untuk siswa..."
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMsgModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Announcement */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl text-slate-800">
            <h3 className="text-sm font-bold text-slate-900">Buat Banner Pengumuman Sekolah</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Judul pengumuman..."
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tipe Prioritas</label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="IMPORTANT">IMPORTANT (Sangat Penting)</option>
                  <option value="WARNING">WARNING (Peringatan)</option>
                  <option value="INFO">INFO (Informasi)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Isi Pengumuman</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail pengumuman..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Siarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetUserId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl text-slate-800">
            <h3 className="text-sm font-bold text-slate-900">Reset Password Siswa</h3>
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetUserId(null);
                    setNewPassword('');
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

