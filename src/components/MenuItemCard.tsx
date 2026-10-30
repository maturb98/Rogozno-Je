import React, { useState } from 'react';
import { Plus, Minus, Check, Ban } from 'lucide-react';
import { MenuItem } from '../types';
import { FoodPlaceholder } from './FoodPlaceholder';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity?: (itemId: string, delta: number) => void;
  quantityInCart?: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  onUpdateQuantity,
  quantityInCart = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    if (!item.isAvailable) return;
    onAddToCart(item);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 400);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(item.id, 1);
    } else {
      onAddToCart(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(item.id, -1);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs hover:shadow-sm transition flex flex-col justify-between ${
        !item.isAvailable ? 'opacity-70 bg-stone-50/70' : ''
      }`}
    >
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
              {item.name}
            </h4>
          </div>

          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-stone-900 tabular-nums">
              {item.price.toFixed(2).replace('.', ',')} zł
            </span>

            {!item.isAvailable && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                <Ban className="w-3 h-3" />
                Niedostępny
              </span>
            )}
          </div>
        </div>

        {/* Right: Food Image or Fallback */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 relative shadow-2xs">
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
            <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-800 text-white text-xs font-black flex items-center justify-center shadow-md animate-in zoom-in">
              {quantityInCart}
            </div>
          )}
        </div>
      </div>

      {/* Action Add Button / Inline Stepper */}
      <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-end">
        {item.isAvailable ? (
          quantityInCart > 0 && onUpdateQuantity ? (
            /* Wolt / Glovo Style Interactive Stepper */
            <div className="flex items-center bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                onClick={handleDecrement}
                aria-label="Zmniejsz ilość"
                className="w-9 h-9 flex items-center justify-center text-red-900 hover:bg-red-100 active:scale-90 transition font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-xs font-black text-red-900 tabular-nums">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                aria-label="Zwiększ ilość"
                className="w-9 h-9 flex items-center justify-center bg-red-800 text-white hover:bg-red-900 active:scale-90 transition font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Initial Add Button */
            <button
              onClick={handleAdd}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-800 hover:bg-red-900 text-white shadow-red-900/10'
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
                  <span>DODAJ</span>
                </>
              )}
            </button>
          )
        ) : (
          <button
            disabled
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium text-stone-400 bg-stone-100 cursor-not-allowed"
          >
            Chwilowo brak
          </button>
        )}
      </div>
    </div>
  );
};
