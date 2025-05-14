import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2 text-secondary-dark-blue">Page introuvable</h2>
        <p className="text-secondary-dark-blue mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        
        <Link to="/">
          <Button className="inline-flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;