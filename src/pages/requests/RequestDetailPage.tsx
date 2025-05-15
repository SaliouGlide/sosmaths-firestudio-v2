import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { collection, doc, getDoc, query, getDocs, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { Calendar, Clock, User, Users, BookOpen, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow, isDate } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { db } from '../../firebase';
import { fr } from 'date-fns/locale';
import type { CourseRequest, Application } from '../../types';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<CourseRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'applications'>(() => {
    return location.state?.tab || 'details';
  });

  const fetchApplicationsForRequest = async (requestId: string) => {
    try {
      const applicationsRef = collection(db, 'requests', requestId, 'applications');
      const applicationsQuery = query(applicationsRef);
      const querySnapshot = await getDocs(applicationsQuery);

      const applicationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        proposedDateTime: doc.data().proposedDateTime
          ? {
              seconds: doc.data().proposedDateTime.seconds,
              nanoseconds: doc.data().proposedDateTime.nanoseconds,
              toDate: () => doc.data().proposedDateTime.toDate(),
            }
          : null,
          ...doc.data(),
      })) as Application[];

      return applicationsData;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setIsLoading(false);
        console.error('Id is missing');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const applications = await fetchApplicationsForRequest(id);
        setApplications(applications);

        const docRef = doc(db, 'requests', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const requestData: CourseRequest = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            availableDates: Array.isArray(data.availableDates)
              ? data.availableDates.map((d: any) => {
                  if (d && typeof d.toDate === 'function') {
                    return d.toDate().toISOString();
                  } else if (typeof d === 'string') {
                    return d;
                  }
                  return undefined;
                }).filter((date: any) => date) || []
              : [],
            preferredDate: data.preferredDate
              ? (typeof data.preferredDate.toDate === 'function'
                  ? data.preferredDate.toDate().toISOString()
                  : (typeof data.preferredDate === 'string' ? data.preferredDate : ''))
              : '',
            assignedTeacherId: data.assignedTeacherId || null,
            assignedTeacherName: data.assignedTeacherName || null,
          };

          setRequest(requestData);
        } else {
          setError('Demande non trouvée');
        }
      } catch (err: any) {
        console.error("Error fetching request:", err);
        setError("Error fetching request");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleSubmit = async (application: Application) => {
    if (!request || !request.parentId) {
      console.error('Request or parentId is missing');
      setError('Request or parentId is missing');
      return;
    }

    if (!application.proposedDateTime || typeof application.proposedDateTime.toDate !== 'function') {
      console.error('Invalid proposed date time');
      setError('Invalid proposed date time');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate unique meeting link based on request ID
      const meetingLink = `https://meet.jit.si/${id}`;

      // Convert Firebase Timestamp to JavaScript Date
      const startTime = application.proposedDateTime.toDate();
      
      // Calculate end time (1 hour after start time)
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const courseData = {
        teacherId: application.teacherId,
        requestId: id,
        studentId: request.parentId,
        teacherName: application.teacherName,
        message: application.message,
        subject: request.subjects,
        level: request.level,
        status: 'pending',
        proposedDateTime: Timestamp.fromDate(startTime),
        endDateTime: Timestamp.fromDate(endTime),
        createdAt: Timestamp.now(),
        meetingLink: meetingLink
      };

      await addDoc(collection(db, 'courses'), courseData);
      console.log('New course document created successfully.');

      // Update request status and assigned teacher
      await updateDoc(doc(db, 'requests', id), {
        status: 'assigned',
        assignedTeacherId: application.teacherId,
        assignedTeacherName: application.teacherName,
      });

      // Update local request state
      setRequest((prevRequest) => ({
        ...prevRequest!,
        status: 'assigned',
        assignedTeacherId: application.teacherId,
        assignedTeacherName: application.teacherName,
      }));

      // Switch to details tab
      setActiveTab('details');
      navigate('/courses');
    } catch (error) {
      console.error('Error creating new course document:', error);
      setError('Error creating new course document');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Détails de la demande" showBackButton />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-450" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatRequestDate = (dateString: string) => {
    try {
      return `Créé le ${format(new Date(dateString), 'dd/MM/yyyy')}`;
    } catch {
      return 'Date de création inconnue';
    }
  };

  const formatDate = (date: string | Timestamp | undefined) => {
    if (!date) {
      return "Date inconnue";
    }

    let dateToFormat: Date;
    if (typeof date === 'string') {
      dateToFormat = new Date(date);
    } else if (date instanceof Timestamp) {
      dateToFormat = date.toDate();
    } else {
      return 'Date inconnue';
    }

    if (isNaN(dateToFormat.getTime())) {
      return "Date inconnue";
    }
    return format(dateToFormat, "dd MMMM yyyy", { locale: fr });
  };

  const formatDateTime = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) {
      return "Date inconnue";
    }

    const date = timestamp.toDate();
    if (!isDate(date) || isNaN(date.getTime())) {
      return "Date invalide";
    }

    const formattedDate = format(date, "EEEE dd MMMM 'à' HH:mm", { locale: fr });

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  const getFrequencyText = (hoursPerWeek: number | undefined) => {
    if (hoursPerWeek === undefined || hoursPerWeek === null) return 'Fréquence non spécifiée';
    if (hoursPerWeek === 1) return '1h / semaine';
    return `${hoursPerWeek}h/semaine`;
  };

  const getTeachingLanguageText = (lang: string | undefined) => {
    if (!lang) return 'Non spécifié';
    return lang === 'french' ? 'Français' : lang === 'dutch' ? 'Néerlandais' : lang;
  };

  const getTimeSlotText = (slot: string | undefined) => {
    if (!slot) return 'Non spécifié';
    switch (slot) {
      case '8-14': return '8h - 14h';
      case '14-20': return '14h - 20h';
      case '20-8': return '20h - 8h';
      default: return slot;
    }
  };

  if (error || !request) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Détails de la demande" showBackButton />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-error-600 mb-4">{error || 'Demande non trouvée'}</p>
            <Button onClick={() => navigate('/requests')}>Retour aux demandes</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Détails de la demande" showBackButton />

      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden shadow-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold text-secondary-dark-blue">
                    {request.subjects?.map(subject => subject.name).join(', ') ?? 'Matière non spécifiée'}
                  </h1>
                  <div className="flex items-center mt-1 text-secondary-dark-blue mb-1">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>Niveau {request.level}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${request.status === 'assigned' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-secondary-dark-blue'}`}>
                  {request.status === 'pending' ? 'En attente' : ''}
                  {request.status === 'assigned' ? 'Professeur assigné' : ''}
                  {request.status === 'completed' ? 'Terminée' : ''}
                  {request.status === 'cancelled' ? 'Annulée' : ''}
                </span>
              </div>
              <div className="mt-2 text-secondary-dark-blue text-sm">{formatRequestDate(request.createdAt)}</div>
            </div>

            {request.status !== 'assigned' && (
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                      activeTab === 'details'
                        ? 'border-primary-500 text-primary-500'
                        : 'border-transparent text-secondary-dark-blue hover:text-secondary-dark-blue/80'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Détails
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                      activeTab === 'applications'
                        ? 'border-primary-500 text-primary-500'
                        : 'border-transparent text-secondary-dark-blue hover:text-secondary-dark-blue/80'
                    } ${request.status === 'assigned' ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => {
                      if (request.status !== 'assigned') {
                        setActiveTab('applications');
                      }
                    }}
                    disabled={request.status === 'assigned'}
                  >
                    Candidatures
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'details' || request.status === 'assigned' ? (
              <div className="p-4">
                <div className="space-y-6">
                  {request.status === 'assigned' && request.assignedTeacherName && (
                    <div className="p-4 bg-primary-50 rounded-lg shadow-md">
                      <h3 className="text-base font-semibold text-primary-800 mb-2">Professeur</h3>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <p className="text-primary-700 mb-2 sm:mb-0">
                          <User className="inline h-4 w-4 mr-1" />
                          {request.assignedTeacherName}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate('/courses')}
                          variant="default"
                          className="w-full sm:w-auto mt-2 sm:mt-0"
                        >
                          Voir mes cours
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-semibold text-secondary-dark-blue mb-2">Description</h3>
                    <p className="text-secondary-dark-blue">{request.description}</p>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-secondary-dark-blue mb-3">Détails de la demande</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-secondary-dark-blue">
                      <div className="flex items-center">
                        {request.type === 'individual' ? (
                          <>
                            <User className="h-5 w-5 mr-2 text-gray-500" />
                            <span>Cours individuel</span>
                          </>
                        ) : (
                          <>
                            <Users className="h-5 w-5 mr-2 text-gray-500" />
                            <span>Cours en groupe</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        <span>{getFrequencyText(request.hoursPerWeek)}</span>
                      </div>

                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
                        <span>Langue: {getTeachingLanguageText(request.teachingLanguage)}</span>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                        <span>Plage horaire: {getTimeSlotText(request.timeSlot)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-semibold text-secondary-dark-blue mb-3">Disponibilités proposées</h3>
                    <div className="space-y-2">
                      {request.availableDates?.map((date, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md text-sm ${
                            date === request.preferredDate
                              ? 'bg-primary-50 text-primary-450'
                              : 'bg-gray-50 text-secondary-dark-blue'
                          }`}
                        >
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date))}</span>
                            {date === request.preferredDate && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-450 rounded-full">
                                Préféré
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {request.availableDates && request.availableDates.length === 0 && (
                        <p className="text-secondary-dark-blue text-sm">Aucune date disponible spécifiée.</p>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <Button onClick={() => navigate('/requests')} variant="outline">
                        Retour
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
                            navigate('/requests');
                          }
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                {(!isLoading && request) ? (
                  applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-secondary-dark-blue mb-2">
                        Aucune candidature pour le moment
                      </h3>
                      <p className="text-secondary-dark-blue max-w-md mx-auto">
                        Les professeurs intéressés vous contacteront dès qu'ils auront vu votre demande.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {applications.map((application) => (
                        <div
                          key={application.id}
                          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg"
                        >
                          <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary-600" />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-secondary-dark-blue">{application.teacherName}</h3>
                                  <p className="text-sm text-secondary-dark-blue flex items-center">
                                    Le {formatDate(application.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <p className="text-secondary-dark-blue italic">{application.message}</p>
                            </div>
                          </div>

                          <div className="px-5 py-4">
                            <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex flex-col">
                                <p className="text-sm font-medium text-secondary-dark-blue ">Premier cours proposé</p>
                                <p className="text-base font-semibold text-secondary-dark-blue">
                                  {formatDateTime(application.proposedDateTime)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 py-4 bg-white-50 border-t border-gray-100 flex justify-end space-x-3">
                            <Button
                              onClick={() => navigate(`/teacher/profile/${application.teacherId}`)}
                              variant="outline"
                              size="sm"
                            >
                              Voir profil
                            </Button>
                            <Button onClick={() => handleSubmit(application)} disabled={isSubmitting} variant="default" size="sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Accepter
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestDetailPage;