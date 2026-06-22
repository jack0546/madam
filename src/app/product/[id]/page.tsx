"use client"

import React, { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ALL_PRODUCTS, getProductById, getRelatedProducts } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { cn, formatCedis } from '@/lib/utils';
import { 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Maximize2,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const product = getProductById(id);
  
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-20 flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold font-headline">Product Not Found</h1>
          <p className="text-muted-foreground">The product you are looking for does not exist.</p>
          <Link href="/shop">
            <Button className="rounded-full">Back to Shop</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const relatedProducts = getRelatedProducts(product, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </nav>

          {/* Product Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-24">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div 
                className="aspect-[3/4] relative rounded-3xl overflow-hidden bg-muted group border shadow-sm cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Image 
                  src={product.images[0]} 
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isTrending && (
                    <Badge className="bg-accent text-white border-none">Trending</Badge>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-primary text-white border-none">Sale</Badge>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md text-foreground group-hover:scale-110 transition-transform duration-300">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground italic">Click image to see full size (WQHD)</p>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  {product.category}
                </span>
                
                <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">(24 reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-4 pt-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-3xl font-bold text-primary">{formatCedis(product.discountPrice!)}</span>
                      <span className="text-lg text-muted-foreground line-through">{formatCedis(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">{formatCedis(product.price)}</span>
                  )}
                </div>

                <Separator />

                <p className="text-muted-foreground font-light leading-relaxed text-base md:text-lg">
                  {product.description}
                </p>
              </div>

              <div className="space-y-6">
                {/* Colors selection */}
                {product.colors.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Color: <span className="text-foreground capitalize">{selectedColor}</span></span>
                    <div className="flex gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            selectedColor === color
                              ? 'border-primary bg-primary/5 text-primary shadow-sm font-semibold'
                              : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes selection */}
                {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Size: <span className="text-foreground">{selectedSize}</span></span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-medium transition-all ${
                            selectedSize === size
                              ? 'border-primary bg-primary/5 text-primary shadow-sm font-semibold'
                              : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center border rounded-xl overflow-hidden h-14 bg-white">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-12 h-full flex items-center justify-center hover:bg-slate-50 transition-colors border-r"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-12 h-full flex items-center justify-center hover:bg-slate-50 transition-colors border-l"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <Button 
                      onClick={handleAddToCart}
                      size="lg" 
                      className={`flex-grow h-14 rounded-xl text-lg font-semibold gap-2 shadow-lg transition-all ${
                        addedToCart 
                          ? 'bg-emerald-600 hover:bg-emerald-600/90 text-white' 
                          : 'bg-primary hover:bg-primary/95 text-white'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {addedToCart ? 'Added to Bag!' : 'Add to Shopping Bag'}
                    </Button>

                    <button className="p-4 border rounded-xl hover:bg-slate-50 transition-all hover:border-slate-400">
                      <Heart className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                   <Link href={`/checkout?${new URLSearchParams({
                     productId: product.id,
                     size: selectedSize || '',
                     color: selectedColor || '',
                     quantity: String(quantity),
                   }).toString()}`} className="w-full">
                     <Button 
                       variant="outline"
                       size="lg" 
                       className="w-full h-14 rounded-xl text-lg font-bold border-accent text-accent hover:bg-accent hover:text-white transition-all shadow-md uppercase tracking-wider"
                     >
                       Order Now (Secure Payment)
                     </Button>
                   </Link>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center text-xs text-muted-foreground">
                <div className="space-y-1">
                  <Truck className="w-5 h-5 text-primary mx-auto" />
                  <p className="font-semibold text-foreground">Free shipping</p>
                  <p>On orders over ₵1,500</p>
                </div>
                <div className="space-y-1">
                  <ShieldCheck className="w-5 h-5 text-primary mx-auto" />
                  <p className="font-semibold text-foreground">Secure checkouts</p>
                  <p>Paystack encrypted</p>
                </div>
                <div className="space-y-1">
                  <RotateCcw className="w-5 h-5 text-primary mx-auto" />
                  <p className="font-semibold text-foreground">Easy returns</p>
                  <p>14 days return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="border-t pt-16">
            <div className="mb-12">
              <span className="text-primary font-bold uppercase tracking-widest text-xs">Recommendations</span>
              <h2 className="font-headline text-3xl font-bold mt-1">Related Collection</h2>
            </div>

            {relatedProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No related products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox Modal for clear WQHD image view */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-300">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between w-full z-50 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full max-w-4xl mx-auto border border-white/5">
            <span className="text-white/80 font-medium text-xs hidden sm:inline-block truncate max-w-xs md:max-w-md">
              {product.name} — {isZoomed ? 'WQHD Zoomed Mode (Click image to Zoom Out)' : 'Standard View (Click image to Zoom In WQHD)'}
            </span>
            <div className="flex items-center gap-3 ml-auto sm:ml-0">
              <a 
                href={product.images[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Open Original WQHD
              </a>
              <button 
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
                className="p-2 bg-white/15 hover:bg-white/25 text-white rounded-full transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Image Viewing Area */}
          <div className="flex-grow flex items-center justify-center overflow-auto my-4 w-full h-full relative">
            <div 
              className={cn(
                "transition-all duration-300 ease-in-out flex items-center justify-center",
                isZoomed 
                  ? "w-auto h-auto min-w-full min-h-full p-4 overflow-auto cursor-zoom-out" 
                  : "w-full max-w-4xl h-[78vh] cursor-zoom-in"
              )}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Using standard img tag for raw uncompressed quality of local/external images */}
              <img 
                src={product.images[0]} 
                alt={product.name}
                className={cn(
                  "transition-all duration-300 ease-in-out select-none",
                  isZoomed 
                    ? "w-[2000px] md:w-[2560px] max-w-none object-contain shadow-2xl rounded-lg" 
                    : "max-w-full max-h-[75vh] object-contain rounded-xl shadow-xl border border-white/10"
                )}
              />
            </div>
          </div>

          <div className="text-center pb-2 text-white/40 text-xs">
            {isZoomed 
              ? 'Scroll horizontally or vertically to pan the uncompressed WQHD image.' 
              : 'Click on the image above to view it in full 2560px WQHD resolution.'
            }
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
