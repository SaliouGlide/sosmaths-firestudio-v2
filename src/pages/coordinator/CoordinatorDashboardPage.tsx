import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BookOpen, Users, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import type { CourseRequest } from '../../types';

function CoordinatorDashboardPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    assignedRequests: 0,
    completedRequests: 0,
    totalTeachers: 0,
    totalStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentRequests, setRecentRequests] = useState<CourseRequest[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch requests
        const requestsRef = collection(db, 'requests');
        const requestsSnapshot = await getDocs(requestsRef);
        const requests = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseRequest[];

        // Calculate stats
        const stats = {
          totalRequests: requests.length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          assignedRequests: requests.filter(r => r.status === 'assigned').length,
          completedRequests: requests.filter(r => r.status === 'completed').length,
          totalTeachers: 0,
          totalStudents: 0,
        };

        // Fetch teachers count
        const teachersRef = query(collection(db, 'users'), where('userType', '==', 'teacher'));
        const teachersSnapshot = await getDocs(teachersRef);
        stats.totalTeachers = teachersSnapshot.size;

        // Fetch students (parents) count
        const studentsRef = query(collection(db, 'users'), where('userType', '==', 'parent'));
        const studentsSnapshot = await getDocs(studentsRef);
        stats.totalStudents = studentsSnapshot.size;

        setStats(stats);
        setRecentRequests(requests.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Tableau de bord" />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Tableau de bord" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.pendingRequests}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-warning-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-warning-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cours assignés</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.assignedRequests}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cours terminés</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.completedRequests}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-success-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-success-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total professeurs</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.totalTeachers}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total élèves</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.totalStudents}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temps moyen d'affectation</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">2h</h3>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-secondary-dark-blue">
                    Dernières demandes
                  </h2>
                  <Link to="/coordinator/requests">
                    <Button variant="link">Voir tout</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-secondary-dark-blue">
                          {request.subjects?.map(s => s.name).join(', ')} - {request.level}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending'
                            ? 'bg-warning-100 text-warning-800'
                            : request.status === 'assigned'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-success-100 text-success-800'
                        }`}
                      >
                        {request.status === 'pending' ? 'En attente' : ''}
                        {request.status === 'assigned' ? 'Assigné' : ''}
                        {request.status === 'completed' ? 'Terminé' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-secondary-dark-blue mb-6">
                  Actions rapides
                </h2>

                <div className="space-y-4">
                  <Button variant="outline" fullWidth className="justify-start">
                    <Users className="h-5 w-5 mr-2" />
                    Gérer les professeurs
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Voir les cours en cours
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Demandes urgentes
                  </Button>
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

export default CoordinatorDashboardPage;