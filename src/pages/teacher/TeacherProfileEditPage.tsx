import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import {  getUserProfile, auth, updateUserProfile} from '../../firebase';
import { Input } from '../../components/ui/Input'; 
import { Button} from '../../components/ui/Button';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';


interface Teacher {
  id: string;
  name: string;
  email: string;
  bio: string;
  subjects: string[];
  qualifications: string[]

  
}

import { useNavigate } from 'react-router-dom';

const TeacherProfileEditPage = () => {
  const [teacherData, setTeacherData] = useState<Teacher>({
    id: '', // Initialize with empty strings or appropriate defaults
    name:'',
    email: '',
    bio: '',
    subjects: [],
    qualifications: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const navigate = useNavigate();

  useEffect(() => { 
     const fetchTeacherData = async () => {
      if (!auth.currentUser) return;
      setIsLoading(true);
      setError(null);
      try {      
        const data = await getUserProfile(auth.currentUser.uid);
        if (data) {
          setTeacherData({ ...data, subjects: data.subjects || [], qualifications: data.qualifications || [] });
        } else {
          setError('Teacher profile not found.');
        }
       
      } catch (err) {
        setError('Network error or server issue.');
        console.error("Error fetching teacher profile :",err);
      } finally {
        setIsLoading(false);
      }
    }; 
    fetchTeacherData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeacherData(prev => ({ ...prev, [name]: value })); 
  };

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setTeacherData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setTeacherData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    setTeacherData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveQualification = (index: number) => {
    setTeacherData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e: KeyboardEvent, type: 'subject' | 'qualification') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'subject') handleAddSubject();
      else handleAddQualification();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        const { id, email, ...dataToUpdate } = teacherData;
        await updateUserProfile(auth.currentUser.uid, dataToUpdate, localStorage.getItem('user_type') || 'parent');
        
        navigate('/profile');
    
    } catch (err) {
      setError('Failed to save teacher profile.');


      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Editer mon profil" showBackButton />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {isLoading && <div className="text-center">Chargement...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        {!isLoading && !error && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={teacherData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      transition duration-150 placeholder-gray-400" 
                    value={teacherData.bio}
                    onChange={handleInputChange}
                    placeholder="Parlez-nous de vous, votre expérience, votre méthode d'enseignement..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 100 caractères - Maximum 500 caractères 
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matières
                  </label>
                  <div className="space-y-2 mb-2">
                    {teacherData.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{subject}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div> 
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)} 
                      onKeyDown={(e) => handleKeyDown(e, 'subject')}
                      placeholder="Nouvelle matière"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleAddSubject}
                      disabled={!newSubject.trim()} 
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <div className="space-y-2 mb-2">
                    {teacherData.qualifications.map((qualification, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{qualification}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div> 
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)} 
                      onKeyDown={(e) => handleKeyDown(e, 'qualification')}
                      placeholder="Nouvelle qualification"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleAddQualification}
                      disabled={!newQualification.trim()} 
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TeacherProfileEditPage;