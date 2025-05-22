import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Video, MessageSquare, Star, BookOpen, Users, Loader2 } from 'lucide-react';
import { getTeacherRequests, auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { CourseRequest, Course } from '../../types';

function TeacherDashboardPage() {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch requests
        const fetchedRequests = await getTeacherRequests();
        setRequests(fetchedRequests);

        // Fetch upcoming courses
        if (auth.currentUser) {
          const coursesRef = collection(db, 'courses');
          const q = query(
            coursesRef,
            where('teacherId', '==', auth.currentUser.uid),
            where('status', '==', 'scheduled')
          );
          const querySnapshot = await getDocs(q);
          const courses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Course[];
          setUpcomingCourses(courses);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasTeacherApplied = (request: CourseRequest) => {
    return request.appliedTeachers?.includes(auth.currentUser?.uid || '');
  };

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-error-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Welcome and Stats Section */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Bonjour, {auth.currentUser?.displayName || 'Professeur'}
                  </h1>
                  <div className="flex items-center mt-1">
                    <Star className="h-5 w-5 text-amber-300 fill-current" />
                    <span className="ml-1 text-white/90">
                      4.5 (24 avis)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm">Ce mois</p>
                  <h3 className="text-2xl font-bold text-white mt-1">36h</h3>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm">Élèves</p>
                  <h3 className="text-2xl font-bold text-white mt-1">12</h3>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm">Cours donnés</p>
                  <h3 className="text-2xl font-bold text-white mt-1">24</h3>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm">Revenu</p>
                  <h3 className="text-2xl font-bold text-white mt-1">960€</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Courses Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-secondary-dark-blue">Prochains cours</h2>
              <Link to="/planning">
                <Button variant="link">Voir tout</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingCourses.length === 0 ? (
                <Card className="shadow-md">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-secondary-dark-blue">Aucun cours prévu</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingCourses.slice(0, 3).map((course) => (
                  <Card key={course.id} className="shadow-md">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-secondary-dark-blue">
                            {course.subject.map(s => s.name).join(', ')} - {course.level}
                          </h3>
                          <p className="text-sm text-secondary-dark-blue">
                            {new Date(course.proposedDateTime.toDate()).toLocaleString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {course.meetingLink && (
                          <Button 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => handleJoinMeeting(course.meetingLink)}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Rejoindre
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Available Requests Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-secondary-dark-blue">Demandes disponibles</h2>
              <Link to="/requests">
                <Button variant="link">Voir tout</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {requests.map((request) => (
                <Link to={`/requests/${request.id}`} key={request.id} className="mb-4 block">
                  <Card className="hover:border-primary-200 transition-colors shadow-md">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-secondary-dark-blue">
                            {(request.subjects && request.subjects.length > 0) 
                              ? request.subjects.map(subject => subject.name).join(', ') 
                              : 'Aucune matière'}
                          </h3>
                          <p className="text-sm text-secondary-dark-blue">Niveau: {request.level}</p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          hasTeacherApplied(request)
                            ? 'bg-gray-100 text-gray-700'
                            : 'text-warning-600 bg-warning-50'
                        }`}>
                          {hasTeacherApplied(request) ? 'Déjà postulé' : 'Nouveau'}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-dark-blue mb-3">{request.description}</p>
                      <div className="flex items-center text-sm text-secondary-dark-blue">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{request.hoursPerWeek}h/semaine</span> 
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TeacherDashboardPage;