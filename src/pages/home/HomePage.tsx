import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { subjects } from '../../utils/mockData';
import { getCourseRequests, auth } from '../../firebase';
import type { CourseRequest } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  Mail, 
  CreditCard,
  Settings,
  Video,
  MessageSquare,
  Clock,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState<CourseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scientificSubjects = subjects.filter(s => s.isScientific);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!auth.currentUser) return;

      try {
        setIsLoading(true);
        setError(null);
        const requests = await getCourseRequests(auth.currentUser.uid, false);
        // Filter for pending or assigned requests and sort by creation date (newest first)
        const sortedRequests = requests
          .filter(r => ['pending', 'assigned', 'under_review'].includes(r.status))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort descending
        setActiveRequests(sortedRequests);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Une erreur est survenue lors du chargement des demandes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date non disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date non disponible';
      
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date non disponible';
    }
  };

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/requests/create?subject=${subjectId}`);
  };

  const subjectColors = [
    { bg: 'bg-[#385F71]', text: 'text-white', hover: 'hover:bg-[#2d4d5d]' },
    { bg: 'bg-[#8B1E3F]', text: 'text-white', hover: 'hover:bg-[#731934]' },
    { bg: 'bg-[#55D6BE]', text: 'text-[#385F71]', hover: 'hover:bg-[#3fc7ad]' },
    { bg: 'bg-[#92DCE5]', text: 'text-[#385F71]', hover: 'hover:bg-[#7ad1dc]' },
    { bg: 'bg-[#77567A]', text: 'text-white', hover: 'hover:bg-[#634764]' },
    { bg: 'bg-[#E26D5A]', text: 'text-white', hover: 'hover:bg-[#dc5840]' }
  ];

  return (
    <div className="container mx-auto px-4 pt-20 pb-24 bg-white">
      <div className="mb-8">
        <div className="bg-white rounded-xl p-8 border-2 border-primary-200 mb-8 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-50"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font text-secondary-dark-blue mb-3">Bonjour !</h1>
            <p className="text-xl text-secondary-dark-blue max-w-lg">
              Trouvez le professeur idéal même à la dernière minute !
            </p>
            <Button 
              className="mt-6 group" 
              size="lg"
              onClick={() => navigate('/requests/create')}
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Layout container - now always a single column */}
        <div className="grid grid-cols-1 gap-8">
          {/* Nos spécialités Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-secondary-dark-blue">Nos spécialités</h2>
            </div>
            
            {/* Modified container for horizontal scroll */}
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {scientificSubjects.map((subject, index) => (
                <Card 
                  key={subject.id}
                  className={`flex-shrink-0 w-48 md:w-64 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md ${
                    subjectColors[index % subjectColors.length].bg
                  } ${subjectColors[index % subjectColors.length].hover}`}
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                    <div className={`mb-4 p-4 rounded-full bg-white/10 backdrop-blur-sm`}>
                      {React.createElement(subject.icon, {
                        size: 32,
                        className: subjectColors[index % subjectColors.length].text
                      })}
                    </div>
                    <h3 className={`font-medium text-lg ${subjectColors[index % subjectColors.length].text}`}>
                      {subject.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Requests Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-secondary-dark-blue">Vos demandes récentes</h2>
              <Link to="/requests" className="text-primary-450 hover:text-primary-600 text-sm font-medium">
                Voir toutes
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-450" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-error-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="text-center py-12 text-secondary-dark-blue">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-dark-blue mb-2">
                  Aucune demande en cours
                </h3>
                <p className="text-secondary-dark-blue mb-6 max-w-sm mx-auto">
                  Vous n'avez pas de demande de cours en cours actuellement.
                </p>
                <Link to="/requests/create">
                  <Button>Créer une demande</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRequests.slice(0, 2).map((request) => (
                  <Card 
                    key={request.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow shadow-md"
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        {/* Display subjects from the array */}
                        <h3 className="font-medium text-secondary-dark-blue">
                          {request.subjects && Array.isArray(request.subjects) && request.subjects.length > 0
                            ? request.subjects.map(subject => subject.name).join(', ') // Map to subject names before joining
                            : 'Matière non spécifiée'} - Niveau {request.level}
                        </h3>
                        {request.status === 'pending' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-warning-100 text-warning-800">
                            En attente
                          </span>
                        )}
                      </div>
                      <p className="text-secondary-dark-blue text-sm mb-2">Créée le {formatDate(request.createdAt)}</p>
                      <div className="flex items-center text-sm text-secondary-dark-blue">
                        <Clock className="h-4 w-4 mr-1" />
                        {/* Display frequency as a number */}
                        {request.hoursPerWeek ? `${request.hoursPerWeek}h/semaine` : 'Fréquence non spécifiée'} -  
                        {/* Display type as a string */} {request.type === 'individual' ? 'Individuel' : 'Groupe'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;