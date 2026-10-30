from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from ..models import db, Restaurant, Category, MenuItem, AdminUser
import json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))

    if request.method === 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = AdminUser.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('admin.dashboard'))
        flash('Nieprawidłowy login lub hasło.', 'error')

    return render_template('admin/login.html')

@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('admin.login'))

@admin_bp.route('/')
@login_required
def dashboard():
    restaurants = Restaurant.query.all()
    return render_template('admin/dashboard.html', restaurants=restaurants)

@admin_bp.route('/restaurants/new', methods=['GET', 'POST'])
@login_required
def new_restaurant():
    if request.method == 'POST':
        name = request.form.get('name')
        slug = request.form.get('slug')
        phone = request.form.get('phone')
        address = request.form.get('address')
        min_order = float(request.form.get('min_order', 30))
        delivery_fee = float(request.form.get('delivery_fee', 5))

        rest = Restaurant(
            name=name,
            slug=slug,
            phone=phone,
            address=address,
            min_order=min_order,
            delivery_fee=delivery_fee,
            has_delivery='has_delivery' in request.form,
            has_takeaway='has_takeaway' in request.form,
            is_active=True
        )
        db.session.add(rest)
        db.session.commit()
        flash('Dodano nową restaurację!', 'success')
        return redirect(url_for('admin.dashboard'))

    return render_template('admin/restaurant_form.html', restaurant=None)

@admin_bp.route('/restaurants/<int:id>/toggle-active', methods=['POST'])
@login_required
def toggle_active(id):
    rest = Restaurant.query.get_or_404(id)
    rest.is_active = not rest.is_active
    db.session.commit()
    flash('Zaktualizowano status restauracji.', 'info')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/restaurants/<int:id>/toggle-closed', methods=['POST'])
@login_required
def toggle_closed(id):
    rest = Restaurant.query.get_or_404(id)
    rest.is_temporary_closed = not rest.is_temporary_closed
    db.session.commit()
    flash('Zmieniono status tymczasowego zamknięcia.', 'info')
    return redirect(url_for('admin.dashboard'))
