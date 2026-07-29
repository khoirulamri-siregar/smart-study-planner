import { Subject, Task, StudySession, StudentProfile } from '../types';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Siswa',
  schoolName: '',
  gradeClass: '',
  academicTrack: 'UMUM',
  hobbies: [],
  dailyStudyTargetHours: 2.0,
  peakProductiveTime: 'EVENING',
};

export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_SESSIONS: StudySession[] = [];

