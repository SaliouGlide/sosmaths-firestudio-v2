import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { scheduledCourses } from '../../utils/mockData';
import { Star } from 'lucide-react';

function RatingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const course = scheduledCourses.find(c => c.id === id);
  
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  if (!course) {
    navigate('/courses');
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Veuillez sélectionner une note.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/courses');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Évaluer le cours" showBackButton />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-6">
              <img 
                src={course.teacher.avatar || 'https://via.placeholder.com/80'} 
                alt={course.teacher.name}
                className="h-20 w-20 rounded-full object-cover mx-auto mb-4"
              />
              <h1 className="text-xl font-semibold">Évaluer {course.teacher.name}</h1>
              <p className="text-gray-600 mt-1">
                Votre avis aide les autres parents à choisir les meilleurs professeurs.
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3 text-center">
                  Comment noteriez-vous ce cours ?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`h-10 w-10 ${
                          rating >= star ? 'text-amber-400 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2 text-gray-600">
                  {rating === 1 && 'Très insatisfait'}
                  {rating === 2 && 'Insatisfait'}
                  {rating === 3 && 'Correct'}
                  {rating === 4 && 'Satisfait'}
                  {rating === 5 && 'Très satisfait'}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting || rating === 0}
                  className="px-8"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon évaluation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RatingPage;