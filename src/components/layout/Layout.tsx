import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Mail,
  CreditCard,
  Settings,
  BookOpen
} from 'lucide-react';
import { auth, getUserProfile } from '../../firebase'; // Import auth and getUserProfile
import type { User } from '../../types'; // Import User type

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [userData, setUserData] = useState<User | null>(null); // Use state for user data
  const [userType, setUserType] = useState('parent'); // Use state for user type
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserData(profile);
          setUserType(profile.userType || 'parent'); // Set userType from fetched data
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Handle error, maybe redirect to login or show an error message
        } finally {
          setLoading(false);
        }
      } else {
        // No user logged in, handle accordingly (e.g., redirect)
        setLoading(false);
        setUserType('parent'); // Default to parent if no user
        setUserData(null);
      }
    };

    fetchUserData();

    // Listen for auth state changes (optional, but good practice)
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(); // Re-fetch if user logs in
      } else {
        setUserData(null);
        setUserType('parent');
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []); // Empty dependency array means this effect runs once on mount

  const sidebarItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Tableau de bord', path: '/', roles: ['parent', 'teacher'] },
    { icon: <BookOpen className="h-5 w-5" />, label: 'Mes cours', path: '/courses', roles: ['parent'] },
    { icon: <Users className="h-5 w-5" />, label: 'Mes élèves', path: '/students', roles: ['teacher'] },
    { icon: <Calendar className="h-5 w-5" />, label: 'Planning', path: '/planning', roles: ['teacher'] },
    { icon: <Mail className="h-5 w-5" />, label: 'Messagerie', path: '/messages', roles: ['parent', 'teacher'] },
    { icon: <CreditCard className="h-5 w-5" />, label: 'Paiements', path: '/payments', roles: ['parent'] },
    { icon: <CreditCard className="h-5 w-5" />, label: 'Revenus', path: '/earnings', roles: ['teacher'] },
    { icon: <Settings className="h-5 w-5" />, label: 'Paramètres', path: '/settings', roles: ['parent', 'teacher'] },
  ];

  const filteredSidebarItems = sidebarItems.filter(item => item.roles.includes(userType));

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 fixed h-screen bg-white border-r border-gray-200 pt-20">
          <div className="flex items-center px-6 py-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-450 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium">{userData?.name || 'Utilisateur'}</h3>{/* Use optional chaining */}
              <p className="text-sm text-gray-500 capitalize">{userType}</p>
            </div>
          </div>

          <nav className="flex-1">
            {filteredSidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-450 border-r-2 border-primary-450'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}