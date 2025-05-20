export interface CourseRequest {
  id: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentPhoneCountry?: string;
  subjects?: Subject[];
  description: string;
  level: string;
  teachingLanguage?: TeachingLanguage;
  timeSlot?: TimeSlot;
  hoursPerWeek?: number;
  availableDates: string[];
  preferredDate: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string;
  appliedTeachers?: string[];
  assignedTeacherId?: string;
  assignedTeacherName?: string;
}

export type UserRole = 'parent' | 'teacher' | 'coordinator' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  phoneCountry?: string;
  bio?: string;
  subjects?: string[];
  qualifications?: string[];
  hourlyRate?: string;
  userType: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  level: string;
  subjects: Subject[];
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  avatar?: string;
  createdAt: string;
}