// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db, collection, addDoc, Timestamp, doc, writeBatch, increment } from '@/firebase';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
// 🔥 1. استيراد المكون الجديد وقائمة الدول 🔥
import { Combobox } from '@/components/ui/combobox';
import { countries } from '@/lib/countries'; // سننشئ هذا الملف

// دالة التحقق المعدلة
const validateForm = (formData) => {
  const errors = {};
  if (!/^[a-zA-Z\u0600-\u06FF\s-']+$/.test(formData.firstName.trim())) errors.firstName = "الاسم الأول يجب أن يحتوي على حروف فقط.";
  if (!/^[a-zA-Z\u0600-\u06FF\s-']+$/.test(formData.lastName.trim())) errors.lastName = "الاسم الأخير يجب أن يحتوي على حروف فقط.";
  if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) errors.phone = "صيغة رقم الهاتف غير صحيحة.";
  if (formData.address.trim().length < 10) errors.address = "العنوان يجب ألا يقل عن 10 أحرف.";
  if (formData.city.trim().length < 2) errors.city = "اسم المدينة يجب ألا يقل عن حرفين.";
  if (formData.country.trim().length < 2) errors.country = "يرجى اختيار دولة.";
  // جعل الرمز البريدي اختياريًا ولكن إذا تم إدخاله، يتم التحقق منه
  if (formData.postalCode && !/^[a-zA-Z0-9\s-]{3,10}$/.test(formData.postalCode)) {
      errors.postalCode = "الرمز البريدي غير صالح.";
  }
  return errors;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { cartItems, cartTotal, clearCart } = useCart(); // تم جلب cartItems من هنا
  const { currentUser } = useAuth();
  
  const [cartData, setCartData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', country: 'EG', // الدولة الافتراضية مصر
    postalCode: '', paymentMethod: 'cod'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // ... الكود كما هو لجلب بيانات السلة وملء بيانات المستخدم
  }, [location.state, navigate, toast, currentUser]);

  const shippingCost = cartTotal > 0 ? 50 : 0; 
  const totalAmount = cartTotal + shippingCost;
  
  const handleChange = (e) => {
    // ... الكود كما هو
  };

  const handleCountryChange = (value) => {
    setFormData(prev => ({ ...prev, country: value }));
    if (formErrors.country) {
      setFormErrors(prev => ({ ...prev, country: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) return;

    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({ title: "بيانات غير مكتملة", description: "يرجى مراجعة الحقول.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderData = {
        userId: currentUser ? currentUser.uid : null,
        shipping: {
            fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`, 
            phone: formData.phone, 
            address: formData.address, 
            city: formData.city, 
            country: countries.find(c => c.value === formData.country)?.label || formData.country, // حفظ اسم الدولة الكامل
            postalCode: formData.postalCode,
        },
        userEmail: formData.email,
        items: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, imageUrl: item.image || null })),
        subtotal: cartTotal,
        shippingCost: shippingCost,
        total: totalAmount,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, { stock: increment(-item.quantity) });
      });
      await batch.commit();

      // ... (الكود الخاص بإرسال الإيميلات هنا كما هو) ...
      
      clearCart();
      toast({ title: "🎉 تم إرسال طلبك بنجاح!", description: `رقم طلبك هو: ${docRef.id}`, className: "bg-green-500 text-white", duration: 7000 });
      navigate(`/order-success/${docRef.id}`, { state: { orderData: { id: docRef.id, ...orderData } } });

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ title: "حدث خطأ", description: "لم نتمكن من إتمام طلبك. يرجى المحاولة لاحقاً.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartItems) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري التحقق من السلة...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 /* ... */>إتمام عملية الدفع</motion.h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.form onSubmit={handleSubmit} /* ... */ className="lg:col-span-2 space-y-6 bg-card p-6 rounded-xl shadow-xl">
           <div className="grid md:grid-cols-2 gap-4">
            {/* ... حقول الاسم والإيميل والهاتف والعنوان كما هي ... */}
            <div>
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} required className={formErrors.city ? 'border-destructive' : ''} />
                {formErrors.city && <p className="text-destructive text-xs mt-1">{formErrors.city}</p>}
            </div>
            {/* 🔥 2. استبدال Select بـ Combobox 🔥 */}
            <div>
              <Label htmlFor="country">الدولة</Label>
              <Combobox
                options={countries}
                value={formData.country}
                onSelect={handleCountryChange}
                placeholder="اختر الدولة..."
                searchPlaceholder="ابحث عن دولة..."
                emptyPlaceholder="لم يتم العثور على الدولة."
                triggerClassName={formErrors.country ? 'border-destructive' : ''}
              />
              {formErrors.country && <p className="text-destructive text-xs mt-1">{formErrors.country}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="postalCode">الرمز البريدي (اختياري)</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className={formErrors.postalCode ? 'border-destructive' : ''} />
                {formErrors.postalCode && <p className="text-destructive text-xs mt-1">{formErrors.postalCode}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب"}
          </Button>
        </motion.form>
        <motion.div /* ... */>
          {/* ... ملخص الطلب كما هو ... */}
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
