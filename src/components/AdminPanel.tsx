import React, { useState } from 'react';
import { ArrowLeft, Lock, LogOut, Plus, Edit2, Trash2, Eye, EyeOff, Check, X, RotateCcw, AlertTriangle, ShieldCheck, Phone, Clock, DollarSign, Store } from 'lucide-react';
import { Category, MenuItem, Restaurant } from '../types';
import { storage } from '../services/storage';

interface AdminPanelProps {
  restaurants: Restaurant[];
  categories: Category[];
  menuItems: MenuItem[];
  onBack: () => void;
  onUpdateRestaurants: (restaurants: Restaurant[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateMenuItems: (items: MenuItem[]) => void;
  onResetData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  restaurants,
  categories,
  menuItems,
  onBack,
  onUpdateRestaurants,
  onUpdateCategories,
  onUpdateMenuItems,
  onResetData,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(storage.isAdminLoggedIn());
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Selected restaurant for menu management
  const [selectedRestId, setSelectedRestId] = useState<string>(restaurants[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menu'>('restaurants');

  // Edit / Add modal states
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin password 'admin123'
    if (passwordInput === 'admin123' || passwordInput === 'admin') {
      storage.setAdminLoggedIn(true);
      setIsLoggedIn(true);
      setAuthError('');
    } else {
      setAuthError('Nieprawidłowe hasło administratora (domyślne: admin123)');
    }
  };

  const handleLogout = () => {
    storage.setAdminLoggedIn(false);
    setIsLoggedIn(false);
  };

  // Restaurant Handlers
  const handleToggleActive = (restId: string) => {
    const updated = restaurants.map((r) =>
      r.id === restId ? { ...r, isActive: !r.isActive } : r
    );
    onUpdateRestaurants(updated);
    showToast('Zaktualizowano status lokalu');
  };

  const handleToggleTempClosed = (restId: string) => {
    const updated = restaurants.map((r) =>
      r.id === restId ? { ...r, isTemporaryClosed: !r.isTemporaryClosed } : r
    );
    onUpdateRestaurants(updated);
    showToast('Zmieniono status tymczasowego zamknięcia');
  };

  const handleSaveRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;

    let updated: Restaurant[];
    if (restaurants.some((r) => r.id === editingRestaurant.id)) {
      updated = restaurants.map((r) =>
        r.id === editingRestaurant.id ? editingRestaurant : r
      );
      showToast('Zapisano zmiany restauracji');
    } else {
      updated = [...restaurants, editingRestaurant];
      showToast('Dodano nową restaurację');
    }
    onUpdateRestaurants(updated);
    setEditingRestaurant(null);
  };

  // Menu Item Handlers
  const handleToggleItemAvailable = (itemId: string) => {
    const updated = menuItems.map((item) =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    onUpdateMenuItems(updated);
    showToast('Zmieniono dostępność produktu');
  };

  const handleToggleItemHidden = (itemId: string) => {
    const updated = menuItems.map((item) =>
      item.id === itemId ? { ...item, isHidden: !item.isHidden } : item
    );
    onUpdateMenuItems(updated);
    showToast('Zmieniono widoczność produktu');
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę pozycję z menu?')) {
      const updated = menuItems.filter((i) => i.id !== itemId);
      onUpdateMenuItems(updated);
      showToast('Usunięto pozycję z menu');
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: MenuItem[];
    if (menuItems.some((i) => i.id === editingItem.id)) {
      updated = menuItems.map((i) => (i.id === editingItem.id ? editingItem : i));
      showToast('Zapisano produkt');
    } else {
      updated = [...menuItems, editingItem];
      showToast('Dodano nowy produkt do menu');
    }
    onUpdateMenuItems(updated);
    setEditingItem(null);
  };

  // Category Add
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      restaurantId: selectedRestId,
      name: newCategoryName.trim(),
      order: categories.length + 1,
    };
    onUpdateCategories([...categories, newCat]);
    setNewCategoryName('');
    showToast('Dodano nową kategorię');
  };

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];
  const restaurantCategories = categories.filter((c) => c.restaurantId === selectedRestId);
  const restaurantItems = menuItems.filter((i) => i.restaurantId === selectedRestId);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wróć do strony głównej</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl text-stone-900">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Panel Administracyjny</h2>
          <p className="text-xs text-stone-500 mt-1">
            Zarządzaj restauracjami, numerami telefonów SMS, godzinami i menu dla Rogoźno Je.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Hasło administratora
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Wpisz hasło (domyślne: admin123)"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-rose-600 mt-1.5">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-sm shadow-sm transition"
            >
              Zaloguj do panelu
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400">
              Wersja developerska · Domyślne hasło: <strong>admin123</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wróć do serwisu Rogoźno Je</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-800" />
            <span>Panel Zarządzania Rogoźno Je</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz przywrócić początkowe dane restauracji i menu?')) {
                onResetData();
                showToast('Przywrócono dane początkowe');
              }
            }}
            className="px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetuj dane</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Wyloguj</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
            activeTab === 'restaurants'
              ? 'bg-red-800 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Restauracje ({restaurants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
            activeTab === 'menu'
              ? 'bg-red-800 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Menu i Ceny ({menuItems.length})</span>
        </button>
      </div>

      {/* TAB 1: RESTAURANTS */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              Lokale w mieście Rogoźno
            </h2>
            <button
              onClick={() => {
                setEditingRestaurant({
                  id: `rest-${Date.now()}`,
                  name: '',
                  slug: '',
                  description: '',
                  cuisineTypes: ['Burgery'],
                  phone: '+48 500 000 000',
                  address: 'ul. Wielka Poznańska 1',
                  city: 'Rogoźno',
                  imageUrl: '',
                  minOrder: 30,
                  deliveryFee: 5,
                  estimatedTime: '30-40 min',
                  hasDelivery: true,
                  hasTakeaway: true,
                  isActive: true,
                  isTemporaryClosed: false,
                  openingHours: {
                    mon: { open: '12:00', close: '22:00', closed: false },
                    tue: { open: '12:00', close: '22:00', closed: false },
                    wed: { open: '12:00', close: '22:00', closed: false },
                    thu: { open: '12:00', close: '22:00', closed: false },
                    fri: { open: '12:00', close: '23:00', closed: false },
                    sat: { open: '12:00', close: '23:00', closed: false },
                    sun: { open: '13:00', close: '21:00', closed: false },
                  },
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj restaurację</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">{rest.name}</h3>
                      <p className="text-xs text-stone-500">{rest.address}, {rest.city}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActive(rest.id)}
                        title={rest.isActive ? 'Wyłącz lokal' : 'Włącz lokal'}
                        className={`p-1.5 rounded-lg text-xs font-bold transition ${
                          rest.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rest.isActive ? 'Aktywna' : 'Nieaktywna'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Numer do SMS:</span>
                      <span className="font-bold text-stone-900">{rest.phone}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Min. zamówienie:</span>
                      <span className="font-bold text-stone-900">{rest.minOrder} zł</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Koszt dostawy:</span>
                      <span className="font-bold text-stone-900">{rest.deliveryFee} zł</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Opcje:</span>
                      <span className="font-bold text-stone-900">
                        {rest.hasDelivery ? 'Dowóz' : ''}{' '}
                        {rest.hasTakeaway ? '· Odbiór' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleTempClosed(rest.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
                      rest.isTemporaryClosed
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {rest.isTemporaryClosed ? 'Tymczasowo zamknięte (aktywne)' : 'Ustaw: Tymczasowo zamknięte'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRestId(rest.id);
                        setActiveTab('menu');
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-800 hover:bg-red-100 font-semibold transition"
                    >
                      Menu lokalu
                    </button>
                    <button
                      onClick={() => setEditingRestaurant(rest)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MENU & PRICES */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Restaurant picker */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase">Restauracja:</span>
              <select
                value={selectedRestId}
                onChange={(e) => setSelectedRestId(e.target.value)}
                className="px-3 py-1.5 text-sm font-bold text-stone-900 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingItem({
                    id: `item-${Date.now()}`,
                    restaurantId: selectedRestId,
                    categoryId: restaurantCategories[0]?.id || '',
                    name: '',
                    description: '',
                    price: 25.0,
                    imageUrl: '',
                    isAvailable: true,
                    isHidden: false,
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj danie</span>
              </button>
            </div>
          </div>

          {/* Add Category row */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nowa kategoria (np. Desery, Dodatki)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none"
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
            >
              Dodaj kategorię
            </button>
          </div>

          {/* Items list */}
          <div className="space-y-3">
            {restaurantItems.map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                      {cat && (
                        <span className="text-[11px] text-stone-400 font-medium">
                          ({cat.name})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <span className="text-sm font-extrabold text-stone-900 tabular-nums block mt-1">
                      {item.price.toFixed(2)} zł
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleItemAvailable(item.id)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {item.isAvailable ? 'Dostępny' : 'Chwilowo niedostępny'}
                    </button>

                    <button
                      onClick={() => handleToggleItemHidden(item.id)}
                      title={item.isHidden ? 'Pokaż w menu' : 'Ukryj w menu'}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                    >
                      {item.isHidden ? <EyeOff className="w-4 h-4 text-stone-400" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {editingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold">Edycja restauracji</h3>
              <button
                onClick={() => setEditingRestaurant(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nazwa restauracji</label>
                <input
                  type="text"
                  value={editingRestaurant.name}
                  onChange={(e) =>
                    setEditingRestaurant({ ...editingRestaurant, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Numer telefonu do odbioru SMS *
                </label>
                <input
                  type="text"
                  value={editingRestaurant.phone}
                  onChange={(e) =>
                    setEditingRestaurant({ ...editingRestaurant, phone: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
                />
                <span className="text-[10px] text-stone-400">
                  Na ten numer klienci będą wysyłać SMS-y z zamówieniem.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Adres (ulica i nr)</label>
                  <input
                    type="text"
                    value={editingRestaurant.address}
                    onChange={(e) =>
                      setEditingRestaurant({ ...editingRestaurant, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Miejscowość</label>
                  <input
                    type="text"
                    value={editingRestaurant.city}
                    onChange={(e) =>
                      setEditingRestaurant({ ...editingRestaurant, city: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min. zamówienie (zł)</label>
                  <input
                    type="number"
                    value={editingRestaurant.minOrder}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        minOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Koszt dostawy (zł)</label>
                  <input
                    type="number"
                    value={editingRestaurant.deliveryFee}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        deliveryFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Czas (np. 30-45 min)</label>
                  <input
                    type="text"
                    value={editingRestaurant.estimatedTime}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        estimatedTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Opis lokalu</label>
                <textarea
                  value={editingRestaurant.description}
                  onChange={(e) =>
                    setEditingRestaurant({
                      ...editingRestaurant,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.hasDelivery}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        hasDelivery: e.target.checked,
                      })
                    }
                    className="rounded text-red-700"
                  />
                  <span className="font-semibold">Oferuje dowóz</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.hasTakeaway}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        hasTakeaway: e.target.checked,
                      })
                    }
                    className="rounded text-red-700"
                  />
                  <span className="font-semibold">Oferuje odbiór</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRestaurant(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-800 text-white font-semibold hover:bg-red-900 transition"
                >
                  Zapisz restaurację
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold">Edycja dania w menu</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nazwa produktu</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                  placeholder="np. Classic Burger"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Cena (zł)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategoria</label>
                  <select
                    value={editingItem.categoryId}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    {restaurantCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Opis składników</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  rows={2}
                  placeholder="np. Wołowina 180 g, cheddar, sałata, pomidor..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isAvailable: e.target.checked })
                    }
                    className="rounded text-red-700"
                  />
                  <span className="font-semibold">Produkt dostępny</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isHidden}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isHidden: e.target.checked })
                    }
                    className="rounded text-red-700"
                  />
                  <span className="font-semibold">Ukryj w menu</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-800 text-white font-semibold hover:bg-red-900 transition"
                >
                  Zapisz produkt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
