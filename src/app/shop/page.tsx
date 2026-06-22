"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ALL_PRODUCTS } from '@/lib/products';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const CATEGORIES = ['Handbags', 'Tote Bags', 'Clutch Bags', 'Shoulder Bags', 'High Heels', 'Sandals'];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category');
  const initialTrending = searchParams.get('trending') === 'true';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  
  // Sync URL search parameters
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  // Filter logic
  let filteredProducts = ALL_PRODUCTS.filter(product => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(product.category);

    // Price filter
    let matchesPrice = true;
    if (selectedPriceRanges.length > 0) {
      const price = product.discountPrice || product.price;
      matchesPrice = selectedPriceRanges.some(range => {
        if (range === 'under-100') return price < 100;
        if (range === '100-300') return price >= 100 && price <= 300;
        if (range === 'over-300') return price > 300;
        return true;
      });
    }

    // Heart icon links to trending
    const matchesTrending = !initialTrending || product.isTrending;

    return matchesSearch && matchesCategory && matchesPrice && matchesTrending;
  });

  // Sort logic
  filteredProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price-low') {
      return priceA - priceB;
    }
    if (sortBy === 'price-high') {
      return priceB - priceA;
    }
    if (sortBy === 'popular') {
      return b.rating - a.rating;
    }
    // Default or 'newest'
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  return (
    <div className="container mx-auto px-4">
      {/* Page Header */}
      <div className="mb-8 space-y-4">
        <h1 className="font-headline text-4xl font-bold">
          {initialTrending ? 'Trending Collection' : 'Shop Collection'}
        </h1>
        <p className="text-muted-foreground">
          {initialTrending 
            ? 'Discover our most popular products loved by fashion enthusiasts.' 
            : 'Discover the latest in premium accessories and footwear.'
          }
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-8 border-b">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 h-11 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 border-primary/20 bg-white">
                <SlidersHorizontal className="w-4 h-4" />
                Filters 
                {(selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
                  <span className="ml-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {selectedCategories.length + selectedPriceRanges.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-headline text-2xl">Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider">Categories</h4>
                  <div className="space-y-3">
                    {CATEGORIES.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${cat}`} 
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <Label htmlFor={`cat-${cat}`} className="text-base font-normal cursor-pointer">{cat}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="p1" 
                        checked={selectedPriceRanges.includes('under-100')}
                        onCheckedChange={() => togglePriceRange('under-100')}
                      />
                      <Label htmlFor="p1" className="text-base font-normal cursor-pointer">Under ₵1,500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="p2" 
                        checked={selectedPriceRanges.includes('100-300')}
                        onCheckedChange={() => togglePriceRange('100-300')}
                      />
                      <Label htmlFor="p2" className="text-base font-normal cursor-pointer">₵1,500 - ₵4,500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="p3" 
                        checked={selectedPriceRanges.includes('over-300')}
                        onCheckedChange={() => togglePriceRange('over-300')}
                      />
                      <Label htmlFor="p3" className="text-base font-normal cursor-pointer">Over ₵4,500</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-grow h-12 text-base"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedPriceRanges([]);
                    }}
                    variant="outline"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-11 border-primary/20 bg-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground space-y-3">
          <p className="text-xl font-medium">No products match your filters.</p>
          <p className="text-sm">Try searching for another keyword or clearing filters.</p>
          <Button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategories([]);
              setSelectedPriceRanges([]);
            }}
            variant="outline"
            className="rounded-full mt-4"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <Suspense fallback={
          <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
            Loading products...
          </div>
        }>
          <ShopContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
