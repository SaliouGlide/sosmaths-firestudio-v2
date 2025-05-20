import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Clock, Calendar, User } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { toast } from 'sonner';
import { subjects } from '../../utils/mockData';
import type { Session, CourseRequest } from '../../types';

function CreateSessionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [requests, setRequests] = useState<CourseRequest[]>([]);

  const durations = [
    { value: 60, label: '1 heure' },
    { value: 90, label: '1 heure 30' },
    { value: 120, label: '2 heures' },
    { value: 150, label: '2 heures 30' },
    { value: 180, label: '3 heures' }
  ];

  useEffect(() => {
    const fetchAssignedRequests = async () => {
      if (!auth.currentUser) return;

      try {
        setIsSubmitting(true);
        const requestsRef = collection(db, 'requests');
        const q = query(
          requestsRef,
          where('assignedTeacherId', '==', auth.currentUser.uid),
          where('status', '==', 'assigned')
        );
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseRequest[];
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Erreur lors du chargement des demandes');
      } finally {
        setIsSubmitting(false);
      }
    };

    fetchAssignedRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('Vous devez être connecté pour créer une session');
      return;
    }

    if (!selectedRequest || !selectedDate || !selectedTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const dateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (dateTime < new Date()) {
      toast.error('La date et l\'heure doivent être dans le futur');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Création de la session...');

    try {
      const selectedRequestData = requests.find(r => r.id === selectedRequest);
      if (!selectedRequestData) {
        throw new Error('Demande non trouvée');
      }

      const sessionData: Partial<Session> = {
        teacherId: auth.currentUser.uid,
        studentId: selectedRequestData.parentId,
        subject: selectedRequestData.subjects,
        level: selectedRequestData.level,
        duration,
        proposedDateTime: dateTime,
        status: 'scheduled',
        meetingLink: `https://meet.jit.si/${auth.currentUser.uid}-${selectedRequestData.parentId}-${Date.now()}`,
      };

      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        createdAt: serverTimestamp(),
      });

      toast.success('Session créée avec succès', {
        id: toastId,
      });

      navigate('/planning');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Erreur lors de la création de la session', {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nouvelle session" showBackButton />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-secondary-dark-blue mb-6">
                  Détails de la session
                </h2>

                {/* Request Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demande de cours <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedRequest}
                    onChange={(e) => setSelectedRequest(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner une demande</option>
                    {requests.map((request) => (
                      <option key={request.id} value={request.id}>
                        {request.subjects?.map(s => s.name).join(', ')} - {request.parentName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {durations.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDuration(d.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          duration === d.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/planning')}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création...' : 'Créer la session'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default CreateSessionPage;