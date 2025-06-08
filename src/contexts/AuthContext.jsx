import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  updateEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null); // بيانات إضافية من Firestore
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setCurrentUserData(userDoc.exists() ? userDoc.data() : null);
        } catch (error) {
          console.error("خطأ في جلب بيانات المستخدم:", error);
          setCurrentUserData(null);
        }
      } else {
        setCurrentUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const sendPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserPassword = (newPassword) => {
    if (!currentUser) {
      return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    }
    return firebaseUpdatePassword(currentUser, newPassword);
  };

  const reauthenticateUser = (currentPassword) => {
    if (!currentUser) {
      return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    return reauthenticateWithCredential(currentUser, credential);
  };

  // تحديث بيانات الملف الشخصي (مثل displayName ورقم الهاتف في Firestore)
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    }
    try {
      if (updates.displayName) {
        await updateProfile(currentUser, { displayName: updates.displayName });
      }
      if (updates.phone) {
        await setDoc(doc(db, "users", currentUser.uid), { phone: updates.phone }, { merge: true });
        setCurrentUserData(prev => ({ ...prev, phone: updates.phone }));
      }
      setCurrentUser({ ...auth.currentUser });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // تحديث البريد الإلكتروني مع إعادة المصادقة
  const updateUserEmail = async (newEmail, currentPassword) => {
    if (!currentUser) {
      return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    }
    try {
      await reauthenticateUser(currentPassword);
      await updateEmail(currentUser, newEmail);
      setCurrentUser({ ...auth.currentUser });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // تسجيل الدخول عبر Google OAuth
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const value = {
    currentUser,
    currentUserData,
    loading,
    signOut,
    sendPasswordReset,
    updateUserPassword,
    reauthenticateUser,
    updateUserProfile,
    updateUserEmail,
    signInWithGoogle,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
