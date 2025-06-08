import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import ProductsPage from '@/pages/ProductsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import CartPage from '@/pages/CartPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UserProfilePage from '@/pages/UserProfilePage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';

import AdminDashboardPage from '@/pages/AdminDashboardPage';
import OrderManagement from '@/components/admin/OrderManagement';
import OrderDetailsView from '@/components/admin/OrderDetailsView';
import ProductManagement from '@/components/admin/ProductManagement';
import AdminSettings from '@/components/admin/AdminSettings'; // صفحة اختيارية

import { Outlet } from 'react-router-dom';

const ProductDetailsPage = () => (

  <div className="text-center p-10">  
    <h1 className="text-3xl">تفاصيل المنتج (قيد الإنشاء)</h1>  
    <img   
      alt="فلتر مياه متطور"   
      className="mx-auto mt-4 rounded-lg shadow-md w-1/2"   
      src="https://images.unsplash.com/photo-1660053094665-a21094758e8b"   
    />  
  </div>  
);  function App() {
return (
<AuthProvider>
<CartProvider>
<Router>
<Routes>
<Route path="/" element={<Layout />}>
<Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
<Route path="products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
<Route path="products/:productId" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
<Route path="cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
<Route
path="checkout"
element={
<ProtectedRoute>
<CheckoutPage />
</ProtectedRoute>
}
/>
<Route
path="order-success"
element={
<ProtectedRoute>
<OrderSuccessPage />
</ProtectedRoute>
}
/>
<Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
<Route path="signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
<Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
<Route
path="profile"
element={
<ProtectedRoute>
<UserProfilePage />
</ProtectedRoute>
}
/>
<Route path="about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
<Route path="contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />

{/* لوحة تحكم المسؤول مع المسارات الفرعية داخل AdminDashboardPage */}  
          <Route   
            path="AdminDashboard"   
            element={  
              <ProtectedRoute adminOnly={true}>  
                <AdminDashboardPage />  
              </ProtectedRoute>  
            }  
          >  
            <Route index element={<OrderManagement />} />  
            <Route path="orders" element={<OrderManagement />} />  
            <Route path="orders/:orderId" element={<OrderDetailsView />} />  
            <Route path="products" element={<ProductManagement />} />  
            <Route path="settings" element={<AdminSettings />} />  
          </Route>  

          <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />  
        </Route>  
      </Routes>  
      <Toaster />  
    </Router>  
  </CartProvider>  
</AuthProvider>

);
}

const AnimatedPage = ({ children }) => (
<motion.div
initial={{ opacity: 0, x: -50 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 50 }}
transition={{ duration: 0.3, ease: "easeInOut" }}

> 

{children}

</motion.div>
);

const NotFoundPage = () => (

  <div className="text-center py-20">  
    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>  
    <p className="text-2xl text-foreground mb-8">عفواً، الصفحة التي تبحث عنها غير موجودة.</p>  
    <img   
      alt="رجل فضاء تائه يبحث عن شيء"   
      className="mx-auto w-1/3 mb-8"   
      src="https://images.unsplash.com/photo-1695088560164-84c9c42bbadd"   
    />  
    <Link to="/">  
      <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">  
        العودة إلى الصفحة الرئيسية  
      </Button>  
    </Link>  
  </div>  
);  export default App;



