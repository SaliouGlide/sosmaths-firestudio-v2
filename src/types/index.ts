import { ClassValue } from 'clsx';

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'parent' | 'teacher' | 'coordinator' | 'admin';
  phone: string;
  phoneCountry?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: any;
  isScientific?: boolean;
}

export type CourseType = 'individual' | 'group';
export type CourseStatus = 'pending' | 'scheduled' | 'inProgress' | 'completed' | 'cancelled';
export type TeachingLanguage = 'french' | 'dutch'
export type TimeSlot = '8-14' | '14-20' | '20-8';

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
  status: 'pending' | 'assigned' | 'completed' | 'cancelled' | 'under_review';
  createdAt: string;
  appliedTeachers?: string[];
  assignedTeacherId?: string;
  assignedTeacherName?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  qualifications: string[];
  subjects: Subject[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  students?: Student[];
}

export interface Application {
  id: string;
  requestId: string;
  teacherId: string;
  teacher: Teacher;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  proposedDateTime: any;
  teacherName: string;
}

export interface Course {
  id: string;
  requestId: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  teacherAvatar?: string;
  message: string;
  subject: Subject[];
  level: string;
  status: string;
  proposedDateTime: any;
  createdAt: any;
  meetingLink?: string;
}

export interface ScheduledCourse {
  id: string;
  requestId: string;
  teacherId: string;
  teacher: Teacher;
  date: string;
  startTime: string;
  endTime: string;
  status: CourseStatus;
  meetingLink?: string;
  materials?: string[];
  validated: boolean;
  teacherRating?: number;
  teacherComment?: string;
  duration: number;
}

export interface Review {
  id: string;
  courseId: string;
  teacherId: string;
  parentId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneCountry?: string;
}

export interface Student {
  id: string;
  name: string;
  level: string;
  subjects: Subject[];
  parent: Parent;
  avatar?: string;
}