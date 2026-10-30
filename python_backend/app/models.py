from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import json

db = SQLAlchemy()

class AdminUser(UserMixin, db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    slug = db.Column(db.String(128), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, default='')
    cuisine_types = db.Column(db.String(256), default='Burgery')  # comma separated
    phone = db.Column(db.String(32), nullable=False)  # Phone for SMS
    address = db.Column(db.String(256), nullable=False)
    city = db.Column(db.String(64), default='Rogoźno')
    image_url = db.Column(db.String(512), default='')
    min_order = db.Column(db.Float, default=30.0)
    delivery_fee = db.Column(db.Float, default=5.0)
    estimated_time = db.Column(db.String(64), default='30-45 min')
    has_delivery = db.Column(db.Boolean, default=True)
    has_takeaway = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    is_temporary_closed = db.Column(db.Boolean, default=false if False else False)
    
    # Opening hours stored as JSON string:
    # {"mon": {"open": "12:00", "close": "22:00", "closed": false}, ...}
    opening_hours_json = db.Column(db.Text, default='{}')

    categories = db.relationship('Category', backref='restaurant', lazy=True, cascade="all, delete-orphan")
    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True, cascade="all, delete-orphan")

    @property
    def hours(self):
        try:
            return json.loads(self.opening_hours_json)
        except Exception:
            return {}

    @hours.setter
    def hours(self, data):
        self.opening_hours_json = json.dumps(data)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    order = db.Column(db.Integer, default=0)

    items = db.relationship('MenuItem', backref='category', lazy=True, cascade="all, delete-orphan")

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, default='')
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(512), default='')
    is_available = db.Column(db.Boolean, default=True)
    is_hidden = db.Column(db.Boolean, default=False)
