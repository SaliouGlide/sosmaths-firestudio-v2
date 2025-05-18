import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  AlertTriangle,
  Settings,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalCourses: 0,
    pendingReports: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Fetch courses count
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const totalCourses = coursesSnapshot.size;

        // Set stats
        setStats({
          totalUsers,
          totalRevenue: 15000, // Mock data
          averageRating: 4.8,
          totalCourses,
          pendingReports: 5,
          activeSubscriptions: 150,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Administration" />
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
      <Header title="Administration" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.totalUsers}
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
                    <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.totalRevenue}€
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-success-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-success-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.averageRating}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-warning-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-warning-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cours donnés</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.totalCourses}
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
                    <p className="text-sm font-medium text-gray-600">Rapports en attente</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.pendingReports}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-error-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-error-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Abonnements actifs</p>
                    <h3 className="text-2xl font-bold text-secondary-dark-blue mt-1">
                      {stats.activeSubscriptions}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-secondary-dark-blue mb-6">
                  Gestion de la plateforme
                </h2>
                <div className="space-y-4">
                  <Button variant="outline" fullWidth className="justify-start">
                    <Users className="h-5 w-5 mr-2" />
                    Gestion des utilisateurs
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <Settings className="h-5 w-5 mr-2" />
                    Paramètres système
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <FileText className="h-5 w-5 mr-2" />
                    Gestion du contenu
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Support utilisateur
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-secondary-dark-blue mb-6">
                  Rapports et analyses
                </h2>
                <div className="space-y-4">
                  <Button variant="outline" fullWidth className="justify-start">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Rapport financier
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <Users className="h-5 w-5 mr-2" />
                    Statistiques utilisateurs
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <Star className="h-5 w-5 mr-2" />
                    Évaluations et avis
                  </Button>
                  <Button variant="outline" fullWidth className="justify-start">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Signalements
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

export default AdminDashboardPage;