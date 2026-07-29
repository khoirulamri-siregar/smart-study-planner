import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  getUsers,
  saveUsers,
  hashPassword,
  createSession,
  getFailedAttempts,
  recordFailedAttempt,
  clearFailedAttempts,
  validatePasswordStrength,
  sanitizeInput,
} from '../utils/auth';
import { UserAccount, AuthSession } from '../types';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Check if admin URL mode is requested via URL query string (e.g. ?role=admin or ?admin)
  const isAdminMode =
    typeof window !== 'undefined' &&
    (window.location.search.includes('admin') || window.location.pathname.includes('admin'));

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  // Rate limiting check
  useEffect(() => {
    let interval: any = null;
    if (email) {
      const failed = getFailedAttempts(email.trim().toLowerCase());
      if (failed.lockUntil && failed.lockUntil > Date.now()) {
        setLockoutTime(Math.ceil((failed.lockUntil - Date.now()) / 1000));
        interval = setInterval(() => {
          const remaining = Math.ceil((failed.lockUntil! - Date.now()) / 1000);
          if (remaining <= 0) {
            setLockoutTime(0);
            clearInterval(interval);
          } else {
            setLockoutTime(remaining);
          }
        }, 1000);
      } else {
        setLockoutTime(0);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [email]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = sanitizeInput(email.trim().toLowerCase());

    if (lockoutTime > 0) {
      setErrorMessage(`Percobaan masuk terkunci sementara. Silakan tunggu ${lockoutTime} detik.`);
      return;
    }

    const users = getUsers();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      recordFailedAttempt(cleanEmail);
      setErrorMessage('Alamat email atau kata sandi tidak sesuai.');
      return;
    }

    if (user.status === 'SUSPENDED') {
      setErrorMessage('Akun ini telah dinonaktifkan.');
      return;
    }

    if (isAdminMode && user.role !== 'ADMIN') {
      setErrorMessage('Akses ditolak: Akun bukan akun administrator.');
      return;
    }

    if (!isAdminMode && user.role === 'ADMIN') {
      setErrorMessage('Akun administrator silakan masuk melalui tautan admin khusus.');
      return;
    }

    const hashed = hashPassword(password);
    if (user.passwordHash !== hashed) {
      recordFailedAttempt(cleanEmail);
      setErrorMessage('Alamat email atau kata sandi tidak sesuai.');
      return;
    }

    clearFailedAttempts(cleanEmail);

    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u
    );
    saveUsers(updatedUsers);

    const session = createSession(user);
    onLoginSuccess(session);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    const cleanName = sanitizeInput(name.trim());
    const cleanSchool = sanitizeInput(schoolName.trim());
    const cleanGrade = sanitizeInput(gradeClass.trim());

    if (!cleanEmail || !cleanName || !password) {
      setErrorMessage('Semua kolom wajib diisi.');
      return;
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      setErrorMessage(passwordCheck.message || 'Kata sandi minimal 8 karakter.');
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      setErrorMessage('Email sudah terdaftar. Silakan masuk dengan akun Anda.');
      return;
    }

    const newUser: UserAccount = {
      id: `user-student-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      role: 'STUDENT',
      passwordHash: hashPassword(password),
      status: 'ACTIVE',
      schoolName: cleanSchool || 'SMA Negeri',
      gradeClass: cleanGrade || 'XII',
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);

    setSuccessMessage('Pendaftaran akun berhasil. Silakan masuk dengan akun Anda.');
    setActiveTab('LOGIN');
    setPassword('');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    setSuccessMessage('Tautan pemulihan kata sandi telah dikirimkan ke email Anda.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800 font-sans">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        {/* Logo & Application Name */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto font-bold shadow-xs">
            {isAdminMode ? <ShieldCheck className="w-5 h-5" /> : <BookMarked className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {isAdminMode ? 'Administrator Login' : 'Smart Study Planner'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdminMode ? 'Sistem Manajemen Administrator' : 'Aplikasi Manajemen Waktu Belajar Siswa'}
            </p>
          </div>
        </div>

        {/* Tab Switcher (Student Mode) */}
        {!isAdminMode && (
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                activeTab === 'LOGIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setActiveTab('REGISTER');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                activeTab === 'REGISTER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MASUK / LOGIN FORM */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@siswa.sch.id"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">Password</label>
                {!isAdminMode && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('FORGOT')}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Lupa Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 pr-10 text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutTime > 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-xs"
            >
              Masuk
            </button>
          </form>
        )}

        {/* DAFTAR / REGISTER FORM */}
        {!isAdminMode && activeTab === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Fauzi"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@siswa.sch.id"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Sekolah</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="SMA 1"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Kelas</label>
                <input
                  type="text"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  placeholder="XII IPA 1"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 pr-10 text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-xs"
            >
              Daftar
            </button>
          </form>
        )}

        {/* LUPA PASSWORD FORM */}
        {!isAdminMode && activeTab === 'FORGOT' && (
          <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Pemulihan</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@siswa.sch.id"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
              >
                Kirim Tautan Reset
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer links hidden for manual URL access only (?admin=true) */}
    </div>
  );
};
