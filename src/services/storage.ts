import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, INITIAL_RESTAURANTS } from '../data/initialData';
import { CartState, Category, CustomerOrderData, MenuItem, Restaurant } from '../types';

const RESTAURANTS_KEY = 'rogozno_je_restaurants_v1';
const CATEGORIES_KEY = 'rogozno_je_categories_v1';
const MENU_ITEMS_KEY = 'rogozno_je_menu_items_v1';
const CART_KEY = 'rogozno_je_cart_v1';
const CUSTOMER_KEY = 'rogozno_je_customer_data_v1';
const ADMIN_AUTH_KEY = 'rogozno_je_admin_auth';

export const storage = {
  getRestaurants(): Restaurant[] {
    try {
      const data = localStorage.getItem(RESTAURANTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    // Seed initial
    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(INITIAL_RESTAURANTS));
    return INITIAL_RESTAURANTS;
  },

  saveRestaurants(restaurants: Restaurant[]): void {
    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  getMenuItems(): MenuItem[] {
    try {
      const data = localStorage.getItem(MENU_ITEMS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
    return INITIAL_MENU_ITEMS;
  },

  saveMenuItems(items: MenuItem[]): void {
    localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items));
  },

  resetToInitialData(): void {
    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(INITIAL_RESTAURANTS));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
  },

  getCart(): CartState {
    try {
      const data = localStorage.getItem(CART_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return {
      restaurantId: null,
      restaurantName: null,
      items: [],
    };
  },

  saveCart(cart: CartState): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  getCustomerData(): Partial<CustomerOrderData> {
    try {
      const data = localStorage.getItem(CUSTOMER_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return {
      deliveryType: 'delivery',
      name: '',
      phone: '',
      street: '',
      buildingNumber: '',
      city: 'Rogoźno',
      notes: '',
    };
  },

  saveCustomerData(data: CustomerOrderData): void {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
  },

  isAdminLoggedIn(): boolean {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  },

  setAdminLoggedIn(value: boolean): void {
    if (value) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  },
};
