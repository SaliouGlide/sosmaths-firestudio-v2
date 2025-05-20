import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Clock, Calendar, User } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { toast } from 'sonner';
import { subjects } from '../../utils/mockData';
import type { Session } from '../../types';

function CreateSessionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [level, setLevel] = useState('');

  const levels = [
    'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème',
    'Seconde', 'Première', 'Terminale',
    'Licence 1', 'Licence 2', 'Licence 3',
    'Master 1', 'Master 2'
  ];

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 heure' },
    { value: 90, label: '1 heure 30' },
    { value: 120, label: '2 heures' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('Vous devez être connecté pour créer une session');
      return;
    }

    if (!selectedStudent || !selectedDate || !selectedTime || selectedSubjects.length === 0) {
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
      const selectedSubjectsData = selectedSubjects.map(subjectId => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) throw new Error('Subject not found');
        return {
          id: subject.id,
          name: subject.name,
          isScientific: subject.isScientific
        };
      });

      const sessionData: Partial<Session> = {
        teacherId: auth.currentUser.uid,
        studentId: selectedStudent,
        subject: selectedSubjectsData,
        level,
        duration,
        proposedDateTime: dateTime,
        status: 'scheduled',
        meetingLink: `https://meet.jit.si/${auth.currentUser.uid}-${selectedStudent}-${Date.now()}`,
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

                {/* Student Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Élève <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner un élève</option>
                    {/* Add your students list here */}
                  </select>
                </div>

                {/* Subject Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matières <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          if (selectedSubjects.includes(subject.id)) {
                            setSelectedSubjects(prev => prev.filter(id => id !== subject.id));
                          } else {
                            setSelectedSubjects(prev => [...prev, subject.id]);
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedSubjects.includes(subject.id)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          {React.createElement(subject.icon, {
                            size: 24,
                            className: selectedSubjects.includes(subject.id) ? 'text-primary-500' : 'text-gray-400'
                          })}
                          <span className="mt-2 text-sm">{subject.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>{l}</option>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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