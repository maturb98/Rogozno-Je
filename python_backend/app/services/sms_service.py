import re
import urllib.parse

def remove_diacritics(text: str) -> str:
    """Replaces Polish letters with standard ASCII Latin equivalents."""
    mapping = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    }
    for pol, asc in mapping.items():
        text = text.replace(pol, asc)
    return text

def build_order_sms_text(restaurant_name, items, customer_data, delivery_fee=0, is_delivery=True):
    """Generates concise SMS text following the Rogoźno Je standard."""
    lines = []
    lines.append("ROGOZNO JE")
    lines.append("")
    lines.append(remove_diacritics(restaurant_name))
    lines.append("")

    total_products = 0
    for it in items:
        qty = it.get('quantity', 1)
        name = remove_diacritics(it.get('name', ''))
        price = it.get('price', 0) * qty
        total_products += price
        lines.append(f"{qty}x {name} - {int(price)} zl")

    lines.append("")
    if is_delivery:
        lines.append(f"Dostawa: {int(delivery_fee)} zl")
        final_total = total_products + delivery_fee
    else:
        lines.append("Odbior osobisty")
        final_total = total_products

    lines.append(f"RAZEM: {int(final_total)} zl")
    lines.append("")

    if is_delivery:
        lines.append("DOSTAWA")
        lines.append(remove_diacritics(customer_data.get('name', '').strip()))
        lines.append(remove_diacritics(f"{customer_data.get('street', '').strip()} {customer_data.get('building_number', '').strip()}"))
        lines.append(remove_diacritics(customer_data.get('city', 'Rogozno').strip()))
        if customer_data.get('phone'):
            lines.append(f"Tel: {customer_data.get('phone').strip()}")
    else:
        lines.append("ODBIOR OSOBISTY")
        lines.append(remove_diacritics(customer_data.get('name', '').strip()))
        if customer_data.get('phone'):
            lines.append(f"Tel: {customer_data.get('phone').strip()}")

    if customer_data.get('notes'):
        lines.append("")
        lines.append(remove_diacritics(f"Uwagi: {customer_data.get('notes').strip()}"))

    sms_body = "\n".join(lines)
    return sms_body
