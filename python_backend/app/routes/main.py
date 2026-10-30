from flask import Blueprint, render_template, request, jsonify, send_from_directory
from ..models import Restaurant, Category, MenuItem
from ..services.opening_hours import get_restaurant_status
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    query = request.args.get('q', '').strip().lower()
    category_filter = request.args.get('cat', '')
    only_open = request.args.get('open') == '1'
    only_delivery = request.args.get('delivery') == '1'
    only_takeaway = request.args.get('takeaway') == '1'

    restaurants = Restaurant.query.filter_by(is_active=True).all()
    filtered = []

    for r in restaurants:
        st = get_restaurant_status(r)
        if only_open and not st['is_open']:
            continue
        if only_delivery and not r.has_delivery:
            continue
        if only_takeaway and not r.has_takeaway:
            continue

        if query:
            matches_name = query in r.name.lower()
            matches_cuisine = query in r.cuisine_types.lower()
            matches_item = any(
                query in item.name.lower() or query in item.description.lower()
                for item in r.menu_items if not item.is_hidden
            )
            if not (matches_name or matches_cuisine or matches_item):
                continue

        filtered.append({
            'obj': r,
            'status': st,
            'cuisines': [c.strip() for c in r.cuisine_types.split(',') if c.strip()]
        })

    return render_template('index.html', restaurants=filtered, query=query)

@main_bp.route('/restauracja/<slug>')
def restaurant_detail(slug):
    rest = Restaurant.query.filter_by(slug=slug, is_active=True).first_or_404()
    st = get_restaurant_status(rest)
    categories = Category.query.filter_by(restaurant_id=rest.id).order_by(Category.order).all()
    return render_template('restaurant.html', restaurant=rest, status=st, categories=categories)
