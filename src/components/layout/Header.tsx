import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, MessageSquare, User } from 'lucide-react'; // Removed Menu and X icons
import { Button } from '../ui/Button';
import { getUserProfile } from '../../firebase';

interface HeaderProps {
  userId?: string;
  title?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
}

export function Header({ title, showBackButton = false, showNotifications = true }: HeaderProps) {
  const navigate = useNavigate();
  // Removed menuOpen state
  const [userName, setUserName] = useState<string>("");
  const userId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchUserData = async () => {
          if (userId) {
            try {
              const userProfile = await getUserProfile(userId);
              setUserName(userProfile.name || "");
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          }
        };

        fetchUserData();
    }, [userId]);

  // Removed toggleMenu function

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-1 rounded-full hover:bg-gray-100"
                aria-label="Retour"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-primary-gradient text-transparent bg-clip-text">SOSmaths</span>
              </Link>
            </div>
            {title && (
              <h1 className={`ml-4 text-lg font-medium hidden sm:block ${title === 'Bonjour !' ? 'bg-primary-gradient text-transparent bg-clip-text' : 'text-secondary-dark-blue'}`}>{title}</h1>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {showNotifications && (
              <>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell size={20} />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Messages">
                  <MessageSquare size={20} />
                </Button>
              </>
            )}
            <Link to="/profile" className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" aria-label="Profile">
                <User size={20} />
              </Button>
              <Button variant="ghost" className="hidden md:flex text-secondary-dark-blue" aria-label="User name">
                {userName}
              </Button>
            </Link>
          </div>

          {/* Removed the mobile menu toggle button */}

        </div>
      </div>

      {/* Removed the conditional rendering for the mobile menu content */}
    </header>
  );
}