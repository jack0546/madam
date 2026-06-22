
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { formatCedis } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-accent/10">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden relative">
          <Image 
            src={product.images[0]} 
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isTrending && (
              <Badge className="bg-accent text-white border-none">Trending</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-primary text-white border-none">Sale</Badge>
            )}
          </div>

          <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-white transform translate-y-2 group-hover:translate-y-0">
            <Heart className="w-4 h-4" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button className="w-full bg-black/90 hover:bg-primary text-white gap-2 h-11">
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{product.category}</p>
          <h3 className="font-headline font-semibold text-lg line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-primary font-bold">{formatCedis(product.discountPrice!)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatCedis(product.price)}</span>
              </>
            ) : (
              <span className="text-foreground font-bold">{formatCedis(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
