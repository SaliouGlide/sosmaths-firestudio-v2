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
  appliedTeachers?: string[]; // Add this field to track which teachers have applied
  assignedTeacherId?: string;
  assignedTeacherName?: string;
}

// ... (keep rest of the types)