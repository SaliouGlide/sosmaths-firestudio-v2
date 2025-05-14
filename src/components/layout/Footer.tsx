import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Footer() {
  const location = useLocation();
  const userType = localStorage.getItem('user_type') || 'parent';

  const isActive = (path: string) => location.pathname === path;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-around">
          <Link 
            to="/" 
            className={cn(
              "flex flex-col items-center p-2 text-secondary-dark-blue",
              isActive('/') && "text-primary-500"
            )}
          >
            <Home size={20} className={cn(isActive('/') && "text-primary-500")} />
            <span className="text-xs mt-1">Accueil</span>
          </Link>
          {userType === 'teacher' ? (
            <Link 
              to="/teacher/students" // Corrected path for teacher students
              className={cn(
                "flex flex-col items-center p-2 text-secondary-dark-blue",
                isActive('/teacher/students') && "text-primary-500"
              )}
            >
              <Users size={20} className={cn(isActive('/teacher/students') && "text-primary-500")} />
              <span className="text-xs mt-1">Mes élèves</span>
            </Link>
          ) : (
            <Link 
              to="/courses" 
              className={cn(
                "flex flex-col items-center p-2 text-secondary-dark-blue",
                isActive('/courses') && "text-primary-500"
              )}
            >
              <BookOpen size={20} className={cn(isActive('/courses') && "text-primary-500")} />
              <span className="text-xs mt-1">Cours</span>
            </Link>
          )}
          <Link 
            to="/profile" 
            className={cn(
              "flex flex-col items-center p-2 text-secondary-dark-blue",
              isActive('/profile') && "text-primary-500"
            )}
          >
            <User size={20} className={cn(isActive('/profile') && "text-primary-500")} />
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}