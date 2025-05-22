import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Clock, Calendar, Users, User, BookOpenCheck, Loader2, ChevronRight, Star, Search, Filter, Video } from "lucide-react";
import { getCourseRequests, auth } from "../../firebase";
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from "../../firebase";
import type { Course } from "../../types";

function CoursesPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.currentUser) return;

      try {
        setIsLoading(true);
        setError(null);
        const coursesRef = collection(db, "courses");
        const q = query(
          coursesRef,
          where("studentId", "==", auth.currentUser.uid),
          where("status", "==", "scheduled")
        );
        const querySnapshot = await getDocs(q);

        const coursesData: Course[] = [];
        for (const docSnapshot of querySnapshot.docs) {
          const courseData = docSnapshot.data();
          const teacherId = courseData.teacherId;

          const teacherRef = doc(db, "teachers", teacherId);
          const teacherSnap = await getDoc(teacherRef);

          let teacherAvatar;
          if (teacherSnap.exists()) {
            teacherAvatar = teacherSnap.data().avatar;
          }

          const course: Course = {
            id: docSnapshot.id,
            ...courseData,
            teacherAvatar: teacherAvatar,
          };
          coursesData.push(course);
        }

        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Une erreur est survenue lors du chargement des cours");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = searchQuery
      ? course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subject.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesSubject = selectedSubject
      ? course.subject.some((s) => s.id === selectedSubject)
      : true;

    const isUpcoming = new Date(course.proposedDateTime.toDate()) > new Date();
    return matchesSearch && matchesSubject && (activeTab === "upcoming" ? isUpcoming : !isUpcoming);
  });

  // Debug logging
  console.log("Filtered courses:", filteredCourses);
  filteredCourses.forEach(course => {
    console.log(`Course ${course.id}: status=${course.status}, meetingLink=${course.meetingLink}`);
  });

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "Date non disponible";
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date non disponible";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning-100 text-warning-800";
      case "scheduled":
        return "bg-primary-100 text-primary-800";
      case "inProgress":
        return "bg-success-100 text-success-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-error-100 text-error-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "scheduled":
        return "Planifié";
      case "inProgress":
        return "En cours";
      case "completed":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mes cours" />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-450" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mes cours" />

      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-dark-blue">Mes cours</h1>
              <p className="text-gray-600 mt-1">
                {filteredCourses.length} cours {activeTab === "upcoming" ? "à venir" : "passés"}
              </p>
            </div>
            <Link to="/requests/create">
              <Button className="w-full sm:w-auto">
                <BookOpenCheck className="h-4 w-4 mr-2" />
                Réserver un cours
              </Button>
            </Link>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="search"
                    placeholder="Rechercher un cours..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-450"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "upcoming" ? "default" : "outline"}
                  onClick={() => setActiveTab("upcoming")}
                >
                  À venir
                </Button>
                <Button
                  variant={activeTab === "past" ? "default" : "outline"}
                  onClick={() => setActiveTab("past")}
                >
                  Passés
                </Button>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun cours {activeTab === "upcoming" ? "à venir" : "passé"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {activeTab === "upcoming"
                  ? "Vous n'avez pas encore de cours programmés. Réservez votre premier cours maintenant !"
                  : "Vous n'avez pas encore pris de cours."}
              </p>
              <Link to="/requests/create">
                <Button>Réserver un cours</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Course Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        {course.teacherAvatar ? (
                          <img
                            src={course.teacherAvatar}
                            alt={course.teacherName}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-secondary-dark-blue">
                            {course.teacherName}
                          </h3>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-amber-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">4.8</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          course.status
                        )}`}
                      >
                        {getStatusText(course.status)}
                      </span>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <BookOpenCheck className="h-5 w-5 mr-2" />
                        <span>
                          {course.subject.map((s) => s.name).join(", ")} - {course.level}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span>{formatDateTime(course.proposedDateTime)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {course.status === "scheduled" && course.meetingLink && (
                        <Button 
                        fullWidth 
                        className="justify-center"
                        onClick={() => window.open(course.meetingLink, '_blank')}
                      >
                        <Video className="h-5 w-5 mr-2" />
                        Rejoindre le cours
                      </Button>
                      )}
                      <Link to={`/courses/${course.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center"
                        >
                          Détails
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CoursesPage;