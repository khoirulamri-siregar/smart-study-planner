import React, { useState } from 'react';
import { Task, Subject, Priority, TaskStatus } from '../types';
import {
  Plus,
  Trash2,
  Edit3,
  CheckSquare,
  Clock,
  Play,
  Filter,
  Tag,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartPomodoroWithTask: (taskId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onStartPomodoroWithTask,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Filter states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<Priority>('HIGH_URGENT');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDueDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    setEstimatedMinutes(60);
    setPriority('HIGH_URGENT');
    setDescription('');
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setSubjectId(task.subjectId);
    setDueDate(task.dueDate);
    setEstimatedMinutes(task.estimatedMinutes);
    setPriority(task.priority);
    setDescription(task.description || '');
    setTagsInput(task.tags ? task.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectId || !dueDate) return;

    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title,
        subjectId,
        dueDate,
        estimatedMinutes: Number(estimatedMinutes),
        priority,
        description,
        tags: tagsArr,
      });
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        subjectId,
        dueDate,
        estimatedMinutes: Number(estimatedMinutes),
        completedMinutes: 0,
        priority,
        status: 'PENDING',
        description,
        tags: tagsArr,
        createdAt: new Date().toISOString(),
      };
      onAddTask(newTask);
    }
    setIsModalOpen(false);
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    onUpdateTask({
      ...task,
      status: nextStatus,
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedSubjectFilter !== 'ALL' && task.subjectId !== selectedSubjectFilter) return false;
    if (selectedPriorityFilter !== 'ALL' && task.priority !== selectedPriorityFilter) return false;
    if (selectedStatusFilter !== 'ALL' && task.status !== selectedStatusFilter) return false;
    return true;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'HIGH_URGENT':
        return {
          label: 'I: Penting & Mendesak',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'HIGH_NOT_URGENT':
        return {
          label: 'II: Penting, Tidak Mendesak',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'LOW_URGENT':
        return {
          label: 'III: Tidak Penting, Mendesak',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'LOW_NOT_URGENT':
        return {
          label: 'IV: Tidak Penting & Tidak Mendesak',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Manajemen Tugas & Prioritas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tugas dan ujian berdasarkan Matriks Prioritas Eisenhower & estimasi waktu.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs shadow-sm">
        <div className="flex items-center space-x-2 text-slate-500 font-semibold mr-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter:</span>
        </div>

        {/* Filter Matpel */}
        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600"
        >
          <option value="ALL">Semua Mata Pelajaran</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} - {s.name}
            </option>
          ))}
        </select>

        {/* Filter Prioritas */}
        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600"
        >
          <option value="ALL">Semua Prioritas (Eisenhower)</option>
          <option value="HIGH_URGENT">Q1: Penting & Mendesak</option>
          <option value="HIGH_NOT_URGENT">Q2: Penting, Tidak Mendesak</option>
          <option value="LOW_URGENT">Q3: Tidak Penting, Mendesak</option>
          <option value="LOW_NOT_URGENT">Q4: Tidak Penting & Tidak Mendesak</option>
        </select>

        {/* Filter Status */}
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600"
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">Sedang Dikerjakan</option>
          <option value="COMPLETED">Selesai</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl p-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-semibold text-sm">Belum ada tugas</p>
            <p className="text-slate-500 text-xs mt-1">Gunakan tombol "Tambah Tugas" untuk mencatat tugas baru Anda.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            const priorityBadge = getPriorityBadge(task.priority);
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl p-4 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-200 opacity-60 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left Side: Checkbox & Info */}
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-blue-600'
                    }`}
                  >
                    {isCompleted && <CheckSquare className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded border text-slate-800"
                        style={{
                          backgroundColor: `${subject?.color || '#3b82f6'}15`,
                          borderColor: `${subject?.color || '#3b82f6'}40`,
                        }}
                      >
                        {subject ? `${subject.code} - ${subject.name}` : 'Mata Pelajaran'}
                      </span>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold border rounded ${priorityBadge.color}`}
                      >
                        {priorityBadge.label}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold text-slate-900 ${
                        isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Deadline: <strong className="text-slate-800">{task.dueDate}</strong></span>
                      </span>

                      <span className="flex items-center space-x-1">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>Estimasi: <strong className="text-slate-800">{task.estimatedMinutes} menit</strong></span>
                      </span>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {task.tags.map((tg, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200"
                            >
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => onStartPomodoroWithTask(task.id)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Sesi Fokus</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {deletingTaskId === task.id ? (
                    <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-lg border border-red-200">
                      <span className="text-[11px] font-semibold text-red-700 px-1">Hapus?</span>
                      <button
                        onClick={() => {
                          onDeleteTask(task.id);
                          setDeletingTaskId(null);
                        }}
                        className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px] hover:bg-red-700"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setDeletingTaskId(null)}
                        className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-300"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingTaskId(task.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <h3 className="text-sm font-bold text-slate-900">
              {editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Judul Tugas / PR</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Latihan Soal Limit Trigonometri"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mata Pelajaran</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
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
                  <label className="block text-slate-700 font-medium mb-1">Tanggal Deadline</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Estimasi Waktu (Menit)
                  </label>
                  <input
                    type="number"
                    step="15"
                    min="15"
                    max="480"
                    required
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Prioritas (Eisenhower)</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="HIGH_URGENT">Q1: Penting & Mendesak</option>
                    <option value="HIGH_NOT_URGENT">Q2: Penting, Tidak Mendesak</option>
                    <option value="LOW_URGENT">Q3: Tidak Penting, Mendesak</option>
                    <option value="LOW_NOT_URGENT">Q4: Tidak Penting & Tidak Mendesak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Detail pengerjaan bab/halaman..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tag / Kategori (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="PR, Ujian, Praktikum"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
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
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
