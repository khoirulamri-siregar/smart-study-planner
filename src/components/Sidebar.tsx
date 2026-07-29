import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CheckSquare,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  X,
  BookMarked,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';
import { StudentProfile, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  sessionRole?: UserRole;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  sessionRole = 'STUDENT',
  isMobileOpen,
  setIsMobileOpen,
  onOpenProfileModal,
  onLogout,
}) => {
  const studentNavItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'planner', label: 'Jadwal', icon: Calendar },
    { id: 'calendar', label: 'Kalender', icon: CalendarDays },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare },
    { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen },
    { id: 'hobbies', label: 'Minat & Ekskul', icon: HeartHandshake },
    { id: 'analytics', label: 'Statistik', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Administrator', icon: ShieldCheck },
  ];

  const navItems = sessionRole === 'ADMIN' ? adminNavItems : studentNavItems;

  const handleTabClick = (id: string) => {
    if (id === 'profile') {
      onOpenProfileModal();
    } else {
      setActiveTab(id);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (Left Sidebar) */}
      <aside className="w-60 hidden md:flex flex-col justify-between h-screen sticky top-0 bg-white border-r border-slate-200 text-slate-800 z-20 shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-slate-100 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">
                Smart Study Planner
              </h1>
              <p className="text-[11px] text-slate-500 mt-1">Siswa SMA</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer User Info & Logout */}
          <div className="p-3 border-t border-slate-100 space-y-2">
            <div
              onClick={onOpenProfileModal}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all flex items-center space-x-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{profile.gradeClass || 'Siswa'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-xs font-medium transition-all border border-slate-200 hover:border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Slide-over (if toggled via hamburger) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 bg-white h-full shadow-lg z-10 flex flex-col justify-between p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <BookMarked className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-900">Smart Study Planner</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
