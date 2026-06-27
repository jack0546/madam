import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCedis(amount: number) {
  return `₵${amount.toFixed(2)}`
}

export function formatDate(createdAt: any): string {
  if (!createdAt) return 'N/A';
  
  if (typeof createdAt === 'string') {
    const date = new Date(createdAt);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }
  
  if (createdAt?.toDate) {
    return createdAt.toDate().toLocaleDateString();
  }
  
  return 'N/A';
}

