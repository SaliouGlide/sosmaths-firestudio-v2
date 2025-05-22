import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Star, GraduationCap, Clock, Calendar, Video, MessageSquare, User, BookOpen, ChevronRight, Mail, Phone } from 'lucide-react';
import { db } from '../../firebase';
import type { StudentProfile, StudentCourse } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

function TeacherProfilePage() {  
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setError('ID étudiant manquant');
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch student profile
        const userRef = doc(db, 'users', studentId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          throw new Error('Étudiant non trouvé');
        }

        const userData = userSnap.data();

        // Fetch courses
        const coursesRef = collection(db, 'courses');
        const q = query(
          coursesRef,
          where('studentId', '==', studentId)
        );
        const coursesSnap = await getDocs(q);

        const coursesData = coursesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString()
        })) as StudentCourse[];

        // Calculate progress
        const totalCourses = coursesData.length;
        const completedCourses = coursesData.filter(c => c.status === 'completed').length;
        const ratings = coursesData.filter(c => c.rating).map(c => c.rating!);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : undefined;

        setStudent({
          ...userData,
          id: userSnap.id,
          progress: {
            totalCourses,
            completedCourses,
            averageRating
          }
        } as StudentProfile);

        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchStudentData();
  }, [studentId]);

  const upcomingCourses = useMemo(() => {
    return courses
      .filter(course => course.status === 'scheduled')
      .sort((a, b) => new Date(a.proposedDateTime.toDate()).getTime() - new Date(b.proposedDateTime.toDate()).getTime());
  }, [courses]);

  const pastCourses = useMemo(() => {
    return courses
      .filter(course => course.status === 'completed')
      .sort((a, b) => new Date(b.proposedDateTime.toDate()).getTime() - new Date(a.proposedDateTime.toDate()).getTime());
  }, [courses]);

  const handleJoinMeeting = (meetingLink: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      toast.error('Lien de réunion non disponible');
    }
  };

  const formatDateTime = (timestamp: any) => {
    try {
      const date = timestamp.toDate();
      return format(date, "EEEE d MMMM 'à' HH'h'mm", { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date non disponible';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary-50 text-primary-700';
      case 'completed':
        return 'bg-success-50 text-success-700';
      case 'cancelled':
        return 'bg-error-50 text-error-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planifié';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Student Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cours total</p>
                <h3 className="text-2xl font-bold text-secondary-dark-blue">
                  {student?.progress?.totalCourses || 0}
                </h3>
              </div>
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cours terminés</p>
                <h3 className="text-2xl font-bold text-secondary-dark-blue">
                  {student?.progress?.completedCourses || 0}
                </h3>
              </div>
              <div className="h-10 w-10 bg-success-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Note moyenne</p>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-secondary-dark-blue mr-1">
                    {student?.progress?.averageRating?.toFixed(1) || '-'}
                  </h3>
                  {student?.progress?.averageRating && (
                    <Star className="h-5 w-5 text-amber-400 fill-current" />
                  )}
                </div>
              </div>
              <div className="h-10 w-10 bg-warning-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-dark-blue">
              Informations de contact
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Parent</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-secondary-dark-blue">{student?.parentName}</span>
                </div>
                {student?.parentEmail && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <a
                      href={`mailto:${student.parentEmail}`}
                      className="text-primary-600 hover:underline"
                    >
                      {student.parentEmail}
                    </a>
                  </div>
                )}
                {student?.parentPhone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <a
                      href={`tel:${student.parentPhone}`}
                      className="text-primary-600 hover:underline"
                    >
                      {student.parentPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Matières suivies</h3>
              <div className="flex flex-wrap gap-2">
                {student?.subjects?.map((subject, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm bg-primary-50 text-primary-700 rounded-full"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Courses */}
      {upcomingCourses.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-dark-blue">
                Prochains cours
              </h2>
              <Button
                variant="link"
                onClick={() => setActiveTab('courses')}
                className="text-primary-600"
              >
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingCourses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-secondary-dark-blue">
                        {course.subject.map(s => s.name).join(', ')} - {course.level}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(course.proposedDateTime)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {course.meetingLink && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinMeeting(course.meetingLink!)}
                        className="flex items-center"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Rejoindre
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      {/* Upcoming Courses */}
      {upcomingCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-dark-blue mb-4">
            Prochains cours
          </h2>
          <div className="space-y-4">
            {upcomingCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-secondary-dark-blue">
                        {course.subject.map(s => s.name).join(', ')} - {course.level}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(course.proposedDateTime)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {course.meetingLink && (
                      <Button
                        onClick={() => handleJoinMeeting(course.meetingLink!)}
                        className="flex items-center"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Rejoindre
                      </Button>
                    )}
                    <Button variant="outline" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Courses */}
      {pastCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-dark-blue mb-4">
            Cours passés
          </h2>
          <div className="space-y-4">
            {pastCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-secondary-dark-blue">
                        {course.subject.map(s => s.name).join(', ')} - {course.level}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(course.proposedDateTime)}
                      </p>
                      {course.rating && (
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>

                  {course.comment && (
                    <p className="text-sm text-gray-600 mt-2">
                      {course.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun cours
          </h3>
          <p className="text-gray-500">
            Aucun cours n'a encore été programmé avec cet élève.
          </p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Profil de l'élève" showBackButton />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Profil de l'élève" showBackButton />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-error-600 mb-4">{error || 'Élève non trouvé'}</p>
            <Button onClick={() => navigate('/students')}>
              Retour aux élèves
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <Header title="Profil de l'élève" showBackButton />
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-primary-gradient p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="h-20 w-20 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold">{student.name}</h1>
                  <div className="flex items-center mt-1">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    <span>{student.level}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Vue d'ensemble
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'courses'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('courses')}
                >
                  Cours
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' ? renderOverviewTab() : renderCoursesTab()}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TeacherProfilePage;