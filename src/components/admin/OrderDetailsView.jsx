import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Package, 
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/firebase'; // عدل المسار حسب مشروعك

const OrderDetailsView = ({ order, onBack }) => {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const statusOptions = [
    { value: 'pending', label: 'في الانتظار' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' }
  ];

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: <Clock className="w-5 h-5" />,
      processing: <Package className="w-5 h-5" />,
      completed: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />
    };
    return iconMap[status];
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return colorMap[status];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // دالة تحديث الحالة في Firestore
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("فشل تحديث حالة الطلب:", error);
      alert("حدث خطأ أثناء تحديث الحالة.");
      setStatus(order.status); // ارجع للحالة القديمة عند الخطأ
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="neon-glow">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة للطلبات
        </Button>
        <div className="text-right">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            تفاصيل الطلب {order.id}
          </h1>
          <p className="text-muted-foreground">
            تم الإنشاء في {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات الطلب الأساسية */}
        <div className="lg:col-span-2 space-y-6">
          {/* حالة الطلب مع قائمة اختيار لتحديث الحالة */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-effect neon-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  {getStatusIcon(status)}
                  <span>حالة الطلب</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(status)} text-white text-lg px-4 py-2`}>
                    {statusOptions.find(s => s.value === status)?.label}
                  </Badge>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">إجمالي الطلب</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block mb-1 font-semibold text-white">تغيير حالة الطلب:</label>
                  <select
                    disabled={loading}
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* تفاصيل المنتجات */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Package className="w-5 h-5" />
                  <span>المنتجات المطلوبة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="gradient-border"
                    >
                      <div className="gradient-border-content">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                              <p className="text-sm text-gray-300">الكمية: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-400">للقطعة الواحدة</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">الإجمالي:</span>
                    <span className="text-2xl font-bold text-green-400">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* معلومات العميل والشحن */}
        <div className="space-y-6">
          {/* معلومات العميل */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-effect neon-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <User className="w-5 h-5" />
                  <span>معلومات العميل</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <p className="text-sm text-gray-400">اسم العميل</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{order.customerEmail}</p>
                    <p className="text-sm text-gray-400">البريد الإلكتروني</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* معلومات الشحن */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-effect neon-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Truck className="w-5 h-5" />
                  <span>معلومات الشحن</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{order.shippingAddress}</p>
                    <p className="text-sm text-gray-400">عنوان الشحن</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* تفاصيل إضافية */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-effect neon-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-5 h-5" />
                  <span>تفاصيل إضافية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-white">
                <p><strong>رقم الهاتف:</strong> {order.customerPhone}</p>
                <p><strong>ملاحظات:</strong> {order.notes || 'لا توجد ملاحظات'}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetailsView;
