import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Tag, AlertTriangle, Frown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard'; // تأكد إن هذا المكون موجود
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase.js'; // عدّل هذا المسار حسب مكان ملف firebaseConfig.js عندك

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allCategories = React.useMemo(() => {
    if (products.length === 0) return [];
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsCol = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCol);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (productsList.length === 0) {
          setError("لا توجد منتجات متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً.");
        }
        setProducts(productsList);
      } catch (err) {
        setError("حدث خطأ أثناء جلب المنتجات.");
        console.error("Firestore fetch error:", err);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let tempProducts = [...products];

    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    tempProducts = tempProducts.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    setFilteredProducts(tempProducts);
  }, [searchTerm, priceRange, selectedCategories, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-foreground">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          منتجاتنا
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          اكتشف مجموعتنا الواسعة من حلول معالجة المياه وأنظمة الشرب الصحية المصممة لتلبية احتياجاتك.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <motion.aside 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-1 space-y-8 p-6 bg-card/50 rounded-xl shadow-lg glassmorphism-card h-fit sticky top-24"
        >
          <div>
            <Label htmlFor="search" className="text-lg font-semibold text-primary mb-2 flex items-center">
              <Search className="ml-2 h-5 w-5" /> ابحث عن منتج
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="اسم المنتج، وصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background/70 border-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <Label className="text-lg font-semibold text-primary mb-4 flex items-center">
              <Filter className="ml-2 h-5 w-5" /> تصفية حسب السعر (ج.م)
            </Label>
            <Slider
              min={0}
              max={50000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary-foreground"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{priceRange[0].toLocaleString('ar-EG')}</span>
              <span>{priceRange[1].toLocaleString('ar-EG')}</span>
            </div>
          </div>

          {allCategories.length > 0 && (
            <div>
              <Label className="text-lg font-semibold text-primary mb-3 flex items-center">
                <Tag className="ml-2 h-5 w-5" /> الفئات
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor={category} className="font-normal text-foreground hover:text-primary cursor-pointer transition-colors">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.aside>

        <main className="md:col-span-3">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 col-span-full bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center"
            >
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-xl text-red-700 font-semibold">
                {error}
              </p>
              <p className="text-sm text-red-600 mt-2">
                إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني.
              </p>
            </motion.div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 col-span-full flex flex-col items-center justify-center"
            >
              <Frown className="w-24 h-24 mx-auto mb-6 text-muted-foreground opacity-50" />
              <p className="text-2xl text-muted-foreground mb-2">
                {products.length > 0 ? "عفواً، لا توجد منتجات تطابق بحثك." : "لم يتم إضافة منتجات بعد."}
              </p>
              {products.length > 0 && 
                <p className="text-md text-muted-foreground">
                  حاول تعديل الفلاتر أو توسيع نطاق البحث.
                </p>
              }
            </motion.div>
          )}

          {!error && filteredProducts.length > 0 && (
            <motion.div 
              layout 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
