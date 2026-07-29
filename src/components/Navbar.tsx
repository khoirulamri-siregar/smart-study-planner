import React from 'react';
import { StudentProfile, UserRole } from '../types';
import { Menu, Mail, LogOut } from 'lucide-react';

interface NavbarProps {
  profile: StudentProfile;
  sessionRole?: UserRole;
  unreadInboxCount?: number;
  onOpenMobileMenu: () => void;
  onOpenProfileModal: () => void;
  onOpenInboxModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  sessionRole = 'STUDENT',
  unreadInboxCount = 0,
  onOpenMobileMenu,
  onOpenProfileModal,
  onOpenInboxModal,
  onLogout,
}) => {
  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu & Greeting */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate max-w-[180px] sm:max-w-none">
            {sessionRole === 'ADMIN' ? 'Halo, Admin' : `Halo, ${profile.name}`}
          </h2>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
            {todayStr}
          </p>
        </div>
      </div>

      {/* Right: Messages, Profile Avatar & Logout */}
      <div className="flex items-center space-x-2">
        {sessionRole === 'STUDENT' && onOpenInboxModal && unreadInboxCount > 0 && (
          <button
            onClick={onOpenInboxModal}
            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 flex items-center space-x-1.5 text-xs font-medium"
            title="Pesan Masuk"
          >
            <Mail className="w-4 h-4" />
            <span className="text-[11px] font-bold">{unreadInboxCount}</span>
          </button>
        )}

        <button
          onClick={onOpenProfileModal}
          className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
          title="Profil"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
          </div>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-red-200"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        )}
      </div>
    </header>
  );
};
