import React from 'react';
import { UtensilsCrossed, ShoppingBag, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  currentView: 'home' | 'restaurant' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenAdmin,
  onOpenCart,
  cartCount = 0,
  currentView,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex flex-row items-center justify-between gap-2">
        {/* Left: Brand Logo & Title in fluid flex-row */}
        <button
          onClick={onGoHome}
          className="flex flex-row items-center gap-2 text-left focus:outline-none shrink-0"
          aria-label="Rogoźno Je - Strona główna"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-700 to-red-900 flex flex-row items-center justify-center text-white shadow-xs shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base sm:text-lg text-red-900 tracking-tight whitespace-nowrap">
            Rogoźno Je
          </span>
        </button>

        {/* Center: Desktop Navigation Links (hidden on mobile, zero impact on 375-430px) */}
        <nav className="hidden md:flex flex-row items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={onGoHome}
            className={`transition hover:text-red-800 ${
              currentView === 'home' ? 'text-red-800 font-bold' : ''
            }`}
          >
            Restauracje
          </button>
          <a
            href="#jak-to-dziala"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                onGoHome();
                setTimeout(() => {
                  document.getElementById('jak-to-dziala')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-red-800 transition"
          >
            Jak to działa?
          </a>
          <button
            onClick={onOpenAdmin}
            className={`hover:text-red-800 transition ${
              currentView === 'admin' ? 'text-red-800 font-bold' : ''
            }`}
          >
            Dla lokali / Admin
          </button>
        </nav>

        {/* Right: Actions in fluid flex-row */}
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 shrink-0">
          {cartCount > 0 && onOpenCart && (
            <button
              onClick={onOpenCart}
              aria-label="Otwórz koszyk"
              className="flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-900 text-white transition active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs font-bold tabular-nums">{cartCount}</span>
            </button>
          )}

          <button
            onClick={onOpenAdmin}
            aria-label="Panel lokalu"
            title="Panel lokalu"
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition flex flex-row items-center justify-center shrink-0 min-h-[36px] min-w-[36px]"
          >
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
