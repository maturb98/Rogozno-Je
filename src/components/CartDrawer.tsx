import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Car, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { CartItem, CustomerOrderData, DeliveryType, Restaurant } from '../types';
import { generateOrderSMS, GeneratedOrderSMS } from '../services/smsService';
import { storage } from '../services/storage';
import { OrderConfirmationModal } from './OrderConfirmationModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  restaurant: Restaurant | null;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  restaurant,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [city, setCity] = useState('Rogoźno');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [smsData, setSmsData] = useState<GeneratedOrderSMS | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load saved customer data on mount
  useEffect(() => {
    const saved = storage.getCustomerData();
    if (saved.name) setName(saved.name);
    if (saved.phone) setPhone(saved.phone);
    if (saved.street) setStreet(saved.street);
    if (saved.buildingNumber) setBuildingNumber(saved.buildingNumber);
    if (saved.city) setCity(saved.city || 'Rogoźno');
    if (saved.notes) setNotes(saved.notes);
  }, []);

  // Update default delivery type if restaurant only offers one
  useEffect(() => {
    if (restaurant) {
      if (!restaurant.hasDelivery && restaurant.hasTakeaway) {
        setDeliveryType('takeaway');
      } else if (restaurant.hasDelivery && !restaurant.hasTakeaway) {
        setDeliveryType('delivery');
      }
    }
  }, [restaurant]);

  if (!isOpen) return null;

  const itemsTotal = items.reduce(
    (sum, cur) => sum + cur.item.price * cur.quantity,
    0
  );

  const deliveryFee =
    deliveryType === 'delivery' && restaurant
      ? restaurant.freeDeliveryThreshold && itemsTotal >= restaurant.freeDeliveryThreshold
        ? 0
        : restaurant.deliveryFee
      : 0;

  const finalTotal = itemsTotal + deliveryFee;

  const minOrder = restaurant?.minOrder || 0;
  const isMinOrderReached = itemsTotal >= minOrder;
  const missingAmount = Math.max(0, minOrder - itemsTotal);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Wpisz swoje imię';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      errors.phone = 'Wpisz poprawny numer telefonu (min. 9 cyfr)';
    }

    if (deliveryType === 'delivery') {
      if (!street.trim()) {
        errors.street = 'Podaj ulicę';
      }
      if (!buildingNumber.trim()) {
        errors.buildingNumber = 'Podaj nr domu / lokalu';
      }
      if (!city.trim()) {
        errors.city = 'Podaj miejscowość';
      }
    }

    if (!isMinOrderReached) {
      errors.minOrder = `Minimalne zamówienie w tym lokalu wynosi ${minOrder} zł`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateSMS = () => {
    if (!restaurant) return;
    if (!validate()) return;

    const customerData: CustomerOrderData = {
      deliveryType,
      name,
      phone,
      street,
      buildingNumber,
      city,
      notes,
    };

    // Save client info locally for seamless future orders
    storage.saveCustomerData(customerData);

    const generated = generateOrderSMS(
      restaurant,
      items,
      customerData,
      itemsTotal,
      deliveryFee,
      finalTotal,
      true
    );

    setSmsData(generated);
    setShowConfirmModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl text-stone-900 overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-800" />
                <span>Twój koszyk</span>
              </h2>
              {restaurant && (
                <p className="text-xs text-stone-500 font-medium">
                  {restaurant.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800">
                  Twój koszyk jest pusty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Przejdź do menu restauracji i dodaj ulubione dania, aby przygotować zamówienie SMS.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Przeglądaj restauracje
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
                    <span>Wybrane dania ({items.reduce((s, c) => s + c.quantity, 0)})</span>
                    <button
                      onClick={onClearCart}
                      className="text-stone-400 hover:text-rose-600 transition flex items-center gap-1 font-normal capitalize"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Wyczyść
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100 bg-stone-50/60 rounded-2xl border border-stone-200/80 p-2">
                    {items.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="py-3 px-2 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-stone-900 truncate">
                            {cartItem.item.name}
                          </p>
                          <p className="text-xs text-stone-500 tabular-nums">
                            {cartItem.item.price.toFixed(2)} zł / szt.
                          </p>
                        </div>

                        {/* Quantity Adjuster */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-white rounded-xl border border-stone-200 shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(cartItem.item.id, -1)}
                              aria-label="Zmniejsz ilość"
                              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-red-800 active:scale-95 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold tabular-nums">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                              aria-label="Zwiększ ilość"
                              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-red-800 active:scale-95 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="w-16 text-right font-bold text-stone-900 text-sm tabular-nums">
                            {(cartItem.item.price * cartItem.quantity).toFixed(2)} zł
                          </span>

                          <button
                            onClick={() => onRemoveItem(cartItem.item.id)}
                            aria-label="Usuń pozycję"
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Mode Selector */}
                {restaurant && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Sposób odbioru
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {restaurant.hasDelivery && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                            deliveryType === 'delivery'
                              ? 'bg-red-800 text-white border-red-800 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <Car className="w-4 h-4" />
                          <span>🚗 DOSTAWA</span>
                        </button>
                      )}

                      {restaurant.hasTakeaway && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType('takeaway')}
                          className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                            deliveryType === 'takeaway'
                              ? 'bg-red-800 text-white border-red-800 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>🛍 ODBIÓR</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Information Form */}
                <div className="space-y-3.5 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Dane do zamówienia
                    </h3>
                    <span className="text-[11px] text-stone-400">Bez logowania</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Twoje imię *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                        }}
                        placeholder="np. Jan"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                      />
                      {formErrors.name && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Numer telefonu *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                        }}
                        placeholder="np. 500 123 456"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address fields (only shown for delivery) */}
                  {deliveryType === 'delivery' && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Ulica *
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => {
                              setStreet(e.target.value);
                              if (formErrors.street) setFormErrors({ ...formErrors, street: '' });
                            }}
                            placeholder="np. Wielka Poznańska"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                          />
                          {formErrors.street && (
                            <p className="text-[11px] text-rose-600 mt-1">{formErrors.street}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Nr domu/m. *
                          </label>
                          <input
                            type="text"
                            value={buildingNumber}
                            onChange={(e) => {
                              setBuildingNumber(e.target.value);
                              if (formErrors.buildingNumber)
                                setFormErrors({ ...formErrors, buildingNumber: '' });
                            }}
                            placeholder="15/2"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                          />
                          {formErrors.buildingNumber && (
                            <p className="text-[11px] text-rose-600 mt-1">{formErrors.buildingNumber}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Miejscowość *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Rogoźno"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Uwagi do zamówienia (opcjonalnie)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="np. burger bez cebuli, sos czosnkowy, domofon 12"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                    />
                  </div>
                </div>

                {/* Minimal order threshold warning */}
                {!isMinOrderReached && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Minimalna kwota zamówienia to <strong>{minOrder} zł</strong>. Brakuje jeszcze <strong>{missingAmount.toFixed(2)} zł</strong>.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer Summary & Main SMS CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3.5 pb-safe">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Produkty:</span>
                  <span className="font-semibold text-stone-800 tabular-nums">
                    {itemsTotal.toFixed(2)} zł
                  </span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Dostawa:</span>
                    <span className="font-semibold text-stone-800 tabular-nums">
                      {deliveryFee === 0 ? 'Gratis' : `${deliveryFee.toFixed(2)} zł`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1.5 border-t border-stone-100">
                  <span>RAZEM:</span>
                  <span className="tabular-nums text-red-900">
                    {finalTotal.toFixed(2)} zł
                  </span>
                </div>
              </div>

              {/* Order by SMS Button */}
              <button
                onClick={handleGenerateSMS}
                disabled={!isMinOrderReached}
                className={`w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] ${
                  isMinOrderReached
                    ? 'bg-red-800 hover:bg-red-900 shadow-red-900/20'
                    : 'bg-stone-300 cursor-not-allowed shadow-none'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>ZAMÓW PRZEZ SMS</span>
                <ArrowRight className="w-4 h-4 opacity-75" />
              </button>

              <p className="text-[10px] text-center text-stone-400">
                Wysyłka bez opłat pośrednika · SMS wysyłasz ze swojego telefonu
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal once SMS is generated */}
      {showConfirmModal && smsData && restaurant && (
        <OrderConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          smsData={smsData}
          restaurant={restaurant}
          onOrderCompleted={() => {
            setShowConfirmModal(false);
            onClearCart();
            onClose();
          }}
        />
      )}
    </>
  );
};
