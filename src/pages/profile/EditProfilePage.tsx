import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Mail, Phone, BookOpen } from 'lucide-react';
import { auth, updateUserProfile, getUserProfile } from '../../firebase';
import { CountryCode } from 'libphonenumber-js';

function EditProfilePage() {
  
  
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }
  }, [navigate]);
  
  // Get user data from localStorage and auth
  const userEmail = auth.currentUser?.email || '';
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCountry: 'FR' as CountryCode,
    bio: '',
    subjects: [],
    hourlyRate: ''
  });

  useEffect(() => {
    if(localStorage.getItem('user_type') !== 'parent') return
    const fetchUserData = async () => {
      if(auth.currentUser){
        const userData = await getUserProfile(auth.currentUser.uid);
        setFormData({
          ...userData,
          email: userEmail
        });
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userEmail]);
  
  const countryOptions = [
    { code: 'FR', name: 'France (+33)', prefix: '+33' },
    { code: 'BE', name: 'Belgique (+32)', prefix: '+32' },
    { code: 'CH', name: 'Suisse (+41)', prefix: '+41' },
    { code: 'LU', name: 'Luxembourg (+352)', prefix: '+352' },
    { code: 'MC', name: 'Monaco (+377)', prefix: '+377' }
  ];
  
  

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const country = countryOptions.find(c => c.code === formData.phoneCountry);
    
    // If the user hasn't entered the prefix, add it
    if (value && !value.startsWith('+')) {
      value = country?.prefix + value;
    }
    
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!auth.currentUser) {
        throw new Error('Vous devez être connecté pour modifier votre profil');
      }

      const profileData = {
        email: formData.email || '',
        name: formData.name || '',
        phone: formData.phone || '',
        phoneCountry: formData.phoneCountry || 'FR',
        bio: formData.bio || '',
        subjects: formData.subjects || [],
        hourlyRate: formData.hourlyRate || '',
      };

      await updateUserProfile(auth.currentUser.uid, {
        ...profileData,
      },localStorage.getItem('user_type') || 'parent');
      try {
        const updatedUser = await getUserProfile(auth.currentUser.uid);
      localStorage.setItem('user_data', JSON.stringify({...updatedUser, userType: localStorage.getItem('user_type') || 'parent'}));
      navigate('/profile');
      } catch (error){
        console.error("error getting the user profile:", error)
        throw error;
      }
    }
    catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not authenticated or loading, don't render the form
  if (!auth.currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <Header title="Modifier mon profil" showBackButton />
      {isLoading ? <p className="text-secondary-dark-blue">Chargement</p> :
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="shadow-md">
              <CardContent className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600">
                    {error}
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        placeholder="Votre nom complet"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="mt-1 text-sm text-secondary-dark-blue">L'email ne peut pas être modifié</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phoneCountry" className="block text-sm font-medium text-secondary-dark-blue">
                      Pays
                    </label>
                    <select
                      id="phoneCountry"
                      value={formData.phoneCountry}
                      onChange={(e) => setFormData({ ...formData, phoneCountry: e.target.value as CountryCode })}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {countryOptions.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-dark-blue">
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="pl-10"
                        placeholder="6 12 34 56 78"
                      />
                    </div>
                    <p className="text-sm text-secondary-dark-blue">
                      Format: {countryOptions.find(c => c.code === formData.phoneCountry)?.prefix} 6 12 34 56 78
                    </p>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>

                  {localStorage.getItem('user_type') === 'teacher' && (
                    <>
                      <div>
                        <label htmlFor="subjects" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                          Matières enseignées
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="subjects"
                            value={formData.subjects.join(', ')}
                            onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(',').map(s => s.trim()) })}
                            className="pl-10"
                            placeholder="Mathématiques, Physique, Chimie..."
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                          Tarif horaire (€)
                        </label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                          min="0"
                          placeholder="45"
                        />
                      </div>
                    </>
                  )}
                </div> 

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
      }
      <Footer />
    </div>
  );
}

export default EditProfilePage;