import React, { useState } from 'react';
import { Plus, Check, Ban } from 'lucide-react';
import { MenuItem } from '../types';
import { FoodPlaceholder } from './FoodPlaceholder';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  quantityInCart?: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantityInCart = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    if (!item.isAvailable) return;
    onAddToCart(item);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 500);
  };

  return (
    <div
      className={`relative bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between transition ${
        !item.isAvailable ? 'opacity-70 bg-stone-50/70' : 'hover:border-stone-300 hover:shadow-sm'
      }`}
    >
      <div className="flex gap-4">
        {/* Left: Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-bold text-stone-900 leading-snug">
              {item.name}
            </h4>
          </div>

          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-base sm:text-lg font-extrabold text-stone-900 tabular-nums">
              {item.price.toFixed(2).replace('.', ',')} zł
            </span>

            {!item.isAvailable && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                <Ban className="w-3 h-3" />
                Chwilowo niedostępny
              </span>
            )}
          </div>
        </div>

        {/* Right: Food Image or Fallback */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 relative">
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <FoodPlaceholder
              type={item.name}
              className="w-full h-full"
            />
          )}

          {quantityInCart > 0 && (
            <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-800 text-white text-xs font-bold flex items-center justify-center shadow-md">
              {quantityInCart}
            </div>
          )}
        </div>
      </div>

      {/* Action Add Button */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
        {item.isAvailable ? (
          <button
            onClick={handleAdd}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-red-800 hover:bg-red-900 text-white shadow-xs'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>Dodano!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>DODAJ DO KOSZYKA</span>
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-medium text-stone-400 bg-stone-100 cursor-not-allowed"
          >
            Niedostępny
          </button>
        )}
      </div>
    </div>
  );
};
