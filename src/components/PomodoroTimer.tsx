import React, { useState, useEffect, useRef } from 'react';
import { Task, Subject, StudySession } from '../types';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PomodoroTimerProps {
  tasks: Task[];
  subjects: Subject[];
  initialTaskId?: string;
  onSaveSession: (session: StudySession) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  subjects,
  initialTaskId,
  onSaveSession,
}) => {
  type Mode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  const [mode, setMode] = useState<Mode>('WORK');

  const WORK_TIME = 25 * 60;
  const SHORT_BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;

  const [timeLeft, setTimeLeft] = useState<number>(WORK_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    tasks.find((t) => t.id === initialTaskId)?.subjectId || subjects[0]?.id || ''
  );

  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedDurationMinutes, setCompletedDurationMinutes] = useState<number>(25);
  const [comprehensionRating, setComprehensionRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find((t) => t.id === selectedTaskId);
      if (task) {
        setSelectedSubjectId(task.subjectId);
      }
    }
  }, [selectedTaskId, tasks]);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio context fallback
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            playBeep();

            if (mode === 'WORK') {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              setCompletedDurationMinutes(25);
              setShowCompletionModal(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'WORK') setTimeLeft(WORK_TIME);
    else if (newMode === 'SHORT_BREAK') setTimeLeft(SHORT_BREAK_TIME);
    else if (newMode === 'LONG_BREAK') setTimeLeft(LONG_BREAK_TIME);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'WORK') setTimeLeft(WORK_TIME);
    else if (mode === 'SHORT_BREAK') setTimeLeft(SHORT_BREAK_TIME);
    else if (mode === 'LONG_BREAK') setTimeLeft(LONG_BREAK_TIME);
  };

  const handleSaveSessionLog = () => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      taskId: selectedTaskId || undefined,
      subjectId: selectedSubjectId,
      startTime: new Date(Date.now() - completedDurationMinutes * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: completedDurationMinutes,
      mode: 'POMODORO',
      comprehensionRating,
      notes,
    };

    onSaveSession(newSession);
    setShowCompletionModal(false);
    setNotes('');
    handleModeChange('SHORT_BREAK');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalModeSeconds =
    mode === 'WORK' ? WORK_TIME : mode === 'SHORT_BREAK' ? SHORT_BREAK_TIME : LONG_BREAK_TIME;
  const progressPercent = ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TimerIcon className="w-5 h-5 text-blue-600" />
            <span>Sesi Fokus Belajar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gunakan teknik Pomodoro: 25 menit fokus penuh diikuti 5 menit istirahat.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-lg"
          title={soundEnabled ? 'Suara Aktif' : 'Suara Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Timer Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center space-y-6">
        {/* Mode Tabs */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg text-xs font-medium space-x-1">
          <button
            onClick={() => handleModeChange('WORK')}
            className={`px-4 py-2 rounded-md transition-all ${
              mode === 'WORK'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fokus (25m)
          </button>
          <button
            onClick={() => handleModeChange('SHORT_BREAK')}
            className={`px-4 py-2 rounded-md transition-all ${
              mode === 'SHORT_BREAK'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Istirahat (5m)
          </button>
          <button
            onClick={() => handleModeChange('LONG_BREAK')}
            className={`px-4 py-2 rounded-md transition-all ${
              mode === 'LONG_BREAK'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Istirahat Panjang (15m)
          </button>
        </div>

        {/* Task Selection */}
        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tugas (Opsional)</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Tanpa Tugas --</option>
              {tasks
                .filter((t) => t.status !== 'COMPLETED')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Display Timer */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-tight font-mono">
            {formatTimer(timeLeft)}
          </div>
          <div className="w-full max-w-md bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg text-slate-800">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sesi Fokus Selesai!</h3>
                <p className="text-xs text-slate-500">
                  Anda telah menyelesaikan {completedDurationMinutes} menit waktu belajar.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tingkat Pemahaman Materi (1-5):
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setComprehensionRating(star as any)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        comprehensionRating === star
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Catatan Sesi (Opsional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ringkasan poin penting materi yang telah dipelajari..."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
              >
                Lewati
              </button>
              <button
                type="button"
                onClick={handleSaveSessionLog}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
