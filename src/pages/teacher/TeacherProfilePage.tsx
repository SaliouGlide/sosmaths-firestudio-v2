import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Star, GraduationCap, Clock, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { db } from '../../firebase';

function TeacherProfilePage() {  
  const { id: teacherId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      console.log("[DEBUG] ID reçu dans l'URL:", teacherId); // Log 1
      
      if (!teacherId) {
        console.error("[ERREUR] Aucun ID de professeur dans l'URL");
        setError('ID du professeur manquant');
        setIsLoading(false);
        return;
      }
  
      try {
        console.log("[DEBUG] Tentative de récupération pour l'ID:", teacherId); // Log 2
        const userDocRef = doc(db, "users", teacherId);
        console.log("[DEBUG] Chemin Firestore complet:", userDocRef.path); // Log 3
  
        const userDocSnap = await getDoc(userDocRef);
        console.log("[DEBUG] Le document existe ?", userDocSnap.exists()); // Log 4
        
        if (!userDocSnap.exists()) {
          console.error("[ERREUR] Aucun document trouvé pour cet ID");
          setError("Professeur non trouvé");
          setIsLoading(false);
          return;
        }
  
        const userData = userDocSnap.data();
        console.log("[DEBUG] Données récupérées:", userData); // Log 5
  
        // Vérification temporairement désactivée pour test
        setTeacher({
          ...userData,
          id: userDocSnap.id,
          // Valeurs par défaut
          avatar: userData.avatar || null,
          bio: userData.bio || 'Aucune description fournie',
          subjects: userData.subjects || [],
          qualifications: userData.qualifications || []
        });
  
      } catch (err) {
        console.error("[ERREUR COMPLÈTE]", err);
        setError("Erreur de chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTeacherData();
  }, [teacherId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return "Date inconnue";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Profil du professeur" showBackButton />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px] text-secondary-dark-blue">
            Chargement...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Profil du professeur" showBackButton />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-error-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Retour</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <Header title="Profil du professeur" showBackButton />
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">             
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  {teacher.avatar ? (
                    <img 
                      src={teacher.avatar} 
                      alt={`${teacher.name}`} 
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).className = 'w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="text-center sm:text-left">
                  <h1 className="text-xl font-semibold text-secondary-dark-blue">{teacher.name}</h1>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1 mb-2">
                    {teacher.subjects?.map((subject: string, index: number) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                        {subject}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start mt-1 mb-2">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-secondary-dark-blue">{teacher.rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-secondary-dark-blue ml-1">({teacher.reviewCount} avis)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium mb-2 text-secondary-dark-blue">À propos</h2>
                <p className="text-secondary-dark-blue">{teacher.bio}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium mb-3 text-secondary-dark-blue">Qualifications</h2>
                <ul className="space-y-2">
                  {teacher.qualifications?.length > 0 ? (
                    teacher.qualifications.map((qualification: string, index: number) => (
                      <li key={`${qualification}-${index}`} className="flex items-start text-secondary-dark-blue">
                        <GraduationCap className="h-5 w-5 text-primary-600 mt-0.5 mr-2" />
                        <span>{qualification}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-secondary-dark-blue">Aucune qualification</p>
                  )}
                </ul>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button fullWidth>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contacter
                </Button>
                <Button variant="secondary" fullWidth>
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  Choisir ce professeur
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TeacherProfilePage;