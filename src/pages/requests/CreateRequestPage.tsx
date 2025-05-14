import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { subjects } from '../../utils/mockData';
import { Calendar, User, Users, X, Phone } from 'lucide-react';
import { createCourseRequest, getUserProfile } from '../../firebase';
import { auth } from '../../firebase';
import type { CourseRequest, TeachingLanguage, TimeSlot, User as UserType } from '../../types'; // Alias User to UserType
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

function CreateRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSubjectId = searchParams.get('subject');
  
  // State for fetched user profile
  const [fetchedUserData, setFetchedUserData] = useState<UserType | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Determine if user has a complete profile based on fetched data
  const hasUserProfile = !!(fetchedUserData?.name && fetchedUserData?.phone);
  
  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialSubjectId ? [initialSubjectId] : []
  );
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [preferredDate, setPreferredDate] = useState('');
  const [type, setType] = useState('individual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [teachingLanguage, setTeachingLanguage] = useState<TeachingLanguage>('french');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('14-20');
  const [hoursPerWeek, setHoursPerWeek] = useState(2);
  // Local state for parent info if profile is incomplete
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentPhoneCountry, setParentPhoneCountry] = useState<CountryCode>('FR');
  
  const scientificSubjects = subjects.filter(subject => subject.isScientific);
  
  const levels = [
    'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème',
    'Seconde', 'Première', 'Terminale',
    'Licence 1', 'Licence 2', 'Licence 3',
    'Master 1', 'Master 2'
  ];

  const countryOptions = [
    { code: 'BE', name: ' Belgique (+32)', prefix: '+32' },
    { code: 'FR', name: 'France (+33)', prefix: '+33' },
    { code: 'CH', name: 'Suisse (+41)', prefix: '+41' },
    { code: 'LU', name: 'Luxembourg (+352)', prefix: '+352' },
    { code: 'MC', name: 'Monaco (+377)', prefix: '+377' }
  ];

  // Ref for the date input
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const profile = await getUserProfile(auth.currentUser.uid);
          setFetchedUserData(profile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Erreur lors du chargement du profil utilisateur.");
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    fetchProfile();
  }, []); // Empty dependency array means this effect runs once on mount

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      }
      return [...prev, subjectId];
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate && !availableDates.includes(selectedDate)) { // Check if selectedDate is not empty
      setAvailableDates(prev => [...prev, selectedDate]);
      if (!preferredDate) {
        setPreferredDate(selectedDate);
      }
    }
    // Clear the input value after adding to the list (optional, but common UX)
    if (dateInputRef.current) {
        dateInputRef.current.value = '';
    }
  };
  
  const removeAvailableDate = (dateToRemove: string) => {
    setAvailableDates(availableDates.filter(date => date !== dateToRemove));
    if (preferredDate === dateToRemove) {
      setPreferredDate(availableDates.find(date => date !== dateToRemove) || '');
    }
  };

  const validatePhone = (phone: string): boolean => {
    // If using fetched data, assume it's already validated or will be validated on profile save
    if (hasUserProfile) return true;

    const country = countryOptions.find(c => c.code === parentPhoneCountry);
     // Prepend prefix if not present for validation
    let phoneToValidate = phone;
    if (phone && country && !phone.startsWith('+')) {
        phoneToValidate = country.prefix + phone;
    }

    const phoneNumber = parsePhoneNumberFromString(phoneToValidate, parentPhoneCountry);
    return phoneNumber ? phoneNumber.isValid() : false;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParentPhone(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0 || !description || !level || availableDates.length === 0 || !type) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    if (!auth.currentUser) {
      setError('Vous devez être connecté pour créer une demande');
      return;
    }

    // Validation for contact info only if profile is incomplete
    if (!hasUserProfile) {
      if (!parentName) {
        setError('Veuillez entrer votre nom');
        return;
      }
      if (!validatePhone(parentPhone)) {
        setError('Veuillez entrer un numéro de téléphone valide');
        return;
      }
    }
    
    setIsSubmitting(true);
    setError('');
    
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

      // Use fetched profile data if available, otherwise use local state
      const parentInfo = hasUserProfile && fetchedUserData
        ? { parentName: fetchedUserData.name, parentPhone: fetchedUserData.phone, parentPhoneCountry: fetchedUserData.phoneCountry }
        : { parentName, parentPhone, parentPhoneCountry };

      const requestData: Partial<CourseRequest> = { 
        parentId: auth.currentUser.uid,
        ...parentInfo,
        subjects: selectedSubjectsData, description, level, teachingLanguage, timeSlot, hoursPerWeek, availableDates, preferredDate, type: type as CourseRequest['type']
      };

      await createCourseRequest(requestData as CourseRequest);
      navigate('/requests');
    } catch (error: any) {
      console.error('Error creating request:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Show loading indicator while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-secondary-dark-blue">Chargement du profil...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <Header title="Créer une demande" showBackButton />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Contact Information - Only show if user profile is not complete */}
          {!hasUserProfile && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Vos coordonnées</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                    Votre nom
                  </label>
                  <Input
                    id="parentName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Votre nom complet"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="parentPhoneCountry" className="block text-sm font-medium text-secondary-dark-blue">
                    Pays
                  </label>
                  <select
                    id="parentPhoneCountry"
                    value={parentPhoneCountry}
                    onChange={(e) => setParentPhoneCountry(e.target.value as CountryCode)}
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {countryOptions.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="parentPhone" className="block text-sm font-medium text-secondary-dark-blue">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="parentPhone"
                      type="tel"
                      value={parentPhone}
                      onChange={handlePhoneChange}
                      className="pl-10"
                      placeholder="6 12 34 56 78"
                      required
                    />
                  </div>
                  <p className="text-sm text-secondary-dark-blue">
                    Format attendu: {countryOptions.find(c => c.code === parentPhoneCountry)?.prefix}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subject Selection */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Matière et niveau</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {scientificSubjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => toggleSubject(subject.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedSubjects.includes(subject.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                        : 'border-gray-200 hover:border-primary-200 hover:shadow'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      {React.createElement(subject.icon, {
                        size: 24,
                        className: selectedSubjects.includes(subject.id) ? 'text-primary-500' : 'text-gray-400'
                      })}
                      <span className="mt-2 text-sm font-medium text-secondary-dark-blue">{subject.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-secondary-dark-blue mb-2">
                  Niveau
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Sélectionnez un niveau</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-dark-blue mb-2">
                  Description de votre besoin
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Décrivez précisément ce dont vous avez besoin..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Préférences</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-dark-blue mb-3">
                  Langue d'enseignement
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'french', label: 'Français' },
                    { value: 'dutch', label: 'Néerlandais' }
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        teachingLanguage === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="teachingLanguage"
                        value={option.value}
                        checked={teachingLanguage === option.value}
                        onChange={(e) => setTeachingLanguage(e.target.value as TeachingLanguage)}
                        className="sr-only"
                      />
                      <span className="font-medium text-secondary-dark-blue">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-dark-blue mb-3">
                  Plage horaire préférée
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: '8-14', label: '8h - 14h' },
                    { value: '14-20', label: '14h - 20h' },
                    { value: '20-8', label: '20h - 8h' }
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        timeSlot === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeSlot"
                        value={option.value}
                        checked={timeSlot === option.value}
                        onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                        className="sr-only"
                      />
                      <span className="font-medium text-secondary-dark-blue">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-secondary-dark-blue mb-2">
                  Heures de cours par semaine
                </label>
                <select
                  id="hoursPerWeek"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4, 5].map(hours => (
                    <option key={hours} value={hours}>
                      {hours}h/semaine
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Dates souhaitées</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-secondary-dark-blue mb-2">
                  Date premier cours
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    ref={dateInputRef}
                    id="date"
                    type="date"
                    onChange={handleDateChange}
                    className="w-full" // Make input visible
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {availableDates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-dark-blue mb-3">Dates disponibles:</h3>
                  <div className="space-y-2">
                    {availableDates.map((date) => (
                      <div
                        key={date}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                          preferredDate === date
                            ? 'bg-primary-50 border border-primary-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`preferred-${date}`}
                            name="preferredDate"
                            checked={preferredDate === date}
                            onChange={() => setPreferredDate(date)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label
                            htmlFor={`preferred-${date}`}
                            className="ml-3 text-sm font-medium text-secondary-dark-blue"
                          >
                            {formatDate(date)}
                            {preferredDate === date && (
                              <span className="ml-2 text-xs text-primary-600">(Préféré)</span>
                            )}
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAvailableDate(date)}
                          className="text-sm font-medium text-error-600 hover:text-error-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Type */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Type de cours</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('individual')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    type === 'individual'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${
                      type === 'individual' ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <User
                        size={24}
                        className={type === 'individual' ? 'text-primary-500' : 'text-gray-400'}
                      />
                    </div>
                    <div className="ml-4 text-left">
                      <h3 className="font-medium text-secondary-dark-blue">Cours individuel</h3>
                      <p className="text-sm text-secondary-dark-blue mt-1">Attention personnalisée</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType('group')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    type === 'group'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${
                      type === 'group' ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <Users
                        size={24}
                        className={type === 'group' ? 'text-primary-500' : 'text-gray-400'}
                      />
                    </div>
                    <div className="ml-4 text-left">
                      <h3 className="font-medium text-secondary-dark-blue">Petits groupes</h3>
                      <p className="text-sm text-secondary-dark-blue mt-1">Jusqu'à 3 élèves</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-error-50 border border-error-200 p-4 text-error-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="px-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {isSubmitting ? 'Publication en cours...' : 'Publier la demande'}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default CreateRequestPage;