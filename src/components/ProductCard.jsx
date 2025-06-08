
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, PackageX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';

const ProductCard = ({ product }) => {
  const { toast } = useToast();
  const { addItemToCart } = useCart();

  const handleAddToCartClick = () => {
    if (product.stock <= 0) {
      toast({
        title: "نفذ المخزون",
        description: `عفواً، منتج "${product.name}" غير متوفر حالياً.`,
        variant: "destructive",
      });
      return;
    }
    addItemToCart(product);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={`overflow-hidden h-full flex flex-col glassmorphism-card hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${product.stock <= 0 ? 'opacity-70 bg-muted/30' : ''}`}>
        <CardHeader className="p-0 relative">
          <Link to={`/products/${product.id}`} className={product.stock <= 0 ? 'pointer-events-none' : ''}>
            <img  
              alt={product.name || "صورة منتج"}
              className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
              src={product.image || "https://images.unsplash.com/photo-1671376354106-d8d21e55dddd"} />
          </Link>
          {product.originalPrice && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              خصم!
            </div>
          )}
          {product.stock <= 0 && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-destructive/80 text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-md shadow-md flex items-center">
              <PackageX className="ml-2 h-4 w-4" /> نفذ المخزون
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Link to={`/products/${product.id}`} className={product.stock <= 0 ? 'pointer-events-none' : ''}>
            <CardTitle className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors mb-1 truncate">
              {product.name}
            </CardTitle>
          </Link>
          <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
            {product.description ? product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '') : 'لا يوجد وصف متاح.'}
          </CardDescription>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-foreground">{product.rating || 0} ({product.reviews || 0} مراجعة)</span>
            </div>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">{product.category || 'غير مصنف'}</span>
          </div>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <p className="text-2xl font-bold text-primary">
              {(product.price || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {product.originalPrice.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
              </p>
            )}
          </div>
           <p className="text-xs text-muted-foreground mt-1">المخزون المتاح: {product.stock || 0}</p>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50">
          <Button 
            onClick={handleAddToCartClick} 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="ml-2 h-5 w-5" /> {product.stock <= 0 ? 'غير متوفر' : 'أضف إلى السلة'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
