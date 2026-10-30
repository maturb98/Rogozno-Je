export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open: string;  // "12:00"
  close: string; // "22:00"
  closed: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisineTypes: string[];
  phone: string;
  address: string;
  city: string;
  imageUrl: string;
  logoUrl?: string;
  minOrder: number;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  estimatedTime: string;
  hasDelivery: boolean;
  hasTakeaway: boolean;
  isActive: boolean;
  isTemporaryClosed: boolean;
  openingHours: Record<DayOfWeek, DayHours>;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isHidden: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
}

export type DeliveryType = 'delivery' | 'takeaway';

export interface CustomerOrderData {
  deliveryType: DeliveryType;
  name: string;
  phone: string;
  street: string;
  buildingNumber: string;
  city: string;
  notes: string;
}

export interface RestaurantStatus {
  isOpen: boolean;
  message: string;
  isTemporaryClosed: boolean;
  nextOpenTime?: string;
}
