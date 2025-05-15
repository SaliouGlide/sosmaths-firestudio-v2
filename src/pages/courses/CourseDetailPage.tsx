import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, Video, MessageSquare, FileText, Star } from 'lucide-react';
import { db, doc, getDoc } from '../../firebase';
import type { Course } from '../../types';

function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const courseRef = doc(db, 'courses', id);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          setCourse({
            id: courseSnap.id,
            ...courseData,
            proposedDateTime: courseData.proposedDateTime?.toDate(),
            createdAt: courseData.createdAt?.toDate()
          });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-secondary-dark-blue">
            {error || 'Course not found'}
          </h1>
          <Link to="/courses">
            <Button>Return to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
                  <h1 className="text-xl font-semibold mb-1">
                    {course.subject.map(s => s.name).join(', ')} - {course.level}
                  </h1>
                  <div className="flex items-center text-primary-100">
                    <Calendar className="h-5 w-5 mr-2" />
                    {formatDate(course.proposedDateTime)}
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
                  src="https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg"
                  alt={course.teacherName}
                  className="h-16 w-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h2 className="text-lg font-medium">{course.teacherName}</h2>
                  <div className="flex items-center text-amber-500 mb-1">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>4.8</span>
                  </div>
                  <Link to={`/teacher/profile/${course.teacherId}`}>
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
                    <Button 
                      fullWidth 
                      className="justify-center"
                      onClick={() => window.open(course.meetingLink, '_blank')}
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Rejoindre le cours
                    </Button>
                    <Button variant="secondary" fullWidth className="justify-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contacter le professeur
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Détails du cours</h3>
                  <Card>
                    <CardContent className="p-4">
                      <dl className="space-y-2">
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Type de cours:</dt>
                          <dd>{course.type === 'individual' ? 'Individuel' : 'Groupe'}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Niveau:</dt>
                          <dd>{course.level}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-1/3 text-gray-500">Matière:</dt>
                          <dd>{course.subject.map(s => s.name).join(', ')}</dd>
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