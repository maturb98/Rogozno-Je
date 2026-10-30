import React, { useState } from 'react';
import { ArrowLeft, Phone, Clock, Car, ShoppingBag, MapPin, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Category, MenuItem, Restaurant } from '../types';
import { formatOpeningSchedule, getRestaurantStatus } from '../services/openingHours';
import { MenuItemCard } from './MenuItemCard';
import { FoodPlaceholder } from './FoodPlaceholder';

interface RestaurantProfileProps {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
  onBack: () => void;
  onAddToCart: (item: MenuItem) => void;
  getCartQuantity: (itemId: string) => number;
}

export const RestaurantProfile: React.FC<RestaurantProfileProps> = ({
  restaurant,
  categories,
  menuItems,
  onBack,
  onAddToCart,
  getCartQuantity,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [showHoursDropdown, setShowHoursDropdown] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const status = getRestaurantStatus(restaurant);
  const schedule = formatOpeningSchedule(restaurant);

  // Filter categories for this restaurant
  const restaurantCategories = categories
    .filter((c) => c.restaurantId === restaurant.id)
    .sort((a, b) => a.order - b.order);

  // Filter items for this restaurant
  const visibleItems = menuItems.filter(
    (item) => item.restaurantId === restaurant.id && !item.isHidden
  );

  const filteredItems =
    activeCategoryId === 'all'
      ? visibleItems
      : visibleItems.filter((i) => i.categoryId === activeCategoryId);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wróć do listy restauracji</span>
        </button>

        <a
          href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-800 hover:bg-red-900 transition shadow-sm min-h-[40px]"
        >
          <Phone className="w-4 h-4" />
          <span>Zadzwoń: {restaurant.phone}</span>
        </a>
      </div>

      {/* Restaurant Hero Banner Card */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm">
        <div className="relative h-48 sm:h-64 w-full bg-stone-100 overflow-hidden">
          {restaurant.imageUrl && !imageError ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <FoodPlaceholder
              type={restaurant.cuisineTypes.join(' ')}
              name={restaurant.name}
              className="w-full h-full"
            />
          )}

          {/* Status overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold shadow-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{status.message}</span>
          </div>
        </div>

        {/* Restaurant Details Strip */}
        <div className="p-5 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {restaurant.name}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                {restaurant.description}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs font-medium text-stone-600 flex-wrap">
                <span className="flex items-center gap-1 text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  {restaurant.address}, {restaurant.city}
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{restaurant.cuisineTypes.join(' · ')}</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="flex items-center gap-2 sm:gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/60 shrink-0">
              <div className="px-3 py-1 text-center border-r border-stone-200">
                <span className="block text-[10px] uppercase font-semibold text-stone-400">Dostawa</span>
                <span className="text-xs sm:text-sm font-bold text-stone-900 tabular-nums">
                  {restaurant.hasDelivery ? `${restaurant.deliveryFee} zł` : 'Brak'}
                </span>
              </div>
              <div className="px-3 py-1 text-center border-r border-stone-200">
                <span className="block text-[10px] uppercase font-semibold text-stone-400">Min. kwota</span>
                <span className="text-xs sm:text-sm font-bold text-stone-900 tabular-nums">
                  {restaurant.minOrder} zł
                </span>
              </div>
              <div className="px-3 py-1 text-center">
                <span className="block text-[10px] uppercase font-semibold text-stone-400">Czas</span>
                <span className="text-xs sm:text-sm font-bold text-stone-900">
                  {restaurant.estimatedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Opening Hours Accordion Toggle */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <button
              onClick={() => setShowHoursDropdown(!showHoursDropdown)}
              className="flex items-center justify-between w-full text-xs font-semibold text-stone-700 hover:text-stone-900 transition"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-700" />
                <span>Godziny otwarcia w tygodniu</span>
              </span>
              {showHoursDropdown ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {showHoursDropdown && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/60 text-xs">
                {schedule.map((slot) => (
                  <div
                    key={slot.day}
                    className={`p-2 rounded-xl flex items-center justify-between ${
                      slot.isToday ? 'bg-white font-bold text-red-900 shadow-xs border border-red-100' : 'text-stone-600'
                    }`}
                  >
                    <span>{slot.day}:</span>
                    <span className="tabular-nums">{slot.hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Closed Warning Banner if restaurant is closed right now */}
      {!status.isOpen && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <p className="font-bold">Restauracja jest obecnie zamknięta.</p>
            <p className="text-amber-800">
              Możesz swobodnie przeglądać menu i skompletować koszyk, ale zamówienie SMS wyślesz w godzinach otwarcia lokalu ({status.nextOpenTime ? `otwarcie o ${status.nextOpenTime}` : 'sprawdź godziny powyżej'}).
            </p>
          </div>
        </div>
      )}

      {/* Menu Categories Bar */}
      <div className="sticky top-16 z-20 bg-stone-50/90 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeCategoryId === 'all'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            Wszystkie pozycje ({visibleItems.length})
          </button>
          {restaurantCategories.map((cat) => {
            const count = visibleItems.filter((i) => i.categoryId === cat.id).length;
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                  isActive
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="space-y-8">
        {restaurantCategories.map((cat) => {
          const itemsInCat = filteredItems.filter((i) => i.categoryId === cat.id);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  {cat.name}
                </h2>
                <span className="text-xs text-stone-400">({itemsInCat.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itemsInCat.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={onAddToCart}
                    quantityInCart={getCartQuantity(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
            <p className="text-stone-500 text-sm">Brak pozycji w tej kategorii.</p>
          </div>
        )}
      </div>
    </div>
  );
};
