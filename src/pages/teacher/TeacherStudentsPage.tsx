import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Mail, Phone, BookOpen, GraduationCap, MessageSquare, User } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { StudentProfile } from '../../types';
import { toast } from 'sonner';

function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!auth.currentUser) return;

      try {
        setIsLoading(true);
        const coursesRef = collection(db, 'courses');
        const q = query(
          coursesRef,
          where('teacherId', '==', auth.currentUser.uid),
          where('status', 'in', ['scheduled', 'completed'])
        );
        const querySnapshot = await getDocs(q);

        // Get unique student IDs
        const studentIds = new Set(querySnapshot.docs.map(doc => doc.data().studentId));

        // Fetch student profiles
        const studentProfiles: StudentProfile[] = [];
        for (const studentId of studentIds) {
          const studentRef = collection(db, 'users');
          const studentQuery = query(studentRef, where('id', '==', studentId));
          const studentSnapshot = await getDocs(studentQuery);

          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            studentProfiles.push({
              id: studentId,
              name: studentData.name || 'Élève',
              level: studentData.level || 'Niveau non spécifié',
              subjects: studentData.subjects || [],
              parentId: studentData.parentId,
              parentName: studentData.parentName || 'Parent',
              parentEmail: studentData.parentEmail || '',
              parentPhone: studentData.parentPhone || '',
              avatar: studentData.avatar,
              createdAt: studentData.createdAt?.toDate?.() || new Date()
            });
          }
        }

        setStudents(studentProfiles);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Erreur lors du chargement des élèves');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.level.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mes élèves" />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mes élèves" />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="search"
                  placeholder="Rechercher un élève..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={student.avatar || 'https://via.placeholder.com/100'}
                          alt={student.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {student.name}
                          </h3>
                          <div className="flex items-center mt-1 text-gray-500">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            <span>{student.level}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Matières suivies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {student.subjects.map(subject => (
                                <span
                                  key={subject.name}
                                  className="px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700"
                                >
                                  {subject.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Parent
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{student.parentName}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <a
                                  href={`mailto:${student.parentEmail}`}
                                  className="text-primary-600 hover:underline"
                                >
                                  {student.parentEmail}
                                </a>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <a
                                  href={`tel:${student.parentPhone}`}
                                  className="text-primary-600 hover:underline"
                                >
                                  {student.parentPhone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                          <Button variant="outline" className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Voir les cours
                          </Button>
                          <Button variant="outline" className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun élève trouvé
                  </h3>
                  <p className="text-gray-500">
                    Aucun élève ne correspond à vos critères de recherche.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default TeacherStudentsPage;