import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Course } from '../../types';
import { Calendar, Clock, Video, User, Scroll, BookOpenCheck, Loader2, ChevronRight, Star } from 'lucide-react';

function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'requests'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);

      if (!auth.currentUser) {
        console.log('No user logged in');
        setIsLoading(false);
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('studentId', '==', userId));
        const querySnapshot = await getDocs(q);

        const coursesData: Course[] = [];
        for (const docSnapshot of querySnapshot.docs) {
          const courseData = docSnapshot.data();
          const teacherId = courseData.teacherId;

          // Fetch teacher data
          const teacherRef = doc(db, 'teachers', teacherId);
          const teacherSnap = await getDoc(teacherRef);

          let teacherAvatar;
          if (teacherSnap.exists()) {
            teacherAvatar = teacherSnap.data().avatar;
          } else {
            console.log('No such teacher document!');
            teacherAvatar = null;
          }

          const course: Course = {
            id: docSnapshot.id,
            ...courseData,
            teacherAvatar: teacherAvatar,
          };
          coursesData.push(course);
        }

        setCourses(coursesData);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError('Erreur lors du chargement des cours');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatCourseDate = (proposedDateTime: any) => {
    if (!proposedDateTime) return 'Date non disponible';
    try {
      const date = proposedDateTime.toDate();
      if (isNaN(date.getTime())) return 'Date non disponible';
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting course date:', error);
      return 'Date non disponible';
    }
  };

  const formatCourseTime = (proposedDateTime: any, duration: number = 60) => {
    if (!proposedDateTime) return 'Heure non disponible';
    try {
      const date = proposedDateTime.toDate();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${hours}:${minutes} (Durée: ${duration} min)`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Heure non disponible';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'inProgress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (proposedDateTime: any, status: string) => {
    if (!proposedDateTime || status !== 'scheduled') return false;
    try {
      const date = proposedDateTime.toDate();
      return date.getTime() > Date.now();
    } catch { return false; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mes cours" />

      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              Mes cours programmés
            </h1>
            <Link to="/requests/create">
              <Button className="flex items-center">
                <BookOpenCheck className="h-4 w-4 mr-2" />
                Demander un nouveau cours
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === 'courses'
                    ? 'border-b-2 border-primary-600 text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('courses')}
              >
                Mes cours
              </button>
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === 'requests'
                    ? 'border-b-2 border-primary-600 text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('requests')}
              >
                Mes demandes
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'courses' ? (
                isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-450" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Réessayer</Button>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Aucun cours programmé
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Vous n'avez pas de cours programmés pour le moment.
                    </p>
                    <Link to="/requests/create">
                      <Button>Créer une demande de cours</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {courses.map((course) => (
                      <Card key={course.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex items-start space-x-4">
                              {course.teacherAvatar ? (
                                <img
                                  src={course.teacherAvatar}
                                  alt={course.teacherName}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {course.teacherName || 'Professeur inconnu'}
                                </h3>
                                <div className="flex items-center mt-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                                  <span className="text-sm text-gray-600">4.8 (24 avis)</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                              {course.status === 'pending' && 'En attente'}
                              {course.status === 'scheduled' && 'Planifié'}
                              {course.status === 'inProgress' && 'En cours'}
                              {course.status === 'completed' && 'Terminé'}
                              {course.status === 'cancelled' && 'Annulé'}
                            </span>
                          </div>

                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium text-gray-800">{formatCourseDate(course.proposedDateTime)}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500">Heure</p>
                                <p className="font-medium text-gray-800">{formatCourseTime(course.proposedDateTime)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            {course.status === 'scheduled' && (
                              <Button className="flex items-center">
                                <Video className="h-4 w-4 mr-2" />
                                Rejoindre le cours
                              </Button>
                            )}
                            <Link to={`/courses/${course.id}`}>
                              <Button variant="outline" className="flex items-center">
                                Voir plus
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Scroll className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Section Demandes en cours de développement
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Cette section sera bientôt disponible. Restez à l'écoute !
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CoursesPage;