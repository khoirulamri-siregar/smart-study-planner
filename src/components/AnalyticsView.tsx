import React from 'react';
import { Subject, StudySession, Task } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Clock, Star, Award, TrendingUp, BookOpen } from 'lucide-react';

interface AnalyticsViewProps {
  subjects: Subject[];
  sessions: StudySession[];
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ subjects, sessions, tasks }) => {
  // Data jam belajar per mata pelajaran
  const hoursPerSubject = subjects.map((sub) => {
    const subSessions = sessions.filter((s) => s.subjectId === sub.id);
    const totalMinutes = subSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    // Calculate average comprehension rating
    const avgRating =
      subSessions.length > 0
        ? Number(
            (
              subSessions.reduce((acc, s) => acc + (s.comprehensionRating || 3), 0) /
              subSessions.length
            ).toFixed(1)
          )
        : 0;

    return {
      name: sub.code,
      fullName: sub.name,
      jam: totalHours,
      pemahaman: avgRating,
      color: sub.color || '#3b82f6',
    };
  });

  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const avgComprehensionOverall =
    sessions.length > 0
      ? (
          sessions.reduce((acc, s) => acc + (s.comprehensionRating || 3), 0) / sessions.length
        ).toFixed(1)
      : '0.0';

  const hasData = sessions.length > 0 || subjects.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Analisis & Statistik Belajar</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluasi jam belajar, distribusi mata pelajaran, dan rata-rata pemahaman materi.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Akumulasi Belajar</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{totalStudyHours} jam</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Rata-Rata Pemahaman</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{avgComprehensionOverall} / 5.0</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Sesi Terhitung</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{sessions.length} sesi</h3>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Belum ada data analisis</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Data grafik dan statistik akan otomatis terisi setelah Anda menambahkan mata pelajaran dan mencatat sesi belajar.
          </p>
        </div>
      ) : (
        /* Charts Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Total Jam Belajar Per Matpel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Alokasi Jam Belajar Per Mata Pelajaran</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursPerSubject}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="j" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="jam" radius={[4, 4, 0, 0]}>
                    {hoursPerSubject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Distrubusi Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Proporsi Alokasi Waktu Belajar</span>
            </h3>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hoursPerSubject}
                    dataKey="jam"
                    nameKey="fullName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {hoursPerSubject.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
