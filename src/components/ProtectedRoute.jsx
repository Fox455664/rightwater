import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!adminOnly) {
      setCheckingAdmin(false);
      return;
    }

    if (!currentUser) {
      setCheckingAdmin(false);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const db = getFirestore();
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);

        if (adminDocSnap.exists()) {
          const data = adminDocSnap.data();
          setIsAdmin(data.role === 'admin');  // تأكد أن الدور admin
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('خطأ في التحقق من صلاحية الأدمن:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [adminOnly, currentUser]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
