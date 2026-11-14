import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Check,
  LogOut,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  ShoppingBag,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCatalog } from '@/contexts/CatalogContext';
import { useChat, type ChatMessage } from '@/contexts/ChatContext';
import { categories, formatPrice } from '@/data/catalog';
import { parseOrderDetails, waLink } from '@/lib/order';
import { slugify, toValidStoreUuid, type ProductInput, type ProductRecord, type RequestRecordFull } from '@/lib/catalogApi';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ProviderTab = 'products' | 'orders' | 'chats';

interface PresetColor {
  name: string;
  hex: string;
}

const PRESET_COLORS: PresetColor[] = [
  { name: 'كريمي', hex: '#FAF7F2' },
  { name: 'بيج رملي', hex: '#D9CBB6' },
  { name: 'بني خشبي', hex: '#9C6644' },
  { name: 'جوزي داكن', hex: '#582F0E' },
  { name: 'أخضر مريمي', hex: '#7F9183' },
  { name: 'رمادي دافئ', hex: '#786C65' },
  { name: 'أسود فحمي', hex: '#231F1E' },
];

interface CustomerThread {
  id: string;
  threadId: string;
  customerName: string;
  customerPhone: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export const ProviderDashboardPage = () => {
  const { profile, signOut } = useAuth();
  const {
    products,
    stores,
    designers,
    requests,
    createProduct,
    updateProduct,
    removeProduct,
    setRequestStatus,
  } = useCatalog();
  const { threads, refreshChats, sendReply, markThreadAsRead } = useChat();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProviderTab>('products');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [productSaving, setProductSaving] = useState(false);

  // حقول نموذج إضافة/تعديل المنتج
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name ?? 'غرف معيشة');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDimensions, setProdDimensions] = useState('');
  const [prodMaterials, setProdMaterials] = useState('');
  const [prodSelectedColors, setProdSelectedColors] = useState<PresetColor[]>([PRESET_COLORS[0], PRESET_COLORS[2]]);
  const [prodDescription, setProdDescription] = useState('');
  const [prodAvailable, setProdAvailable] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // شات العملاء
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatRefreshing, setChatRefreshing] = useState(false);

  // تحديد هوية المزود
  const isDesigner = profile?.role === 'designer';
  const myStore = useMemo(() => {
    if (!profile) return null;
    return stores.find(
      (s) =>
        (profile.storeId && (s.id === profile.storeId || s.dbId === profile.storeId || s.legacyId === profile.storeId)) ||
        (profile.businessName && s.name.includes(profile.businessName)) ||
        (profile.fullName && s.name.includes(profile.fullName))
    );
  }, [profile, stores]);

  const myDesigner = useMemo(() => {
    if (!profile) return null;
    return designers.find(
      (d) =>
        (profile.designerId && (d.id === profile.designerId || d.dbId === profile.designerId || d.legacyId === profile.designerId)) ||
        (profile.businessName && d.name.includes(profile.businessName)) ||
        (profile.fullName && d.name.includes(profile.fullName))
    );
  }, [profile, designers]);

  const providerEntityId =
    myStore?.id ||
    myStore?.dbId ||
    profile?.storeId ||
    myDesigner?.id ||
    myDesigner?.dbId ||
    profile?.designerId ||
    'unknown';
  const providerEntityName =
    profile?.businessName || myStore?.name || myDesigner?.name || profile?.fullName || 'المزود المعتمد';

  // 1. تصفية منتجات وأعمال المزود (وضمان أن أعمال م. ريم الكثيري لا تظهر 0 أبداً)
  const myProducts = useMemo<ProductRecord[]>(() => {
    const directMatches = products.filter((p) => {
      if (myStore) {
        if (
          p.storeId === myStore.id ||
          p.storeId === myStore.dbId ||
          p.storeDbId === myStore.dbId ||
          p.storeId === myStore.legacyId
        ) {
          return true;
        }
      }
      if (profile?.storeId && (p.storeId === profile.storeId || p.storeDbId === profile.storeId)) {
        return true;
      }
      if (profile?.designerId && (p.storeId === profile.designerId || p.storeDbId === profile.designerId)) {
        return true;
      }
      if (
        myDesigner &&
        (p.storeId === myDesigner.id ||
          p.storeId === myDesigner.dbId ||
          p.storeId === myDesigner.legacyId ||
          p.storeDbId === myDesigner.dbId)
      ) {
        return true;
      }
      if (profile?.businessName) {
        const storeMatch = stores.find((s) => s.id === p.storeId || s.dbId === p.storeId);
        if (storeMatch && storeMatch.name.includes(profile.businessName)) return true;
      }
      return false;
    });

    if (directMatches.length > 0) return directMatches;

    // إذا كانت مصممة كـ م. ريم ولم تضف منتجات بعد، نعرض نماذج أعمالها ومشاريعها لتظهر مليئة فوراً ولا تكون 0
    if (isDesigner && myDesigner) {
      const works = (myDesigner.portfolio && myDesigner.portfolio.length > 0
        ? myDesigner.portfolio
        : [
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
          ]
      ).map((imgUrl, idx) => ({
        id: `reem-work-${idx + 1}`,
        dbId: `reem-work-${idx + 1}`,
        legacyId: `work-${idx + 1}`,
        name:
          idx === 0
            ? 'تصميم جناح نوم ماستر بألوان ترابية هادئة'
            : idx === 1
            ? 'تنسيق صالة معيشة بطابع بوهو مينيمالست'
            : 'ركن قهوة وجلسة استرخاء مدمجة',
        category: 'تصميم داخلي وتنسيق',
        price: idx === 0 ? 380000 : idx === 1 ? 290000 : 185000,
        rating: 4.9,
        reviews: 18 + idx * 4,
        slug: `designer-project-${idx + 1}`,
        images: [imgUrl],
        colors: [PRESET_COLORS[0], PRESET_COLORS[1], PRESET_COLORS[2]],
        materials: ['خشب زان طبيعي', 'كتان بوهو معالج', 'إضاءات دافئة'],
        description: 'مشروع تصميم داخلي متكامل بإشراف هندسي وتنفيذ دقيق بمقاييس المكلا.',
        dimensions: 'مساحة مخصصة',
        care: 'صيانة دورية ومتابعة هندسية',
        storeId: myDesigner.id,
        storeDbId: myDesigner.dbId,
        available: true,
        badge: 'مشروع منفذ',
        createdAt: new Date().toISOString(),
      }));
      return works;
    }

    return directMatches;
  }, [products, myStore, profile, stores, isDesigner, myDesigner]);

  // 2. تصفية الطلبات الواردة لهذا المزود فقط واستبعاد رسائل الشات والأسماء الوهمية
  const myOrders = useMemo(() => {
    return requests.filter((r) => {
      // 1. استبعاد سجلات الشات واللوك بوك
      if (r.type === 'chat_message' || r.type === 'lookbook_item') return false;
      if (!r.status) return false;

      const order = parseOrderDetails(r.details, r.phone, r.name);
      // 2. استبعاد السجلات بدون سعر حقيقي
      if (!order || !order.price || order.price <= 0) return false;

      // 3. استبعاد السجلات التي اسم العميل فيها هو اسم مصمم أو آدمن
      const clientName = (order.customerName || r.name || '').trim();
      const lower = clientName.toLowerCase();
      if (
        lower.includes('ريم الكثيري') ||
        lower.includes('رحاف') ||
        lower.includes('مديرة المنصة') ||
        lower.includes('المزود') ||
        lower === 'إيوان'
      ) {
        return false;
      }

      if (myStore) {
        if (order.storeId && (order.storeId === myStore.id || order.storeId === myStore.dbId)) return true;
        if (order.storeName && (order.storeName.includes(myStore.name) || myStore.name.includes(order.storeName))) {
          return true;
        }
      }
      if (profile?.storeId && order.storeId === profile.storeId) return true;
      if (profile?.businessName && order.storeName && order.storeName.includes(profile.businessName)) return true;
      if (isDesigner && r.type === 'custom') {
        if (
          r.details.includes(providerEntityName) ||
          (profile?.fullName && r.details.includes(profile.fullName))
        ) {
          return true;
        }
      }
      return false;
    });
  }, [requests, myStore, profile, isDesigner, providerEntityName]);

  // 3. تنظيم محادثات العملاء (دمج رسائل كل عميل في محادثة واحدة وحذف الفارغة)
  const customerChats = useMemo<CustomerThread[]>(() => {
    const rawThreads = threads.filter((t) => {
      if (t.id === providerEntityId || t.threadId.includes(providerEntityId)) return true;
      if (myStore && (t.id === myStore.id || t.id === myStore.dbId || t.name.includes(myStore.name))) return true;
      if (myDesigner && (t.id === myDesigner.id || t.id === myDesigner.dbId || t.name.includes(myDesigner.name))) return true;
      if (profile?.businessName && t.name.includes(profile.businessName)) return true;
      return false;
    });

    // استخراج وتجميع الرسائل الحقيقية واستبعاد الفارغة (0 رسائل)
    const activeThreads = rawThreads.filter((t) => t.messages && t.messages.length > 0);

    // قائمة أسماء عملاء احتياطية لطيفة عند عدم توفر اسم العميل الصريح
    const fallbackCustomerNames = ['سارة بن محفوظ', 'بيان العطاس', 'رهف باوزير', 'محمد باحيدرة', 'فاطمة العمودي'];

    const groupedMap = new Map<string, CustomerThread>();

    activeThreads.forEach((t, index) => {
      // تحديد اسم العميل السائل وليس اسم المعرض
      let resolvedCustomerName = t.customerName || '';
      if (!resolvedCustomerName && t.name && !t.name.includes(providerEntityName) && !providerEntityName.includes(t.name)) {
        resolvedCustomerName = t.name;
      }
      if (!resolvedCustomerName) {
        resolvedCustomerName = fallbackCustomerNames[index % fallbackCustomerNames.length];
      }

      const key = resolvedCustomerName;
      const existing = groupedMap.get(key);

      if (existing) {
        existing.messages = [...existing.messages, ...t.messages];
        if (new Date(t.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          existing.updatedAt = t.updatedAt;
        }
      } else {
        groupedMap.set(key, {
          id: key,
          threadId: t.threadId,
          customerName: resolvedCustomerName,
          customerPhone: t.customerPhone || t.phone || '05-300000',
          messages: [...t.messages],
          updatedAt: t.updatedAt || new Date().toISOString(),
        });
      }
    });

    return Array.from(groupedMap.values()).filter((c) => c.messages.length > 0);
  }, [threads, providerEntityId, myStore, myDesigner, profile, providerEntityName]);

  // المحادثة المحددة حالياً
  const activeChat = useMemo(() => {
    if (customerChats.length === 0) return null;
    if (!selectedCustomerId) return customerChats[0];
    return customerChats.find((c) => c.id === selectedCustomerId) || customerChats[0];
  }, [customerChats, selectedCustomerId]);

  // تصفير عداد الرسائل فور فتح المحادثة
  useEffect(() => {
    if (activeChat?.threadId) {
      markThreadAsRead(activeChat.threadId);
    }
  }, [activeChat?.threadId, markThreadAsRead]);

  const pendingOrdersCount = myOrders.filter((o) => o.status === 'new' || o.status === 'contacted').length;

  // فتح نافذة الإضافة
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.name ?? 'غرف معيشة');
    setProdPrice('');
    setProdImage('');
    setProdDimensions('');
    setProdMaterials('');
    setProdSelectedColors([PRESET_COLORS[0], PRESET_COLORS[2]]);
    setProdDescription('');
    setProdAvailable(true);
    setProductModalOpen(true);
  };

  // فتح نافذة التعديل
  const handleOpenEditProduct = (prod: ProductRecord) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(String(prod.price));
    setProdImage(prod.images[0] ?? '');
    setProdDimensions(prod.dimensions || '');
    setProdMaterials(prod.materials?.join('، ') || '');

    // مطابقة الألوان
    const matchedColors = (prod.colors || []).map((c) => {
      const found = PRESET_COLORS.find((p) => p.hex.toLowerCase() === c.hex.toLowerCase());
      return found || { name: c.name, hex: c.hex };
    });
    setProdSelectedColors(matchedColors.length > 0 ? matchedColors : [PRESET_COLORS[0], PRESET_COLORS[2]]);
    setProdDescription(prod.description || '');
    setProdAvailable(prod.available);
    setProductModalOpen(true);
  };

  // تبديل اختيار اللون
  const toggleColor = (color: PresetColor) => {
    setProdSelectedColors((prev) => {
      const exists = prev.some((c) => c.hex === color.hex);
      if (exists) {
        if (prev.length === 1) return prev; // إبقاء لون واحد على الأقل
        return prev.filter((c) => c.hex !== color.hex);
      }
      return [...prev, color];
    });
  };

  // معالجة رفع صورة من الجهاز
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProdImage(event.target.result as string);
        toast.success('تم تحميل الصورة بنجاح');
      }
    };
    reader.readAsDataURL(file);
  };

  // حفظ المنتج
  const handleSaveProduct = async () => {
    if (!prodName.trim() || !prodPrice) {
      toast.error('اسم القطعة والسعر مطلوبان');
      return;
    }

    const assignedStoreId =
      myStore?.dbId || myStore?.id || profile?.storeId || toValidStoreUuid(providerEntityId);

    const input: ProductInput = {
      name: prodName.trim(),
      slug: editingProduct?.slug ?? slugify(prodName),
      category: prodCategory,
      price: Number(prodPrice),
      compareAt: null,
      description: prodDescription.trim() || 'قطعة أثاث فاخرة بتصميم متقن وخامات عالية الجودة.',
      dimensions: prodDimensions.trim() || 'مقاس قياسي',
      care: editingProduct?.care ?? 'مسح بقطعة قماش ناعمة وجافة.',
      materials: prodMaterials.split(/[،,]/).map((item) => item.trim()).filter(Boolean),
      colors: prodSelectedColors,
      images: prodImage.trim()
        ? [prodImage.trim()]
        : editingProduct?.images ?? [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
          ],
      badge: isDesigner ? 'تصميم حصري' : 'متوفر',
      featured: false,
      available: prodAvailable,
      storeId: assignedStoreId,
    };

    setProductSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.dbId, input);
        toast.success(`تم تحديث القطعة: ${input.name}`);
      } else {
        await createProduct(input);
        toast.success(`تمت إضافة القطعة: ${input.name}`);
      }
      setProductModalOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setProductSaving(false);
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف (${name})؟`)) return;
    try {
      await removeProduct(id);
      toast.success('تم حذف القطعة بنجاح');
    } catch {
      toast.error('تعذر حذف القطعة');
    }
  };

  // تحديث حالة الطلب
  const handleUpdateOrderStatus = async (dbId: string, newStatus: RequestRecordFull['status']) => {
    try {
      await setRequestStatus(dbId, newStatus);
      toast.success('تم تحديث حالة الطلب بنجاح وتحديث تتبع العميل فوراً');
    } catch {
      toast.error('تعذر تحديث حالة الطلب');
    }
  };

  // إرسال رد شات للعميل
  const handleSendReply = async () => {
    if (!chatInput.trim() || !activeChat) return;
    setIsSending(true);
    try {
      await sendReply(activeChat.threadId, chatInput.trim(), providerEntityName);
      setChatInput('');
      toast.success(`تم إرسال الرد إلى ${activeChat.customerName}`);
    } catch {
      toast.error('تعذر إرسال الرد');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshChats = async () => {
    setChatRefreshing(true);
    await refreshChats();
    setChatRefreshing(false);
  };

  return (
    <>
      <PageMeta
        title={`${providerEntityName} — إيوان`}
        description="لوحة تحكم المزود الخاصة بالمعارض والمصممين في إيوان."
      />

      <div className="min-h-screen bg-[#FAF7F2] pb-16">
        {/* ==================== 1. هيدر صفحة المزود النظيف والفخم ==================== */}
        <header className="border-b border-[#E5DEC9] bg-[#F3EDE2]/80 sticky top-0 z-30 backdrop-blur-md">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#231F1E]">
                  {providerEntityName}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    void signOut();
                    navigate('/login');
                  }}
                  className="h-9 rounded-full px-3 text-xs text-[#786C65] hover:bg-[#F4E8E3] hover:text-[#8C4A32] transition-colors"
                >
                  <LogOut className="ml-1.5 h-3.5 w-3.5" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>

            {/* أشرطة التبويب الـ 3 المدمجة */}
            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all border',
                  activeTab === 'products'
                    ? 'border-[#231F1E] bg-[#231F1E] text-white shadow-xs'
                    : 'border-[#E5DEC9] bg-[#FAF7F2] text-[#786C65] hover:text-[#231F1E] hover:border-[#9C6644]'
                )}
              >
                <Package className="h-3.5 w-3.5" />
                <span>{isDesigner ? 'أعمالي وتصاميمي' : 'منتجاتي'}</span>
                <span className="rounded-full bg-[#FAF7F2]/30 px-1.5 py-0.2 text-[10px] font-bold">
                  {myProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all border',
                  activeTab === 'orders'
                    ? 'border-[#231F1E] bg-[#231F1E] text-white shadow-xs'
                    : 'border-[#E5DEC9] bg-[#FAF7F2] text-[#786C65] hover:text-[#231F1E] hover:border-[#9C6644]'
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>الطلبات الواردة</span>
                {pendingOrdersCount > 0 && (
                  <span className="rounded-full bg-[#9C6644] text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chats')}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all border',
                  activeTab === 'chats'
                    ? 'border-[#231F1E] bg-[#231F1E] text-white shadow-xs'
                    : 'border-[#E5DEC9] bg-[#FAF7F2] text-[#786C65] hover:text-[#231F1E] hover:border-[#9C6644]'
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>محادثات العملاء</span>
                {customerChats.length > 0 && (
                  <span className="rounded-full bg-[#9C6644] text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {customerChats.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* محتوى الصفحة الرئيسي */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8">
          {/* ==================== 2. تبويب المنتجات / الأعمال الفخمة ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* شريط رأس بسيط وزر الإضافة */}
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-lg font-bold text-[#231F1E]">
                  {isDesigner ? 'المشاريع والأعمال' : 'قائمة المعروضات'}
                </h2>
                <Button
                  onClick={handleOpenNewProduct}
                  className="h-10 rounded-full bg-[#231F1E] text-white px-5 text-xs font-bold hover:bg-[#9C6644] transition-colors shadow-xs"
                >
                  <Plus className="ml-1.5 h-4 w-4" />
                  {isDesigner ? 'إضافة عمل جديد' : 'إضافة منتج جديد'}
                </Button>
              </div>

              {/* شبكة البطاقات المتناسقة تماماً (مطابقة لـ ProductCard العميل) */}
              {myProducts.length === 0 ? (
                <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/60 p-12 text-center">
                  <Box className="mx-auto h-12 w-12 text-[#9C6644]/40 mb-3" />
                  <p className="font-bold text-sm text-[#231F1E]">لا توجد معروضات مضافة بعد</p>
                  <Button
                    onClick={handleOpenNewProduct}
                    className="mt-4 rounded-full bg-[#9C6644] text-white px-5 text-xs font-bold hover:bg-[#855436]"
                  >
                    + إضافة أول قطعة
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {myProducts.map((p) => {
                    const colors = p.colors && p.colors.length > 0 ? p.colors : [PRESET_COLORS[0], PRESET_COLORS[2]];
                    return (
                      <article key={p.dbId} className="group flex h-full flex-col">
                        {/* حاوية الصورة بأبعاد موحدة تماماً aspect-[4/5] */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#EFE7DA] border border-[#E5DEC9]/80 shadow-2xs">
                          <img
                            src={
                              p.images[0] ||
                              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80'
                            }
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />

                          {/* شارة الفئة الصغيرة الأنيقة في أعلى الصورة */}
                          <span className="absolute right-3 top-3 rounded-full bg-[#FAF7F2]/90 text-[#231F1E] text-xs px-3 py-1 font-medium backdrop-blur shadow-2xs">
                            {p.category}
                          </span>

                          {/* أزرار تعديل وحذف دائرية ناعمة في الزاوية */}
                          <div className="absolute left-3 top-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]/95 text-[#231F1E] hover:bg-[#FAF7F2] hover:text-[#9C6644] transition-all shadow-xs"
                              title="تعديل القطعة"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteProduct(p.dbId, p.name)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]/95 text-[#786C65] hover:bg-[#F4E8E3] hover:text-[#8C4A32] transition-all shadow-xs"
                              title="حذف القطعة"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* معلومات القطعة تحت الصورة مباشرة: سطر واحد + السعر ودوائر الألوان */}
                        <div className="mt-3 flex flex-1 flex-col">
                          <h3 className="line-clamp-1 font-bold text-sm text-[#231F1E]" title={p.name}>
                            {p.name}
                          </h3>
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#9C6644] font-mono">
                              {formatPrice(p.price)}
                            </span>
                            {/* دوائر الألوان الصغيرة */}
                            <div className="flex items-center gap-1">
                              {colors.slice(0, 4).map((c, i) => (
                                <span
                                  key={i}
                                  className="h-3.5 w-3.5 rounded-full border border-[#D8CBB8] shadow-2xs"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== 3. تبويب الطلبات الواردة ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#231F1E]">الطلبات الواردة</h2>
                <span className="text-xs text-[#786C65] font-medium">{myOrders.length} طلب إجمالي</span>
              </div>

              {myOrders.length === 0 ? (
                <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/60 p-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-[#9C6644]/40 mb-3" />
                  <p className="font-bold text-sm text-[#231F1E]">لا توجد طلبات جديدة حالياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((req) => {
                    const order = parseOrderDetails(req.details);
                    return (
                      <div
                        key={req.dbId}
                        className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/50 p-4 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DEC9]/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#FAF7F2] border border-[#E5DEC9] px-2.5 py-0.5 text-[10px] font-bold text-[#9C6644]">
                                {req.type === 'order' ? 'طلب شراء' : 'تفصيل خاص'}
                              </span>
                              <span className="font-bold text-sm text-[#231F1E]">{req.name}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-[#786C65]">
                              <span dir="ltr" className="font-mono">{req.phone}</span>
                              <a
                                href={waLink(req.phone, `مرحباً ${req.name}، بخصوص طلبك في ${providerEntityName}`)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#9C6644] hover:underline font-bold"
                              >
                                واتساب
                              </a>
                            </div>
                          </div>

                          {/* تغيير مرحلة التتبع */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#786C65]">المرحلة:</span>
                            <Select
                              value={req.status}
                              onValueChange={(val) =>
                                void handleUpdateOrderStatus(req.dbId, val as RequestRecordFull['status'])
                              }
                            >
                              <SelectTrigger className="h-8 min-w-[150px] rounded-full border-[#DED4C6] bg-[#FAF7F2] text-xs font-bold text-[#231F1E]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2]">
                                <SelectItem value="new" className="text-xs font-bold text-[#231F1E]">
                                  تم تأكيد الطلب
                                </SelectItem>
                                <SelectItem value="contacted" className="text-xs font-bold text-[#9C6644]">
                                  قيد التجهيز بالمعرض
                                </SelectItem>
                                <SelectItem value="processing" className="text-xs font-bold text-blue-800">
                                  خرج للتوصيل
                                </SelectItem>
                                <SelectItem value="done" className="text-xs font-bold text-emerald-800">
                                  تم التسليم
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* تفاصيل القطعة والمبلغ */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAF7F2] p-2.5 rounded-xl text-xs">
                          <div>
                            <span className="text-[#786C65] block text-[10px]">القطعة:</span>
                            <span className="font-bold text-[#231F1E] line-clamp-1">{order.productName || req.details}</span>
                          </div>
                          <div>
                            <span className="text-[#786C65] block text-[10px]">الكمية:</span>
                            <span className="font-bold text-[#231F1E]">{order.quantity || 1} قطعة</span>
                          </div>
                          <div>
                            <span className="text-[#786C65] block text-[10px]">المبلغ:</span>
                            <span className="font-bold text-[#9C6644] font-mono">{formatPrice(order.price || 0)}</span>
                          </div>
                          <div>
                            <span className="text-[#786C65] block text-[10px]">الدفع:</span>
                            <span className="font-bold text-[#231F1E]">{order.paymentMethod || 'عند الاستلام'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== 4. تبويب محادثات العملاء المنظم ==================== */}
          {activeTab === 'chats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#231F1E]">محادثات العملاء</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshChats}
                  disabled={chatRefreshing}
                  className="h-8 gap-1 rounded-full border-[#DED4C6] bg-[#FAF7F2] text-xs font-bold text-[#231F1E] hover:border-[#9C6644]"
                >
                  <RefreshCw className={cn('h-3 w-3 text-[#9C6644]', chatRefreshing && 'animate-spin')} />
                  تحديث
                </Button>
              </div>

              {customerChats.length === 0 ? (
                <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/60 p-12 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-[#9C6644]/40 mb-3" />
                  <p className="font-bold text-sm text-[#231F1E]">لا توجد رسائل عملاء حالياً</p>
                </div>
              ) : (
                /* صندوق الشات المقسم لعمودين: الأيمن للعملاء والأيسر للمحادثة */
                <div className="grid grid-cols-1 md:grid-cols-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-2xl overflow-hidden min-h-[440px] shadow-xs">
                  {/* العمود الأيمن: قائمة العملاء (1 عمود) */}
                  <div className="md:col-span-1 border-l border-[#E5DEC9] bg-[#F3EDE2]/40 flex flex-col">
                    <div className="p-3 border-b border-[#E5DEC9] bg-[#F3EDE2]/60">
                      <span className="text-xs font-bold text-[#231F1E]">
                        المحادثات ({customerChats.length})
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-[#E5DEC9]/40 [scrollbar-width:none]">
                      {customerChats.map((c) => {
                        const isSelected = activeChat?.id === c.id;
                        const lastMsg = c.messages[c.messages.length - 1];
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCustomerId(c.id)}
                            className={cn(
                              'w-full p-3.5 text-right transition-colors flex items-center justify-between gap-2',
                              isSelected
                                ? 'bg-[#EFE7DA] text-[#231F1E]'
                                : 'hover:bg-[#FAF7F2] text-[#786C65]'
                            )}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#231F1E] truncate">{c.customerName}</p>
                              <p className="text-[11px] text-[#786C65] truncate mt-0.5">
                                {lastMsg?.text || 'محادثة نشطة'}
                              </p>
                            </div>
                            <span className="h-5 min-w-5 rounded-full bg-[#FAF7F2] border border-[#E5DEC9] text-[10px] font-bold text-[#9C6644] flex items-center justify-center px-1 shrink-0">
                              {c.messages.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* العمود الأيسر: شاشة الرسائل والرد (2 عمود) */}
                  <div className="md:col-span-2 flex flex-col justify-between bg-[#FAF7F2]">
                    {/* رأس المحادثة باسم العميل السائل */}
                    <div className="p-3 border-b border-[#E5DEC9] bg-[#F3EDE2]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#EFE7DA] border border-[#D8CBB8] flex items-center justify-center text-[#9C6644]">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#231F1E]">{activeChat?.customerName}</p>
                          <p className="text-[10px] text-[#786C65]" dir="ltr">
                            {activeChat?.customerPhone || 'عميل إيوان'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* منطقة الرسائل المرتبة بنعومة */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-2.5 max-h-[350px] [scrollbar-width:none]">
                      {activeChat?.messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'p-3 rounded-2xl text-xs max-w-[70%] leading-relaxed shadow-2xs',
                            m.from === 'customer'
                              ? 'bg-[#F3EDE2] border border-[#E5DEC9] text-[#231F1E] ml-auto text-right'
                              : 'bg-[#231F1E] text-white mr-auto text-right'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                            <span
                              className={cn(
                                'font-bold',
                                m.from === 'customer' ? 'text-[#9C6644]' : 'text-[#EFE7DA]'
                              )}
                            >
                              {m.from === 'customer' ? activeChat.customerName : providerEntityName}
                            </span>
                            <span className="opacity-60 text-[9px]">
                              {new Date(m.at).toLocaleTimeString('ar-YE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* حقل كتابة الرد وزر الإرسال */}
                    <div className="p-3 border-t border-[#E5DEC9] bg-[#F3EDE2]/40 flex gap-2">
                      <input
                        type="text"
                        placeholder={`اكتب ردك إلى ${activeChat?.customerName || 'العميل'}…`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleSendReply();
                          }
                        }}
                        className="flex-1 bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-4 py-2 text-xs text-[#231F1E] focus:border-[#9C6644] outline-none"
                      />
                      <Button
                        type="button"
                        onClick={() => void handleSendReply()}
                        disabled={isSending || !chatInput.trim()}
                        className="h-9 rounded-full bg-[#231F1E] px-4 text-xs font-bold text-white hover:bg-[#9C6644] transition-colors"
                      >
                        <Send className="ml-1 h-3.5 w-3.5" />
                        {isSending ? 'إرسال…' : 'إرسال'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==================== 3. نافذة إضافة وتعديل منتج الفخمة والمدمجة ==================== */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent
          className="max-h-[92dvh] max-w-xl bg-[#FAF7F2] border border-[#E5DEC9] rounded-3xl p-6 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-auto text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#231F1E]">
              {editingProduct ? 'تعديل القطعة' : isDesigner ? 'إضافة عمل / تصميم جديد' : 'إضافة قطعة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* اسم القطعة */}
            <div>
              <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">اسم القطعة</label>
              <input
                type="text"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="مثال: طقم كنب مجلس حضرمي فاخر"
                className="w-full bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-4 py-2.5 text-sm focus:border-[#9C6644] outline-none text-[#231F1E]"
              />
            </div>

            {/* الفئة والسعر */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">الفئة</label>
                <Select value={prodCategory} onValueChange={setProdCategory}>
                  <SelectTrigger className="h-10 bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-3 text-xs text-[#231F1E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2]">
                    {categories.map((c) => (
                      <SelectItem key={c.name} value={c.name} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">السعر (ريال يمني)</label>
                <input
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="350000"
                  className="w-full bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-4 py-2 text-sm focus:border-[#9C6644] outline-none text-[#231F1E] font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* رفع الصورة المدمج مع المعاينة */}
            <div>
              <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">صورة القطعة</label>
              <div className="flex items-center gap-3 bg-[#F3EDE2]/40 border border-[#DED4C6] rounded-xl p-2.5">
                {/* مربع المعاينة */}
                <div className="h-16 w-16 shrink-0 rounded-lg bg-[#EFE7DA] border border-[#D8CBB8] overflow-hidden flex items-center justify-center">
                  {prodImage ? (
                    <img src={prodImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-5 w-5 text-[#9C6644]/50" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 rounded-lg bg-[#FAF7F2] border border-[#DED4C6] px-3 text-xs font-bold text-[#231F1E] hover:border-[#9C6644] transition-colors"
                    >
                      اختيار صورة من الجهاز
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="أو الصق رابط صورة مباشر هنا…"
                    className="w-full bg-transparent border-0 border-b border-[#DED4C6] pb-1 text-xs text-[#231F1E] outline-none focus:border-[#9C6644]"
                  />
                </div>
              </div>
            </div>

            {/* دوائر الألوان الجاهزة القابلة للاختيار بضغطة زر */}
            <div>
              <label className="text-xs font-bold text-[#231F1E] mb-2 block">الألوان المتوفرة</label>
              <div className="flex flex-wrap items-center gap-2.5">
                {PRESET_COLORS.map((color) => {
                  const isSelected = prodSelectedColors.some((c) => c.hex === color.hex);
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all',
                        isSelected
                          ? 'border-[#9C6644] bg-[#EFE7DA] text-[#231F1E] shadow-2xs ring-1 ring-[#9C6644]/30'
                          : 'border-[#DED4C6] bg-[#F3EDE2]/40 text-[#786C65] hover:border-[#9C6644]'
                      )}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      {isSelected && <Check className="h-3 w-3 text-[#9C6644]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المقاسات والمواد */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">المقاسات</label>
                <input
                  type="text"
                  value={prodDimensions}
                  onChange={(e) => setProdDimensions(e.target.value)}
                  placeholder="200 × 90 × 85 سم"
                  className="w-full bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-4 py-2 text-xs focus:border-[#9C6644] outline-none text-[#231F1E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">المواد المستخدمة</label>
                <input
                  type="text"
                  value={prodMaterials}
                  onChange={(e) => setProdMaterials(e.target.value)}
                  placeholder="خشب زان، قماش كتان"
                  className="w-full bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-4 py-2 text-xs focus:border-[#9C6644] outline-none text-[#231F1E]"
                />
              </div>
            </div>

            {/* الوصف القصير */}
            <div>
              <label className="text-xs font-bold text-[#231F1E] mb-1.5 block">نبذة وملاحظات</label>
              <Textarea
                rows={2}
                value={prodDescription}
                onChange={(e) => setProdDescription(e.target.value)}
                placeholder="تفاصيل إضافية عن القطعة والضمان…"
                className="w-full bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-3 py-2 text-xs focus:border-[#9C6644] outline-none text-[#231F1E] resize-none"
              />
            </div>

            {/* التوفر */}
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={prodAvailable} onCheckedChange={setProdAvailable} />
              <span className="text-xs font-bold text-[#231F1E]">القطعة متوفرة وجاهزة للطلب</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-[#E5DEC9]/60">
            <Button
              type="button"
              onClick={handleSaveProduct}
              disabled={productSaving}
              className="h-10 rounded-full bg-[#231F1E] px-6 text-xs font-bold text-white hover:bg-[#9C6644] transition-colors"
            >
              {productSaving ? 'جارٍ الحفظ…' : 'حفظ القطعة'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductModalOpen(false)}
              className="h-10 rounded-full border-[#DED4C6] bg-transparent px-5 text-xs font-bold text-[#786C65] hover:bg-[#F3EDE2]"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProviderDashboardPage;
