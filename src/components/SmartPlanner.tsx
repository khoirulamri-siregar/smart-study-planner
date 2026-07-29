import React, { useState } from 'react';
import { Task, Subject, ScheduleItem, StudentProfile } from '../types';
import { generateSmartSchedule } from '../utils/plannerAlgorithm';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';

interface SmartPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  schedule: ScheduleItem[];
  profile: StudentProfile;
  onUpdateSchedule: (newSchedule: ScheduleItem[]) => void;
  onStartPomodoroWithTask: (taskId: string) => void;
}

export const SmartPlanner: React.FC<SmartPlannerProps> = ({
  tasks,
  subjects,
  schedule,
  profile,
  onUpdateSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSchedule = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateSmartSchedule(tasks, subjects, profile, new Date(), 7);
      onUpdateSchedule(result.schedule);
      setIsGenerating(false);
    }, 300);
  };

  const handleDeleteItem = (id: string) => {
    const updated = schedule.filter((item) => item.id !== id);
    onUpdateSchedule(updated);
  };

  const selectedDateSchedule = schedule.filter((item) => item.date === selectedDate);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getSubjectName = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s ? `${s.code} - ${s.name}` : 'Mata Pelajaran';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>Jadwal Belajar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Susun jadwal belajar harian Anda secara otomatis berdasarkan estimasi tugas dan target waktu.
          </p>
        </div>

        <button
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Menyusun Jadwal...' : 'Susun Jadwal Otomatis'}</span>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-900 px-2">
            {new Date(selectedDate).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>

          <button
            onClick={() => changeDate(1)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
        >
          Hari Ini
        </button>
      </div>

      {/* Schedule Items List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Daftar Sesi Belajar</span>
        </h3>

        {selectedDateSchedule.length === 0 ? (
          <div className="py-10 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center p-4">
            <p className="text-xs font-semibold text-slate-700">Belum ada jadwal belajar.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Klik tombol "Susun Jadwal Otomatis" di atas untuk menyusun sesi belajar untuk tanggal ini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateSchedule.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="font-bold text-slate-900">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {getSubjectName(item.subjectId)}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus Sesi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
