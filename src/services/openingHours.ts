import { DayOfWeek, Restaurant, RestaurantStatus } from '../types';

const DAYS_MAP: Record<number, DayOfWeek> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const DAY_LABELS_PL: Record<DayOfWeek, string> = {
  mon: 'Poniedziałek',
  tue: 'Wtorek',
  wed: 'Środa',
  thu: 'Czwartek',
  fri: 'Piątek',
  sat: 'Sobota',
  sun: 'Niedziela',
};

export function getRestaurantStatus(restaurant: Restaurant, customDate?: Date): RestaurantStatus {
  if (!restaurant.isActive) {
    return {
      isOpen: false,
      isTemporaryClosed: true,
      message: 'Lokal nieaktywny',
    };
  }

  if (restaurant.isTemporaryClosed) {
    return {
      isOpen: false,
      isTemporaryClosed: true,
      message: 'Tymczasowo zamknięte',
    };
  }

  const now = customDate || new Date();
  const currentDayIndex = now.getDay();
  const dayKey = DAYS_MAP[currentDayIndex];
  const daySchedule = restaurant.openingHours?.[dayKey];

  if (!daySchedule || daySchedule.closed) {
    return {
      isOpen: false,
      isTemporaryClosed: false,
      message: 'Dzisiaj nieczynne',
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = daySchedule.open.split(':').map(Number);
  const [closeH, closeM] = daySchedule.close.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  // Handle midnight closing (e.g. 01:00 next day)
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
  }

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      isTemporaryClosed: false,
      message: `Otwarte do ${daySchedule.close}`,
    };
  }

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      isTemporaryClosed: false,
      message: `Zamknięte · otwiera się o ${daySchedule.open}`,
      nextOpenTime: daySchedule.open,
    };
  }

  return {
    isOpen: false,
    isTemporaryClosed: false,
    message: 'Zamknięte na dzisiaj',
  };
}

export function formatOpeningSchedule(restaurant: Restaurant): { day: string; hours: string; isToday: boolean }[] {
  const currentDayKey = DAYS_MAP[new Date().getDay()];
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return days.map((day) => {
    const config = restaurant.openingHours?.[day];
    const isToday = day === currentDayKey;
    const hours = !config || config.closed ? 'Zamknięte' : `${config.open} – ${config.close}`;
    return {
      day: DAY_LABELS_PL[day],
      hours,
      isToday,
    };
  });
}
