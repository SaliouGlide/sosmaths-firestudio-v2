import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ReactCalendar from 'react-calendar';
import { scheduledCourses } from '../../utils/mockData';
import { Clock, Video, MessageSquare, User, Star } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

type CalendarView = 'month' | 'week' | 'day';

function TeacherCoursesPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  };

  const todayCourses = scheduledCourses.filter(course => {
    const courseDate = new Date(course.date);
    return (
      courseDate.getDate() === selectedDate.getDate() &&
      courseDate.getMonth() === selectedDate.getMonth() &&
      courseDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Header title="Planning des cours" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="space-x-2">
                      <Button
                        variant={view === 'month' ? 'default' : 'outline'}
                        onClick={() => setView('month')}
                      >
                        Mois
                      </Button>
                      <Button
                        variant={view === 'week' ? 'default' : 'outline'}
                        onClick={() => setView('week')}
                      >
                        Semaine
                      </Button>
                      <Button
                        variant={view === 'day' ? 'default' : 'outline'}
                        onClick={() => setView('day')}
                      >
                        Jour
                      </Button>
                    </div>
                    
                    <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                      Aujourd'hui
                    </Button>
                  </div>

                  <ReactCalendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="fr-FR"
                    className="w-full border-0"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Daily Schedule Section */}
            <div>
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 text-secondary-dark-blue">
                    {new Intl.DateTimeFormat('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }).format(selectedDate)}
                  </h2>

                  <div className="space-y-4">
                    {todayCourses.length > 0 ? (
                      todayCourses.map((course) => (
                        <div
                          key={course.id}
                          className="p-4 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-secondary-dark-blue">
                                {course.teacher.subjects[0]?.name}
                              </h3>
                              <div className="flex items-center mt-1">
                                <User className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-secondary-dark-blue">
                                  Jean Dupont
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-primary-600">
                              {formatTime(course.startTime)}
                            </span>
                          </div>

                          <div className="flex gap-2 mt-4">
                            {course.meetingLink && (
                              <Button size="sm" className="flex items-center">
                                <Video className="h-4 w-4 mr-1" />
                                Rejoindre
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-secondary-dark-blue">Aucun cours prévu</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="mt-6 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4 text-secondary-dark-blue">Statistiques du mois</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-dark-blue">Heures de cours</span>
                      <span className="font-medium text-secondary-dark-blue">24h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-dark-blue">Élèves</span>
                      <span className="font-medium text-secondary-dark-blue">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-dark-blue">Note moyenne</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 fill-current mr-1" />
                        <span className="font-medium text-secondary-dark-blue">4.8</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default TeacherCoursesPage;