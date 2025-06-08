import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '@/firebase'; // عدل حسب مسار ملف firebase.js
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';

const PAGE_SIZE = 5;

const i18n = {
  ar: {
    totalOrders: 'إجمالي الطلبات',
    totalRevenue: 'إجمالي الإيرادات',
    pendingOrders: 'طلبات في الانتظار',
    completedOrders: 'طلبات مكتملة',
    searchPlaceholder: 'البحث في الطلبات...',
    all: 'الكل',
    pending: 'في الانتظار',
    processing: 'قيد المعالجة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    updateStatusSuccess: (id, status) => `تم تغيير حالة الطلب ${id} إلى ${status}`,
    deleteOrderSuccess: (id) => `تم حذف الطلب ${id} بنجاح`,
    confirmDeleteTitle: 'تأكيد الحذف',
    confirmDeleteDesc: 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    noOrdersFound: 'لا توجد طلبات مطابقة للبحث',
    viewOrder: 'عرض الطلب',
    updateStatusProcessing: 'معالجة',
    updateStatusCompleted: 'إكمال',
    updateStatusCancel: 'إلغاء',
    nextPage: 'التالي',
    prevPage: 'السابق',
    statusPending: 'في الانتظار',
    statusProcessing: 'قيد المعالجة',
    statusCompleted: 'مكتمل',
    statusCancelled: 'ملغي',
  },
  en: {
    // ممكن تضيف ترجمة إنجليزية هنا لو حبيت
  }
};

const OrderManagement = ({ onViewOrder, lang = 'ar' }) => {
  const t = i18n[lang];
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // عرض تفاصيل الطلب
  const [paginationCursor, setPaginationCursor] = useState(null);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [page, setPage] = useState(1);

  const { toast } = useToast();

  // تحميل الطلبات من Firestore مع Pagination
  const loadOrders = async (cursor = null) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );
      if (cursor) {
        q = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          startAfter(cursor),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
        setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setOrders([]);
        setFilteredOrders([]);
        setLastVisibleDoc(null);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'حدث خطأ أثناء تحميل الطلبات',
        description: error.message
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter]);

  // فلترة الطلبات محلياً بعد جلبها
  const applyFilters = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  // تحديث حالة الطلب في Firestore
  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      // تحديث محلي
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      toast({
        title: "تم تحديث حالة الطلب",
        description: t.updateStatusSuccess(orderId, t[`status${capitalize(newStatus)}`]),
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء تحديث الحالة',
        description: error.message
      });
    }
    setLoading(false);
  };

  // حذف الطلب مع تأكيد
  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const deleteOrder = async () => {
    if (!orderToDelete) return;
    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', orderToDelete.id);
      await deleteDoc(orderRef);

      const updatedOrders = orders.filter(order => order.id !== orderToDelete.id);
      setOrders(updatedOrders);
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);

      toast({
        title: "تم حذف الطلب",
        description: t.deleteOrderSuccess(orderToDelete.id),
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء حذف الطلب',
        description: error.message
      });
    }
    setLoading(false);
  };

  // عرض الأيقونات والألوان للحالة
  const getStatusText = (status) => {
    return t[`status${capitalize(status)}`] || status;
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: <Clock className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
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

  // حساب الإحصائيات
  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;

    return { totalOrders, totalRevenue, pendingOrders, completedOrders };
  };

  const stats = calculateStats();

  // مساعدة لتحويل الحروف الأولى لكابيتال
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // تغيير الصفحة التالية مع تحميل بيانات جديدة
  const handleNextPage = () => {
    if (!lastVisibleDoc) return;
    setPage(page + 1);
    loadOrders(lastVisibleDoc);
  };

  // لتبسيط الكود للصفحة السابقة، ممكن تضيف تخزين الـ cursors للصفحات السابقة، لكن الآن نعيد تحميل الصفحة الأولى فقط:
  const handlePrevPage = () => {
    if (page === 1) return;
    setPage(page - 1);
    loadOrders(); // تحميل أول صفحة
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect card-hover neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.totalOrders}</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect card-hover neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.totalRevenue}</p>
                  <p className="text-2xl font-bold text-green-400">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect card-hover neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.pendingOrders}</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect card-hover neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.completedOrders}</p>
                  <p className="text-2xl font-bold text-green-500">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* فلترة وبحث */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow"
          disabled={loading}
          icon={<Search className="w-5 h-5 text-gray-400" />}
        />
        <select
          className="border rounded p-2"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          disabled={loading}
          aria-label="Filter orders by status"
        >
          <option value="all">{t.all}</option>
          <option value="pending">{t.pending}</option>
          <option value="processing">{t.processing}</option>
          <option value="completed">{t.completed}</option>
          <option value="cancelled">{t.cancelled}</option>
        </select>
      </div>

      {/* جدول الطلبات */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300">رقم الطلب</th>
              <th className="p-3 border border-gray-300">العميل</th>
              <th className="p-3 border border-gray-300">البريد الإلكتروني</th>
              <th className="p-3 border border-gray-300">الإجمالي</th>
              <th className="p-3 border border-gray-300">الحالة</th>
              <th className="p-3 border border-gray-300">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  {t.noOrdersFound}
                </td>
              </tr>
            )}

            <AnimatePresence>
              {filteredOrders.map(order => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <td className="p-3 border border-gray-300">{order.id}</td>
                  <td className="p-3 border border-gray-300">{order.customerName}</td>
                  <td className="p-3 border border-gray-300">{order.customerEmail}</td>
                  <td className="p-3 border border-gray-300">${order.total.toFixed(2)}</td>
                  <td className="p-3 border border-gray-300">
                    <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </Badge>
                  </td>
                  <td className="p-3 border border-gray-300 space-x-2 rtl:space-x-reverse">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} disabled={loading}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={loading}
                        title={t.updateStatusProcessing}
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={loading}
                        title={t.updateStatusCompleted}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={loading}
                        title={t.updateStatusCancel}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirmDeleteOrder(order)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* أزرار التنقل بين الصفحات */}
      <div className="flex justify-between mt-4">
        <Button onClick={handlePrevPage} disabled={page === 1 || loading}>
          {t.prevPage}
        </Button>
        <div className="text-gray-700">
          صفحة {page}
        </div>
        <Button onClick={handleNextPage} disabled={!lastVisibleDoc || loading}>
          {t.nextPage}
        </Button>
      </div>

      {/* حوار تفاصيل الطلب */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.viewOrder} #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <p><strong>اسم العميل:</strong> {selectedOrder.customerName}</p>
              <p><strong>البريد الإلكتروني:</strong> {selectedOrder.customerEmail}</p>
              <p><strong>الهاتف:</strong> {selectedOrder.customerPhone}</p>
              <p><strong>العنوان:</strong> {selectedOrder.customerAddress}</p>
              <p><strong>حالة الطلب:</strong> {getStatusText(selectedOrder.status)}</p>
              <p><strong>إجمالي الطلب:</strong> ${selectedOrder.total.toFixed(2)}</p>
              <div>
                <strong>المنتجات:</strong>
                <ul className="list-disc list-inside">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - الكمية: {item.quantity} - السعر: ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <Button onClick={() => setSelectedOrder(null)}>إغلاق</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* حوار تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDeleteTitle}</DialogTitle>
            <p>{t.confirmDeleteDesc}</p>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={deleteOrder} disabled={loading}>
              {t.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
