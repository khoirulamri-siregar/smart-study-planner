import React, { useState } from 'react';
import { HobbyActivity, StudentProfile } from '../types';
import {
  Sparkles,
  Plus,
  Trophy,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Dumbbell,
  BookOpenCheck,
  Cpu,
  HeartPulse,
  Palette,
  Compass,
  X,
  Target,
  Flame,
} from 'lucide-react';

interface HobbiesManagerProps {
  profile: StudentProfile;
  hobbies: HobbyActivity[];
  onSaveHobbies: (hobbies: HobbyActivity[]) => void;
  onOpenProfile: () => void;
}

export const HobbiesManager: React.FC<HobbiesManagerProps> = ({
  profile,
  hobbies,
  onSaveHobbies,
  onOpenProfile,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHobby, setEditingHobby] = useState<HobbyActivity | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HobbyActivity['category']>('OLAHRAGA');
  const [weeklyTarget, setWeeklyTarget] = useState('2x Seminggu');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingHobby(null);
    setTitle('');
    setCategory('OLAHRAGA');
    setWeeklyTarget('2x Seminggu');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: HobbyActivity) => {
    setEditingHobby(item);
    setTitle(item.title);
    setCategory(item.category);
    setWeeklyTarget(item.weeklyTarget);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleToggleComplete = (id: string) => {
    const updated = hobbies.map((h) =>
      h.id === id ? { ...h, completedThisWeek: !h.completedThisWeek } : h
    );
    onSaveHobbies(updated);
  };

  const handleDelete = (id: string) => {
    const updated = hobbies.filter((h) => h.id !== id);
    onSaveHobbies(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingHobby) {
      const updated = hobbies.map((h) =>
        h.id === editingHobby.id
          ? { ...h, title, category, weeklyTarget, notes }
          : h
      );
      onSaveHobbies(updated);
    } else {
      const newItem: HobbyActivity = {
        id: `hobby-${Date.now()}`,
        title,
        category,
        weeklyTarget,
        notes,
        completedThisWeek: false,
      };
      onSaveHobbies([...hobbies, newItem]);
    }
    setIsModalOpen(false);
  };

  const getCategoryBadge = (cat: HobbyActivity['category']) => {
    switch (cat) {
      case 'OLAHRAGA':
        return { label: 'Olahraga & Jasmani', icon: Dumbbell, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'AGAMA':
        return { label: 'Keagamaan & Tahfidz', icon: BookOpenCheck, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'SAINTEK_ROBOTIK':
        return { label: 'Saintek & Robotik', icon: Cpu, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'KESEHATAN_PMR':
        return { label: 'PMR & Kesehatan', icon: HeartPulse, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'SENI':
        return { label: 'Seni & Musik', icon: Palette, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Lainnya / Minat', icon: Sparkles, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const completedCount = hobbies.filter((h) => h.completedThisWeek).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Personalized for School Track & Hobbies */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-bold border border-blue-400/30 uppercase tracking-wide">
                Rumpun Sekolah: {profile.academicTrack || 'SAINTEK'}
              </span>
              <span className="text-xs text-slate-300">| {profile.gradeClass}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Keseimbangan Akademik & Minat Hobi Siswa
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Sekolah bukan hanya tentang pelajaran buku. Kembangkan minat bakat seperti Olahraga, Keagamaan, PMR/Kesehatan, Robotik, dan Seni untuk membentuk diri yang unggul dan berkarakter.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Hobi / Ekskul</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rumpun Utama</p>
            <h4 className="text-sm font-bold text-slate-800">{profile.academicTrack || 'SAINTEK'}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Mingguan</p>
            <h4 className="text-sm font-bold text-slate-800">{completedCount} dari {hobbies.length} Tercapai</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status Hobi</p>
            <h4 className="text-sm font-bold text-slate-800">
              {hobbies.length > 0 ? `${(profile.hobbies || []).length} Minat Aktif` : 'Belum Ditambah'}
            </h4>
          </div>
        </div>
      </div>

      {/* Hobbies & Extracurriculars List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Kegiatan Minat & Ekstrakurikuler</h3>
            <p className="text-xs text-slate-500">Centang kegiatan hobi yang sudah kamu lakukan minggu ini.</p>
          </div>
          <button
            onClick={onOpenProfile}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Edit Minat Profil
          </button>
        </div>

        {hobbies.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada hobi atau ekskul terdaftar</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Tambahkan kegiatan hobi favoritmu seperti Futsal, Tahfidz Al-Qur'an, Robotik, PMR, atau Musik.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hobbies.map((item) => {
              const badge = getCategoryBadge(item.category);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    item.completedThisWeek
                      ? 'bg-slate-50/70 border-slate-200 opacity-90'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        {item.completedThisWeek ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>

                      <div>
                        <h4
                          className={`font-bold text-sm text-slate-800 ${
                            item.completedThisWeek ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center space-x-1 ${badge.color}`}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            Target: {item.weeklyTarget}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Hobby */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingHobby ? 'Edit Kegiatan Hobi' : 'Tambah Kegiatan Hobi / Ekskul'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nama Kegiatan Hobi / Ekskul</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Latihan Futsal / Tahfidz Surat Al-Mulk"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Kategori Minat</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="OLAHRAGA">Olahraga & Fisik (Futsal, Basket, Renang)</option>
                  <option value="AGAMA">Keagamaan (Tahfidz, Kajian, Rohis)</option>
                  <option value="SAINTEK_ROBOTIK">Saintek & Robotik (Koding, Experiment)</option>
                  <option value="KESEHATAN_PMR">PMR & Kesehatan (P3K, Donor, Edukasi)</option>
                  <option value="SENI">Seni & Kreatif (Musik, Melukis, Fotografi)</option>
                  <option value="LITERASI">Literasi & Menulis (Karya Tulis, Debat)</option>
                  <option value="LAINNYA">Lainnya / Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Durasi / Frekuensi</label>
                <input
                  type="text"
                  required
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value)}
                  placeholder="2x Seminggu / 30 Menit Setiap Hari"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Lokasi latihan atau target khusus yang ingin dicapai..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-bold"
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
