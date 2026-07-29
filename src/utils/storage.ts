import { Subject, Task, StudySession, ScheduleItem, StudentProfile, HobbyActivity } from '../types';

const getUserKey = (baseKey: string, userId?: string): string => {
  const scope = userId ? `user_${userId}` : 'guest';
  return `${baseKey}_${scope}`;
};

const BASE_KEYS = {
  PROFILE: 'smart_study_profile_v2',
  SUBJECTS: 'smart_study_subjects_v2',
  TASKS: 'smart_study_tasks_v2',
  SESSIONS: 'smart_study_sessions_v2',
  SCHEDULE: 'smart_study_schedule_v2',
  HOBBIES: 'smart_study_hobbies_v2',
};

export const loadProfile = (userId?: string): StudentProfile => {
  const key = getUserKey(BASE_KEYS.PROFILE, userId);
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        academicTrack: parsed.academicTrack || 'UMUM',
        hobbies: parsed.hobbies || [],
      };
    } catch {
      // ignore
    }
  }
  return {
    name: 'Siswa',
    schoolName: '',
    gradeClass: '',
    academicTrack: 'UMUM',
    hobbies: [],
    dailyStudyTargetHours: 2.0,
    peakProductiveTime: 'EVENING',
  };
};

export const saveProfile = (profile: StudentProfile, userId?: string): void => {
  const key = getUserKey(BASE_KEYS.PROFILE, userId);
  localStorage.setItem(key, JSON.stringify(profile));
};

export const loadSubjects = (userId?: string): Subject[] => {
  const key = getUserKey(BASE_KEYS.SUBJECTS, userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveSubjects = (subjects: Subject[], userId?: string): void => {
  const key = getUserKey(BASE_KEYS.SUBJECTS, userId);
  localStorage.setItem(key, JSON.stringify(subjects));
};

export const loadTasks = (userId?: string): Task[] => {
  const key = getUserKey(BASE_KEYS.TASKS, userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[], userId?: string): void => {
  const key = getUserKey(BASE_KEYS.TASKS, userId);
  localStorage.setItem(key, JSON.stringify(tasks));
};

export const loadSessions = (userId?: string): StudySession[] => {
  const key = getUserKey(BASE_KEYS.SESSIONS, userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveSessions = (sessions: StudySession[], userId?: string): void => {
  const key = getUserKey(BASE_KEYS.SESSIONS, userId);
  localStorage.setItem(key, JSON.stringify(sessions));
};

export const loadSchedule = (userId?: string): ScheduleItem[] => {
  const key = getUserKey(BASE_KEYS.SCHEDULE, userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveSchedule = (schedule: ScheduleItem[], userId?: string): void => {
  const key = getUserKey(BASE_KEYS.SCHEDULE, userId);
  localStorage.setItem(key, JSON.stringify(schedule));
};

export const loadHobbies = (userId?: string): HobbyActivity[] => {
  const key = getUserKey(BASE_KEYS.HOBBIES, userId);
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return [];
};

export const saveHobbies = (hobbies: HobbyActivity[], userId?: string): void => {
  const key = getUserKey(BASE_KEYS.HOBBIES, userId);
  localStorage.setItem(key, JSON.stringify(hobbies));
};

export const exportAllData = (userId?: string) => {
  const data = {
    profile: loadProfile(userId),
    subjects: loadSubjects(userId),
    tasks: loadTasks(userId),
    sessions: loadSessions(userId),
    schedule: loadSchedule(userId),
    exportedAt: new Date().toISOString(),
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `smart_study_planner_backup_${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const resetToDefaultData = () => {
  localStorage.clear();
  window.location.reload();
};

