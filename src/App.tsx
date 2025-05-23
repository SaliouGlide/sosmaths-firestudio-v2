import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import AuthPage from './pages/auth/AuthPage';
import HomePage from './pages/home/HomePage';
import RequestsPage from './pages/requests/RequestsPage';
import CreateRequestPage from './pages/requests/CreateRequestPage';
import RequestDetailPage from './pages/requests/RequestDetailPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import RatingPage from './pages/courses/RatingPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import EditProfilePage from './pages/profile/EditProfilePage';
import { auth, getUserProfile, updateUserProfile } from './firebase';

// Teacher pages
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherRequestsPage from './pages/teacher/TeacherRequestsPage';
import TeacherRequestDetailPage from './pages/teacher/TeacherRequestDetailPage';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import TeacherPlanningPage from './pages/teacher/TeacherPlanningPage';
import TeacherProfileEditPage from './pages/teacher/TeacherProfileEditPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';

import { Toaster } from 'sonner'; // Import Toaster

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<'parent' | 'teacher'>('parent');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        const type = localStorage.getItem('user_type');
        setUserType(type as 'parent' | 'teacher' || 'parent');

        try {
          const userData = await getUserProfile(user.uid);
          
          
          localStorage.setItem('user_type', userData.userType || 'parent');
          localStorage.setItem('user_data', JSON.stringify(userData));
        } catch (error) {
          console.error('Error fetching and storing user data:', error);

        }
      } else {
        localStorage.removeItem('user_data');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const login = (type: 'parent' | 'teacher') => {
    const user_data_str = localStorage.getItem('user_data') || '{}';
    const user_data = JSON.parse(user_data_str);
    if (!user_data || !user_data.id) {
      console.error("user_data or user_data.id is undefined");
      return;
    }

    updateUserProfile(user_data.id, {
      userType: type,
    }).catch((error) => {
    });

    localStorage.setItem('user_type', type );
    setUserType(type);
  };
  
  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user_type');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public route */}
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <AuthPage onLogin={login} />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                userType === 'teacher' ? (
                  <Layout>
                    <TeacherDashboardPage />
                  </Layout>
                ) : (
                  <Layout>
                    <HomePage />
                  </Layout>
                )
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />

          {/* Parent routes */}
          {userType === 'parent' && isAuthenticated && (
            <>
              <Route 
                path="/requests" 
                element={
                  <Layout>
                    <RequestsPage />
                  </Layout>
                }
              />
              <Route 
                path="/requests/create" 
                element={
                  <Layout>
                    <CreateRequestPage />
                  </Layout>
                }
              />
              <Route 
                path="/requests/:id" 
                element={
                  <Layout>
                    <RequestDetailPage />
                  </Layout>
                }
              />
              <Route 
                path="/courses" 
                element={
                  <Layout>
                    <CoursesPage />
                  </Layout>
                }
              />
              <Route 
                path="/courses/:id" 
                element={
                  <Layout>
                    <CourseDetailPage />
                  </Layout>
                }
              />
              <Route 
                path="/courses/:id/rate" 
                element={
                  <Layout>
                    <RatingPage />
                  </Layout>
                }
              />
            </>
          )}

          {/* Teacher routes */}
          {userType === 'teacher' && isAuthenticated && (
            <>
              <Route 
                path="/requests" 
                element={
                  <Layout>
                    <TeacherRequestsPage />
                  </Layout>
                }
              />
              <Route 
                path="/requests/:id" 
                element={
                  <Layout>
                    <TeacherRequestDetailPage />
                  </Layout>
                }
              />
              <Route 
                path="/courses" 
                element={
                  <Layout>
                    <TeacherCoursesPage />
                  </Layout>
                }
              />
              <Route 
                path="/planning" 
                element={
                  <Layout>
                    <TeacherPlanningPage />
                  </Layout>
                }
              />
              <Route 
                path="/students" 
                element={
                  <Layout>
                    <TeacherStudentsPage />
                  </Layout>
                }
              />
            </>
          )}

          {/* Common protected routes */}
          {isAuthenticated && (
            <>
              {/* Teacher edit profile route */}
              <Route 
                path="/teacher/profile/edit/:id" 
                element={
                  <Layout>
                    <TeacherProfileEditPage />
                  </Layout>
                }
              />
              <Route 
                path="/teacher/profile/:id" 
                element={
                  <Layout>
                    <TeacherProfilePage />
                  </Layout>
                }
              />
              <Route 
                path="/profile" 
                element={
                  <Layout>
                    <ProfilePage onLogout={logout} />
                  </Layout>
                }
              />
              <Route 
                path="/profile/edit" 
                element={
                  <Layout>
                    {userType === 'teacher' ? <TeacherProfileEditPage /> : <EditProfilePage />}
                  </Layout>
                }
              />
            </>
          )}
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-center"
        richColors 
        closeButton
      />
    </>
  );
}

export default App;