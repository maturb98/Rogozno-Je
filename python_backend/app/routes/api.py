from flask import Blueprint, jsonify, request
from ..models import Restaurant, Category, MenuItem
from ..services.sms_service import build_order_sms_text

api_bp = Blueprint('api', __name__)

@api_bp.route('/restaurants', methods=['GET'])
def get_restaurants():
    rests = Restaurant.query.filter_by(is_active=True).all()
    data = []
    for r in rests:
        data.append({
            'id': r.id,
            'name': r.name,
            'slug': r.slug,
            'description': r.description,
            'cuisine_types': r.cuisine_types.split(','),
            'phone': r.phone,
            'address': r.address,
            'min_order': r.min_order,
            'delivery_fee': r.delivery_fee,
            'estimated_time': r.estimated_time,
            'has_delivery': r.has_delivery,
            'has_takeaway': r.has_takeaway,
            'is_temporary_closed': r.is_temporary_closed
        })
    return jsonify(data)

@api_bp.route('/sms-preview', methods=['POST'])
def sms_preview():
    payload = request.json or {}
    restaurant_name = payload.get('restaurant_name', '')
    items = payload.get('items', [])
    customer_data = payload.get('customer', {})
    delivery_fee = payload.get('delivery_fee', 0)
    is_delivery = payload.get('is_delivery', True)

    body = build_order_sms_text(
        restaurant_name=restaurant_name,
        items=items,
        customer_data=customer_data,
        delivery_fee=delivery_fee,
        is_delivery=is_delivery
    )

    return jsonify({
        'body': body,
        'char_count': len(body),
        'is_long': len(body) > 160
    })
