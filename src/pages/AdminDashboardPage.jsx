import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import OrderDetailsView from '@/components/admin/OrderDetailsView';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Star,
  Activity,
  Eye
} from 'lucide-react';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; // تأكد من المسار الصحيح لملف firebase.js

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // جلب الطلبات من Firestore
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // تحويل createdAt إلى تاريخ JS لو كان Timestamp من Firestore
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          total: typeof data.total === 'number' ? data.total : 0, // حماية total
          customerEmail: data.customerEmail || '',
          customerName: data.customerName || '',
        };
      });

      // جلب المنتجات من Firestore
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          sales: typeof data.sales === 'number' ? data.sales : 0, // حماية sales
          name: data.name || '',
        };
      });

      // حساب الإحصائيات
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalCustomers = new Set(orders.map(order => order.customerEmail)).size;

      const recentOrders = orders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      const topProducts = products
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setDashboardStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        recentOrders,
        topProducts
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setActiveTab('order-details');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setActiveTab('orders');
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="glass-effect card-hover neon-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-muted-foreground text-lg">
            إدارة شاملة للطلبات والمنتجات والعملاء
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="glass-effect p-1 h-auto">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white px-6 py-3"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                الرئيسية
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white px-6 py-3"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                الطلبات
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white px-6 py-3"
              >
                <Package className="w-4 h-4 mr-2" />
                المنتجات
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="إجمالي الإيرادات"
                  value={`$${(dashboardStats.totalRevenue ?? 0).toFixed(2)}`}
                  icon={DollarSign}
                  color="text-green-400"
                  delay={0.1}
                />
                <StatCard
                  title="إجمالي الطلبات"
                  value={dashboardStats.totalOrders}
                  icon={ShoppingCart}
                  color="text-blue-400"
                  delay={0.2}
                />
                <StatCard
                  title="إجمالي المنتجات"
                  value={dashboardStats.totalProducts}
                  icon={Package}
                  color="text-purple-400"
                  delay={0.3}
                />
                <StatCard
                  title="إجمالي العملاء"
                  value={dashboardStats.totalCustomers}
                  icon={Users}
                  color="text-orange-400"
                  delay={0.4}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="glass-effect neon-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          الطلبات الحديثة
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardStats.recentOrders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="gradient-border"
                          >
                            <div className="gradient-border-content">
                              <div className="flex items-center justify-between p-3">
                                <div>
                                  <p className="font-semibold text-white">{order.id}</p>
                                  <p className="text-sm text-gray-300">{order.customerName}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-400">
                                    ${order.total !== undefined ? order.total.toFixed(2) : '0.00'}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewOrder(order)}
                                    className="mt-1"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    عرض
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {dashboardStats.recentOrders.length === 0 && (
                          <p className="text-center text-gray-400 py-8">لا توجد طلبات حديثة</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="glass-effect neon-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          أفضل المنتجات
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardStats.topProducts.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="gradient-border"
                          >
                            <div className="gradient-border-content">
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">#{index + 1}</span>
                                  </div>
                                  <span className="font-semibold text-white">{product.name}</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-yellow-400">{product.sales || 0} مبيعات</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {dashboardStats.topProducts.length === 0 && (
                          <p className="text-center text-gray-400 py-8">لا توجد منتجات مباعة</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <OrderManagement
                onViewOrder={handleViewOrder}
                onRefresh={loadDashboardData}
              />
            </TabsContent>

            <TabsContent value="order-details">
              {selectedOrder ? (
                <>
                  <Button variant="outline" onClick={handleBackToOrders} className="mb-4">
                    العودة إلى الطلبات
                  </Button>
                  <OrderDetailsView order={selectedOrder} />
                </>
              ) : (
                <p>لم يتم اختيار طلب لعرض التفاصيل.</p>
              )}
            </TabsContent>

            <TabsContent value="products">
              <ProductManagement onRefresh={loadDashboardData} />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
