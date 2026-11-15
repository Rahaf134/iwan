import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, DollarSign, Minus, Plus, ShoppingBag, Trash2, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCatalog } from '@/contexts/CatalogContext';
import { useStore } from '@/contexts/StoreContext';
import { formatPrice } from '@/data/catalog';
import { productCode, serializeOrderDetails, type OrderDetails } from '@/lib/order';
import { useAuth } from '@/contexts/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, setQuantity, removeLine, subtotal, clearCart } = useStore();
  const { products, stores, createRequest } = useCatalog();
  const { profile, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'wallet'>('cod');
  const [remittanceNumber, setRemittanceNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // ملء بيانات العميل المسجل مسبقاً لتسهيل الطلب
  useEffect(() => {
    if (profile) {
      if (profile.fullName && !name) setName(profile.fullName);
      if (profile.phone && !phone) setPhone(profile.phone);
      if (profile.address && !address) setAddress(profile.address);
    }
  }, [profile]);

  const lines = useMemo(
    () =>
      cart
        .map((line) => ({ line, product: products.find((item) => item.id === line.productId) }))
        .filter((entry): entry is { line: typeof cart[number]; product: NonNullable<typeof entry.product> } =>
          Boolean(entry.product),
        ),
    [cart, products],
  );

  const delivery = subtotal > 0 ? 15000 : 0;

  const checkout = async () => {
    if (!profile && !user) {
      toast.error('يرجى تسجيل الدخول أولاً لإتمام الطلب', {
        description: 'سجّل دخولك لمتابعة عملية الشراء وتأكيد طلبك.',
      });
      navigate('/login');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      toast.error('الاسم ورقم التواصل مطلوبان');
      return;
    }
    setSaving(true);
    try {
      const firstStore = stores.find(
        (s) => s.id === lines[0]?.product.storeId || s.dbId === lines[0]?.product.storeId,
      );
      const storeName = lines
        .map(
          (l) =>
            stores.find((s) => s.id === l.product.storeId || s.dbId === l.product.storeId)?.name ||
            'معرض أرض حمير للأثاث',
        )
        .filter((v, i, a) => a.indexOf(v) === i)
        .join('، ');

      const paymentLabel =
        paymentMethod === 'bank'
          ? 'تحويل بنكي / صرافة'
          : paymentMethod === 'wallet'
          ? 'محفظة إلكترونية'
          : 'الدفع عند الاستلام (بعد المعاينة)';

      const orderData: OrderDetails = {
        kind: 'order',
        productName: lines.map((l) => l.product.name).join(' + '),
        productCode: lines.map((l) => productCode(l.product.id || l.product.dbId)).join(', '),
        quantity: lines.reduce((acc, l) => acc + l.line.quantity, 0),
        storeName: storeName || 'معارض إيوان المكلا',
        storeId: firstStore?.id || firstStore?.dbId,
        price: subtotal + delivery,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim() || 'المكلا — حضرموت',
        paymentMethod: paymentLabel,
        paymentLabel: paymentMethod === 'bank' ? 'تحويل بنكي' : paymentMethod === 'wallet' ? 'محفظة' : 'عند الاستلام',
        remittanceNumber: remittanceNumber.trim() || undefined,
        customerEmail: (profile?.email || user?.email || '').trim() || undefined,
        userId: profile?.id || user?.id || undefined,
        date: new Date().toISOString(),
      };

      await createRequest({
        type: 'order',
        name: name.trim(),
        phone: phone.trim(),
        details: serializeOrderDetails(orderData),
      });

      try {
        localStorage.setItem('ewan_saved_phone', phone.trim());
        const existingPhones = JSON.parse(localStorage.getItem('ewan_my_orders_phones') || '[]');
        if (!existingPhones.includes(phone.trim())) {
          localStorage.setItem('ewan_my_orders_phones', JSON.stringify([...existingPhones, phone.trim()]));
        }
      } catch {
        // ignore
      }

      toast.success('تم إرسال وتأكيد طلبك بنجاح', {
        description: 'يمكنك متابعة مراحل تجهيز وتوصيل طلبك عبر خيار "طلباتي" في الشريط العلوي.',
      });
      clearCart();
      setOpen(false);
      setName('');
      setPhone('');
      setAddress('');
      setRemittanceNumber('');
      navigate('/my-orders');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر إرسال الطلب');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="سلة التسوق — إيوان" description="مراجعة القطع المختارة وإتمام الطلب." />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-14">
          <p className="eyebrow">سلة التسوق</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-balance md:text-5xl">
            قطعك المختارة
          </h1>
        </div>

        {lines.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-border bg-card px-6 py-20 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.4} />
            <p className="mt-4 font-display text-xl">سلتك فارغة</p>
            <p className="mt-2 text-sm text-muted-foreground">
              تصفّح معارض المكلا واختر قطعتك الأولى.
            </p>
            <Button asChild className="mt-6 h-11 rounded-full bg-primary px-6 text-primary-foreground">
              <Link to="/shop">تصفّح المتجر</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1.6fr_1fr] md:gap-12">
            <div className="divide-y divide-border border-y border-border">
              {lines.map(({ line, product }) => (
                <div key={line.key} className="flex gap-4 py-5">
                  <Link
                    to={`/product/${product.slug}`}
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-muted md:h-28 md:w-24"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${product.slug}`}
                          className="block text-sm font-medium leading-snug text-balance hover:opacity-70"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">اللون: {line.color}</p>
                      </div>
                      <button
                        type="button"
                        aria-label="حذف"
                        onClick={() => removeLine(line.key)}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex h-9 items-center rounded-full border border-border">
                        <button
                          type="button"
                          aria-label="تقليل"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.6} />
                        </button>
                        <span className="w-7 text-center text-xs">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="زيادة"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
                        </button>
                      </div>
                      <p className="text-sm">{formatPrice(product.price * line.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-xl">ملخص الطلب</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">المجموع الفرعي</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">التوصيل والتركيب</dt>
                  <dd>{formatPrice(delivery)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-medium">
                  <dt>الإجمالي</dt>
                  <dd>{formatPrice(subtotal + delivery)}</dd>
                </div>
              </dl>

              <Button
                onClick={() => setOpen(true)}
                className="mt-6 h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                إتمام الطلب
                <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.8} />
              </Button>
              <Button asChild variant="outline" className="mt-2 h-11 w-full rounded-full border-border">
                <Link to="/shop">متابعة التسوق</Link>
              </Button>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                الدفع عند الاستلام أو تحويل بنكي محلي — يتم التأكيد هاتفياً.
              </p>
            </aside>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-border bg-background sm:rounded-3xl md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">تأكيد الطلب</DialogTitle>
            <DialogDescription className="text-pretty text-sm text-muted-foreground">
              أدخل بياناتك وسيتواصل معك فريق المعرض لتأكيد التوصيل داخل المكلا.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="order-name">الاسم الكامل</Label>
              <Input
                id="order-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-xl border-border px-3 text-base"
                placeholder="اسمك الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-phone">رقم التواصل</Label>
              <Input
                id="order-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                dir="ltr"
                className="h-11 rounded-xl border-border px-3 text-base"
                placeholder="7xxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-address">العنوان في المكلا</Label>
              <Textarea
                id="order-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={2}
                className="rounded-xl border-border px-3 text-base"
                placeholder="الحي، الشارع، أقرب معلم"
              />
            </div>

            {/* طريقة الدفع */}
            <div className="space-y-2 pt-1">
              <Label>طريقة الدفع المعتمدة</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#9C6644] bg-[#FAF7F2] text-[#231F1E] shadow-2xs ring-1 ring-[#9C6644]'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <DollarSign className={`h-5 w-5 mb-1 ${paymentMethod === 'cod' ? 'text-[#9C6644]' : ''}`} />
                  <span className="text-xs font-bold">عند الاستلام</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">بعد المعاينة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-[#9C6644] bg-[#FAF7F2] text-[#231F1E] shadow-2xs ring-1 ring-[#9C6644]'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 mb-1 ${paymentMethod === 'bank' ? 'text-[#9C6644]' : ''}`} />
                  <span className="text-xs font-bold">تحويل بنكي</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">العمقي / الكريمي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-[#9C6644] bg-[#FAF7F2] text-[#231F1E] shadow-2xs ring-1 ring-[#9C6644]'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Wallet className={`h-5 w-5 mb-1 ${paymentMethod === 'wallet' ? 'text-[#9C6644]' : ''}`} />
                  <span className="text-xs font-bold">محفظة إلكترونية</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">جوالي / كاش</span>
                </button>
              </div>

              {paymentMethod === 'bank' && (
                <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] p-3 text-xs space-y-2 mt-2 text-right">
                  <p className="font-semibold text-[#231F1E]">بيانات التحويل عبر الصرافة في حضرموت:</p>
                  <p className="text-[11px] text-[#5C534E]">
                    • <strong>حساب بنك الكريمي المميز:</strong> 300481295 (باسم: منصة إيوان للأثاث)
                  </p>
                  <p className="text-[11px] text-[#5C534E]">
                    • <strong>حساب شركة العمقي للصرافة:</strong> 25409180 (باسم: إيوان للأثاث)
                  </p>
                  <Input
                    placeholder="رقم الحوالة أو السند (اختياري)"
                    value={remittanceNumber}
                    onChange={(e) => setRemittanceNumber(e.target.value)}
                    className="h-9 text-xs bg-white mt-1.5"
                  />
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] p-3 text-xs space-y-1 mt-2 text-right">
                  <p className="font-semibold text-[#231F1E]">الدفع عبر المحافظ المحلية:</p>
                  <p className="text-[11px] text-[#5C534E]">• حساب محفظة جوالي / كاش: <strong>777123456</strong></p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-full border-border px-5">
              إلغاء
            </Button>
            <Button
              onClick={() => void checkout()}
              disabled={saving}
              className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {saving ? 'جارٍ الإرسال…' : 'تأكيد الطلب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartPage;
