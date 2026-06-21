import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { fetchUserProfile, createUserProfile, updateUserProfile } from '../services/db';
import { sendEmailNotification } from '../services/mail';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleLikePublication: (pubId: string) => Promise<void>;
  addPurchasedPublication: (pubId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfileOfUser = async (uid: string) => {
    try {
      const uProfile = await fetchUserProfile(uid);
      if (uProfile) {
        setProfile(uProfile);
      }
    } catch (err) {
      console.error("Error refreshing profile", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Find or create profile
        try {
          let uProfile = await fetchUserProfile(firebaseUser.uid);
          if (!uProfile) {
            uProfile = await createUserProfile(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || 'Visitor Academic',
              false
            );
          }
          setProfile(uProfile);
        } catch (error) {
          console.warn("Could not retrieve or build user store:", error);
          // Fallback static profile
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Visitor Academic',
            likedPublications: [],
            purchasedPublications: [],
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Seed user profile
      const prof = await createUserProfile(userCredential.user.uid, email, name, false);
      setProfile(prof);

      // Automated registration emails
      try {
        await sendEmailNotification({
          to: email,
          type: 'welcome',
          metadata: { name }
        });

        await sendEmailNotification({
          type: 'admin_alert',
          metadata: {
            alertTitle: 'New User Registration',
            alertBody: `A new user named "${name}" (${email}) has registered on the official academic portal.`
          }
        });
      } catch (mailErr) {
        console.warn("Automated registration emails failure:", mailErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      let uProfile = await fetchUserProfile(result.user.uid);
      if (!uProfile) {
        uProfile = await createUserProfile(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || 'Scholar User',
          false
        );
      }
      setProfile(uProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await refreshProfileOfUser(user.uid);
    }
  };

  const toggleLikePublication = async (pubId: string) => {
    if (!profile) return;
    const currentLikes = profile.likedPublications || [];
    const isLiked = currentLikes.includes(pubId);
    let updatedLikes: string[];
    
    if (isLiked) {
      updatedLikes = currentLikes.filter(id => id !== pubId);
    } else {
      updatedLikes = [...currentLikes, pubId];
    }

    const updatedProfile = {
      ...profile,
      likedPublications: updatedLikes
    };

    setProfile(updatedProfile);
    await updateUserProfile(updatedProfile);
  };

  const addPurchasedPublication = async (pubId: string) => {
    if (!profile) return;
    const currentPurchased = profile.purchasedPublications || [];
    if (currentPurchased.includes(pubId)) return;

    const updatedProfile = {
      ...profile,
      purchasedPublications: [...currentPurchased, pubId]
    };

    setProfile(updatedProfile);
    await updateUserProfile(updatedProfile);
  };

  const isAdmin = !!(profile?.isAdmin || 
    user?.email === "younggist212@gmail.com" || 
    user?.email === "admin@okorie.edu.ng");

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      refreshProfile,
      toggleLikePublication,
      addPurchasedPublication
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
