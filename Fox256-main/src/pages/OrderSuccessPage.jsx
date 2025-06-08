import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Home, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccessPage = () => {
  const location = useLocation();
  
  if (!location.state || !location.state.orderId) {
    // If no orderId is present in state, redirect to home. 
    // This prevents users from accessing this page directly without placing an order.
    return <Navigate to="/" replace />;
  }

  const { orderId, customerName, totalAmount } = location.state;

  return (
    <div className="container mx-auto px-4 py-16 md:py-20 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="p-8 md:p-16 bg-card/80 rounded-xl shadow-2xl glassmorphism-card max-w-2xl w-full"
      >
        <CheckCircle className="mx-auto h-20 w-20 md:h-24 md:w-24 text-green-500 mb-8 animate-pulse" />
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
          شكراً لك، {customerName || 'عميلنا العزيز'}!
        </h1>
        <p className="text-lg md:text-xl text-foreground mb-4">
          تم استلام طلبك بنجاح وجاري تجهيزه.
        </p>
        <div className="bg-primary/10 p-4 rounded-lg mb-8 border border-primary/20">
          <p className="text-md md:text-lg text-muted-foreground">
            رقم طلبك هو: <strong className="text-primary font-mono text-lg md:text-xl">{orderId}</strong>
          </p>
          {typeof totalAmount === 'number' && (
            <p className="text-md md:text-lg text-muted-foreground mt-1">
              المبلغ الإجمالي: <strong className="text-primary font-semibold">{totalAmount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</strong>
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          ستتلقى بريدًا إلكترونيًا قريبًا يحتوي على تفاصيل طلبك وتأكيد الشحن.
          <br/>
          إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/products">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-3">
              <ShoppingBag className="ml-2 h-5 w-5" /> متابعة التسوق
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-primary border-primary hover:bg-primary/10 text-lg py-3">
              <Home className="ml-2 h-5 w-5" /> العودة للرئيسية
            </Button>
          </Link>
        </div>
         <img 
            alt="رسم توضيحي لصندوق شحن محاط بعلامات صح ونجوم صغيرة للدلالة على نجاح الطلب"
            className="mx-auto mt-10 rounded-lg shadow-md w-full max-w-xs opacity-80"
             src="https://images.unsplash.com/photo-1638423045244-36bd798e8700" />
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;