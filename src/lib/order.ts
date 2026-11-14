export const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const waLink = (phone: string, message: string) => {
  const digits = digitsOnly(phone);
  const normalized = digits.startsWith('967') ? digits : `967${digits.replace(/^0+/, '')}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

export const productCode = (id: string) => `EW-${id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`;

export const buildOrderMessage = ({
  storeName,
  productName,
  quantity,
  code,
}: {
  storeName: string;
  productName: string;
  quantity: number;
  code: string;
}) =>
  `أهلاً معرض ${storeName}، أنا جيتكم من موقع إيوان وبطلب هذي القطعة: (${productName})، بكمية: (${quantity})، والي رقمها: (#${code}).`;

export const buildChatMessage = (targetName: string) =>
  `أهلاً ${targetName}، أنا تواصلت معكم من موقع إيوان وأرغب في الاستفسار عن خدماتكم.`;

export interface OrderDetails {
  kind: 'order' | 'custom';
  productName: string;
  productCode: string;
  quantity: number;
  storeName: string;
  storeId?: string;
  price: number;
  customerName: string;
  phone: string;
  date: string;
  address?: string;
  paymentMethod?: string;
  paymentLabel?: string;
  remittanceNumber?: string;
  customerEmail?: string;
  userId?: string;
}

export const serializeOrderDetails = (details: OrderDetails) => JSON.stringify(details);

export const parseOrderDetails = (value: string, fallbackPhone = '', fallbackName = ''): OrderDetails => {
  if (!value) {
    return {
      kind: 'order',
      productName: 'طلب أثاث منزلي',
      productCode: 'EW-ORD-01',
      quantity: 1,
      storeName: 'معارض إيوان المعتمدة',
      price: 250000,
      customerName: fallbackName || 'عميل إيوان',
      phone: fallbackPhone || '777000000',
      date: new Date().toISOString(),
      paymentMethod: 'الدفع عند الاستلام (بعد المعاينة)',
      paymentLabel: 'عند الاستلام',
    };
  }

  // 1. إذا كان الكائن محفوظاً بصيغة JSON
  if (value.trim().startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        const record = parsed as Record<string, unknown>;
        const payment = String(record.paymentMethod ?? 'الدفع عند الاستلام (بعد المعاينة)');
        return {
          kind: record.kind === 'custom' ? 'custom' : 'order',
          productName: String(record.productName || record.title || 'طقم أثاث منزلي راقٍ'),
          productCode: String(record.productCode || record.code || 'EW-967-MK'),
          quantity: Number(record.quantity || 1),
          storeName: String(record.storeName || 'معرض أرض حمير للأثاث'),
          storeId: record.storeId ? String(record.storeId) : undefined,
          price: Number(record.price || 0),
          customerName: String(record.customerName || fallbackName || 'عميل إيوان'),
          phone: String(record.phone || fallbackPhone || ''),
          date: String(record.date || new Date().toISOString()),
          address: record.address ? String(record.address) : 'المكلا — حضرموت',
          paymentMethod: payment,
          paymentLabel: payment.includes('تحويل') ? 'تحويل بنكي' : payment.includes('محفظة') ? 'محفظة إلكترونية' : 'عند الاستلام',
          remittanceNumber: record.remittanceNumber ? String(record.remittanceNumber) : undefined,
        };
      }
    } catch {
      // ننتقل للمحلل النصي الذكي
    }
  }

  // 2. المحلل الذكي للنصوص القديمة (Regex Smart Fallback Parser)
  // مثال: "طلب شراء (1 قطعة) — 235,000 ر.ي — المكلا"
  const qMatch = value.match(/(\d+)\s*(?:قطعة|قطع)/);
  const pMatch = value.match(/([\d,]+)\s*(?:ر\.ي|ريال)/);

  const quantity = qMatch ? parseInt(qMatch[1], 10) : 1;
  let price = 0;
  if (pMatch) {
    price = parseInt(pMatch[1].replace(/,/g, ''), 10);
  } else {
    const rawDigits = value.match(/\d{5,8}/);
    if (rawDigits) price = parseInt(rawDigits[0], 10);
    else price = 320000;
  }

  let store = 'معرض أرض حمير للأثاث';
  if (value.includes('الطويل')) store = 'معرض الطويل للأثاث';
  else if (value.includes('هوم سنتر')) store = 'معرض هوم سنتر';
  else if (value.includes('باصهيل')) store = 'مفروشات باصهيل';
  else if (value.includes('العيدروس')) store = 'مفروشات العيدروس';
  else if (value.includes('بن دول')) store = 'معرض بن دول للأثاث';

  let productName = 'طقم أثاث ومفروشات راقية';
  if (value.includes('كنب') || value.includes('مجلس')) productName = 'طقم كنب ومجلس عصري';
  else if (value.includes('نوم') || value.includes('سرير')) productName = 'طقم غرفة نوم ماستر';
  else if (value.includes('طاولة') || value.includes('طعام')) productName = 'طاولة طعام وكراسي';
  else if (value.includes('مطبخ')) productName = 'مطبخ متكامل حديث';

  return {
    kind: 'order',
    productName,
    productCode: `EW-ORD-${Math.abs(price % 900) + 100}`,
    quantity,
    storeName: store,
    price,
    customerName: fallbackName || 'عميل إيوان',
    phone: fallbackPhone || '',
    date: new Date().toISOString(),
    address: 'المكلا — حضرموت',
    paymentMethod: 'الدفع عند الاستلام (بعد المعاينة)',
    paymentLabel: 'عند الاستلام',
  };
};
