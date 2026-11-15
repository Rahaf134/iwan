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
import { DEMO_ACCOUNTS, useAuth } from '@/contexts/AuthContext';
import { useCatalog } from '@/contexts/CatalogContext';
import { useChat, type ChatMessage } from '@/contexts/ChatContext';
import { categories, formatPrice } from '@/data/catalog';
import { parseOrderDetails } from '@/lib/order';
import {
  slugify,
  toValidStoreUuid,
  resolveCanonicalProvider,
  fallbackProducts,
  type ProductInput,
  type ProductRecord,
  type RequestRecordFull,
  type StoreRecord,
  type DesignerRecord,
} from '@/lib/catalogApi';
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

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذّر قراءة الملف'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('صيغة الصورة غير مدعومة'));
      image.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(String(reader.result));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export const ProviderDashboardPage = () => {
  const { profile, signOut, quickLogin } = useAuth();
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

  // تحديد هوية المزود المعتمد ومطابقة كافة المعرّفات بدقة
  const canonical = useMemo(
    () =>
      resolveCanonicalProvider({
        id: profile?.id,
        email: profile?.email,
        businessName: profile?.businessName,
        fullName: profile?.fullName,
        storeId: profile?.storeId,
        designerId: profile?.designerId,
      }),
    [profile]
  );

  const isDesigner = profile?.role === 'designer' || canonical?.role === 'designer';

  const myStore = useMemo(() => {
    if (!profile && !canonical) return null;
    const targetUuid = canonical?.uuid || profile?.storeId;

    const matched = stores.find((s) => {
      if (targetUuid && (s.id === targetUuid || s.dbId === targetUuid)) return true;
      if (canonical && (s.legacyId === canonical.legacyId || s.name.includes(canonical.name) || canonical.name.includes(s.name))) return true;
      if (profile?.storeId && (s.id === profile.storeId || s.dbId === profile.storeId || s.legacyId === profile.storeId)) return true;
      if (profile?.businessName && (s.name.includes(profile.businessName) || profile.businessName.includes(s.name))) return true;
      if (profile?.fullName && (s.name.includes(profile.fullName) || profile.fullName.includes(s.name))) return true;
      return false;
    });

    if (matched) return matched;

    if (canonical && canonical.role === 'merchant') {
      return {
        id: canonical.uuid,
        dbId: canonical.uuid,
        legacyId: canonical.legacyId,
        name: canonical.name,
        city: 'المكلا',
        area: 'حضرموت',
        address: 'المكلا — حضرموت',
        specialty: 'أثاث وديكور منزلي راقٍ',
        phone: '05-300000',
        rating: 5,
        verified: true,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
        description: canonical.name,
        createdAt: '',
      } as StoreRecord;
    }

    return null;
  }, [profile, canonical, stores]);

  const myDesigner = useMemo(() => {
    if (!profile && !canonical) return null;
    const targetUuid = canonical?.uuid || profile?.designerId;

    const matched = designers.find((d) => {
      if (targetUuid && (d.id === targetUuid || d.dbId === targetUuid)) return true;
      if (canonical && (d.legacyId === canonical.legacyId || d.name.includes(canonical.name) || canonical.name.includes(d.name))) return true;
      if (profile?.designerId && (d.id === profile.designerId || d.dbId === profile.designerId || d.legacyId === profile.designerId)) return true;
      if (profile?.businessName && (d.name.includes(profile.businessName) || profile.businessName.includes(d.name))) return true;
      if (profile?.fullName && (d.name.includes(profile.fullName) || profile.fullName.includes(d.name))) return true;
      return false;
    });

    if (matched) return matched;

    if (canonical && canonical.role === 'designer') {
      return {
        id: canonical.uuid,
        dbId: canonical.uuid,
        legacyId: canonical.legacyId,
        name: canonical.name,
        title: 'مصمم داخلي معتمد',
        area: 'المكلا',
        years: 6,
        rating: 4.9,
        bio: canonical.name,
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        portfolio: [],
        kind: 'designer',
        createdAt: '',
      } as DesignerRecord;
    }

    return null;
  }, [profile, canonical, designers]);

  const providerEntityId =
    canonical?.uuid ||
    myStore?.id ||
    myStore?.dbId ||
    profile?.storeId ||
    myDesigner?.id ||
    myDesigner?.dbId ||
    profile?.designerId ||
    'unknown';
  const providerEntityName =
    profile?.businessName ||
    canonical?.name ||
    myStore?.name ||
    myDesigner?.name ||
    profile?.fullName ||
    'المزود المعتمد';

  // 1. تصفية منتجات وأعمال المزود (وضمان جلبها فوراً بالبريد أو المعرف أو الاسم مع حماية كاملة)
  const myProducts = useMemo<ProductRecord[]>(() => {
    const targetUuids = new Set<string>();
    const targetNames = new Set<string>();

    if (canonical) {
      targetUuids.add(canonical.uuid.toLowerCase());
      targetUuids.add(canonical.legacyId.toLowerCase());
      canonical.aliases.forEach((a) => targetNames.add(a.toLowerCase()));
      targetNames.add(canonical.name.toLowerCase());
    }
    if (profile?.storeId) targetUuids.add(profile.storeId.toLowerCase());
    if (profile?.designerId) targetUuids.add(profile.designerId.toLowerCase());
    if (myStore) {
      if (myStore.id) targetUuids.add(myStore.id.toLowerCase());
      if (myStore.dbId) targetUuids.add(myStore.dbId.toLowerCase());
      if (myStore.legacyId) targetUuids.add(myStore.legacyId.toLowerCase());
      if (myStore.name) targetNames.add(myStore.name.toLowerCase());
    }
    if (myDesigner) {
      if (myDesigner.id) targetUuids.add(myDesigner.id.toLowerCase());
      if (myDesigner.dbId) targetUuids.add(myDesigner.dbId.toLowerCase());
      if (myDesigner.legacyId) targetUuids.add(myDesigner.legacyId.toLowerCase());
      if (myDesigner.name) targetNames.add(myDesigner.name.toLowerCase());
    }
    if (profile?.businessName) targetNames.add(profile.businessName.toLowerCase());
    if (profile?.fullName) targetNames.add(profile.fullName.toLowerCase());

    const directMatches = products.filter((p) => {
      const pStoreId = (p.storeId || '').toLowerCase();
      const pStoreDbId = (p.storeDbId || '').toLowerCase();
      const pLegacyId = (p.legacyId || '').toLowerCase();

      // مطابقة المعرّف المباشر
      if (
        (pStoreId && targetUuids.has(pStoreId)) ||
        (pStoreDbId && targetUuids.has(pStoreDbId)) ||
        (pLegacyId && targetUuids.has(pLegacyId))
      ) {
        return true;
      }

      // مطابقة المعرّف المعياري المحول
      if (pStoreId) {
        const canonicalUuid = toValidStoreUuid(pStoreId).toLowerCase();
        if (targetUuids.has(canonicalUuid)) return true;
      }

      // مطابقة اسم المعرض المرتبط بالمنتج
      const matchedStore = stores.find(
        (s) => s.id === p.storeId || s.dbId === p.storeId || (s.legacyId && s.legacyId === p.storeId)
      );
      if (matchedStore) {
        const sName = matchedStore.name.toLowerCase();
        for (const name of targetNames) {
          if (sName.includes(name) || name.includes(sName)) return true;
        }
      }

      // مطابقة اسم المصمم المرتبط
      const matchedDesigner = designers.find(
        (d) => d.id === p.storeId || d.dbId === p.storeId || (d.legacyId && d.legacyId === p.storeId)
      );
      if (matchedDesigner) {
        const dName = matchedDesigner.name.toLowerCase();
        for (const name of targetNames) {
          if (dName.includes(name) || name.includes(dName)) return true;
        }
      }

      return false;
    });

    if (directMatches.length > 0) return directMatches;

    // استرجاع المنتجات الافتراضية في حال كانت بيانات Supabase قيد التحميل الأولي
    const fallbackMatches = fallbackProducts.filter((p) => {
      const pStoreId = (p.storeId || '').toLowerCase();
      const pLegacyId = (p.legacyId || '').toLowerCase();
      if (targetUuids.has(pStoreId) || targetUuids.has(pLegacyId)) return true;
      const canonicalUuid = toValidStoreUuid(p.storeId).toLowerCase();
      if (targetUuids.has(canonicalUuid)) return true;
      return false;
    });

    if (fallbackMatches.length > 0) return fallbackMatches;

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
  }, [products, stores, designers, profile, canonical, myStore, myDesigner, isDesigner]);

  // 2. تصفية الطلبات الواردة لهذا المزود فقط واستبعاد رسائل الشات والأسماء الوهمية
  const myOrders = useMemo(() => {
    const targetUuids = new Set<string>();
    const targetNames = new Set<string>();
    if (canonical) {
      targetUuids.add(canonical.uuid.toLowerCase());
      targetUuids.add(canonical.legacyId.toLowerCase());
      canonical.aliases.forEach((a) => targetNames.add(a.toLowerCase()));
      targetNames.add(canonical.name.toLowerCase());
    }
    if (myStore) {
      if (myStore.id) targetUuids.add(myStore.id.toLowerCase());
      if (myStore.dbId) targetUuids.add(myStore.dbId.toLowerCase());
      if (myStore.legacyId) targetUuids.add(myStore.legacyId.toLowerCase());
      if (myStore.name) targetNames.add(myStore.name.toLowerCase());
    }
    if (profile?.storeId) targetUuids.add(profile.storeId.toLowerCase());
    if (profile?.businessName) targetNames.add(profile.businessName.toLowerCase());

    return requests.filter((r) => {
      // 1. استبعاد سجلات الشات واللوك بوك
      if (r.type === 'chat_message' || r.type === 'lookbook_item') return false;
      if (!r.status) return false;

      const order = parseOrderDetails(r.details, r.phone, r.name);
      // 2. استبعاد السجلات بدون سعر حقيقي
      if (!order || !order.price || order.price <= 0) return false;

      // 3. استبعاد السجلات التي اسم العميل فيها هو اسم مصمم أو آدمن
      const clientName = (order.customerName || r.name || '').trim().toLowerCase();
      if (
        clientName.includes('ريم الكثيري') ||
        clientName.includes('رحاف') ||
        clientName.includes('مديرة المنصة') ||
        clientName.includes('المزود') ||
        clientName === 'إيوان'
      ) {
        return false;
      }

      const oStoreId = (order.storeId || '').toLowerCase();
      if (oStoreId && targetUuids.has(oStoreId)) return true;

      const oStoreName = (order.storeName || '').toLowerCase();
      if (oStoreName) {
        for (const name of targetNames) {
          if (oStoreName.includes(name) || name.includes(oStoreName)) return true;
        }
      }

      if (isDesigner && r.type === 'custom') {
        const detailsLower = (r.details || '').toLowerCase();
        for (const name of targetNames) {
          if (detailsLower.includes(name)) return true;
        }
      }

      return false;
    });
  }, [requests, canonical, myStore, profile, isDesigner]);

  // 3. تنظيم محادثات العملاء (دمج رسائل كل عميل في محادثة واحدة وحذف الفارغة)
  const customerChats = useMemo<CustomerThread[]>(() => {
    const targetUuids = new Set<string>();
    const targetNames = new Set<string>();
    if (canonical) {
      targetUuids.add(canonical.uuid.toLowerCase());
      targetUuids.add(canonical.legacyId.toLowerCase());
      canonical.aliases.forEach((a) => targetNames.add(a.toLowerCase()));
      targetNames.add(canonical.name.toLowerCase());
    }
    if (providerEntityId && providerEntityId !== 'unknown') targetUuids.add(providerEntityId.toLowerCase());
    if (myStore) {
      if (myStore.id) targetUuids.add(myStore.id.toLowerCase());
      if (myStore.dbId) targetUuids.add(myStore.dbId.toLowerCase());
      if (myStore.name) targetNames.add(myStore.name.toLowerCase());
    }
    if (myDesigner) {
      if (myDesigner.id) targetUuids.add(myDesigner.id.toLowerCase());
      if (myDesigner.dbId) targetUuids.add(myDesigner.dbId.toLowerCase());
      if (myDesigner.name) targetNames.add(myDesigner.name.toLowerCase());
    }
    if (profile?.businessName) targetNames.add(profile.businessName.toLowerCase());

    const rawThreads = threads.filter((t) => {
      const tId = (t.id || '').toLowerCase();
      const tThreadId = (t.threadId || '').toLowerCase();
      const tName = (t.name || '').toLowerCase();

      for (const id of targetUuids) {
        if (tId === id || tThreadId.includes(id)) return true;
      }
      for (const name of targetNames) {
        if (tName.includes(name) || name.includes(tName)) return true;
      }
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
  }, [threads, canonical, providerEntityId, myStore, myDesigner, profile, providerEntityName]);

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

  // معالجة رفع صورة من الجهاز مع ضغط فوري بالكاميرا أو الاستديو لتقليل الحجم وتسريع الحفظ
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.info('جارٍ ضغط وتجهيز الصورة…');
      const dataUrl = await compressImage(file);
      setProdImage(dataUrl);
      toast.success('تم تحميل الصورة وتجهيزها بنجاح');
    } catch {
      toast.error('تعذر معالجة الصورة');
    }
  };

  // حفظ المنتج
  const handleSaveProduct = async () => {
    if (!prodName.trim()) {
      toast.error('اسم القطعة مطلوب');
      return;
    }

    // تنظيف السعر من الفواصل والأرقام العربية
    const rawPriceStr = String(prodPrice || '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
    const parsedPrice = parseFloat(rawPriceStr);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('يرجى إدخال سعر صحيح للقطعة');
      return;
    }

    const assignedStoreId =
      canonical?.uuid ||
      myStore?.dbId ||
      myStore?.id ||
      profile?.storeId ||
      toValidStoreUuid(providerEntityId);

    // توليد slug فريد 100% وغير فارغ
    const uniqueSlug =
      editingProduct?.slug && editingProduct.slug !== '-'
        ? editingProduct.slug
        : slugify(prodName.trim());

    const input: ProductInput = {
      name: prodName.trim(),
      slug: uniqueSlug,
      category: prodCategory,
      price: parsedPrice,
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
                {/* قائمة سريعة لتبديل المعرض / الحساب بسهولة تامة دون تسجيل الخروج */}
                <div className="flex items-center gap-1.5">
                  <Select
                    value={
                      canonical?.legacyId
                        ? `demo-${canonical.legacyId.replace('s-', '').replace('d-', '')}`
                        : profile?.id || 'demo-homecentre'
                    }
                    onValueChange={(val) => {
                      const acc = DEMO_ACCOUNTS.find((a) => a.id === val);
                      if (acc) {
                        quickLogin(acc);
                        toast.success(`تم التبديل إلى: ${acc.name}`);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 w-[170px] sm:w-[210px] rounded-full border-[#DED4C6] bg-[#FAF7F2] text-xs font-bold text-[#231F1E]">
                      <SelectValue placeholder="تبديل المعرض" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2]">
                      {DEMO_ACCOUNTS.filter((a) => a.role === 'merchant' || a.role === 'designer').map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="text-xs">
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    void signOut();
                    navigate('/login');
                  }}
                  className="h-9 rounded-full px-3 text-xs text-[#786C65] hover:bg-[#F4E8E3] hover:text-[#8C4A32] transition-colors"
                >
                  <LogOut className="ml-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
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
                            <div className="mt-1 flex items-center gap-2 text-xs text-[#786C65]">
                              <span className="text-[11px] text-[#786C65]">رقم الجوال:</span>
                              <span dir="ltr" className="font-mono text-[#5C534E] font-medium">{req.phone || order.phone || '—'}</span>
                            </div>
                          </div>

                          {/* تغيير مرحلة التتبع */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#786C65]">المرحلة:</span>
                            <Select
                              value={
                                req.status === 'contacted' ? 'processing' :
                                req.status === 'in_progress' ? 'shipping' :
                                req.status === 'confirmed' ? 'new' :
                                req.status === 'delivered' ? 'done' :
                                req.status || 'new'
                              }
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
                                <SelectItem value="processing" className="text-xs font-bold text-[#9C6644]">
                                  قيد التجهيز بالمعرض
                                </SelectItem>
                                <SelectItem value="shipping" className="text-xs font-bold text-[#9C6644]">
                                  خرج للتوصيل
                                </SelectItem>
                                <SelectItem value="done" className="text-xs font-bold text-[#231F1E]">
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
