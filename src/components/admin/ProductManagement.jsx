import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase';
import { collection, doc, getDocs, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, PackagePlus, Loader2, AlertTriangle, Search, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
  const [stockUpdate, setStockUpdate] = useState({ amount: 0, type: 'add' }); // type can be 'add' or 'set'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const productsCollectionRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching products: ", err);
      setError("حدث خطأ أثناء تحميل المنتجات.");
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleInputChange = (e, formSetter) => {
    const { name, value, type, checked } = e.target;
    formSetter(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value) }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0 || newProduct.stock < 0) {
      toast({ title: "بيانات غير كاملة", description: "يرجى ملء اسم المنتج والسعر والمخزون بشكل صحيح.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : null,
        rating: newProduct.rating ? Number(newProduct.rating) : 0,
        reviews: newProduct.reviews ? Number(newProduct.reviews) : 0,
      });
      toast({ title: "✅ تم إضافة المنتج", description: `تم إضافة "${newProduct.name}" بنجاح.`, className: "bg-green-500 text-white" });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
    } catch (err) {
      toast({ title: "❌ خطأ في الإضافة", description: err.message, variant: "destructive" });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name || currentProduct.price <= 0 || currentProduct.stock < 0) {
      toast({ title: "بيانات غير كاملة", description: "يرجى ملء اسم المنتج والسعر والمخزون بشكل صحيح.", variant: "destructive" });
      return;
    }
    try {
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, {
        ...currentProduct,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock),
        originalPrice: currentProduct.originalPrice ? Number(currentProduct.originalPrice) : null,
        rating: currentProduct.rating ? Number(currentProduct.rating) : 0,
        reviews: currentProduct.reviews ? Number(currentProduct.reviews) : 0,
      });
      toast({ title: "✅ تم تعديل المنتج", description: `تم تعديل "${currentProduct.name}" بنجاح.`, className: "bg-green-500 text-white" });
      setIsEditModalOpen(false);
      setCurrentProduct(null);
    } catch (err) {
      toast({ title: "❌ خطأ في التعديل", description: err.message, variant: "destructive" });
    }
  };
  
  const handleDeleteProduct = async (productId, productName) => {
     if (!window.confirm(`هل أنت متأكد أنك تريد حذف المنتج "${productName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        return;
    }
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({ title: "🗑️ تم حذف المنتج", description: `تم حذف "${productName}" بنجاح.`, className: "bg-red-500 text-white" });
    } catch (err) {
      toast({ title: "❌ خطأ في الحذف", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!currentProduct || stockUpdate.amount === 0 && stockUpdate.type === 'add') {
        toast({ title: "لا تغيير في المخزون", description: "الرجاء إدخال كمية لتحديث المخزون.", variant: "default" });
        return;
    }
    if (stockUpdate.amount < 0 && stockUpdate.type === 'set') {
        toast({ title: "كمية غير صالحة", description: "لا يمكن تعيين المخزون إلى قيمة سالبة.", variant: "destructive" });
        return;
    }

    try {
      const productRef = doc(db, 'products', currentProduct.id);
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(productRef);
        if (!sfDoc.exists()) {
          throw new Error("المنتج غير موجود!");
        }
        let newStock;
        if (stockUpdate.type === 'add') {
            newStock = (sfDoc.data().stock || 0) + Number(stockUpdate.amount);
        } else { // 'set'
            newStock = Number(stockUpdate.amount);
        }
        
        if (newStock < 0) newStock = 0; // Prevent negative stock

        transaction.update(productRef, { stock: newStock });
      });
      toast({ title: "📦 تم تحديث المخزون", description: `تم تحديث مخزون "${currentProduct.name}".`, className: "bg-green-500 text-white" });
      setIsStockModalOpen(false);
      setCurrentProduct(null);
      setStockUpdate({ amount: 0, type: 'add' });
    } catch (err) {
      toast({ title: "❌ خطأ في تحديث المخزون", description: err.message, variant: "destructive" });
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  const openStockModal = (product) => {
    setCurrentProduct(product);
    setStockUpdate({ amount: 0, type: 'add' });
    setIsStockModalOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل المنتجات...</p></div>;
  }
  if (error) {
    return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;
  }

  const renderProductForm = (productData, setProductData, handleSubmit, isEdit = false) => (
    <form onSubmit={handleSubmit} className="space-y-4 text-right max-h-[70vh] overflow-y-auto p-1">
        <div><Label htmlFor="name">اسم المنتج</Label><Input id="name" name="name" value={productData.name} onChange={(e) => handleInputChange(e, setProductData)} required /></div>
        <div><Label htmlFor="category">الفئة</Label><Input id="category" name="category" value={productData.category} onChange={(e) => handleInputChange(e, setProductData)} /></div>
        <div><Label htmlFor="price">السعر (ج.م)</Label><Input id="price" name="price" type="number" value={productData.price} onChange={(e) => handleInputChange(e, setProductData)} required min="0" step="0.01" /></div>
        <div><Label htmlFor="originalPrice">السعر الأصلي (ج.م) (اختياري)</Label><Input id="originalPrice" name="originalPrice" type="number" value={productData.originalPrice || ''} onChange={(e) => handleInputChange(e, setProductData)} min="0" step="0.01" /></div>
        <div><Label htmlFor="stock">المخزون</Label><Input id="stock" name="stock" type="number" value={productData.stock} onChange={(e) => handleInputChange(e, setProductData)} required min="0" /></div>
        <div><Label htmlFor="description">الوصف</Label><Textarea id="description" name="description" value={productData.description} onChange={(e) => handleInputChange(e, setProductData)} /></div>
        <div><Label htmlFor="image">رابط الصورة</Label><Input id="image" name="image" value={productData.image} onChange={(e) => handleInputChange(e, setProductData)} /></div>
        <div><Label htmlFor="rating">التقييم (0-5)</Label><Input id="rating" name="rating" type="number" value={productData.rating || ''} onChange={(e) => handleInputChange(e, setProductData)} min="0" max="5" step="0.1" /></div>
        <div><Label htmlFor="reviews">عدد المراجعات</Label><Input id="reviews" name="reviews" type="number" value={productData.reviews || ''} onChange={(e) => handleInputChange(e, setProductData)} min="0" /></div>
        <DialogFooter className="pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">{isEdit ? "حفظ التعديلات" : "إضافة المنتج"}</Button>
            <Button type="button" variant="outline" onClick={() => isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false)}>إلغاء</Button>
        </DialogFooter>
    </form>
  );


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">إدارة المنتجات</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"><PlusCircle className="ml-2 h-5 w-5" /> إضافة منتج جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg text-right">
            <DialogHeader><DialogTitle className="text-primary">إضافة منتج جديد</DialogTitle></DialogHeader>
            {renderProductForm(newProduct, setNewProduct, handleAddProduct)}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
            type="text"
            placeholder="ابحث بالاسم أو الفئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-background/70 border-primary/30 focus:border-primary"
        />
        {searchTerm && <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')}><FilterX className="h-5 w-5 text-muted-foreground"/></Button>}
      </div>

      {filteredProducts.length === 0 && !loading ? (
        <p className="text-muted-foreground text-center py-8">لا توجد منتجات تطابق بحثك أو لم يتم إضافة منتجات بعد.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
          <Table>
            <TableHeader><TableRow className="bg-muted/50">
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">السعر (ج.م)</TableHead>
              <TableHead className="text-right">المخزون</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow></TableHeader>
            <TableBody><AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.tr key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-primary">{product.name}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>{(product.price || 0).toLocaleString('ar-EG')}</TableCell>
                  <TableCell className={product.stock <= 5 ? (product.stock === 0 ? 'text-red-500 font-bold' : 'text-yellow-500 font-semibold') : ''}>
                    {product.stock || 0}
                  </TableCell>
                  <TableCell className="text-center"><div className="flex justify-center items-center space-x-1 space-x-reverse">
                    <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700" onClick={() => openStockModal(product)}><PackagePlus className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => openEditModal(product)}><Edit className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteProduct(product.id, product.name)}><Trash2 className="h-5 w-5" /></Button>
                  </div></TableCell>
                </motion.tr>
              ))}
            </AnimatePresence></TableBody>
          </Table>
        </div>
      )}

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg text-right">
          <DialogHeader><DialogTitle className="text-primary">تعديل المنتج: {currentProduct?.name}</DialogTitle></DialogHeader>
          {currentProduct && renderProductForm(currentProduct, setCurrentProduct, handleEditProduct, true)}
        </DialogContent>
      </Dialog>

      {/* Update Stock Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="sm:max-w-md text-right">
          <DialogHeader><DialogTitle className="text-primary">تحديث مخزون: {currentProduct?.name}</DialogTitle>
          <DialogDescription>المخزون الحالي: {currentProduct?.stock || 0}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4 pt-2">
            <div>
                <Label htmlFor="stockAmount">الكمية</Label>
                <Input id="stockAmount" name="amount" type="number" value={stockUpdate.amount} onChange={(e) => handleInputChange(e, setStockUpdate)} required />
            </div>
            <div>
                <Label htmlFor="updateType">نوع التحديث</Label>
                <select 
                    id="updateType" 
                    name="type" 
                    value={stockUpdate.type} 
                    onChange={(e) => handleInputChange(e, setStockUpdate)}
                    className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <option value="add">إضافة إلى المخزون</option>
                    <option value="set">تعيين قيمة المخزون</option>
                </select>
                {stockUpdate.type === 'add' && stockUpdate.amount < 0 && <p className="text-xs text-yellow-600 mt-1">سيتم خصم هذه الكمية من المخزون.</p>}
            </div>
            <DialogFooter className="pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">تحديث المخزون</Button>
                <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default ProductManagement;
