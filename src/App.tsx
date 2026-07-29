import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { SubjectsManager } from './components/SubjectsManager';
import { TaskManager } from './components/TaskManager';
import { SmartPlanner } from './components/SmartPlanner';
import { CalendarView } from './components/CalendarView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnalyticsView } from './components/AnalyticsView';
import { HobbiesManager } from './components/HobbiesManager';
import { ProfileModal } from './components/ProfileModal';
import { StudentInboxModal } from './components/StudentInboxModal';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

import {
  loadProfile,
  saveProfile,
  loadSubjects,
  saveSubjects,
  loadTasks,
  saveTasks,
  loadSessions,
  saveSessions,
  loadSchedule,
  saveSchedule,
  loadHobbies,
  saveHobbies,
} from './utils/storage';

import {
  getCurrentSession,
  clearSession,
  getStudentInbox,
} from './utils/auth';

import { Subject, Task, StudySession, ScheduleItem, StudentProfile, AuthSession, HobbyActivity } from './types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // Authentication session state
  const [session, setSession] = useState<AuthSession | null>(getCurrentSession);

  const [activeTab, setActiveTab] = useState<string>(
    session?.role === 'ADMIN' ? 'admin' : 'dashboard'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // Compute unread inbox messages
  const studentMessages = session ? getStudentInbox(session.email) : [];
  const unreadInboxCount = studentMessages.filter((m) => !m.isRead).length;

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Login handler
  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setActiveTab(newSession.role === 'ADMIN' ? 'admin' : 'dashboard');
    showToast(`Selamat datang, ${newSession.name}!`);
  };

  // Logout handler
  const handleLogout = () => {
    clearSession();
    setSession(null);
    showToast('Logout berhasil.', 'info');
  };

  // Core Persistent State
  const [profile, setProfile] = useState<StudentProfile>(() => loadProfile(session?.userId));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects(session?.userId));
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(session?.userId));
  const [sessions, setSessions] = useState<StudySession[]>(() => loadSessions(session?.userId));
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => loadSchedule(session?.userId));
  const [hobbies, setHobbies] = useState<HobbyActivity[]>(() => loadHobbies(session?.userId));

  // Active pomodoro task selection bridge
  const [pomodoroSelectedTaskId, setPomodoroSelectedTaskId] = useState<string | undefined>();

  // Strict Role Guard Middleware
  useEffect(() => {
    if (session) {
      if (session.role === 'ADMIN' && activeTab !== 'admin') {
        setActiveTab('admin');
      } else if (session.role === 'STUDENT' && activeTab === 'admin') {
        setActiveTab('dashboard');
      }
    }
  }, [session?.role, activeTab]);

  // Sync state when session changes
  useEffect(() => {
    if (session) {
      setProfile(loadProfile(session.userId));
      setSubjects(loadSubjects(session.userId));
      setTasks(loadTasks(session.userId));
      setSessions(loadSessions(session.userId));
      setSchedule(loadSchedule(session.userId));
      setHobbies(loadHobbies(session.userId));
    }
  }, [session?.userId]);

  // Persist handlers scoped by current user
  useEffect(() => {
    if (session?.userId) saveProfile(profile, session.userId);
  }, [profile, session?.userId]);

  useEffect(() => {
    if (session?.userId) saveSubjects(subjects, session.userId);
  }, [subjects, session?.userId]);

  useEffect(() => {
    if (session?.userId) saveTasks(tasks, session.userId);
  }, [tasks, session?.userId]);

  useEffect(() => {
    if (session?.userId) saveSessions(sessions, session.userId);
  }, [sessions, session?.userId]);

  useEffect(() => {
    if (session?.userId) saveSchedule(schedule, session.userId);
  }, [schedule, session?.userId]);

  // Profile Handler
  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    showToast('Profil berhasil disimpan!');
  };

  // Subject Handlers
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    showToast(`Mata pelajaran "${newSubject.name}" berhasil ditambahkan!`);
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)));
    showToast(`Mata pelajaran "${updatedSubject.name}" berhasil diperbarui!`);
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subName = subjects.find((s) => s.id === subjectId)?.name || '';
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    showToast(`Mata pelajaran "${subName}" dihapus.`, 'info');
  };

  // Task Handlers
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Tugas "${newTask.title}" berhasil ditambahkan!`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    showToast(`Tugas "${updatedTask.title}" diperbarui!`);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskTitle = tasks.find((t) => t.id === taskId)?.title || '';
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast(`Tugas "${taskTitle}" dihapus.`, 'info');
  };

  // Session Handlers
  const handleSaveSession = (newSession: StudySession) => {
    setSessions((prev) => [newSession, ...prev]);
    showToast(`Sesi belajar (${newSession.durationMinutes}m) tersimpan!`);

    if (newSession.taskId) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === newSession.taskId) {
            const updatedCompletedMins = t.completedMinutes + newSession.durationMinutes;
            const updatedStatus =
              updatedCompletedMins >= t.estimatedMinutes ? 'COMPLETED' : 'IN_PROGRESS';
            return {
              ...t,
              completedMinutes: updatedCompletedMins,
              status: updatedStatus,
            };
          }
          return t;
        })
      );
    }
  };

  // Schedule Handler
  const handleUpdateSchedule = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    showToast('Jadwal belajar berhasil disimpan!');
  };

  // Bridge: Launch Pomodoro with task
  const handleStartPomodoroWithTask = (taskId: string) => {
    setPomodoroSelectedTaskId(taskId);
    setActiveTab('pomodoro');
  };

  // Unauthenticated -> render LoginPage
  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Toast Notification Floating Container */}
      <div className="fixed bottom-16 md:bottom-5 right-5 z-50 space-y-2 max-w-xs w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-md border flex items-center justify-between space-x-2 text-xs transition-all ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/50 text-white'
                : toast.type === 'error'
                ? 'bg-slate-900 border-rose-500/50 text-white'
                : 'bg-slate-900 border-blue-500/50 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span className="font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={{
          ...profile,
          name: session.name,
        }}
        sessionRole={session.role}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        <Navbar
          profile={{
            ...profile,
            name: session.name,
          }}
          sessionRole={session.role}
          unreadInboxCount={unreadInboxCount}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenInboxModal={() => setIsInboxOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          {session.role === 'ADMIN' && activeTab === 'admin' && (
            <AdminDashboard
              adminEmail={session.email}
              adminName={session.name}
              onShowToast={showToast}
            />
          )}

          {session.role === 'STUDENT' && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    profile={{
                      ...profile,
                      name: session.name,
                    }}
                    studentEmail={session.email}
                    subjects={subjects}
                    tasks={tasks}
                    sessions={sessions}
                    schedule={schedule}
                    setActiveTab={setActiveTab}
                    onStartPomodoroWithTask={handleStartPomodoroWithTask}
                    onOpenInboxModal={() => setIsInboxOpen(true)}
                  />
                )}

                {activeTab === 'planner' && (
                  <SmartPlanner
                    tasks={tasks}
                    subjects={subjects}
                    schedule={schedule}
                    profile={profile}
                    onUpdateSchedule={handleUpdateSchedule}
                    onStartPomodoroWithTask={handleStartPomodoroWithTask}
                  />
                )}

                {activeTab === 'calendar' && (
                  <CalendarView
                    tasks={tasks}
                    schedule={schedule}
                    subjects={subjects}
                  />
                )}

                {activeTab === 'subjects' && (
                  <SubjectsManager
                    subjects={subjects}
                    onAddSubject={handleAddSubject}
                    onUpdateSubject={handleUpdateSubject}
                    onDeleteSubject={handleDeleteSubject}
                  />
                )}

                {activeTab === 'hobbies' && (
                  <HobbiesManager
                    profile={{
                      ...profile,
                      name: session.name,
                    }}
                    hobbies={hobbies}
                    onSaveHobbies={(updatedHobbies) => {
                      setHobbies(updatedHobbies);
                      if (session?.userId) saveHobbies(updatedHobbies, session.userId);
                      showToast('Minat & Ekstrakurikuler berhasil diperbarui!');
                    }}
                    onOpenProfile={() => setIsProfileModalOpen(true)}
                  />
                )}

                {activeTab === 'tasks' && (
                  <TaskManager
                    tasks={tasks}
                    subjects={subjects}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onStartPomodoroWithTask={handleStartPomodoroWithTask}
                  />
                )}

                {activeTab === 'pomodoro' && (
                  <PomodoroTimer
                    tasks={tasks}
                    subjects={subjects}
                    initialTaskId={pomodoroSelectedTaskId}
                    onSaveSession={handleSaveSession}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsView subjects={subjects} sessions={sessions} tasks={tasks} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        {session.role === 'STUDENT' && (
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        profile={profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Student Inbox Modal */}
      <StudentInboxModal
        studentEmail={session.email}
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
      />
    </div>
  );
}
