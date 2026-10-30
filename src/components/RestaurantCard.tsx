import React, { useState } from 'react';
import { Clock, Car, ShoppingBag, ArrowRight } from 'lucide-react';
import { Restaurant } from '../types';
import { getRestaurantStatus } from '../services/openingHours';
import { FoodPlaceholder } from './FoodPlaceholder';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
  matchedDishes?: string[];
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSelect,
  matchedDishes = [],
}) => {
  const [imageError, setImageError] = useState(false);
  const status = getRestaurantStatus(restaurant);

  return (
    <div
      onClick={() => onSelect(restaurant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(restaurant);
        }
      }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-md active:scale-[0.98] transition cursor-pointer flex flex-col text-left focus:outline-none focus:ring-2 focus:ring-red-700/30"
    >
      {/* Card Header Image */}
      <div className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden">
        {restaurant.imageUrl && !imageError ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition duration-500 ease-out"
          />
        ) : (
          <FoodPlaceholder
            type={restaurant.cuisineTypes.join(' ')}
            name={restaurant.name}
            className="w-full h-full"
          />
        )}

        {/* Status Badge overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold shadow">
          <span
            className={`w-2 h-2 rounded-full ${
              status.isOpen ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span>{status.message}</span>
        </div>

        {/* Estimated delivery time badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-stone-800 text-xs font-bold shadow-sm flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          <span>{restaurant.estimatedTime}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-red-800 transition line-clamp-1">
              {restaurant.name}
            </h3>
            {restaurant.rating && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold shrink-0">
                <span>⭐</span>
                <span>{restaurant.rating.toFixed(1).replace('.', ',')}</span>
                {restaurant.reviewCount && (
                  <span className="text-[10px] text-amber-700 font-normal">({restaurant.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Clean Unboxed Cuisine Metadata with Dot Separator */}
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mt-1 flex-wrap">
            <span>{restaurant.cuisineTypes.join(' · ')}</span>
            <span aria-hidden="true">·</span>
            <span>{restaurant.address}</span>
          </div>

          {/* Optional: Discovered search dishes matched */}
          {matchedDishes.length > 0 && (
            <div className="mt-2.5 p-2 rounded-xl bg-red-50/70 border border-red-100 text-[11px] text-red-900 leading-snug">
              <span className="font-semibold">W menu m.in.: </span>
              {matchedDishes.slice(0, 3).join(', ')}
            </div>
          )}
        </div>

        {/* Card Footer: Delivery modes, Minimum Order & CTA */}
        <div className="mt-4 pt-3.5 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-3">
            <div className="flex items-center gap-3">
              {restaurant.hasDelivery && (
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <Car className="w-3.5 h-3.5 text-red-700" />
                  Dowóz ({restaurant.deliveryFee} zł)
                </span>
              )}
              {restaurant.hasTakeaway && (
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                  Odbiór
                </span>
              )}
            </div>
            <div className="text-stone-500">
              Min. <span className="font-semibold text-stone-800 tabular-nums">{restaurant.minOrder} zł</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(restaurant);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 group-hover:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.99] shadow-xs"
          >
            <span>ZOBACZ MENU</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
