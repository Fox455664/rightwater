import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("خطأ في التحقق من الصلاحيات:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
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

  // دالة تحديث بيانات الملف الشخصي (مثل displayName)
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    }
    try {
      await updateProfile(currentUser, updates);
      // تحديث حالة المستخدم الحالية بعد التعديل
      setCurrentUser({ ...auth.currentUser });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    signOut,
    sendPasswordReset,
    updateUserPassword,
    reauthenticateUser,
    updateUserProfile,  // أضفنا الدالة هنا
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
