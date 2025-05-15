import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  setDoc,
  orderBy,
  getDoc,
  serverTimestamp,
  arrayUnion // Added arrayUnion import
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import type { CourseRequest, User } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyAUP_Q9nlS9mqgLZ7AIVPKptMZLdZEckK0",
  authDomain: "sosmaths-bolt.firebaseapp.com",
  projectId: "sosmaths-bolt",
  storageBucket: "sosmaths-bolt.firebasestorage.app",
  messagingSenderId: "254310756552",
  appId: "1:254310756552:web:14b09c3a48c4987f18f5fd",
  measurementId: "G-CFFMVTS635"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export { Timestamp, doc, getDoc, setDoc, updateDoc, getDocs, collection, addDoc, query, where, orderBy, serverTimestamp, arrayUnion }; // Added arrayUnion to exports

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink };

// User profile functions
export const updateUserProfile = async (userId: string, profileData: Partial<User>, userType: 'parent' | 'teacher' = 'parent') => {
  const docRef = doc(db, "users", userId);
  try {
    const userDoc = await getDoc(docRef);
    
    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profileData,
        userType: userType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } else {
      // Update existing user document
      await updateDoc(docRef, {
        ...profileData,
        userType: userType,
        updatedAt: Timestamp.now()
      });
    } 
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getTeacherApplications = async (requestId: string) => {
  try {
    const q = query(collection(db, 'requests', requestId, 'applications'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      teacherId: doc.data().teacherId,
      teacherName: doc.data().teacherName,
      message: doc.data().message,
      proposedDateTime: doc.data().proposedDateTime.toDate().toISOString(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    }));
  } catch (error) {
    console.error('Error getting teacher applications:', error);
  }
};

export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      ...docSnap.data(),
      id: docSnap.id,
    };
  } else {
    return {};
  }    
  
    

};
 
// Authentication functions
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create initial user profile
    await updateUserProfile(userCredential.user.uid, {
      email: userCredential.user.email || '',
      createdAt: new Date().toISOString()
    });
    return userCredential.user;
  } catch (error: any) {
    let message = `Une erreur est survenue lors de votre inscription`; // Fixed string
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = `Cette adresse email est déjà utilisée`; // Fixed string
        break;
      case 'auth/invalid-email':
        message = `L'adresse email n'est pas valide`; // Fixed string
        break;
      case 'auth/weak-password':
        message = `Le mot de passe doit contenir au moins 6 caractères`; // Fixed string
        break;
    }
    
    throw new Error(message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await getUserProfile(userCredential.user.uid);
    
    if (userProfile) {
      localStorage.setItem('user_data', JSON.stringify(userProfile));
    }

    return userCredential.user;
  } catch (error: any) {
    let message = `Une erreur est survenue lors de la connexion`; // Fixed string
    
    switch (error.code) {
      case 'auth/invalid-credential':
        message = `Email ou mot de passe incorrect`; // Fixed string
        break;
      case 'auth/user-disabled':
        message = `Ce compte a été désactivé`; // Fixed string
        break;
      case 'auth/user-not-found':
        message = `Aucun compte trouvé avec cette adresse email`; // Fixed string
        break;
      case 'auth/wrong-password':
        message = `Mot de passe incorrect`; // Fixed string
        break;
    }
    
    throw new Error(message);
  }
};

export const sendLoginLink = async (email: string) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';
  const actionCodeSettings = {
    url: baseUrl,
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  } catch (error) {
    let message = `Une erreur est survenue lors de l'envoi du lien`; // Fixed string
    console.error('Error sending login link:', error.code);
    console.error('Error sending login link:', error.message);
    
    if (error.code === 'auth/invalid-email') {
      message = `L'adresse email n'est pas valide`; // Fixed string
    }

    throw new Error(message);
  }
};

export const completeLoginWithLink = async (email: string, link: string) => {
  try {
    const result = await signInWithEmailLink(auth, email, link);
    window.localStorage.removeItem('emailForSignIn');
    return result.user;
  } catch (error: any) {
    let message = `Une erreur est survenue lors de la connexion`; // Fixed string
    
    if (error.code === 'auth/invalid-email') {
      message = `L'adresse email n'est pas valide`; // Fixed string
    }
    
    throw new Error(message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user_data');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Course request functions
export const createCourseRequest = async (requestData: CourseRequest) => {
  try {
    const profileData: Partial<User> = {};
    
    // Check if profile data was provided
    if (requestData.parentName) {
      profileData.name = requestData.parentName;
    }
    if (requestData.parentPhone) {
      profileData.phone = requestData.parentPhone;
    }
    // Check if requestData.phoneCountry is defined before setting it
    if (requestData.parentPhoneCountry !== undefined) {
      profileData.phoneCountry = requestData.parentPhoneCountry;
    }

    // Update the user profile if needed
    if (Object.keys(profileData).length > 0) { await updateUserProfile(auth.currentUser!.uid, profileData, localStorage.getItem('user_type') || 'parent'); }

    const docRef = await addDoc(collection(db, 'requests'), {
      ...requestData,
      parentId: auth.currentUser!.uid,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating course request:', error);
    throw error;
  }
};
export const getCourseRequests = async (userId: string): Promise<CourseRequest[]> => {
  try {
    const q = query(collection(db, 'requests'), where('parentId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    })) as CourseRequest[];
  } catch (error) {
    console.error('Error getting course requests:', error);
    throw error;
  }
};

export const getTeacherRequests = async (): Promise<CourseRequest[]> => {
  try {
    // Modified query to fetch requests with status 'pending' or 'under_review'
    const q = query(
      collection(db, 'requests'),
      where('status', 'in', ['pending', 'under_review']),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const subjects = (doc.data().subjects && Array.isArray(doc.data().subjects)) ? doc.data().subjects : [];
      return {
        id: doc.id, ...doc.data(), subjects: subjects, createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      } as CourseRequest;
    });
    
  } catch (error) {
    console.error('Error getting teacher requests:', error);
    throw error;
  }
};