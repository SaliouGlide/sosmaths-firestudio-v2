import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { scheduledCourses } from '../../utils/mockData';
import { Calendar, Clock, Video, MessageSquare, FileText, Star } from 'lucide-react';

function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = scheduledCourses.find(c => c.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <Link to="/courses">
            <Button>Retour à mes cours</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Détails du cours" showBackButton />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="bg-primary-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold mb-1">Cours de {course.teacher.subjects[0]?.name || 'Matière'}</h1>
                  <div className="flex items-center text-primary-100">
                    <Calendar className="h-5 w-5 mr-2" />
                    {formatDate(course.date)}
                  </div>
                  <div className="flex items-center text-primary-100 mt-1">
                    <Clock className="h-5 w-5 mr-2" />
                    {formatTime(course.startTime)} - {formatTime(course.endTime)}
                  </div>
                </div>
                <div>
                  {course.status === 'scheduled' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-white text-primary-800 font-medium">
                      Planifié
                    </span>
                  )}
                  {course.status === 'inProgress' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-green-400 text-green-800 font-medium">
                      En cours
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <img 
                  src={course.teacher.avatar || 'https://via.placeholder.com/80'} 
                  alt={course.teacher.name}
                  className="h-16 w-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h2 className="text-lg font-medium">{course.teacher.name}</h2>
                  <div className="flex items-center text-amber-500 mb-1">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>{course.teacher.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({course.teacher.reviewCount} avis)
                    </span>
                  </div>
                  <Link to={`/teachers/${course.teacherId}`}>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Voir le profil
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.meetingLink && (
                      <Link to={course.meetingLink} target="_blank">
                        <Button fullWidth className="justify-center">
                          <Video className="h-5 w-5 mr-2" />
                          Rejoindre le cours
                        </Button>
                      </Link>
                    )}
                    <Button variant="secondary" fullWidth className="justify-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contacter le professeur
                    </Button>
                  </div>
                </div>
                
                {course.materials && course.materials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Matériel de cours</h3>
                    <Card>
                      <CardContent className="p-4">
                        <ul className="space-y-2">
                          {course.materials.map((material, index) => (
                            <li key={index} className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-2" />
                              <a href="#" className="text-primary-600 hover:underline">
                                {material}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Détails du cours</h3>
                  <Card>
                    <CardContent className="p-4">
                      <dl className="space-y-2">
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Type de cours:</dt>
                          <dd>Individuel</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Niveau:</dt>
                          <dd>Terminale</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Matière:</dt>
                          <dd>{course.teacher.subjects[0]?.name || 'Non spécifié'}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Prix:</dt>
                          <dd>{course.teacher.hourlyRate}€ /heure</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default CourseDetailPage;