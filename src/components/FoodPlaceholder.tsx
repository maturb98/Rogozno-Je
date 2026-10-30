import React from 'react';
import { Utensils, Pizza, Beef, Soup, Coffee, Sandwich } from 'lucide-react';

interface FoodPlaceholderProps {
  type?: string;
  name?: string;
  className?: string;
}

export const FoodPlaceholder: React.FC<FoodPlaceholderProps> = ({ type = '', name = '', className = '' }) => {
  const lower = `${type} ${name}`.toLowerCase();

  let Icon = Utensils;
  let bgGradient = 'from-red-900 to-stone-900';
  let accentColor = 'text-red-200';

  if (lower.includes('burger') || lower.includes('wołowina')) {
    Icon = Beef;
    bgGradient = 'from-red-900 via-stone-900 to-amber-950';
    accentColor = 'text-amber-200';
  } else if (lower.includes('pizza') || lower.includes('włoska')) {
    Icon = Pizza;
    bgGradient = 'from-red-800 via-orange-950 to-stone-900';
    accentColor = 'text-red-300';
  } else if (lower.includes('kebab') || lower.includes('rollo') || lower.includes('lawasz')) {
    Icon = Sandwich;
    bgGradient = 'from-amber-900 via-stone-900 to-red-950';
    accentColor = 'text-amber-300';
  } else if (lower.includes('obiad') || lower.includes('schabowy') || lower.includes('zupa') || lower.includes('pierogi')) {
    Icon = Soup;
    bgGradient = 'from-stone-800 via-red-950 to-stone-900';
    accentColor = 'text-red-200';
  } else if (lower.includes('kawiarnia') || lower.includes('deser') || lower.includes('napoje')) {
    Icon = Coffee;
    bgGradient = 'from-stone-900 via-amber-950 to-stone-800';
    accentColor = 'text-amber-100';
  }

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${bgGradient} ${className}`}>
      {/* Decorative culinary background rings */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-white/10 opacity-30" />
      <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full border border-white/10 opacity-20" />
      
      <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center">
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm shadow-inner mb-2 border border-white/10">
          <Icon className={`w-8 h-8 ${accentColor}`} />
        </div>
        {name && (
          <span className="text-xs font-semibold text-white/90 drop-shadow line-clamp-1 max-w-[90%]">
            {name}
          </span>
        )}
      </div>
    </div>
  );
};
