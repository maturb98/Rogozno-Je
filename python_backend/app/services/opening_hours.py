from datetime import datetime

DAYS_MAP = {
    0: 'mon',
    1: 'tue',
    2: 'wed',
    3: 'thu',
    4: 'fri',
    5: 'sat',
    6: 'sun',
}

def get_restaurant_status(restaurant, custom_dt=None):
    """Calculates OTWARTE / ZAMKNIĘTE automatically based on schedule."""
    if not restaurant.is_active:
        return {'is_open': False, 'message': 'Lokal nieaktywny'}
    if restaurant.is_temporary_closed:
        return {'is_open': False, 'message': 'Tymczasowo zamknięte'}

    now = custom_dt or datetime.now()
    day_key = DAYS_MAP[now.weekday()]
    hours = restaurant.hours.get(day_key, {})

    if not hours or hours.get('closed', False):
        return {'is_open': False, 'message': 'Dzisiaj nieczynne'}

    open_str = hours.get('open', '12:00')
    close_str = hours.get('close', '22:00')

    now_minutes = now.hour * 60 + now.minute
    open_h, open_m = map(int, open_str.split(':'))
    close_h, close_m = map(int, close_str.split(':'))

    open_minutes = open_h * 60 + open_m
    close_minutes = close_h * 60 + close_m

    if close_minutes < open_minutes:
        close_minutes += 24 * 60

    if open_minutes <= now_minutes < close_minutes:
        return {'is_open': True, 'message': f"Otwarte do {close_str}"}
    elif now_minutes < open_minutes:
        return {'is_open': False, 'message': f"Zamknięte · otwiera się o {open_str}"}
    else:
        return {'is_open': False, 'message': 'Zamknięte na dzisiaj'}
