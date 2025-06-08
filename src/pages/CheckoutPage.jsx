// CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart(); 

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', paymentMethod: 'cod'
  });

  useEffect(() => {
    setIsLoadingData(true);
    const source = location.state;

    if (source?.cartItems?.length && typeof source.total === 'number' && source.fromCart) {
      setCartItems(source.cartItems);
      setTotal(source.total);
    } else {
      toast({
        title: "سلة التسوق فارغة",
        description: "لم يتم العثور على منتجات في السلة. يتم توجيهك لصفحة المنتجات.",
        duration: 3000,
      });
      setTimeout(() => navigate('/products'), 1500);
    }
    setIsLoadingData(false);
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات أولاً.",
        variant: "destructive",
      });
      return navigate('/products');
    }

    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast({
          title: "يجب تسجيل الدخول",
          description: "يرجى تسجيل الدخول لإتمام الطلب.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return navigate('/login'); // عدل حسب مسار صفحة تسجيل الدخول عندك
      }

      const orderData = {
        userId: currentUser.uid,  // معرف المستخدم مضاف هنا
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: 'Egypt'
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || null
        })),
        totalAmount: total,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // تحديث المخزون
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock;
          const newStock = Math.max(0, currentStock - item.quantity);
          await updateDoc(productRef, { stock: newStock });
        }
      }

      // تحضير تفاصيل الطلب للإيميل
      const orderItemsHtml = cartItems.map(item => `
        <tr>
          <td style="padding:8px; border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:right;">
            ${item.price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
          </td>
        </tr>
      `).join('');

      const baseEmailParams = {
        to_name: `${formData.firstName} ${formData.lastName}`,
        to_email: formData.email,
        order_id: docRef.id,
        order_total: total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_address: `${formData.address}, ${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}, مصر`,
        order_items_html: orderItemsHtml,
        customer_phone: formData.phone,
        payment_method: formData.paymentMethod === 'cod' ? "الدفع عند الاستلام" : formData.paymentMethod,
      };

      // إيميل العميل
      const clientEmailParams = {
        ...baseEmailParams,
        from_name: "متجر Right Water",
        support_email: "rightwater156@gmail.com",
      };

      // إيميل التاجر
      const merchantEmailParams = {
        ...baseEmailParams,
        to_email: "rightwater156@gmail.com",
        client_email: formData.email,
        from_name: "Right Water - إشعار طلب جديد",
        reply_to: formData.email,
      };

      try {
        await emailjs.send('service_0p2k5ih', 'template_bu792mf', clientEmailParams, 'xpSKf6d4h11LzEOLz');
        await emailjs.send('service_0p2k5ih', 'template_tboeo2t', merchantEmailParams, 'xpSKf6d4h11LzEOLz');
        clearCart();
      } catch (emailError) {
        console.error("حدث خطأ أثناء إرسال البريد الإلكتروني:", emailError);
      }

      toast({
        title: "🎉 تم إرسال طلبك بنجاح!",
        description: `شكراً لك ${formData.firstName}. رقم طلبك هو: ${docRef.id}`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });

      navigate('/order-success', {
        state: {
          orderId: docRef.id,
          customerName: formData.firstName,
          totalAmount: total
        }
      });

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إتمام طلبك. يرجى المحاولة لاحقاً.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تجهيز صفحة الدفع...</p>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">سلة التسوق فارغة</h2>
        <p className="text-muted-foreground mb-6">يرجى إضافة منتجات قبل متابعة الدفع.</p>
        <Button onClick={() => navigate('/products')} className="bg-primary text-white">
          <ArrowRight className="ml-2" /> العودة للمنتجات
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-8 text-primary"
      >
        إتمام عملية الدفع
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6 bg-card p-6 rounded-xl shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="lastName">الاسم الأخير</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">العنوان</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="postalCode">الرمز البريدي</Label>
              <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">طريقة الدفع</Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <Input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
              الدفع عند الاستلام
            </Label>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب"}
          </Button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="sticky top-24"
        >
                 <Card className="p-6 shadow-xl rounded-xl bg-card">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold text-primary">
              ملخص الطلب
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div className="text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">الكمية: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  {(item.price * item.quantity).toLocaleString("ar-EG", {
                    style: "currency",
                    currency: "EGP",
                  })}
                </p>
              </div>
            ))}

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg text-primary">
              <span>الإجمالي</span>
              <span>
                {total.toLocaleString("ar-EG", {
                  style: "currency",
                  currency: "EGP",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
