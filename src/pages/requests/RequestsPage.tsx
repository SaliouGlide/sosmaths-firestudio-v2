import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Clock, Calendar, Users, User, BookOpenCheck, Loader2 } from "lucide-react";
import { getCourseRequests, auth } from "../../firebase";
import type { CourseRequest, Application } from "../../types";

const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
      const fetchRequests = async () => {
        if (!auth.currentUser) return;
  
        try {
          setIsLoading(true);
          setError(null);
  
          // Fetch requests
          const fetchedRequests = await getCourseRequests(auth.currentUser.uid);
          setRequests(fetchedRequests.map((request) => ({ ...request, applicationNumber: request.applications?.length || 0 })));

        } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Une erreur est survenue lors du chargement des demandes");
      } finally {
        setIsLoading(false);
      }
    };


    fetchRequests();
  }, []);

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    return activeTab === 'active'
      ? ['pending', 'assigned'].includes(request.status)
      : ['completed', 'cancelled'].includes(request.status);


  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mes demandes" />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mes demandes" />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-error-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mes demandes" />

      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Demandes de cours</h1>
        </div>

        <div className='flex border-b border-gray-200 mb-6'>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "active"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("active")}
          >
            En cours
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "completed"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Terminées
          </button>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className='text-center py-16'>
            <div className="max-w-md mx-auto">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande{" "}
                {activeTab === "active" ? "en cours" : "terminée"}
              </h3>
              <p className='text-gray-500 mb-6'>
                {activeTab === "active"
                  ? "Vous n'avez pas de demande de cours en cours actuellement."
                  : "Vous n'avez pas encore de demande de cours terminée."}
              </p>
              <Link to='/requests/create'>
                <Button>Créer une demande</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {request.subjects.map((subject, index) => (
                          <span key={subject.id}>{subject.name}{index < request.subjects.length -1 ? ', ' : ''}</span>
                        ))}
                      </h3>
                      <p className="text-sm text-gray-500">Niveau: {request.level}</p>
                    </div>
                    <div>
                      {request.status === "pending" && (
                        <span className='px-2 py-1 rounded-full text-xs bg-warning-100 text-warning-800'>
                          En attente
                        </span> 
                      )}
                      {request.status === "assigned" && (
                        <span className='px-2 py-1 rounded-full text-xs bg-success-100 text-success-800'>
                          Professeur trouvé
                        </span>
                      )}
                      {request.status === "completed" && (
                        <span className='px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800'>
                          Terminée
                        </span>
                      )}
                      {request.status === "cancelled" && (
                        <span className='px-2 py-1 rounded-full text-xs bg-error-100 text-error-800'>
                          Annulée
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <div className="min-w-10">
                        <BookOpenCheck className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">Description</p>
                        <p className="text-sm text-gray-500">{request.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="min-w-10">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                         <p className="text-sm text-gray-900">
                            {request.hoursPerWeek} h/semaine
                      </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="min-w-10">
                        {request.type === "individual" ? (
                          <User className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {request.type === "individual" ? "Individuel" : "Groupe"}
                      </p>
                    </div>
                  </div>
                    
                    <Link to={`/requests/${request.id}`} state={{applicationNumber: request.applicationNumber}}>
                      <Button variant="link">Voir les détails</Button>
                    </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RequestsPage;