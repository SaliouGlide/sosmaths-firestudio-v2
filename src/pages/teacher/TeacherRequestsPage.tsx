import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, User, Users, MessageSquare, Globe2 } from 'lucide-react';
import { db, collection, getDocs, query, where, auth } from '../../firebase';

function TeacherRequestsPage() {
  const [filter, setFilter] = useState<'all' | 'scientific'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'requests'),
          where('status', 'in', ['pending', 'under_review'])
        );
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          hasApplied: doc.data().appliedTeachers?.includes(auth.currentUser?.uid)
        }));
        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    if (filter === 'scientific') {
      return request.subjects.some((subject: any) => subject.isScientific);
    }
    return true;
  }).filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.subjects.some((subject: any) => subject.name.toLowerCase().includes(query)) ||
      request.level.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query) ||
      request.parentName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Header title="Demandes de cours" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  Toutes les matières
                </Button>
                <Button
                  variant={filter === 'scientific' ? 'default' : 'outline'}
                  onClick={() => setFilter('scientific')}
                >
                  Matières scientifiques
                </Button>
              </div>
              
              <div className="relative">
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden hover:border-primary-200 transition-colors shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {request.subjects.map((subject: any) => (
                            <span
                              key={subject.id}
                              className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                            >
                              {subject.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-secondary-dark-blue">
                          Niveau: {request.level}
                        </p>
                        {request.parentName && (
                          <p className="text-sm text-secondary-dark-blue mt-1">
                            Parent: {request.parentName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.hasApplied 
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-primary-50 text-primary-700'
                        }`}>
                          {request.hasApplied ? 'Déjà postulé' : 'Nouveau'}
                        </span>
                      </div>
                    </div>

                    <p className="text-secondary-dark-blue mb-4">
                      {request.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-secondary-dark-blue">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span className="text-sm">
                          {request.hoursPerWeek}h/semaine
                        </span>
                      </div>
                      <div className="flex items-center text-secondary-dark-blue">
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="text-sm">
                          {request.timeSlot}
                        </span>
                      </div>
                      <div className="flex items-center text-secondary-dark-blue">
                        {request.type === 'individual' ? (
                          <>
                            <User className="h-5 w-5 mr-2" />
                            <span className="text-sm">Cours individuel</span>
                          </>
                        ) : (
                          <>
                            <Users className="h-5 w-5 mr-2" />
                            <span className="text-sm">Cours en groupe</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-secondary-dark-blue">
                        <Globe2 className="h-5 w-5 mr-2" />
                        <span className="text-sm">
                          {request.teachingLanguage === 'french' ? 'Français' : 'Néerlandais'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter
                      </Button>
                      {!request.hasApplied && (
                        <Link to={`/requests/${request.id}`}>
                          <Button>
                            Postuler
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-secondary-dark-blue mb-2">Aucune demande trouvée</h3>
                  <p className="text-sm text-secondary-dark-blue">
                    Aucune demande ne correspond à vos critères de recherche.
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

export default TeacherRequestsPage;