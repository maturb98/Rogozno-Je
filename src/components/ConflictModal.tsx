import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  currentRestaurantName: string;
  newRestaurantName: string;
  onCancel: () => void;
  onConfirmClearAndAdd: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  currentRestaurantName,
  newRestaurantName,
  onCancel,
  onConfirmClearAndAdd,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              Inna restauracja w koszyku
            </h3>
            <p className="text-xs text-stone-500">
              Każde zamówienie SMS wysyłane jest do jednego lokalu
            </p>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed my-4">
          Masz już produkty z lokalu <strong className="text-stone-900">{currentRestaurantName}</strong>. 
          Czy chcesz wyczyścić dotychczasowy koszyk i rozpocząć nowe zamówienie w <strong className="text-stone-900">{newRestaurantName}</strong>?
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>ANULUJ</span>
          </button>

          <button
            onClick={onConfirmClearAndAdd}
            className="w-full py-3 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>WYCZYŚĆ I KONTYNUUJ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
