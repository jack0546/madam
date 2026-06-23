import { Product } from './types';

export const ALL_PRODUCTS: Product[] = [
  // Bags
  {
    id: 'bag-1',
    name: 'Seraphina Leather Tote',
    category: 'Tote Bags',
    price: 0.5,
    images: ['/images/bags/bag 1.jpg'],
    description: 'A spacious and elegant tote bag crafted from premium textured leather. Perfect for the modern professional, featuring comfortable shoulder straps and an organized interior with zip pockets.',
    sizes: ['One Size'],
    colors: ['Tan', 'Black', 'Nude'],
    stock: 12,
    rating: 4.8,
    dateAdded: '2024-01-01',
    isTrending: true
  },
  {
    id: 'bag-2',
    name: 'Midnight Velvet Clutch',
    category: 'Clutch Bags',
    price: 0.5,
    images: ['/images/bags/bag 2.jpg'],
    description: 'Make a statement at your next evening event. This compact clutch features plush velvet upholstery, a secure metallic clasp, and a detachable chain strap for hands-free convenience.',
    sizes: ['One Size'],
    colors: ['Burgundy', 'Emerald', 'Navy'],
    stock: 8,
    rating: 4.5,
    dateAdded: '2024-01-02',
    isTrending: false
  },
  {
    id: 'bag-3',
    name: 'Azure Shoulder Bag',
    category: 'Shoulder Bags',
    price: 320,
    discountPrice: 280,
    images: ['/images/bags/bag 3.jpg'],
    description: 'A stylish and versatile shoulder bag in a gorgeous azure hue. Designed with clean lines, gold-tone hardware, and an adjustable strap to wear long or short.',
    sizes: ['One Size'],
    colors: ['Azure Blue', 'Classic Black'],
    stock: 15,
    rating: 4.7,
    dateAdded: '2024-01-03',
    isTrending: true
  },
  {
    id: 'bag-4',
    name: 'Crocodile Pattern Purse',
    category: 'Handbags',
    price: 0.5,
    images: ['/images/bags/bag 4.jpg'],
    description: 'Add texture to your outfit with this stunning crocodile-embossed leather purse. Crafted with a structured silhouette, double handles, and a secure top-zip closure.',
    sizes: ['One Size'],
    colors: ['Emerald Green', 'Chocolate Brown', 'Midnight Black'],
    stock: 6,
    rating: 4.6,
    dateAdded: '2024-01-04',
    isTrending: false
  },
  {
    id: 'bag-5',
    name: 'Golden Chain Clutch',
    category: 'Clutch Bags',
    price: 150,
    images: ['/images/bags/bag 5.jpg'],
    description: 'Shine bright with this luxurious metallic gold envelope clutch. Features a heavy-link golden chain and magnetic snap closure, perfect for gala nights.',
    sizes: ['One Size'],
    colors: ['Gold', 'Silver'],
    stock: 10,
    rating: 4.2,
    dateAdded: '2024-01-05',
    isTrending: false
  },
  {
    id: 'bag-6',
    name: 'Classic Leather Satchel',
    category: 'Handbags',
    price: 0.5,
    images: ['/images/bags/bag 6.jpg'],
    description: 'A timeless satchel with a structured outline and top handle. Features dual buckle straps with magnetic quick-releases and a spacious main compartment.',
    sizes: ['One Size'],
    colors: ['Chestnut', 'Black'],
    stock: 7,
    rating: 4.4,
    dateAdded: '2024-01-06',
    isTrending: false
  },
  {
    id: 'bag-7',
    name: 'Quilted Crossbody Bag',
    category: 'Handbags',
    price: 0.5,
    discountPrice: 220,
    images: ['/images/bags/bag 7.jpg'],
    description: 'Effortless luxury in a quilted diamond pattern. This crossbody bag comes with an adjustable leather-and-chain strap and fits all your daily essentials.',
    sizes: ['One Size'],
    colors: ['Cream', 'Soft Pink', 'Black'],
    stock: 18,
    rating: 4.7,
    dateAdded: '2024-01-07',
    isTrending: true
  },
  {
    id: 'bag-8',
    name: 'Urban Canvas Backpack',
    category: 'Handbags',
    price: 195,
    images: ['/images/bags/bag 8.jpg'],
    description: 'Designed for city explorers. Combining durable canvas with leather trims, it has multiple outer pockets and a padded sleeve for your tablet or small laptop.',
    sizes: ['One Size'],
    colors: ['Olive Green', 'Charcoal Grey'],
    stock: 22,
    rating: 4.3,
    dateAdded: '2024-01-08',
    isTrending: false
  },
  {
    id: 'bag-9',
    name: 'Minimalist Belt Bag',
    category: 'Handbags',
    price: 130,
    images: ['/images/bags/bag 9.jpg'],
    description: 'A sleek, lightweight belt bag for hands-free convenience. Features a front zip pouch, adjustable buckle belt, and can be worn around the waist or across the chest.',
    sizes: ['One Size'],
    colors: ['Black', 'Off-White', 'Crimson'],
    stock: 14,
    rating: 4.1,
    dateAdded: '2024-01-09',
    isTrending: false
  },
  {
    id: 'bag-10',
    name: 'Luxury Gold-Clasp Tote',
    category: 'Handbags',
    price: 520,
    images: ['/images/bags/bag 10.jpg'],
    description: 'Our flagship handbag. Made from the finest full-grain Italian leather, highlighted by a signature gold clasp and structured base with protective metal feet.',
    sizes: ['One Size'],
    colors: ['Cognac', 'Burgundy', 'Ivory'],
    stock: 5,
    rating: 4.9,
    dateAdded: '2024-01-10',
    isTrending: true
  },

  // High Heels & Sandals
  {
    id: 'heel-1',
    name: 'Starlight Satin Heels',
    category: 'High Heels',
    price: 0.5,
    images: ['/images/foot/w 1.jpg'],
    description: 'Elevate your stride with these shimmering satin stiletto heels. Featuring a sleek pointed toe, delicate ankle straps, and a cushioned footbed for maximum comfort.',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Navy Blue', 'Silver', 'Black'],
    stock: 15,
    rating: 5.0,
    dateAdded: '2024-01-01',
    isTrending: true
  },
  {
    id: 'heel-2',
    name: 'Pearl Embellished Sandals',
    category: 'Sandals',
    price: 210,
    images: ['/images/foot/w 2.jpg'],
    description: 'Adorned with imitation pearls, these low-block heel sandals bring an air of romance. Ideal for weddings, summer dinner dates, and special garden parties.',
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Pearl White', 'Blush Pink'],
    stock: 9,
    rating: 4.9,
    dateAdded: '2024-01-02',
    isTrending: true
  },
  {
    id: 'heel-3',
    name: 'Suede Ankle Strap Heels',
    category: 'High Heels',
    price: 260,
    images: ['/images/foot/w 3.jpg'],
    description: 'Classic block-heeled sandals crafted in soft, premium goatskin suede. Features a secure ankle buckle strap and a wearable 3-inch block heel.',
    sizes: ['37', '38', '39', '40', '41'],
    colors: ['Dusty Rose', 'Midnight Black', 'Taupe'],
    stock: 11,
    rating: 4.4,
    dateAdded: '2024-01-03',
    isTrending: false
  },
  {
    id: 'heel-4',
    name: 'Classic Nude Pumps',
    category: 'High Heels',
    price: 245,
    images: ['/images/foot/w 4.jpg'],
    description: 'The ultimate wardrobe essential. These nude leather pumps feature a timeless pointed toe and slim stiletto heel, seamlessly transitioning from office to evening.',
    sizes: ['35', '36', '37', '38', '39', '40', '41'],
    colors: ['Nude Leather', 'Black Patent'],
    stock: 20,
    rating: 4.7,
    dateAdded: '2024-01-04',
    isTrending: false
  },
  {
    id: 'heel-5',
    name: 'Sparkling Crystal Stilettos',
    category: 'High Heels',
    price: 350,
    discountPrice: 295,
    images: ['/images/foot/w 5.jpg'],
    description: 'Dazzle with every step. These breathtaking stilettos are encrusted with hand-placed glass crystals, featuring an adjustable ankle buckle and thin heel.',
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Crystal Silver', 'Champagne Gold'],
    stock: 7,
    rating: 4.8,
    dateAdded: '2024-01-05',
    isTrending: true
  },
  {
    id: 'heel-6',
    name: 'Strappy Leather Gladiators',
    category: 'Sandals',
    price: 180,
    images: ['/images/foot/w 6.jpg'],
    description: 'Embrace warm weather in style. These flat gladiator sandals feature soft premium calfskin straps that tie elegantly around the ankle, with a durable leather sole.',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Tan', 'Black'],
    stock: 13,
    rating: 4.5,
    dateAdded: '2024-01-06',
    isTrending: false
  },
  {
    id: 'heel-7',
    name: 'Boho Espadrille Wedges',
    category: 'Sandals',
    price: 165,
    images: ['/images/foot/w 7.jpg'],
    description: 'Perfect for coastal escapes. A classic braided jute wedge with soft canvas crossover straps and a buckle closure, giving you comfortable height.',
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Navy Canvas', 'Beige Canvas'],
    stock: 16,
    rating: 4.3,
    dateAdded: '2024-01-07',
    isTrending: false
  },
  {
    id: 'heel-8',
    name: 'Chic Velvet Mules',
    category: 'High Heels',
    price: 220,
    images: ['/images/foot/w 8.jpg'],
    description: 'Slip into effortless style. These modern square-toe mules feature a low sculptural heel and a luxurious velvet strap, perfect for pairing with cropped trousers or dresses.',
    sizes: ['37', '38', '39', '40'],
    colors: ['Emerald Velvet', 'Midnight Velvet'],
    stock: 8,
    rating: 4.4,
    dateAdded: '2024-01-08',
    isTrending: false
  },
  {
    id: 'heel-9',
    name: 'Casual Summer Slides',
    category: 'Sandals',
    price: 95,
    images: ['/images/foot/w 9.webp'],
    description: 'Simple, minimal, and comfortable. These flat slides feature a wide leather strap with a padded footbed, ideal for beach trips and relaxed weekend wear.',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Tan Leather', 'White Leather', 'Black Leather'],
    stock: 25,
    rating: 4.2,
    dateAdded: '2024-01-09',
    isTrending: false
  },
  {
    id: 'heel-10',
    name: 'Glossy Patent Leather Pumps',
    category: 'High Heels',
    price: 275,
    images: ['/images/foot/w 10.jpg'],
    description: 'Make a bold professional statement. These pointed-toe pumps are finished in a brilliant high-shine patent leather with a comfortable medium stiletto heel.',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Cherry Red', 'Nero Black'],
    stock: 10,
    rating: 4.6,
    dateAdded: '2024-01-10',
    isTrending: true
  }
];

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const isBag = ['Handbags', 'Tote Bags', 'Clutch Bags', 'Shoulder Bags'].includes(product.category);
  
  return ALL_PRODUCTS.filter(p => {
    if (p.id === product.id) return false;
    const pIsBag = ['Handbags', 'Tote Bags', 'Clutch Bags', 'Shoulder Bags'].includes(p.category);
    return isBag === pIsBag;
  }).slice(0, limit);
}
