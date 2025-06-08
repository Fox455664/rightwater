"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  db,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy
} from '@/firebase';

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog.jsx";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Eye, PackageCheck, PackageX, Truck,
  Loader2, AlertTriangle, ListOrdered as ListOrderedIcon, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const statusOptions = [
  { value: 'pending', label: 'قيد الانتظار', icon: <Loader2 className="h-4 w-4 text-yellow-500" /> },
  { value: 'processing', label: 'قيد المعالجة', icon: <Truck className="h-4 w-4 text-blue-500" /> },
  { value: 'shipped', label: 'تم الشحن', icon: <Truck className="h-4 w-4 text-sky-500" /> },
  { value: 'delivered', label: 'تم التسليم', icon: <PackageCheck className="h-4 w-4 text-green-500" /> },
  { value: 'cancelled', label: 'ملغي', icon: <PackageX className="h-4 w-4 text-red-500" /> },
];

const getStatusStyles = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'shipped': return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const OrderDetailsView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
      setOrders(fetchedOrders);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching orders: ", err);
      setError("حدث خطأ أثناء تحميل الطلبات من قاعدة البيانات.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({
        title: "✅ تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب إلى ${statusOptions.find(s => s.value === newStatus)?.label || newStatus}.`,
        className: "bg-green-500 text-white"
      });
    } catch (err) {
      toast({ title: "❌ خطأ في تحديث الحالة", description: err.message, variant: "destructive" });
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleteAlertOpen(true);
  };

  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteDoc(doc(db, 'orders', orderToDelete.id));
      toast({
        title: "🗑️ تم حذف الطلب",
        description: `تم حذف الطلب رقم ${orderToDelete.id} بنجاح.`,
        className: "bg-red-600 text-white"
      });
      setOrderToDelete(null);
      setIsDeleteAlertOpen(false);
    } catch (err) {
      toast({ title: "❌ خطأ في حذف الطلب", description: err.message, variant: "destructive" });
      setOrderToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;

    const lowerSearch = searchTerm.trim().toLowerCase();
    return orders.filter(order => {
      const idMatch = order.id.toLowerCase().includes(lowerSearch);
      const nameMatch = order.customerInfo?.name?.toLowerCase().includes(lowerSearch);
      return idMatch || nameMatch;
    });
  }, [searchTerm, orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  if (error) {
  return (
    <div className="p-10 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-lg text-destructive">{error}</p>
    </div>
  );
}

return (
  <div>
    {/* ✅ الكود الخاص بالجدول والنوافذ المنبثقة موجود لديك مسبقاً وكامل ولا يحتاج تعديل */}
    {/* يمكنك استدعاء المكونات أو JSX الخاص بعرض الطلبات هنا */}
  </div>
);
}; // ← هذا القوس هو المهم

export default OrderDetailsView;
