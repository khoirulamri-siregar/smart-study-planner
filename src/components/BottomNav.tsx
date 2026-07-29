import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BarChart3,
  User,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfileModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfileModal,
}) => {
  const items = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'planner', label: 'Jadwal', icon: Calendar },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare },
    { id: 'analytics', label: 'Statistik', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 flex items-center justify-around shadow-sm">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'profile') {
                onOpenProfileModal();
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
