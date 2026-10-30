import React from 'react';
import { Search, X, Clock, Car, ShoppingBag, Sparkles } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  onlyOpen: boolean;
  onlyDelivery: boolean;
  onlyTakeaway: boolean;
  selectedCategory: string;
}

interface CategoryMeta {
  name: string;
  icon: string;
}

const CATEGORIES_WITH_ICONS: CategoryMeta[] = [
  { name: 'Wszystkie', icon: '🍽️' },
  { name: 'Burgery', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Kebab', icon: '🥙' },
  { name: 'Obiady', icon: '🍲' },
  { name: 'Pierogi', icon: '🥟' },
  { name: 'Kurczak', icon: '🍗' },
  { name: 'Azjatyckie', icon: '🥢' },
  { name: 'Desery', icon: '🍰' },
  { name: 'Kawiarnie', icon: '☕' },
];

interface SearchAndFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: string[];
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onChange,
}) => {
  const handleQueryChange = (val: string) => {
    onChange({ ...filters, searchQuery: val });
  };

  const toggleOpen = () => {
    onChange({ ...filters, onlyOpen: !filters.onlyOpen });
  };

  const toggleDelivery = () => {
    onChange({ ...filters, onlyDelivery: !filters.onlyDelivery });
  };

  const toggleTakeaway = () => {
    onChange({ ...filters, onlyTakeaway: !filters.onlyTakeaway });
  };

  const selectCategory = (cat: string) => {
    onChange({ ...filters, selectedCategory: cat });
  };

  return (
    <div className="space-y-3.5">
      {/* Mobile-Optimized Search Input Bar */}
      <div className="relative flex items-center shadow-xs">
        <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center">
          <Search className="w-5 h-5 text-stone-400" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Szukaj restauracji lub dania (np. burger, pizza, schabowy)..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-stone-200/90 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleQueryChange('')}
            aria-label="Wyczyść szukanie"
            className="absolute right-3 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Action Toggle Chips (Touch Targets >= 44px) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={toggleOpen}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0 min-h-[38px] active:scale-95 ${
            filters.onlyOpen
              ? 'bg-red-800 text-white border-red-800 shadow-sm'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Otwarte teraz</span>
        </button>

        <button
          onClick={toggleDelivery}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0 min-h-[38px] active:scale-95 ${
            filters.onlyDelivery
              ? 'bg-red-800 text-white border-red-800 shadow-sm'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Dowóz</span>
        </button>

        <button
          onClick={toggleTakeaway}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0 min-h-[38px] active:scale-95 ${
            filters.onlyTakeaway
              ? 'bg-red-800 text-white border-red-800 shadow-sm'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Odbiór osobisty</span>
        </button>
      </div>

      {/* Horizontal Food Categories Bar with App Icon Aesthetics */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES_WITH_ICONS.map((cat) => {
          const isActive = filters.selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => selectCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shrink-0 min-h-[40px] active:scale-95 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
