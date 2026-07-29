import React from 'react';
import { Task, Subject, StudySession, ScheduleItem, StudentProfile } from '../types';
import {
  CalendarCheck,
  CheckSquare,
  Clock,
  Play,
  Plus,
  BookOpen,
  ArrowRight,
  History,
} from 'lucide-react';

interface DashboardProps {
  profile: StudentProfile;
  studentEmail?: string;
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
  schedule: ScheduleItem[];
  setActiveTab: (tab: string) => void;
  onStartPomodoroWithTask: (taskId: string) => void;
  onOpenInboxModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  subjects,
  tasks,
  sessions,
  schedule,
  setActiveTab,
  onStartPomodoroWithTask,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Jadwal Hari Ini
  const todaySchedule = schedule.filter((s) => s.date === todayStr);

  // 2. Tugas Mendatang
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');

  // 3. Target Belajar Minggu Ini
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const thisWeekSessions = sessions.filter((s) => new Date(s.startTime) >= oneWeekAgo);
  const totalMinutesThisWeek = thisWeekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHoursThisWeek = (totalMinutesThisWeek / 60).toFixed(1);
  const weeklyTargetHours = (profile.dailyStudyTargetHours * 7).toFixed(1);
  const targetPercentage = Math.min(
    100,
    Math.round((totalMinutesThisWeek / (profile.dailyStudyTargetHours * 7 * 60)) * 100)
  );

  // 4. Aktivitas Terakhir
  const recentSessions = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  ).slice(0, 5);

  const getSubjectName = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s ? `${s.code} - ${s.name}` : 'Mata Pelajaran';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* 1. Halo, {Nama} */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Halo, {profile.name || 'Siswa'}.
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Berikut adalah ringkasan kegiatan dan jadwal belajar Anda untuk hari ini.
        </p>
      </div>

      {/* 2. Jadwal Hari Ini */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span>Jadwal Hari Ini</span>
          </h2>
          <button
            onClick={() => setActiveTab('planner')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Atur Jadwal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center p-4">
            <p className="text-xs font-semibold text-slate-700">Belum ada jadwal belajar.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tambahkan jadwal belajar mandiri Anda untuk hari ini.
            </p>
            <button
              onClick={() => setActiveTab('planner')}
              className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {getSubjectName(item.subjectId)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Tugas Mendatang */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Tugas Mendatang</span>
          </h2>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center p-4">
            <p className="text-xs font-semibold text-slate-700">Tidak ada tugas.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Semua tugas belajar Anda telah terselesaikan.
            </p>
            <button
              onClick={() => setActiveTab('tasks')}
              className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.slice(0, 4).map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subject?.color || '#2563EB' }}
                      ></span>
                      <span className="font-bold text-slate-900">{task.title}</span>
                      <span className="text-[10px] text-slate-500">
                        ({subject?.name || 'Umum'})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Batas waktu: {task.dueDate} • Estimasi: {task.estimatedMinutes} menit
                    </p>
                  </div>

                  <button
                    onClick={() => onStartPomodoroWithTask(task.id)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-medium transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Mulai</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Target Belajar Minggu Ini */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Target Belajar Minggu Ini</span>
          </h2>
          <span className="text-xs font-bold text-blue-600">{targetPercentage}%</span>
        </div>

        {subjects.length === 0 ? (
          <div className="py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center p-4">
            <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">Tambahkan mata pelajaran pertama.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tambahkan mata pelajaran untuk menyusun target belajar mingguan Anda.
            </p>
            <button
              onClick={() => setActiveTab('subjects')}
              className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Progres Jam Belajar:</span>
              <span className="font-bold text-slate-900">
                {totalHoursThisWeek} / {weeklyTargetHours} jam
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${targetPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Aktivitas Terakhir */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Aktivitas Terakhir</span>
          </h2>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Statistik Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center p-4">
            <p className="text-xs font-semibold text-slate-700">Belum ada aktivitas belajar.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Gunakan Sesi Fokus untuk mulai mencatat durasi belajar Anda.
            </p>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all inline-flex items-center space-x-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Sesi Fokus</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {getSubjectName(session.subjectId)}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {new Date(session.startTime).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-100 text-[11px]">
                  {session.durationMinutes} menit
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
