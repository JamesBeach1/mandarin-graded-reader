import { 
  Utensils, 
  Plane, 
  Briefcase, 
  Home, 
  BookOpen, 
  ShoppingBag, 
  Car, 
  GraduationCap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const getThemeIcon = (tag: string): LucideIcon => {
  switch (tag?.toLowerCase()) {
    case 'food':
      return Utensils;
    case 'travel':
      return Plane;
    case 'business':
      return Briefcase;
    case 'daily_life':
      return Home;
    case 'school':
      return BookOpen;
    case 'shopping':
      return ShoppingBag;
    case 'transport':
      return Car;
    default:
      return GraduationCap;
  }
};
