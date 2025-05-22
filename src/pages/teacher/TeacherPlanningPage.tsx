import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button'; 
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Calendar, Clock, Video, MessageSquare, Plus, Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Course } from '../../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

function TeacherPlanningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState<'day' | 'week'>('week');

  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.currentUser) return;

      try {
        setIsLoading(true);
        const coursesRef = collection(db, "courses");
        const q = query(
          coursesRef,
          where("teacherId", "==", auth.currentUser.uid),
          where("status", "==", "scheduled")
        );
        const querySnapshot = await getDocs(q);

        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];

        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 })
  });

  const filteredCourses = courses.filter(course => {
    const courseDate = course.proposedDateTime.toDate();
    if (view === 'day') {
      return isSameDay(courseDate, selectedDate);
    } else {
      return courseDate >= startOfWeek(selectedDate) && courseDate <= endOfWeek(selectedDate);
    }
  });

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Planning" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-dark-blue">Mon Planning</h1>
              <p className="text-gray-600">
                {view === 'day' 
                  ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
                  : `Semaine du ${format(weekDays[0], 'd MMMM', { locale: fr })}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/sessions/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle session
              </Button>
            </div>
          </div>

          {/* Calendar Filter */}
          {showCalendar && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant={view === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('day')}
                  >
                    Jour
                  </Button>
                  <Button
                    variant={view === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('week')}
                  >
                    Semaine
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">
                    {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses List */}
          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun cours prévu
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas de cours programmé pour cette période
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                            {format(course.proposedDateTime.toDate(), 'HH:mm')}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">
                            {course.duration || 60} min
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-secondary-dark-blue mb-1">
                          {course.subject.map(s => s.name).join(', ')} - {course.level}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {format(course.proposedDateTime.toDate(), 'EEEE d MMMM', { locale: fr })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {course.meetingLink && (
                          <Button 
                            onClick={() => handleJoinMeeting(course.meetingLink)}
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
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default TeacherPlanningPage;