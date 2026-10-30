import os
import json
from app import create_app
from app.models import db, Restaurant, Category, MenuItem, AdminUser

def run_seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Create or update default admin
        admin = AdminUser.query.filter_by(username='admin').first()
        if not admin:
            admin = AdminUser(username='admin')
            admin.set_password(os.environ.get('ADMIN_PASSWORD', 'admin123'))
            db.session.add(admin)
            print("Utworzono administratora: admin / admin123")

        # Create Test Burger Rogoźno (spec Section 16 & 17)
        test_burger = Restaurant.query.filter_by(slug='test-burger-rogozno').first()
        if not test_burger:
            test_phone = os.environ.get('TEST_RESTAURANT_PHONE', '+48500123456')
            hours_data = {
                "mon": {"open": "12:00", "close": "22:00", "closed": False},
                "tue": {"open": "12:00", "close": "22:00", "closed": False},
                "wed": {"open": "12:00", "close": "22:00", "closed": False},
                "thu": {"open": "12:00", "close": "22:00", "closed": False},
                "fri": {"open": "12:00", "close": "23:00", "closed": False},
                "sat": {"open": "12:00", "close": "23:00", "closed": False},
                "sun": {"open": "13:00", "close": "21:00", "closed": False}
            }

            test_burger = Restaurant(
                name='Test Burger Rogoźno',
                slug='test-burger-rogozno',
                description='Pyszne rzemieślnicze burgery wołowe, chrupiące dodatki i zimne napoje w Rogoźnie.',
                cuisine_types='Burgery,Frytki,Amerykańska',
                phone=test_phone,
                address='Plac Karola Marcinkowskiego 4',
                city='Rogoźno',
                min_order=30.0,
                delivery_fee=5.0,
                estimated_time='30-45 min',
                has_delivery=True,
                has_takeaway=True,
                is_active=True,
                is_temporary_closed=False,
                opening_hours_json=json.dumps(hours_data)
            )
            db.session.add(test_burger)
            db.session.flush()

            # Categories (Section 17)
            cat_burgers = Category(restaurant_id=test_burger.id, name='Burgery', order=1)
            cat_sides = Category(restaurant_id=test_burger.id, name='Dodatki', order=2)
            cat_drinks = Category(restaurant_id=test_burger.id, name='Napoje', order=3)
            db.session.add_all([cat_burgers, cat_sides, cat_drinks])
            db.session.flush()

            # Items (Section 17)
            items = [
                # Burgery
                MenuItem(restaurant_id=test_burger.id, category_id=cat_burgers.id, name='Classic Burger', description='Wołowina 180 g, cheddar, sałata, pomidor, cebula, sos firmowy', price=29.0),
                MenuItem(restaurant_id=test_burger.id, category_id=cat_burgers.id, name='Cheese Burger', description='Wołowina 180 g, podwójny cheddar, pikle, sos', price=32.0),
                MenuItem(restaurant_id=test_burger.id, category_id=cat_burgers.id, name='Double Burger', description='2x wołowina 180 g, podwójny cheddar, sos BBQ', price=39.0),
                # Dodatki
                MenuItem(restaurant_id=test_burger.id, category_id=cat_sides.id, name='Frytki', description='Złociste, chrupiące frytki z solą', price=12.0),
                MenuItem(restaurant_id=test_burger.id, category_id=cat_sides.id, name='Frytki duże', description='Powiększona porcja frytek', price=16.0),
                MenuItem(restaurant_id=test_burger.id, category_id=cat_sides.id, name='Krążki cebulowe', description='8 sztuk w złocistym cieście', price=14.0),
                # Napoje
                MenuItem(restaurant_id=test_burger.id, category_id=cat_drinks.id, name='Coca-Cola 0,5 l', description='Butelka 0.5 l schłodzona', price=8.0),
                MenuItem(restaurant_id=test_burger.id, category_id=cat_drinks.id, name='Fanta 0,5 l', description='Butelka 0.5 l', price=8.0),
                MenuItem(restaurant_id=test_burger.id, category_id=cat_drinks.id, name='Woda', description='Butelka 0.5 l', price=5.0),
            ]
            db.session.add_all(items)
            print("Zainicjalizowano Test Burger Rogoźno z pełnym menu.")

        db.session.commit()
        print("Baza danych została pomyślnie zainicjalizowana i uzupełniona danymi testowymi!")

if __name__ == '__main__':
    run_seed()
