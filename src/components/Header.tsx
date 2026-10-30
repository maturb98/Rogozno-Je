import React from 'react';
import { UtensilsCrossed, ShieldAlert, ShoppingBag } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-white shadow-md shadow-red-900/20 group-hover:scale-105 transition-transform shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-red-900 leading-tight">
              Rogoźno Je
            </span>
            <span className="text-[11px] font-semibold text-stone-500 leading-none">
              Co dzisiaj zamawiamy?
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={onGoHome}
            className={`transition hover:text-red-800 ${currentView === 'home' ? 'text-red-800 font-semibold' : ''}`}
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
            className={`hover:text-red-800 transition flex items-center gap-1 ${currentView === 'admin' ? 'text-red-800 font-semibold' : ''}`}
          >
            Panel restauratora
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          {/* Quick Cart button if on desktop or has items */}
          {cartCount > 0 && onOpenCart && (
            <button
              onClick={onOpenCart}
              aria-label="Otwórz koszyk"
              className="relative p-2 rounded-xl bg-red-50 text-red-800 hover:bg-red-100 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow">
                {cartCount}
              </span>
            </button>
          )}

          {/* Admin Icon button for mobile */}
          <button
            onClick={onOpenAdmin}
            aria-label="Panel administratora"
            title="Panel administratora"
            className="md:hidden p-2 text-stone-500 hover:text-red-800 hover:bg-stone-100 rounded-xl transition min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
