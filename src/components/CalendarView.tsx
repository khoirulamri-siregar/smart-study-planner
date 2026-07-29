import React, { useState } from 'react';
import { Task, ScheduleItem, Subject } from '../types';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  schedule: ScheduleItem[];
  subjects: Subject[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, schedule, subjects }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getSubjectColor = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s?.color || '#2563EB';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span>Kalender Akademik & Belajar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lihat penyebaran jadwal sesi belajar dan batas waktu tugas dalam tampilan kalender bulanan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-900 px-2">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Kalender */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100 mb-2">
          <div>Ming</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {paddingDays.map((p) => (
            <div key={`pad-${p}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-lg" />
          ))}

          {daysArray.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              day
            ).padStart(2, '0')}`;

            const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
            const daySchedule = schedule.filter((s) => s.date === dateStr);
            const isToday =
              new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div
                key={day}
                className={`h-20 sm:h-24 p-1.5 border rounded-lg flex flex-col justify-between text-xs overflow-hidden ${
                  isToday
                    ? 'border-blue-600 bg-blue-50/30 font-bold'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] ${
                      isToday ? 'text-blue-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="px-1 py-0.5 text-[9px] bg-amber-50 text-amber-800 rounded border border-amber-200 truncate"
                      title={`Tugas: ${t.title}`}
                    >
                      PR: {t.title}
                    </div>
                  ))}

                  {daySchedule.map((s) => (
                    <div
                      key={s.id}
                      className="px-1 py-0.5 text-[9px] bg-blue-50 text-blue-800 rounded border border-blue-200 truncate"
                      title={`Sesi: ${s.title}`}
                    >
                      {s.startTime} {s.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
