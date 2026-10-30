import { CartItem, CustomerOrderData, Restaurant } from '../types';

/**
 * Normalizes Polish diacritics to pure ASCII 7-bit characters
 * to keep SMS length within standard 160-char GSM limits
 * and prevent carrier truncation or multi-part SMS fees.
 */
export function removeDiacritics(text: string): string {
  const map: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
    Ą: 'A',
    Ć: 'C',
    Ę: 'E',
    Ł: 'L',
    Ń: 'N',
    Ó: 'O',
    Ś: 'S',
    Ź: 'Z',
    Ż: 'Z',
  };
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => map[char] || char);
}

export interface GeneratedOrderSMS {
  body: string;
  smsUrl: string;
  charCount: number;
  estimatedSmsParts: number;
  isLongOrder: boolean;
  recipientPhone: string;
}

export function generateOrderSMS(
  restaurant: Restaurant,
  items: CartItem[],
  customer: CustomerOrderData,
  totalItemsPrice: number,
  deliveryFee: number,
  finalPrice: number,
  normalizeToAscii = true
): GeneratedOrderSMS {
  const lines: string[] = [];

  lines.push('ROGOZNO JE');
  lines.push('');
  lines.push(normalizeToAscii ? removeDiacritics(restaurant.name) : restaurant.name);
  lines.push('');

  // Items list
  items.forEach((cartItem) => {
    const rawName = `${cartItem.quantity}x ${cartItem.item.name} - ${Math.round(cartItem.item.price * cartItem.quantity)} zl`;
    lines.push(normalizeToAscii ? removeDiacritics(rawName) : rawName);
  });

  lines.push('');
  if (customer.deliveryType === 'delivery') {
    lines.push(`Dostawa: ${Math.round(deliveryFee)} zl`);
  } else {
    lines.push('Odbior osobisty');
  }
  lines.push(`RAZEM: ${Math.round(finalPrice)} zl`);
  lines.push('');

  if (customer.deliveryType === 'delivery') {
    lines.push('DOSTAWA');
    const nameLine = customer.name.trim();
    lines.push(normalizeToAscii ? removeDiacritics(nameLine) : nameLine);

    const addressLine = `${customer.street.trim()} ${customer.buildingNumber.trim()}`.trim();
    lines.push(normalizeToAscii ? removeDiacritics(addressLine) : addressLine);

    const cityLine = (customer.city || 'Rogozno').trim();
    lines.push(normalizeToAscii ? removeDiacritics(cityLine) : cityLine);

    if (customer.phone.trim()) {
      lines.push(`Tel: ${customer.phone.trim()}`);
    }
  } else {
    lines.push('ODBIOR OSOBISTY');
    const nameLine = customer.name.trim();
    lines.push(normalizeToAscii ? removeDiacritics(nameLine) : nameLine);
    if (customer.phone.trim()) {
      lines.push(`Tel: ${customer.phone.trim()}`);
    }
  }

  if (customer.notes && customer.notes.trim()) {
    lines.push('');
    const rawNotes = `Uwagi: ${customer.notes.trim()}`;
    lines.push(normalizeToAscii ? removeDiacritics(rawNotes) : rawNotes);
  }

  const smsText = lines.join('\n');
  const charCount = smsText.length;

  // In 7-bit GSM: 160 chars for 1 part, 153 chars per part if multi-part
  const estimatedSmsParts = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
  const isLongOrder = estimatedSmsParts > 1;

  // Clean phone number (strip spaces, dashes, brackets)
  const cleanPhone = restaurant.phone.replace(/[^0-9+]/g, '');

  // Detect iOS Safari vs Android Chrome for sms: URI protocol
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent || '');

  // RFC standard specifies '?', but iOS WebKit historically expects '&'
  const separator = isIOS ? '&' : '?';
  const encodedBody = encodeURIComponent(smsText);
  const smsUrl = `sms:${cleanPhone}${separator}body=${encodedBody}`;

  return {
    body: smsText,
    smsUrl,
    charCount,
    estimatedSmsParts,
    isLongOrder,
    recipientPhone: cleanPhone,
  };
}

/**
 * Copies text to user clipboard with safe fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.warn('Could not copy to clipboard:', err);
    return false;
  }
}
