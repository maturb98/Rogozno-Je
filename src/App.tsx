/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, ArrowRight, Sparkles, CheckCircle2, MessageSquare, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { Header } from './components/Header';
import { SearchAndFilters, FilterState } from './components/SearchAndFilters';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantProfile } from './components/RestaurantProfile';
import { CartDrawer } from './components/CartDrawer';
import { ConflictModal } from './components/ConflictModal';
import { AdminPanel } from './components/AdminPanel';
import { storage } from './services/storage';
import { getRestaurantStatus } from './services/openingHours';
import { CartItem, Category, MenuItem, Restaurant } from './types';

export default function App() {
  // Database States
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => storage.getRestaurants());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => storage.getMenuItems());

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'restaurant' | 'admin'>('home');
  const [activeRestaurantSlug, setActiveRestaurantSlug] = useState<string | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => storage.getCart().items);
  const [cartRestaurantId, setCartRestaurantId] = useState<string | null>(() => storage.getCart().restaurantId);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Multi-restaurant conflict modal
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    pendingItem: MenuItem | null;
  }>({
    isOpen: false,
    pendingItem: null,
  });

  // Search & Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    onlyOpen: false,
    onlyDelivery: false,
    onlyTakeaway: false,
    selectedCategory: 'Wszystkie',
  });

  // Sync route from URL Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/restauracja/')) {
        const slug = hash.replace('#/restauracja/', '');
        setActiveRestaurantSlug(slug);
        setCurrentView('restaurant');
      } else if (hash === '#/admin' || window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
        setActiveRestaurantSlug(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    const activeRest = restaurants.find((r) => r.id === cartRestaurantId);
    storage.saveCart({
      restaurantId: cartRestaurantId,
      restaurantName: activeRest ? activeRest.name : null,
      items: cartItems,
    });
  }, [cartItems, cartRestaurantId, restaurants]);

  // Derived: Current Cart Restaurant
  const cartRestaurant = useMemo(() => {
    if (!cartRestaurantId) return null;
    return restaurants.find((r) => r.id === cartRestaurantId) || null;
  }, [cartRestaurantId, restaurants]);

  // Derived: Current Active Profile Restaurant
  const activeRestaurant = useMemo(() => {
    if (!activeRestaurantSlug) return null;
    return restaurants.find((r) => r.slug === activeRestaurantSlug) || null;
  }, [activeRestaurantSlug, restaurants]);

  // Cart totals
  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, cur) => acc + cur.quantity, 0),
    [cartItems]
  );
  const totalCartPrice = useMemo(
    () => cartItems.reduce((acc, cur) => acc + cur.item.price * cur.quantity, 0),
    [cartItems]
  );

  // Add to cart handler
  const handleAddToCart = (item: MenuItem) => {
    // If cart is empty, set this restaurant
    if (cartItems.length === 0 || !cartRestaurantId) {
      setCartRestaurantId(item.restaurantId);
      setCartItems([{ item, quantity: 1 }]);
      return;
    }

    // If item is from the same restaurant, increment or add
    if (cartRestaurantId === item.restaurantId) {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.item.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { item, quantity: 1 }];
      });
      return;
    }

    // Conflict: Different restaurant! Open conflict modal
    setConflictModal({
      isOpen: true,
      pendingItem: item,
    });
  };

  const handleConfirmClearAndAdd = () => {
    if (conflictModal.pendingItem) {
      const newItem = conflictModal.pendingItem;
      setCartRestaurantId(newItem.restaurantId);
      setCartItems([{ item: newItem, quantity: 1 }]);
    }
    setConflictModal({ isOpen: false, pendingItem: null });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.item.id === itemId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const filtered = prev.filter((i) => i.item.id !== itemId);
        if (filtered.length === 0) {
          setCartRestaurantId(null);
        }
        return filtered;
      }
      return prev.map((i) => (i.item.id === itemId ? { ...i, quantity: newQty } : i));
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => {
      const filtered = prev.filter((i) => i.item.id !== itemId);
      if (filtered.length === 0) {
        setCartRestaurantId(null);
      }
      return filtered;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartRestaurantId(null);
    storage.clearCart();
  };

  const getItemQuantity = (itemId: string): number => {
    return cartItems.find((i) => i.item.id === itemId)?.quantity || 0;
  };

  // Navigations
  const handleSelectRestaurant = (rest: Restaurant) => {
    setActiveRestaurantSlug(rest.slug);
    setCurrentView('restaurant');
    window.location.hash = `#/restauracja/${rest.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setActiveRestaurantSlug(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.location.hash = '#/admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Restaurants List with dish search
  const { filteredRestaurants, matchedDishesMap } = useMemo(() => {
    const matchedMap = new Map<string, string[]>();
    const query = filters.searchQuery.trim().toLowerCase();

    const list = restaurants.filter((restaurant) => {
      // Must be active
      if (!restaurant.isActive) return false;

      // Filter: only open
      if (filters.onlyOpen) {
        const st = getRestaurantStatus(restaurant);
        if (!st.isOpen) return false;
      }

      // Filter: only delivery
      if (filters.onlyDelivery && !restaurant.hasDelivery) return false;

      // Filter: only takeaway
      if (filters.onlyTakeaway && !restaurant.hasTakeaway) return false;

      // Filter: category
      if (filters.selectedCategory !== 'Wszystkie') {
        const catLower = filters.selectedCategory.toLowerCase();
        const matchesCuisine = restaurant.cuisineTypes.some((c) =>
          c.toLowerCase().includes(catLower)
        );
        const matchesDishCategory = menuItems.some(
          (m) =>
            m.restaurantId === restaurant.id &&
            categories.some(
              (c) =>
                c.id === m.categoryId &&
                c.name.toLowerCase().includes(catLower)
            )
        );
        if (!matchesCuisine && !matchesDishCategory) return false;
      }

      // Search query filter (restaurant name, cuisine, address, or item names & descriptions)
      if (query) {
        const matchesName = restaurant.name.toLowerCase().includes(query);
        const matchesAddress = restaurant.address.toLowerCase().includes(query);
        const matchesCuisine = restaurant.cuisineTypes.some((c) =>
          c.toLowerCase().includes(query)
        );

        // Check dishes in this restaurant's menu
        const dishes = menuItems.filter(
          (m) =>
            m.restaurantId === restaurant.id &&
            !m.isHidden &&
            (m.name.toLowerCase().includes(query) ||
              m.description.toLowerCase().includes(query))
        );

        if (dishes.length > 0) {
          matchedMap.set(
            restaurant.id,
            dishes.map((d) => d.name)
          );
        }

        if (!matchesName && !matchesAddress && !matchesCuisine && dishes.length === 0) {
          return false;
        }
      }

      return true;
    });

    return { filteredRestaurants: list, matchedDishesMap: matchedMap };
  }, [restaurants, menuItems, categories, filters]);

  // Available filter categories list
  const availableCategories = [
    'Burgery',
    'Pizza',
    'Kebab',
    'Obiady',
    'Pierogi',
    'Kurczak',
    'Azjatyckie',
    'Desery',
    'Kawiarnie',
  ];

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-stone-900 flex flex-col antialiased">
      {/* Top Bar adhering to 3-zone contract */}
      <Header
        onGoHome={handleGoHome}
        onOpenAdmin={handleOpenAdmin}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24">
        {currentView === 'home' && (
          <div className="space-y-7">
            {/* Hero Banner Section */}
            <div className="relative bg-gradient-to-br from-red-900 via-stone-900 to-red-950 text-white rounded-3xl p-6 sm:p-9 shadow-md overflow-hidden">
              <div className="relative z-10 max-w-xl space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-red-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rogoźno, Wielkopolska · Zamawianie bez pośredników</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Co dzisiaj zamawiamy?
                </h1>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  Przeglądaj menu lokalnych restauracji w Rogoźnie, dodawaj dania do koszyka i zamawiaj gotowym SMS-em prosto ze swojego telefonu. Bez rejestracji i bez dodatkowych prowizji!
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-red-700/20 blur-2xl pointer-events-none" />
              <div className="absolute right-6 top-6 hidden lg:block opacity-15 text-white">
                <ShoppingBag className="w-48 h-48" />
              </div>
            </div>

            {/* Live Search and Filters */}
            <SearchAndFilters
              filters={filters}
              onChange={setFilters}
              categories={availableCategories}
            />

            {/* Restaurant Showcase Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                  Restauracje ({filteredRestaurants.length})
                </h2>
                {filters.searchQuery && (
                  <span className="text-xs text-stone-500">
                    Wyniki dla: <strong>"{filters.searchQuery}"</strong>
                  </span>
                )}
              </div>

              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onSelect={handleSelectRestaurant}
                      matchedDishes={matchedDishesMap.get(restaurant.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
                  <p className="text-base font-bold text-stone-800">
                    Nie znaleziono restauracji spełniających kryteria
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Spróbuj wyczyścić wyszukiwanie lub zresetować filtry godzinowe i kategorie.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        searchQuery: '',
                        onlyOpen: false,
                        onlyDelivery: false,
                        onlyTakeaway: false,
                        selectedCategory: 'Wszystkie',
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
                  >
                    Wyczyść wszystkie filtry
                  </button>
                </div>
              )}
            </div>

            {/* How It Works Educational Section */}
            <section
              id="jak-to-dziala"
              className="mt-12 pt-8 border-t border-stone-200 bg-white rounded-3xl p-6 sm:p-8 border shadow-2xs space-y-6"
            >
              <div className="text-center max-w-lg mx-auto space-y-1.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
                  Jak działa Rogoźno Je?
                </h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  0 zł prowizji · 100% zysku dla rogozińskiej gastronomii · Błyskawiczny SMS
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Wybierz menu</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Wybierz lokal z Rogoźna, przejrzyj aktualne ceny i dodaj pozycje do koszyka.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Podaj adres lub odbiór</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Wpisz imię i adres na terenie Rogoźna. Nie wymagamy zakładania konta ani e-maila.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Wyślij SMS z telefonu</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Aplikacja przygotuje gotową wiadomość i wpisze numer restauracji. Ty tylko klikasz "Wyślij".
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'restaurant' && activeRestaurant && (
          <RestaurantProfile
            restaurant={activeRestaurant}
            categories={categories}
            menuItems={menuItems}
            onBack={handleGoHome}
            onAddToCart={handleAddToCart}
            getCartQuantity={getItemQuantity}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            restaurants={restaurants}
            categories={categories}
            menuItems={menuItems}
            onBack={handleGoHome}
            onUpdateRestaurants={(r) => {
              setRestaurants(r);
              storage.saveRestaurants(r);
            }}
            onUpdateCategories={(c) => {
              setCategories(c);
              storage.saveCategories(c);
            }}
            onUpdateMenuItems={(m) => {
              setMenuItems(m);
              storage.saveMenuItems(m);
            }}
            onResetData={() => {
              storage.resetToInitialData();
              setRestaurants(storage.getRestaurants());
              setCategories(storage.getCategories());
              setMenuItems(storage.getMenuItems());
            }}
          />
        )}
      </main>

      {/* Floating Sticky Mobile Bottom Cart Bar (Thumb Zone Ergonomics) */}
      {cartItems.length > 0 && currentView !== 'admin' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xs pb-safe">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-red-800 hover:bg-red-900 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-between shadow-xl shadow-red-900/25 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {totalCartCount}
                </div>
                <span>Koszyk · {cartRestaurant?.name || 'Zamówienie'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="tabular-nums font-black">{totalCartPrice.toFixed(2)} zł</span>
                <ArrowRight className="w-4 h-4 opacity-75" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        restaurant={cartRestaurant}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Multi-restaurant Conflict Dialog */}
      <ConflictModal
        isOpen={conflictModal.isOpen}
        currentRestaurantName={cartRestaurant?.name || 'poprzedniej restauracji'}
        newRestaurantName={
          restaurants.find((r) => r.id === conflictModal.pendingItem?.restaurantId)?.name ||
          'nowej restauracji'
        }
        onCancel={() => setConflictModal({ isOpen: false, pendingItem: null })}
        onConfirmClearAndAdd={handleConfirmClearAndAdd}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700">
            <span>Rogoźno Je</span>
            <span aria-hidden="true">·</span>
            <span>Wielkopolska</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Niezależna platforma agregująca gastronomię. Zamówienia SMS wysyłane są bezpośrednio z telefonu klienta.
          </p>
          <button
            onClick={handleOpenAdmin}
            className="text-stone-500 hover:text-red-800 transition"
          >
            Panel administracyjny
          </button>
        </div>
      </footer>
    </div>
  );
}
