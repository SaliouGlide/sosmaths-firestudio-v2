import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Mail, PhoneCall, Bell, HelpCircle, LogOut, BookOpenCheck, Calendar, Pencil } from 'lucide-react';

import { getUserProfile, auth, updateUserProfile } from '../../firebase';

interface ProfilePageProps {
  onLogout: () => void;
}

function ProfilePage({ onLogout }: ProfilePageProps) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string>(localStorage.getItem('user_type') || 'parent');
  const [userData, setUserData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const profileData = await getUserProfile(currentUser.uid);
            setUserData(profileData);
        } else {
            // Handle case where user is not logged in, e.g., redirect to login page
            console.log("No user logged in.");
            setUserData({}); // Clear user data if no user is logged in
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Handle error appropriately (e.g., show an error message)
      } finally {
        setLoading(false);
      };
    };
    fetchUserProfile();
  }, [auth.currentUser]); // Added auth.currentUser to dependency array

  const switchRole = async () => {
    try {
        const newRole = userType === 'parent' ? 'teacher' : 'parent';
        localStorage.setItem('user_type', newRole);
        if (auth.currentUser?.uid) {
          console.log('userType in switchRole', newRole);
          await updateUserProfile(auth.currentUser.uid, {
            userType: newRole,
          }, localStorage.getItem('user_type') || 'parent');
        }
        window.location.href = '/';
    } catch (error) {
      console.error("Failed to update user role:", error);
      // Handle error appropriately (e.g., show an error message)
    }
  };

  return (

    <div className="min-h-screen bg-white pb-16">
       {loading && <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50 text-secondary-dark-blue">Chargement...</div>}
      <Header title="Mon profil" />

      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6 overflow-hidden shadow-md">
            <div className="bg-primary-500 p-6 text-white"> {/* Updated to primary-500 for new palette */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white rounded-full p-2 mr-4">
                    <User className="h-8 w-8 text-primary-500" /> {/* Icon color adjusted if needed */}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">{userData.name || 'Utilisateur'}</h1>
                    <p className="text-white/90 capitalize">{userType}</p> {/* Changed from text-primary-100 */}
                  </div>
                </div>
                <Link to={userType === 'teacher' ? `/teacher/profile/edit/${auth.currentUser?.uid}` : "/profile/edit"}>
  <Button variant="secondary" size="sm" className="flex items-center text-white">
    <Pencil className="h-4 w-4 mr-2" />
    Modifier
  </Button>
</Link>

              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <p className="text-secondary-dark-blue">{userData.email || 'Email non renseigné'}</p>
                </div>
                <div className="flex items-center">
                  <PhoneCall className="h-5 w-5 text-gray-400 mr-3" />
                  <p className="text-secondary-dark-blue">{userData.phone || 'Téléphone non renseigné'}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={switchRole}
                >
                  Passer en mode {userType === 'parent' ? 'professeur' : 'parent'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 shadow-md">
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                <li>
                  <Link to="/courses" className="flex items-center p-4 hover:bg-gray-50">
                    <div className="rounded-full bg-primary-100 p-2 mr-4">
                      <BookOpenCheck className="h-5 w-5 text-primary-500" /> {/* Icon color adjusted */}
                    </div>
                    <span className="text-secondary-dark-blue">Mes cours</span>
                  </Link>
                </li>
                <li>
                  <Link to="/planning" className="flex items-center p-4 hover:bg-gray-50">
                    <div className="rounded-full bg-primary-100 p-2 mr-4">
                      <Calendar className="h-5 w-5 text-primary-500" /> {/* Icon color adjusted */}
                    </div>
                    <span className="text-secondary-dark-blue">Planning</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" className="flex items-center p-4 hover:bg-gray-50">
                    <div className="rounded-full bg-primary-100 p-2 mr-4">
                      <Bell className="h-5 w-5 text-primary-500" /> {/* Icon color adjusted */}
                    </div>
                    <span className="text-secondary-dark-blue">Notifications</span>
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 shadow-md">
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                <li>
                  <Link to="/help" className="flex items-center p-4 hover:bg-gray-50">
                    <div className="rounded-full bg-gray-100 p-2 mr-4">
                      <HelpCircle className="h-5 w-5 text-secondary-dark-blue" /> {/* Icon color adjusted */}
                    </div>
                    <span className="text-secondary-dark-blue">Aide et support</span>
                  </Link>
                </li>
                <li>
                  <button
                    className="flex items-center p-4 hover:bg-gray-50 w-full text-left"
                    onClick={onLogout}
                  >
                    <div className="rounded-full bg-gray-100 p-2 mr-4">
                      <LogOut className="h-5 w-5 text-secondary-dark-blue" /> {/* Icon color adjusted */}
                    </div>
                    <span className="text-secondary-dark-blue">Déconnexion</span>
                  </button>
                </li>
              </ul>
            </CardContent>
          </Card>

          <p className="text-center text-secondary-dark-blue text-sm">
            SOSmaths v1.0.0 • © 2025 Tous droits réservés
          </p>
        </div>
      </main>

      <Footer />

    </div>
  );
}

export default ProfilePage;