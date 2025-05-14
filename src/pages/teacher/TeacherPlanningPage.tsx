import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Calendar from 'react-calendar';
import { scheduledCourses } from '../../utils/mockData';
import { Clock, Video, MessageSquare, User, Star, Plus } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

type CalendarView = 'month' | 'week' | 'day';

function TeacherPlanningPage() {
  const navigate = useNavigate();
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

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleNewSession = () => {
    navigate('/requests/create');
  };

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Planning" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={view === 'month' ? 'default' : 'outline'}
                      onClick={() => handleViewChange('month')}
                      size="sm"
                    >
                      Mois
                    </Button>
                    <Button
                      variant={view === 'week' ? 'default' : 'outline'}
                      onClick={() => handleViewChange('week')}
                      size="sm"
                    >
                      Semaine
                    </Button>
                    <Button
                      variant={view === 'day' ? 'default' : 'outline'}
                      onClick={() => handleViewChange('day')}
                      size="sm"
                    >
                      Jour
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Aujourd'hui
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleNewSession}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle session
                    </Button>
                  </div>
                </div>

                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  view={view.toLowerCase() as 'month' | 'week' | 'day'}
                  onViewChange={({ view }) => handleViewChange(view as CalendarView)}
                  locale="fr-FR"
                  className="w-full border-0"
                />
              </CardContent>
            </Card>
          </div>

          {/* Daily Schedule Section */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">
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
                        className="p-4 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">
                              {course.teacher.subjects[0]?.name}
                            </h3>
                            <div className="flex items-center mt-1">
                              <User className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                Jean Dupont
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-primary-600">
                            {formatTime(course.startTime)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {course.meetingLink && (
                            <Button 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => handleJoinMeeting(course.meetingLink!)}
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
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun cours prévu</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-medium mb-4">Statistiques du mois</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Heures de cours</span>
                    <span className="font-medium">24h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Élèves</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Note moyenne</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-400 fill-current mr-1" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default TeacherPlanningPage;