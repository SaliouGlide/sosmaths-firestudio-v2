import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, User, Users, MessageSquare, Globe2, Phone, BookOpen } from 'lucide-react';
import { db, doc, getDoc, collection, addDoc, serverTimestamp, auth, updateDoc, getDocs, query, where, arrayUnion, getUserProfile } from '../../firebase';
import type { CourseRequest } from '../../types';
import { toast } from 'sonner';

function TeacherRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CourseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

  const checkApplicationStatus = async (requestId: string, teacherId: string): Promise<boolean> => {
    const q = query(
      collection(db, 'requests', requestId, 'applications'),
      where('teacherId', '==', teacherId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setLoading(false);
        setError('No request ID provided.');
        return;
      }
      try {
        const requestRef = doc(db, 'requests', id);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists()) {
          const requestData = requestSnap.data();
           const fetchedRequest: CourseRequest = {
            id: requestSnap.id,
            studentName: requestData.studentName || '',
            level: requestData.level || '',
            subjects: requestData.subjects || [],
            description: requestData.description || '',
            type: requestData.type || 'individual',
            hoursPerWeek: requestData.hoursPerWeek || 0,
            teachingLanguage: requestData.teachingLanguage || 'french',
            timeSlot: requestData.timeSlot || '',
            availableDates: requestData.availableDates || [],
            preferredDate: requestData.preferredDate || '',
            parentName: requestData.parentName || '',
            parentPhone: requestData.parentPhone || '',
            parentPhoneCountry: requestData.parentPhoneCountry || '',
            parentId: requestData.parentId || '',
            status: requestData.status || 'pending',
            createdAt: requestData.createdAt?.toDate().toISOString() || new Date().toISOString(),
           };

          setRequest(fetchedRequest);
           if (auth.currentUser) {
            const hasAlreadyApplied = await checkApplicationStatus(fetchedRequest.id, auth.currentUser.uid);
            setHasApplied(hasAlreadyApplied);
          }
        } else {
          setRequest(null);
          setError('Request not found.');
        }
      } catch (err: any) {
        console.error('Error fetching request:', err);
        setError('Failed to load request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

   const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions) => {
     if (!dateString) return 'N/A';
     try {
      const date = (dateString instanceof Date) ? dateString : new Date(dateString);
      const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      const finalOptions = { ...defaultOptions, ...options };

      return new Intl.DateTimeFormat('fr-FR', finalOptions).format(date);
     } catch (e) {
       console.error("Error formatting date:", e);
       return String(dateString);
     }
  };

  const formatTimeSlot = (slot: string) => {
    switch (slot) {
      case '8-14': return '8h - 14h';
      case '14-20': return '14h - 20h';
      case '20-8': return '20h - 8h';
      default: return slot || 'N/A';
    }
  };

  const generateTimeOptions = (timeSlot: string, date: Date): Date[] => {
    const times: Date[] = [];
    const [startHour, endHour] = timeSlot.split('-').map(Number);

    if (isNaN(startHour) || isNaN(endHour)) return [];

    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date(date);
    if (startHour >= endHour) {
      endTime.setDate(endTime.getDate() + 1);
    }
    endTime.setHours(endHour, 0, 0, 0);

    let currentTime = new Date(startTime);
    while (currentTime.getTime() < endTime.getTime()) {
      times.push(new Date(currentTime));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return times;
  };

  const handleDateSelect = (dateString: string) => {
     const date = new Date(dateString);
     const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
     setSelectedDateTime(dateOnly);
  };

   const handleTimeSelect = (time: Date) => {
     if (!selectedDateTime) return;

     const finalDateTime = new Date(selectedDateTime);
     finalDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
     setSelectedDateTime(finalDateTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('Vous devez être connecté pour postuler');
      return;
    }

    if (!message.trim()) {
      toast.warning('Veuillez rédiger un message de motivation');
      return;
    }

    if (!selectedDateTime) {
      toast.warning('Veuillez sélectionner une date et heure');
      return;
    }

    if (selectedDateTime < new Date()) {
      toast.warning('Veuillez sélectionner une date future');
      return;
    }

    if (request?.availableDates && request.availableDates.length > 0) {
      const isDateAvailable = request.availableDates.some(availDate => {
        const availableDate = new Date(availDate);
        return (
          availableDate.getFullYear() === selectedDateTime.getFullYear() &&
          availableDate.getMonth() === selectedDateTime.getMonth() &&
          availableDate.getDate() === selectedDateTime.getDate()
        );
      });

      if (!isDateAvailable) {
        toast.warning('La date sélectionnée ne fait pas partie des disponibilités proposées');
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Envoi de votre candidature...');

    try {
      if (!request?.id) {
        throw new Error('Requête invalide');
      }

      const teacherProfile = await getUserProfile(auth.currentUser.uid);
      if (!teacherProfile || !teacherProfile.name) {
        throw new Error('Profil du professeur introuvable');
      }

      const applicationRef = await addDoc(
        collection(db, 'requests', request.id, 'applications'),
        {
          teacherId: auth.currentUser.uid,
          teacherName: teacherProfile.name,
          requestId: request.id,
          studentId: request.parentId,
          proposedDateTime: selectedDateTime,
          message: message.trim(),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      await updateDoc(doc(db, 'requests', request.id), {
        status: 'under_review',
        appliedTeachers: arrayUnion(auth.currentUser.uid),
        updatedAt: serverTimestamp(),
      });

      setHasApplied(true);

      toast.success('Candidature envoyée avec succès !', {
        id: toastId,
      });

      navigate('/');

    } catch (error) {
      console.error("Erreur d'envoi:", error);
      let errorMessage = "Une erreur est survenue";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(`Échec de l'envoi: ${errorMessage}`, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

   if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-secondary-dark-blue">Chargement des détails de la demande...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-secondary-dark-blue">Erreur: {error}</div>
      </div>
    );
  }

  if (!request) {
     return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-secondary-dark-blue">Demande non trouvée.</div>
      </div>
    );
  }

  const selectedDateOnlyFormatted = selectedDateTime ? formatDate(selectedDateTime) : null;

  return (
    <div className="min-h-screen bg-white">
      <Header title="Détails de la demande" showBackButton />

      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6 space-y-6">

              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(request.subjects || []).map((subject: any) => (
                      <span
                        key={subject.id || subject.name}
                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                      >
                        {subject.name || 'Matière inconnue'}
                      </span>
                    ))}
                  </div>
                  <p className="text-secondary-dark-blue">Niveau: {request.level || 'N/A'}</p>
                  <div className="flex items-center mt-2 text-secondary-dark-blue">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Créée le {formatDate(request.createdAt)}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-medium">
                   Nouvelle demande
                </span>
              </div>

              <div>
                <h2 className="text-sm font-medium text-secondary-dark-blue mb-2">Description</h2>
                <p className="text-secondary-dark-blue">{request.description || 'Aucune description fournie.'}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-secondary-dark-blue mb-2">Détails de la demande</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-secondary-dark-blue text-sm">
                  <div className="flex items-center">
                    {request.type === 'individual' ? (
                      <>
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Cours individuel</span>
                      </>
                    ) : request.type === 'group' ? (
                      <>
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Cours en groupe</span>
                      </>
                    ) : (
                       <span className="text-gray-500">Type non spécifié</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {request.hoursPerWeek ? `${request.hoursPerWeek}h/semaine` : 'Fréquence non spécifiée'}
                    </span>
                  </div>
                   <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Plage horaire : {formatTimeSlot(request.timeSlot)}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe2 className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      Langue : {request.teachingLanguage === 'french' ? 'Français' : request.teachingLanguage === 'dutch' ? 'Néerlandais' : request.teachingLanguage || 'Langue non spécifiée'}
                    </span>
                  </div>
                </div>
              </div>

              {request.parentName && (
                <div>
                  <h2 className="text-sm font-medium text-secondary-dark-blue mb-2">Contact parent</h2>
                  <div className="space-y-2 text-secondary-dark-blue text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{request.parentName}</span>
                    </div>
                    {request.parentPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <a
                          href={`tel:${request.parentPhone}`}
                          className="text-primary-600 hover:underline"
                        >
                          {request.parentPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-secondary-dark-blue">Postuler pour cette demande</h2>

              {hasApplied ? (
                <div className='text-center text-secondary-dark-blue'>Vous avez déjà postulé à cette demande</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <h2 className="text-sm font-medium text-secondary-dark-blue mb-2">Sélectionnez une date parmi les disponibilités proposées :</h2>
                    <div className="space-y-2">
                      {(request?.availableDates || []).length > 0 ? (
                        (request?.availableDates || []).map((dateString: string, index: number) => {
                          const date = new Date(dateString);
                          const isSelectedDate = selectedDateTime ?
                            new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate()).getTime() ===
                            new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() : false;
                          return (
                            <div
                            key={index}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelectedDate
                                ? 'border-primary-500 bg-primary-100'
                                : dateString === request?.preferredDate
                                ? 'border-primary-200 bg-primary-50 hover:border-primary-300'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            onClick={() => handleDateSelect(dateString)}
                           
                            >
                              <div className="flex items-center text-secondary-dark-blue text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500"/>
                                <span>{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                {dateString === request?.preferredDate && (
                                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                    Préféré
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-secondary-dark-blue text-sm">Aucune disponibilité spécifiée par le parent.</p>
                      )}
                    </div>
                  </div>

                  {selectedDateTime && request?.timeSlot && request?.availableDates.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-sm font-medium text-secondary-dark-blue mb-2">Sélectionnez une heure ({formatTimeSlot(request.timeSlot)}) :</h2>
                      <div className="flex flex-wrap gap-2">
                        {generateTimeOptions(request.timeSlot, selectedDateTime!).map((time, index) => {
                          const isSelectedTime = selectedDateTime ? time.getTime() === selectedDateTime.getTime() : false;
                          return (
                            <Button
                              key={index}
                              variant={isSelectedTime ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-secondary-dark-blue mb-2"
                    >
                      Votre message de candidature au parent <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Présentez-vous et expliquez comment vous pouvez aider l'élève..."
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center"
                      onClick={() => navigate('/teacher/requests')}
                    >
                      Retour aux demandes
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !selectedDateTime || !message.trim() || hasApplied}
                      className="flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                    </Button>
                  </div>
                </form>
              )}

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TeacherRequestDetailPage;