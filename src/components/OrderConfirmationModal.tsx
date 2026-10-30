import React, { useState } from 'react';
import { MessageSquare, Phone, Copy, Check, ExternalLink, X, AlertCircle } from 'lucide-react';
import { GeneratedOrderSMS, copyToClipboard } from '../services/smsService';
import { Restaurant } from '../types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  smsData: GeneratedOrderSMS;
  restaurant: Restaurant;
  onOrderCompleted: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  smsData,
  restaurant,
  onOrderCompleted,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(smsData.body);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenSMS = async () => {
    // Proactively copy to clipboard as safety fallback
    await copyToClipboard(smsData.body);
    setCopied(true);

    // Open native sms: URI
    window.location.href = smsData.smsUrl;

    onOrderCompleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-800">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Gotowe zamówienie SMS
              </h3>
              <p className="text-xs text-stone-500">
                Wyślij bezpośrednio do: {restaurant.name} ({restaurant.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice about 0 PLN platform fee */}
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong>Bez prowizji i bez pośredników:</strong> Wiadomość SMS wysyłasz ze swojego telefonu bezpośrednio do restauracji.
          </span>
        </div>

        {/* Long SMS notice if applicable */}
        {smsData.isLongOrder && (
          <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Informacja:</strong> Długie zamówienie ({smsData.charCount} znaków) może zostać wysłane jako {smsData.estimatedSmsParts} wiadomości SMS wg taryfy Twojego operatora.
            </span>
          </div>
        )}

        {/* Prepared SMS Text Box */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Treść przygotowanej wiadomości
            </span>
            <span className="tabular-nums">
              {smsData.charCount} znaków · {smsData.estimatedSmsParts} SMS
            </span>
          </div>
          <div className="p-3.5 bg-stone-900 text-stone-100 rounded-2xl font-mono text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all border border-stone-800">
            {smsData.body}
          </div>
        </div>

        {/* 3-Step Mobile Workflow */}
        <div className="mt-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
          <p className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
            Jak dokończyć zamówienie w 3 krokach:
          </p>
          <div className="flex items-start gap-2 text-stone-600">
            <span className="w-4 h-4 rounded-full bg-red-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Dotknij poniższego przycisku <strong>OTWÓRZ APLIKACJĘ SMS</strong>.</span>
          </div>
          <div className="flex items-start gap-2 text-stone-600">
            <span className="w-4 h-4 rounded-full bg-red-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Twój telefon otworzy Wiadomości z uzupełnionym numerem lokalu i treścią.</span>
          </div>
          <div className="flex items-start gap-2 text-stone-600">
            <span className="w-4 h-4 rounded-full bg-red-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Wystarczy wcisnąć <strong>Wyślij</strong>. Lokal otrzyma SMS bez żadnych prowizji!</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-4 space-y-2.5">
          <button
            onClick={handleOpenSMS}
            className="w-full py-4 px-4 rounded-2xl bg-red-800 hover:bg-red-900 active:scale-[0.98] text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition"
          >
            <MessageSquare className="w-5 h-5" />
            <span>OTWÓRZ APLIKACJĘ SMS</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </button>

          <p className="text-[11px] text-center text-stone-500 leading-tight">
            Numer i treść zostaną uzupełnione automatycznie. W telefonie wystarczy kliknąć <strong>Wyślij</strong>.
          </p>

          {/* Fallback buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleCopy}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Skopiowano treść!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>KOPIUJ ZAMÓWIENIE</span>
                </>
              )}
            </button>

            <a
              href={`tel:${smsData.recipientPhone}`}
              className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="w-4 h-4 text-red-700" />
              <span>ZADZWOŃ DO LOKALU</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
