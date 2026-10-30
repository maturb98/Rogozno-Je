import React from 'react';
import { Search, X, Clock, Car, ShoppingBag, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  onlyOpen: boolean;
  onlyDelivery: boolean;
  onlyTakeaway: boolean;
  selectedCategory: string;
}

interface SearchAndFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: string[];
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onChange,
  categories,
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
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400 pointer-events-none">
          <Search className="w-5 h-5 text-stone-400" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Szukaj restauracji lub dania (np. burger, pizza, schabowy)..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleQueryChange('')}
            className="absolute right-3 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Action Toggle Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={toggleOpen}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition shrink-0 ${
            filters.onlyOpen
              ? 'bg-red-800 text-white border-red-800 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Otwarte teraz</span>
        </button>

        <button
          onClick={toggleDelivery}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition shrink-0 ${
            filters.onlyDelivery
              ? 'bg-red-800 text-white border-red-800 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Dowóz</span>
        </button>

        <button
          onClick={toggleTakeaway}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition shrink-0 ${
            filters.onlyTakeaway
              ? 'bg-red-800 text-white border-red-800 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Odbiór osobisty</span>
        </button>
      </div>

      {/* Horizontal Food Categories Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => selectCategory('Wszystkie')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
            filters.selectedCategory === 'Wszystkie'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
          }`}
        >
          Wszystkie
        </button>
        {categories.map((cat) => {
          const isActive = filters.selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
