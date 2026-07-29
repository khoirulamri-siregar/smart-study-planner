import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, Trash2, Edit3, BookOpen, Target, User, Gauge } from 'lucide-react';

interface SubjectsManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [targetGrade, setTargetGrade] = useState(85);
  const [color, setColor] = useState('#3B82F6');
  const [difficultyLevel, setDifficultyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(3.5);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setCode('');
    setName('');
    setTeacherName('');
    setTargetGrade(85);
    setColor('#3B82F6');
    setDifficultyLevel(3);
    setWeeklyTargetHours(3.5);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setCode(subject.code);
    setName(subject.name);
    setTeacherName(subject.teacherName);
    setTargetGrade(subject.targetGrade);
    setColor(subject.color);
    setDifficultyLevel(subject.difficultyLevel);
    setWeeklyTargetHours(subject.weeklyTargetHours);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        code,
        name,
        teacherName,
        targetGrade: Number(targetGrade),
        color,
        difficultyLevel,
        weeklyTargetHours: Number(weeklyTargetHours),
      });
    } else {
      const newSubject: Subject = {
        id: `subj-${Date.now()}`,
        code,
        name,
        teacherName,
        targetGrade: Number(targetGrade),
        color,
        difficultyLevel,
        weeklyTargetHours: Number(weeklyTargetHours),
      };
      onAddSubject(newSubject);
    }
    setIsModalOpen(false);
  };

  const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Manajemen Mata Pelajaran</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur daftar mata pelajaran, target nilai akademik, dan guru pengampu.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      {/* Grid List Mata Pelajaran */}
      {subjects.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Belum ada mata pelajaran</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Gunakan tombol "Tambah Mata Pelajaran" di atas untuk menambahkan pelajaran yang ingin Anda pelajari.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all relative overflow-hidden"
            >
              {/* Top Color Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: subject.color }}
              ></div>

              <div className="flex items-start justify-between pt-1">
                <div>
                  <span
                    className="px-2.5 py-0.5 text-xs font-bold rounded border text-slate-800"
                    style={{
                      backgroundColor: `${subject.color}15`,
                      borderColor: `${subject.color}40`,
                    }}
                  >
                    {subject.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                    {subject.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(subject)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {deletingSubjectId === subject.id ? (
                    <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-lg border border-red-200">
                      <span className="text-[11px] font-semibold text-red-700 px-1">Hapus?</span>
                      <button
                        onClick={() => {
                          onDeleteSubject(subject.id);
                          setDeletingSubjectId(null);
                        }}
                        className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px] hover:bg-red-700"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setDeletingSubjectId(null)}
                        className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-300"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingSubjectId(subject.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Mata Pelajaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Details */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Guru:</span>
                  </span>
                  <span className="font-semibold text-slate-800">{subject.teacherName || '-'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Target Nilai:</span>
                  </span>
                  <span className="font-bold text-emerald-700">{subject.targetGrade} / 100</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tingkat Kesulitan:</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    Level {subject.difficultyLevel} / 5
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Belajar/Minggu:</span>
                  <span className="font-semibold text-blue-700">
                    {subject.weeklyTargetHours} jam
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Subject */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <h3 className="text-sm font-bold text-slate-900">
              {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Kode Matpel</label>
                  <input
                    type="text"
                    required
                    placeholder="MAT-A"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Matematika Peminatan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  placeholder="Drs. Budi Santoso"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Target Nilai (0-100)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Target Jam/Minggu
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    required
                    value={weeklyTargetHours}
                    onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tingkat Kesulitan (1 = Sangat Mudah, 5 = Sangat Sulit)
                </label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(Number(e.target.value) as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value={1}>Level 1 - Sangat Mudah</option>
                  <option value={2}>Level 2 - Mudah</option>
                  <option value={3}>Level 3 - Sedang</option>
                  <option value={4}>Level 4 - Sulit</option>
                  <option value={5}>Level 5 - Sangat Sulit / Butuh Fokus Ekstra</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Warna Label</label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
