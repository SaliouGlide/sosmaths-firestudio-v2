import { Calculator, Atom, Microscope, FlaskRound as Flask, Brain, Code } from 'lucide-react';
import { Subject, Parent, Student, CourseRequest, Teacher, Application, ScheduledCourse, Review } from '../types';

export const subjects: Subject[] = [
  { id: 'math', name: 'Mathématiques', icon: Calculator, isScientific: true },
  { id: 'physics', name: 'Physique', icon: Atom, isScientific: true },
  { id: 'biology', name: 'Biologie', icon: Microscope, isScientific: true },
  { id: 'chemistry', name: 'Chimie', icon: Flask, isScientific: true },
  { id: 'science', name: 'Sciences', icon: Brain, isScientific: true },
  { id: 'computer', name: 'Informatique', icon: Code, isScientific: true },
  { id: 'french', name: 'Français', icon: Calculator },
  { id: 'english', name: 'Anglais', icon: Calculator },
  { id: 'history', name: 'Histoire', icon: Calculator },
  { id: 'geography', name: 'Géographie', icon: Calculator },
  { id: 'spanish', name: 'Espagnol', icon: Calculator },
  { id: 'german', name: 'Allemand', icon: Calculator }
];

export const parents: Parent[] = [
  {
    id: 'p1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '06 12 34 56 78'
  },
  {
    id: 'p2',
    name: 'Thomas Bernard',
    email: 'thomas.bernard@email.com',
    phone: '06 23 45 67 89'
  }
];

export const students: Student[] = [
  {
    id: 's1',
    name: 'Lucas Dubois',
    level: 'Terminale',
    subjects: [subjects[0], subjects[1]],
    parent: parents[0],
    avatar: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg'
  },
  {
    id: 's2',
    name: 'Emma Bernard',
    level: 'Première',
    subjects: [subjects[1], subjects[2]],
    parent: parents[1],
    avatar: 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg'
  }
];

export const courseRequests: CourseRequest[] = [
  {
    id: '1',
    parentId: 'p1',
    subject: subjects[0],
    level: 'Terminale',
    status: 'pending',
    createdAt: '2024-02-15',
    frequency: 'weekly',
    type: 'individual',
    description: `Je cherche de l'aide pour préparer le bac de mathématiques.`,
    availableDates: [
      '2024-03-01T14:00:00',
      '2024-03-02T10:00:00',
      '2024-03-03T16:00:00'
    ],
    preferredDate: '2024-03-02T10:00:00'
  },
  {
    id: '2',
    parentId: 'p2',
    subject: subjects[1],
    level: 'Première',
    status: 'assigned',
    createdAt: '2024-02-14',
    frequency: 'biweekly',
    type: 'group',
    description: `Nous sommes un groupe de 3 élèves cherchant à améliorer notre niveau en physique.`,
    availableDates: [
      '2024-03-04T15:00:00',
      '2024-03-05T17:00:00'
    ],
    preferredDate: '2024-03-04T15:00:00'
  }
];

export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Prof. Martin',
    subjects: [subjects[0], subjects[1]],
    avatar: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg',
    rating: 4.8,
    reviewCount: 127,
    bio: `Professeur expérimenté avec plus de 10 ans d'enseignement en mathématiques et physique.`,
    qualifications: [
      'Agrégation de Mathématiques',
      `Master en Physique Théorique`,
      `Doctorat en Sciences de l'Éducation`
    ],
    hourlyRate: 45,
    students: [students[0]]
  },
  {
    id: '2',
    name: 'Prof. Bernard',
    subjects: [subjects[1], subjects[2]],
    avatar: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg',
    rating: 4.9,
    reviewCount: 93,
    bio: `Spécialiste en physique et SVT avec une approche pédagogique innovante.`,
    qualifications: [
      `Agrégation de Physique`,
      `Master en Biologie Moléculaire`,
      `Doctorat en Physique`
    ],
    hourlyRate: 40,
    students: [students[1]]
  }
];

export const applications: Application[] = [
  {
    id: 'app1',
    requestId: '1',
    teacherId: '1',
    teacher: teachers[0],
    status: 'pending',
    message: `Je serais ravi de vous aider à préparer le bac de mathématiques. J'ai une grande expérience dans la préparation aux examens.`,
    createdAt: '2024-02-15T10:30:00'
  },
  {
    id: 'app2',
    requestId: '2',
    teacherId: '2',
    teacher: teachers[1],
    status: 'accepted',
    message: `Je propose des cours en groupe très interactifs avec des exercices pratiques adaptés au niveau de chaque élève.`,
    createdAt: '2024-02-14T15:45:00'
  }
];

export const scheduledCourses: ScheduledCourse[] = [
  {
    id: '1',
    requestId: '1',
    teacherId: '1',
    teacher: teachers[0],
    date: '2024-03-01',
    startTime: '14:00',
    endTime: '16:00',
    status: 'scheduled',
    meetingLink: 'https://meet.jit.si/SosmathsCourse1Student1',
    materials: [
      'Exercices de révision.pdf',
      'Support de cours.pdf'
    ],
    validated: false,
    duration: 120
  },
  {
    id: '2',
    requestId: '2',
    teacherId: '2',
    teacher: teachers[1],
    date: '2024-03-02',
    startTime: '10:00',
    endTime: '12:00',
    status: 'completed',
    meetingLink: 'https://meet.jit.si/SosmathsCourse2Student2',
    validated: true,
    teacherRating: 5,
    teacherComment: `Excellent cours, très bonne participation !`,
    duration: 120
  }
];

export const reviews: Review[] = [
  {
    id: '1',
    courseId: '2',
    teacherId: '1',
    parentId: 'p1',
    rating: 5,
    comment: `Excellent professeur ! Les explications sont très claires et la méthode d'enseignement est efficace.`,
    createdAt: '2024-02-10T14:30:00'
  },
  {
    id: '2',
    courseId: '1',
    teacherId: '1',
    parentId: 'p1',
    rating: 4,
    comment: `Très bon cours, j'ai beaucoup progressé en mathématiques.`,
    createdAt: '2024-02-08T16:45:00'
  },
  {
    id: '3',
    courseId: '2',
    teacherId: '2',
    parentId: 'p2',
    rating: 5,
    comment: `Une approche pédagogique remarquable. Les cours sont interactifs et enrichissants.`,
    createdAt: '2024-02-12T10:15:00'
  }
];