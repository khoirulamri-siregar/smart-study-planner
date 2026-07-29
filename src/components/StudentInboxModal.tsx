import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Bell, X, ShieldCheck, Inbox, AlertCircle } from 'lucide-react';
import { getStudentInbox, markMessageAsRead } from '../utils/auth';
import { DirectStudentMessage } from '../types';

interface StudentInboxModalProps {
  studentEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const StudentInboxModal: React.FC<StudentInboxModalProps> = ({
  studentEmail,
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [messages, setMessages] = useState<DirectStudentMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<DirectStudentMessage | null>(null);

  useEffect(() => {
    if (studentEmail) {
      const inbox = getStudentInbox(studentEmail);
      setMessages(inbox);
      const unread = inbox.filter((m) => !m.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    }
  }, [studentEmail, isOpen]);

  const handleSelectMessage = (msg: DirectStudentMessage) => {
    setSelectedMsg(msg);
    if (!msg.isRead) {
      markMessageAsRead(msg.id);
      const updated = messages.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m));
      setMessages(updated);
      const unread = updated.filter((m) => !m.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Kotak Masuk Pesan & Pengumuman Siswa
              </h3>
              <p className="text-xs text-slate-400">
                Pesan resmi dan pengumuman akademik terverifikasi dari Admin / Sekolah.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Message List */}
          <div className="md:col-span-2 overflow-y-auto divide-y divide-slate-800/60 max-h-[60vh] md:max-h-none">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">Kotak masuk kosong.</div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full p-3.5 text-left transition-all flex items-start space-x-2.5 ${
                    selectedMsg?.id === msg.id
                      ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="pt-0.5">
                    {msg.isRead ? (
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 truncate">
                        {msg.senderName}
                      </span>
                      {msg.priority === 'HIGH' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-800/50 rounded">
                          PENTING
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-xs truncate mt-0.5 ${
                        msg.isRead ? 'text-slate-400 font-normal' : 'text-white font-bold'
                      }`}
                    >
                      {msg.subject}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{msg.body}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detailed View */}
          <div className="md:col-span-3 p-5 overflow-y-auto bg-slate-950/40 flex flex-col justify-between">
            {selectedMsg ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{selectedMsg.senderName}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(selectedMsg.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedMsg.subject}</h3>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {selectedMsg.body}
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Pesan terverifikasi dari Admin / Sekolah. Disiarkan melalui sistem terenkripsi.
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Inbox className="w-10 h-10 mb-2 text-slate-700" />
                <p>Pilih pesan di sebelah kiri untuk membaca surat / pengumuman secara detail.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
