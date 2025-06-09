"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  db,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "@/firebase";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import {
  Eye,
  PackageCheck,
  PackageX,
  Truck,
  Loader2,
  AlertTriangle,
  ListOrdered as ListOrderedIcon,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const statusOptions = [
  {
    value: "pending",
    label: "قيد الانتظار",
    icon: <Loader2 className="h-4 w-4 text-yellow-500" />,
  },
  {
    value: "processing",
    label: "قيد المعالجة",
    icon: <Truck className="h-4 w-4 text-blue-500" />,
  },
  {
    value: "shipped",
    label: "تم الشحن",
    icon: <Truck className="h-4 w-4 text-sky-500" />,
  },
  {
    value: "delivered",
    label: "تم التسليم",
    icon: <PackageCheck className="h-4 w-4 text-green-500" />,
  },
  {
    value: "cancelled",
    label: "ملغي",
    icon: <PackageX className="h-4 w-4 text-red-500" />,
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "shipped":
      return "bg-sky-100 text-sky-700 border-sky-300";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(),
        }));
        setOrders(fetchedOrders);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching orders: ", err);
        setError("حدث خطأ أثناء تحميل الطلبات من قاعدة البيانات.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({
        title: "✅ تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب إلى ${
          statusOptions.find((s) => s.value === newStatus)?.label || newStatus
        }.`,
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      toast({
        title: "❌ خطأ في تحديث الحالة",
        description: err.message,
        variant: "destructive",
      });
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
      await deleteDoc(doc(db, "orders", orderToDelete.id));
      toast({
        title: "🗑️ تم حذف الطلب",
        description: `تم حذف الطلب رقم ${orderToDelete.id} بنجاح.`,
        className: "bg-red-600 text-white",
      });
      setOrderToDelete(null);
      setIsDeleteAlertOpen(false);
    } catch (err) {
      toast({
        title: "❌ خطأ في حذف الطلب",
        description: err.message,
        variant: "destructive",
      });
      setOrderToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let results = [...orders];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.trim().toLowerCase();
      results = results.filter((order) => {
        const idMatch = order.id.toLowerCase().includes(lowerSearch);
        const nameMatch = order.customerInfo?.name
          ?.toLowerCase()
          .includes(lowerSearch);
        return idMatch || nameMatch;
      });
    }
    if (statusFilter !== "all") {
      results = results.filter((order) => order.status === statusFilter);
    }
    return results;
  }, [searchTerm, statusFilter, orders]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-primary flex items-center">
        <ListOrderedIcon className="ml-2 h-6 w-6" />
        عرض وإدارة الطلبات
      </h2>

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="ابحث برقم الطلب أو اسم العميل..."
          className="w-full md:w-96 p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="rtl"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">
            جاري تحميل الطلبات...
          </p>
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          لا توجد طلبات تطابق البحث أو الفلتر.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجمالي (ج.م)</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-primary truncate max-w-[100px]">
                    {order.id}
                  </TableCell>
                  <TableCell>{order.customerInfo?.name || "غير متوفر"}</TableCell>
                  <TableCell>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("ar-EG")
                      : "غير متوفر"}
                  </TableCell>
                  <TableCell>
                    {(order.totalAmount || 0).toLocaleString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(order.id, newStatus)
                      }
                    >
                      <SelectTrigger
                        className={`w-[150px] text-xs h-9 ${getStatusStyles(
                          order.status
                        )}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      title="عرض الطلب"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDeleteOrder(order)}
                      title="حذف الطلب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DialogContent className="max-w-4xl rounded-xl">
  <DialogHeader>
    <DialogTitle className="text-2xl">👁️ عرض تفاصيل الطلب</DialogTitle>
  </DialogHeader>

  {selectedOrder && (
    <div id="printable-order" className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* بيانات العميل */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">📋 معلومات العميل</h2>
          <p>🧍‍♂️ <strong>الاسم:</strong> {selectedOrder.name}</p>
          <p>📍 <strong>العنوان:</strong> {selectedOrder.address}</p>
          <p>💳 <strong>طريقة الدفع:</strong> {selectedOrder.paymentMethod}</p>
          <p>📅 <strong>تاريخ الطلب:</strong>{" "}
            {new Date(selectedOrder.timestamp?.seconds * 1000).toLocaleDateString("ar-EG")}
          </p>
          <p>💰 <strong>المجموع:</strong>{" "}
            {selectedOrder.totalAmount?.toLocaleString("ar-EG")} ج.م
          </p>
        </div>

        {/* تفاصيل المنتجات */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">📦 المنتجات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedOrder.cart?.map((item, index) => (
              <div
                key={index}
                className="border p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition flex flex-col items-center text-center"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-24 object-contain mb-2 rounded"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <p className="font-medium">{item.title}</p>
                <p><strong>الكمية:</strong> {item.quantity}</p>
                <p><strong>السعر:</strong> {(item.price || 0).toLocaleString("ar-EG")} ج.م</p>
                <p><strong>الإجمالي:</strong> {(item.quantity * item.price || 0).toLocaleString("ar-EG")} ج.م</p>
              </div>
            ))}
          </div>

          {/* مجموع الطلب الكلي */}
          <div className="mt-4 text-lg font-semibold text-right border-t pt-3">
            المجموع الكلي للطلب:{" "}
            {(selectedOrder.cart?.reduce(
              (sum, item) => sum + (item.quantity * item.price || 0),
              0
            )).toLocaleString("ar-EG")} ج.م
          </div>
        </div>
      </div>
    </div>
  )}

  {/* زر الطباعة */}
  <div className="flex justify-end mt-6">
    <Button
      variant="secondary"
      onClick={() => {
        const printContents = document.getElementById('printable-order')?.innerHTML;
        if (!printContents) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html dir="rtl" lang="ar">
            <head>
              <title>طباعة تفاصيل الطلب</title>
              <style>
                body { font-family: sans-serif; padding: 20px; direction: rtl; }
                h1 { font-size: 24px; margin-bottom: 10px; color: #1f2937; }
                h4 { margin: 8px 0; color: #333; }
                ul { list-style: none; padding: 0; }
                li { border: 1px solid #ddd; margin-bottom: 10px; padding: 8px; border-radius: 5px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                .logo { max-height: 60px; margin-bottom: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="https://envs.sh/XgU.jpg" alt="شعار المتجر" class="logo" onerror="this.style.display='none'" />
                <h1>Right Water Store </h1>
              </div>
              ${printContents}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }}
    >
      const OrderDetailsView = () => {
  return (
    <motion.div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <div>
            {/* محتوى حوار الطلب */}
            <Button>🖨️ طباعة</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* تنبيه تأكيد الحذف */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الطلب نهائيًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteOrder}>
              نعم، احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default OrderDetailsView;
