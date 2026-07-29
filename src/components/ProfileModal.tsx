import React, { useState } from 'react';
import { StudentProfile, AcademicTrack } from '../types';
import { User, GraduationCap, Clock, Flame, X, Check, HeartHandshake, Compass } from 'lucide-react';

interface ProfileModalProps {
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: StudentProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [gradeClass, setGradeClass] = useState(profile.gradeClass);
  const [academicTrack, setAcademicTrack] = useState<AcademicTrack>(
    profile.academicTrack || 'SAINTEK'
  );
  const [hobbiesInput, setHobbiesInput] = useState(
    (profile.hobbies || []).join(', ')
  );
  const [dailyStudyTargetHours, setDailyStudyTargetHours] = useState(
    profile.dailyStudyTargetHours
  );
  const [peakProductiveTime, setPeakProductiveTime] = useState(
    profile.peakProductiveTime
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gradeClass) return;

    const parsedHobbies = hobbiesInput
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    onSave({
      ...profile,
      name,
      gradeClass,
      academicTrack,
      hobbies: parsedHobbies,
      dailyStudyTargetHours: Number(dailyStudyTargetHours),
      peakProductiveTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Profil Siswa</h3>
              <p className="text-xs text-slate-400">
                Sesuaikan rumpun kelas, minat hobi, dan target akademik Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nama Lengkap Siswa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Sekolah & Kelas</label>
            <input
              type="text"
              required
              value={gradeClass}
              onChange={(e) => setGradeClass(e.target.value)}
              placeholder="SMA Negeri 1 (XII Saintek 1)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Rumpun Kelas / Jurusan Sekolah</span>
            </label>
            <select
              value={academicTrack}
              onChange={(e) => setAcademicTrack(e.target.value as AcademicTrack)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="SAINTEK">Saintek (Sains, Matematika & Teknologi)</option>
              <option value="AGAMA">Keagamaan (Agama, Tahfidz & Syariah)</option>
              <option value="BAHASA">Bahasa & Sastra (Indonesia, Inggris, Asing)</option>
              <option value="EKONOMI">Ekonomi & Bisnis (Akuntansi & Manajemen)</option>
              <option value="KESEHATAN">Kesehatan & Medis (Anatomi & Keperawatan)</option>
              <option value="UMUM">Umum / Lintas Minat</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Minat, Hobi & Ekstrakurikuler (Pisahkan dengan koma)</span>
            </label>
            <input
              type="text"
              value={hobbiesInput}
              onChange={(e) => setHobbiesInput(e.target.value)}
              placeholder="Futsal, Tahfidz, Robotik, PMR, Seni Musik"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Target Belajar/Hari (Jam)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                required
                value={dailyStudyTargetHours}
                onChange={(e) => setDailyStudyTargetHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Waktu Produktif</label>
              <select
                value={peakProductiveTime}
                onChange={(e) => setPeakProductiveTime(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="MORNING">Pagi (07.00 - 11.00)</option>
                <option value="AFTERNOON">Siang (13.00 - 16.00)</option>
                <option value="EVENING">Sore/Malam (18.30 - 21.00)</option>
                <option value="NIGHT">Larut Malam (21.00+)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
