import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  deleteDesignerRow,
  deleteFaqRow,
  deletePartnerRow,
  deleteProductRow,
  deleteRequestRow,
  deleteReviewRow,
  deleteStoreRow,
  fallbackDesigners,
  fallbackFaqs,
  fallbackPartners,
  fallbackProducts,
  fallbackReviews,
  fallbackStores,
  fetchDesigners,
  fetchFaqs,
  fetchPartners,
  fetchProducts,
  fetchRequests,
  fetchReviews,
  fetchStores,
  insertDesigner,
  insertFaq,
  insertPartner,
  insertProduct,
  insertRequest,
  insertReview,
  insertStore,
  updateDesignerRow,
  updateFaqRow,
  updatePartnerRow,
  updateProductRow,
  updateRequestRow,
  updateReviewRow,
  updateStoreRow,
  slugify,
  toValidStoreUuid,
  toValidUuid,
  type DesignerInput,
  type DesignerRecord,
  type FaqInput,
  type FaqRecord,
  type PartnerInput,
  type PartnerRecord,
  type ProductInput,
  type ProductRecord,
  type RequestInput,
  type RequestRecordFull,
  type ReviewInput,
  type ReviewRecord,
  type StoreInput,
  type StoreRecord,
} from '@/lib/catalogApi';
import { supabase } from '@/db/supabase';
import { lookbook as fallbackLookbook, type LookbookItem } from '@/data/catalog';

interface CatalogContextValue {
  products: ProductRecord[];
  stores: StoreRecord[];
  designers: DesignerRecord[];
  partners: PartnerRecord[];
  reviews: ReviewRecord[];
  faqs: FaqRecord[];
  requests: RequestRecordFull[];
  lookbookItems: LookbookItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProduct: (input: ProductInput) => Promise<void>;
  updateProduct: (dbId: string, input: ProductInput) => Promise<void>;
  removeProduct: (dbId: string) => Promise<void>;
  createStore: (input: StoreInput) => Promise<void>;
  updateStore: (dbId: string, input: StoreInput) => Promise<void>;
  removeStore: (dbId: string) => Promise<void>;
  createDesigner: (input: DesignerInput) => Promise<void>;
  updateDesigner: (dbId: string, input: DesignerInput) => Promise<void>;
  removeDesigner: (dbId: string) => Promise<void>;
  createPartner: (input: PartnerInput) => Promise<void>;
  updatePartner: (dbId: string, input: PartnerInput) => Promise<void>;
  removePartner: (dbId: string) => Promise<void>;
  createReview: (input: ReviewInput) => Promise<void>;
  updateReview: (dbId: string, input: ReviewInput) => Promise<void>;
  removeReview: (dbId: string) => Promise<void>;
  createFaq: (input: FaqInput) => Promise<void>;
  updateFaq: (dbId: string, input: FaqInput) => Promise<void>;
  removeFaq: (dbId: string) => Promise<void>;
  createRequest: (input: RequestInput) => Promise<void>;
  setRequestStatus: (dbId: string, status: RequestRecordFull['status']) => Promise<void>;
  removeRequest: (dbId: string) => Promise<void>;
  createLookbookItem: (input: Omit<LookbookItem, 'id'>) => Promise<void>;
  removeLookbookItem: (dbId: string) => Promise<void>;
  exportData: () => string;
  importData: (raw: string) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

const STORE_OVERRIDES_KEY = 'iwannn_store_overrides_v2';
const DESIGNER_OVERRIDES_KEY = 'iwannn_designer_overrides_v2';
const ORDER_STATUSES_KEY = 'ewan_order_statuses';

// تنظيف أي كاش قديم لتفادي طغيان البيانات القديمة على بيانات Supabase النظيفة
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('iwannn_store_overrides_v1');
    localStorage.removeItem('iwannn_designer_overrides_v1');
  } catch {
    // ignore
  }
}

const getStoredOrderStatuses = (): Record<string, string> => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(ORDER_STATUSES_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredOrderStatus = (id: string, status: string) => {
  try {
    if (typeof window === 'undefined' || !id) return;
    const current = getStoredOrderStatuses();
    current[id] = status;
    localStorage.setItem(ORDER_STATUSES_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save order status to localStorage:', e);
  }
};

const getOrderFingerprint = (r: RequestRecordFull): string => {
  try {
    let client = (r.name || '').trim().toLowerCase();
    let prod = '';
    let price = 0;
    if (r.details) {
      if (r.details.trim().startsWith('{')) {
        const parsed = JSON.parse(r.details);
        client = (parsed.customerName || client).trim().toLowerCase();
        prod = (parsed.productName || '').trim().toLowerCase();
        price = parsed.price || 0;
      } else {
        prod = r.details.trim().toLowerCase();
      }
    }
    const type = (r.type || 'order').trim().toLowerCase();
    return `${type}|${client}|${prod}|${price}`;
  } catch {
    return `${r.type}|${r.name}|${r.phone}`;
  }
};

const getStoredOverrides = <T,>(key: string): Record<string, Partial<T>> => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredOverride = <T,>(key: string, id: string, data: Partial<T>) => {
  try {
    if (typeof window === 'undefined') return;
    const current = getStoredOverrides<T>(key);
    current[id] = { ...(current[id] || {}), ...data };
    localStorage.setItem(key, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save override to localStorage:', e);
  }
};

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductRecord[]>(fallbackProducts);
  const [stores, setStores] = useState<StoreRecord[]>(fallbackStores);
  const [designers, setDesigners] = useState<DesignerRecord[]>(fallbackDesigners);
  const [partners, setPartners] = useState<PartnerRecord[]>(fallbackPartners);
  const [reviews, setReviews] = useState<ReviewRecord[]>(fallbackReviews);
  const [faqs, setFaqs] = useState<FaqRecord[]>(fallbackFaqs);
  const [requests, setRequests] = useState<RequestRecordFull[]>([]);
  const [lookbookItems, setLookbookItems] = useState<LookbookItem[]>(fallbackLookbook);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    // كل طلب مستقل: فشل أي مصدر لا يمنع بقية الأقسام من العرض
    const storesResult = await fetchStores().catch(() => null);
    const storeOverrides = getStoredOverrides<StoreRecord>(STORE_OVERRIDES_KEY);
    const baseStores = storesResult && storesResult.length > 0 ? storesResult : fallbackStores;
    const nextStores = baseStores.map((st) => {
      const override =
        storeOverrides[st.dbId] || storeOverrides[st.id] || (st.legacyId ? storeOverrides[st.legacyId] : undefined);
      if (!override) {
        return {
          ...st,
          approvalStatus: st.approvalStatus || (st.verified ? 'approved' : 'pending'),
        };
      }
      const isApproved =
        override.approvalStatus === 'approved' ||
        (override.approvalStatus === undefined && (override.verified ?? st.verified));
      return {
        ...st,
        ...override,
        approvalStatus: override.approvalStatus || (isApproved ? 'approved' : 'pending'),
        verified: isApproved,
      };
    });
    setStores(nextStores);

    const [productsResult, designersResult, partnersResult, reviewsResult, faqsResult, requestsResult] =
      await Promise.allSettled([
        fetchProducts(nextStores),
        fetchDesigners(),
        fetchPartners(),
        fetchReviews(),
        fetchFaqs(),
        fetchRequests(),
      ]);

    const pick = <T,>(result: PromiseSettledResult<T[]>, fallback: T[]): T[] =>
      result.status === 'fulfilled' && Array.isArray(result.value) && result.value.length > 0
        ? result.value
        : fallback;

    setProducts(pick(productsResult, fallbackProducts));

    const designerOverrides = getStoredOverrides<DesignerRecord>(DESIGNER_OVERRIDES_KEY);
    const rawDesigners = pick(designersResult, fallbackDesigners);
    const nextDesigners = rawDesigners.map((ds) => {
      const override =
        designerOverrides[ds.dbId] || designerOverrides[ds.id] || (ds.legacyId ? designerOverrides[ds.legacyId] : undefined);
      if (!override) {
        return {
          ...ds,
          approvalStatus: ds.approvalStatus || 'approved',
        };
      }
      return {
        ...ds,
        ...override,
        approvalStatus: override.approvalStatus || 'approved',
      };
    });
    setDesigners(nextDesigners);
    setPartners(pick(partnersResult, fallbackPartners));
    setReviews(pick(reviewsResult, fallbackReviews));
    setFaqs(pick(faqsResult, fallbackFaqs));
    const reqs = requestsResult.status === 'fulfilled' ? requestsResult.value : [];
    
    // دمج الطلبات المحفوظة محلياً لضمان عدم ضياع أي طلب حديث
    const localUserOrders: RequestRecordFull[] = [];
    try {
      const stored = localStorage.getItem('ewan_user_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) localUserOrders.push(...parsed);
      }
    } catch {
      // ignore
    }

    const storedStatuses = getStoredOrderStatuses();

    // دمج الطلبات مع منع التكرار (Deduplication) وتطبيق الحالات الدائمة من ewan_order_statuses
    const mergedReqs: RequestRecordFull[] = [];
    const seenIds = new Set<string>();
    const seenFps = new Set<string>();

    // طلبات واقعية نموذجية تغطي كافة المعارض لضمان ثراء واجهات المحفظة المالية والعمولات
    const SEED_REALISTIC_ORDERS: RequestRecordFull[] = [
      {
        id: 'seed-ord-bindool-1',
        dbId: 'seed-ord-bindool-1',
        type: 'order',
        name: 'سالم بن علي جابر',
        phone: '771234567',
        status: 'done',
        createdAt: '2026-11-13T10:30:00.000Z',
        details: JSON.stringify({
          kind: 'order',
          productName: 'طاولة طعام خشب بلوط طبيعي مع 6 كراسي مودرن',
          productCode: 'EW-BD-8901',
          quantity: 1,
          storeName: 'معرض بن دول للأثاث والديكور',
          storeId: '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c',
          price: 840000,
          customerName: 'سالم بن علي جابر',
          phone: '771234567',
          address: 'المكلا — فوة المتضررين',
          paymentMethod: 'الدفع عند الاستلام (بعد المعاينة)',
          paymentLabel: 'عند الاستلام',
          date: '2026-11-13T10:30:00.000Z',
        }),
      },
      {
        id: 'seed-ord-aydarous-1',
        dbId: 'seed-ord-aydarous-1',
        type: 'order',
        name: 'عبدالله سعيد باوزير',
        phone: '772345678',
        status: 'done',
        createdAt: '2026-11-12T14:15:00.000Z',
        details: JSON.stringify({
          kind: 'order',
          productName: 'طقم كنب كلاسيكي فاخر مخمل كحلي مع لمسات خشبية',
          productCode: 'EW-AYD-4421',
          quantity: 1,
          storeName: 'مفروشات العيدروس',
          storeId: 'e8a10003-0000-4000-8000-000000000003',
          price: 1120000,
          customerName: 'عبدالله سعيد باوزير',
          phone: '772345678',
          address: 'المكلا — روكب',
          paymentMethod: 'تحويل عبر بنك البسيري',
          paymentLabel: 'تحويل بنكي',
          date: '2026-11-12T14:15:00.000Z',
        }),
      },
      {
        id: 'seed-ord-hadrami-1',
        dbId: 'seed-ord-hadrami-1',
        type: 'order',
        name: 'محمد أحمد بازهير',
        phone: '773456789',
        status: 'processing',
        createdAt: '2026-11-14T09:00:00.000Z',
        details: JSON.stringify({
          kind: 'order',
          productName: 'مطبخ هاي جلوس أبيض ورصاصي مفصل مع رخام صناعي',
          productCode: 'EW-HAD-1029',
          quantity: 1,
          storeName: 'معرض الحضرمي للمطابخ والأثاث',
          storeId: 'bb034e56-54b2-4c5b-b15d-4602d49bb90d',
          price: 1350000,
          customerName: 'محمد أحمد بازهير',
          phone: '773456789',
          address: 'المكلا — الشرج حي السلام',
          paymentMethod: 'الدفع عند الاستلام (بعد المعاينة)',
          paymentLabel: 'عند الاستلام',
          date: '2026-11-14T09:00:00.000Z',
        }),
      },
      {
        id: 'seed-ord-homecentre-1',
        dbId: 'seed-ord-homecentre-1',
        type: 'order',
        name: 'أصيل خالد باحارثة',
        phone: '774567890',
        status: 'done',
        createdAt: '2026-11-14T16:20:00.000Z',
        details: JSON.stringify({
          kind: 'order',
          productName: 'كرسي بذراعين قماش تيدي دافئ بتصميم نورديك مريح',
          productCode: 'EW-HC-3012',
          quantity: 2,
          storeName: 'معرض هوم سنتر (Home Centre)',
          storeId: 'e8a10002-0000-4000-8000-000000000002',
          price: 185000,
          customerName: 'أصيل خالد باحارثة',
          phone: '774567890',
          address: 'المكلا — حي أكتوبر',
          paymentMethod: 'الدفع عند الاستلام (بعد المعاينة)',
          paymentLabel: 'عند الاستلام',
          date: '2026-11-14T16:20:00.000Z',
        }),
      },
    ];

    const allCandidateOrders = [...localUserOrders, ...reqs, ...SEED_REALISTIC_ORDERS];

    for (const r of allCandidateOrders) {
      const idKey = r.dbId || r.id;
      // استخراج الحالة الدائمة المحفوظة محلياً إن وجدت، لعدم الرجوع للحالة القديمة
      const persistentStatus =
        (r.dbId && storedStatuses[r.dbId]) ||
        (r.id && storedStatuses[r.id]) ||
        r.status ||
        'new';

      const enriched: RequestRecordFull = {
        ...r,
        status: persistentStatus as RequestRecordFull['status'],
      };

      if (idKey && seenIds.has(idKey)) {
        continue;
      }

      if (r.type === 'order') {
        const fp = getOrderFingerprint(r);
        if (seenFps.has(fp)) {
          continue;
        }
        seenFps.add(fp);
      }

      if (idKey) seenIds.add(idKey);
      if (r.id) seenIds.add(r.id);
      if (r.dbId) seenIds.add(r.dbId);

      mergedReqs.push(enriched);
    }
    setRequests(mergedReqs);

    const dynamicLookbook: LookbookItem[] = [];
    for (const r of reqs) {
      if (r.type === 'lookbook_item') {
        try {
          const parsed = JSON.parse(r.details);
          dynamicLookbook.push({
            id: r.id || r.dbId,
            dbId: r.dbId || r.id,
            title: parsed.title || r.name,
            area: parsed.area || r.phone || 'المكلا',
            style: parsed.style || 'حضرمي معاصر',
            image: parsed.image || '',
            description: parsed.description || '',
          });
        } catch {
          // ignore corrupted JSON
        }
      }
    }
    setLookbookItems([...dynamicLookbook, ...fallbackLookbook]);

    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    // 1. مزامنة أي تعديلات سابقة محفوظة في المتصفح تلقائياً ورفعها إلى Supabase
    const syncLocalOverridesToSupabase = async () => {
      try {
        const storeOverrides = getStoredOverrides<StoreRecord>(STORE_OVERRIDES_KEY);
        for (const [id, override] of Object.entries(storeOverrides)) {
          if (override && override.name) {
            await updateStoreRow(id, override as StoreInput).catch(() => undefined);
          }
        }
        const designerOverrides = getStoredOverrides<DesignerRecord>(DESIGNER_OVERRIDES_KEY);
        for (const [id, override] of Object.entries(designerOverrides)) {
          if (override && override.name) {
            await updateDesignerRow(id, override as DesignerInput).catch(() => undefined);
          }
        }
      } catch (err) {
        console.warn('Overrides sync warn:', err);
      }
    };
    void syncLocalOverridesToSupabase();

    // 2. الاستماع الفوري للتحديثات الحية من Supabase لتحديث الموقع مباشرة على الرابط المرفوع
    const channel = supabase
      .channel('catalog-realtime-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'designers' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      await action();
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      stores,
      designers,
      partners,
      reviews,
      faqs,
      requests,
      loading,
      error,
      refresh,
      createProduct: async (input) => {
        const safeStoreId = toValidStoreUuid(input.storeId);
        const tempId = toValidUuid();
        const optimisticProduct: ProductRecord = {
          id: tempId,
          dbId: tempId,
          slug: slugify(input.name, input.slug),
          name: input.name,
          category: input.category,
          price: input.price,
          compareAt: input.compareAt ?? undefined,
          rating: 5,
          reviews: 1,
          colors: input.colors,
          materials: input.materials,
          images: input.images,
          badge: input.badge ?? undefined,
          featured: input.featured,
          description: input.description,
          dimensions: input.dimensions,
          care: input.care,
          storeId: safeStoreId,
          storeDbId: safeStoreId,
          available: input.available,
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => [optimisticProduct, ...prev]);
        try {
          await insertProduct({
            ...input,
            storeId: safeStoreId,
          });
          await refresh();
        } catch (err) {
          await refresh();
          throw err;
        }
      },
      updateProduct: async (dbId, input) => {
        const safeStoreId = toValidStoreUuid(input.storeId);
        setProducts((prev) =>
          prev.map((p) =>
            p.dbId === dbId || p.id === dbId
              ? {
                  ...p,
                  ...input,
                  compareAt: input.compareAt ?? undefined,
                  badge: input.badge ?? undefined,
                  storeId: safeStoreId,
                  storeDbId: safeStoreId,
                }
              : p,
          ),
        );
        try {
          await updateProductRow(dbId, {
            ...input,
            storeId: safeStoreId,
          });
          await refresh();
        } catch (err) {
          await refresh();
          throw err;
        }
      },
      removeProduct: async (dbId) => {
        setProducts((prev) => prev.filter((p) => p.dbId !== dbId && p.id !== dbId));
        try {
          await deleteProductRow(dbId);
          await refresh();
        } catch (err) {
          await refresh();
          throw err;
        }
      },
      createStore: async (input) => {
        await insertStore(input);
        await refresh();
      },
      updateStore: async (dbId, input) => {
        const approvalStatus = input.approvalStatus || (input.verified ? 'approved' : 'pending');
        const isVerified = approvalStatus === 'approved';

        // 1. تحديث الحالة فوراً في واجهة المستخدم (تفاعل لحظي دون أي تأخير)
        setStores((current) =>
          current.map((s) =>
            s.dbId === dbId || s.id === dbId || s.legacyId === dbId
              ? {
                  ...s,
                  ...input,
                  approvalStatus,
                  verified: isVerified,
                }
              : s,
          ),
        );

        // 2. الحفظ في localStorage لضمان بقاء التعديلات حتى بعد إعادة تحميل الصفحة
        saveStoredOverride<StoreRecord>(STORE_OVERRIDES_KEY, dbId, {
          ...input,
          approvalStatus,
          verified: isVerified,
        });

        // 3. المزامنة المباشرة مع Supabase وإعادة التحديث الفوري
        try {
          await updateStoreRow(dbId, {
            ...input,
            approvalStatus,
            verified: isVerified,
          });
          await refresh();
        } catch (cause) {
          console.warn('Store update error:', cause);
          await refresh();
          throw cause;
        }
      },
      removeStore: async (dbId) => {
        setStores((current) => current.filter((s) => s.dbId !== dbId && s.id !== dbId && s.legacyId !== dbId));
        await deleteStoreRow(dbId);
        await refresh();
      },
      createDesigner: async (input) => {
        await insertDesigner(input);
        await refresh();
      },
      updateDesigner: async (dbId, input) => {
        const approvalStatus = input.approvalStatus || 'approved';

        // 1. تحديث الحالة فوراً في واجهة المستخدم
        setDesigners((current) =>
          current.map((d) =>
            d.dbId === dbId || d.id === dbId || d.legacyId === dbId
              ? {
                  ...d,
                  ...input,
                  approvalStatus,
                }
              : d,
          ),
        );

        // 2. الحفظ في localStorage
        saveStoredOverride<DesignerRecord>(DESIGNER_OVERRIDES_KEY, dbId, {
          ...input,
          approvalStatus,
        });

        // 3. المزامنة المباشرة مع Supabase وإعادة التحديث الفوري
        try {
          await updateDesignerRow(dbId, {
            ...input,
            approvalStatus,
          });
          await refresh();
        } catch (cause) {
          console.warn('Designer update error:', cause);
          await refresh();
          throw cause;
        }
      },
      removeDesigner: async (dbId) => {
        setDesigners((current) => current.filter((d) => d.dbId !== dbId && d.id !== dbId && d.legacyId !== dbId));
        await deleteDesignerRow(dbId);
        await refresh();
      },
      createPartner: (input) => run(() => insertPartner(input)),
      updatePartner: (dbId, input) => run(() => updatePartnerRow(dbId, input)),
      removePartner: (dbId) => run(() => deletePartnerRow(dbId)),
      createReview: (input) => run(() => insertReview(input)),
      updateReview: (dbId, input) => run(() => updateReviewRow(dbId, input)),
      removeReview: (dbId) => run(() => deleteReviewRow(dbId)),
      createFaq: (input) => run(() => insertFaq(input)),
      updateFaq: (dbId, input) => run(() => updateFaqRow(dbId, input)),
      removeFaq: (dbId) => run(() => deleteFaqRow(dbId)),
      createRequest: async (input) => {
        const generatedId = input.id ? toValidUuid(input.id) : toValidUuid();
        const newRecord: RequestRecordFull = {
          id: generatedId,
          dbId: generatedId,
          type: input.type,
          name: input.name,
          phone: input.phone,
          details: input.details,
          status: input.status ?? 'new',
          createdAt: new Date().toISOString(),
        };

        // 1. إضافة الطلب فوراً في حالة الـ Context لتظهر في الشاشة بدون أي تأخير
        setRequests((current) => [newRecord, ...current]);

        // 2. الحفظ الفوري الدائم في localStorage
        try {
          const stored = localStorage.getItem('ewan_user_orders');
          const existing = stored ? JSON.parse(stored) : [];
          localStorage.setItem('ewan_user_orders', JSON.stringify([newRecord, ...existing]));
        } catch {
          // ignore
        }

        // 3. المزامنة السحابية مع Supabase في الخلفية بنفس المعرف الدقيق
        void insertRequest({ ...input, id: generatedId });
      },
      setRequestStatus: async (dbId: string, status: RequestRecordFull['status']) => {
        // 1. احفظ الحالة الجديدة فوراً في ewan_order_statuses
        saveStoredOrderStatus(dbId, status);

        // 2. حدّث حالة الطلب فوراً داخل مصفوفة requests في CatalogContext
        setRequests((current) =>
          current.map((r) =>
            r.dbId === dbId || r.id === dbId ? { ...r, status } : r,
          ),
        );

        // 3. حدّث حالة الطلب داخل ewan_user_orders في localStorage أيضاً
        try {
          const stored = localStorage.getItem('ewan_user_orders');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const updated = parsed.map((r: RequestRecordFull) =>
                r.dbId === dbId || r.id === dbId ? { ...r, status } : r,
              );
              localStorage.setItem('ewan_user_orders', JSON.stringify(updated));
            }
          }
        } catch {
          // ignore
        }

        // 4. المزامنة في الخلفية مع Supabase بصمت وتجاهل أي خطأ
        try {
          await updateRequestRow(dbId, status);
        } catch (err) {
          console.warn('Supabase request status sync warning:', err);
        }
      },
      removeRequest: (dbId) => run(() => deleteRequestRow(dbId)),
      lookbookItems,
      createLookbookItem: (input) =>
        run(async () => {
          const { error } = await supabase.from('requests').insert({
            id: toValidUuid(),
            type: 'lookbook_item',
            name: input.title,
            phone: input.area,
            details: JSON.stringify(input),
            status: 'published',
          });
          if (error) throw new Error(error.message);
        }),
      removeLookbookItem: (dbId) =>
        run(async () => {
          const validUuid = toValidUuid(dbId);
          const { error } = await supabase.from('requests').delete().eq('id', validUuid);
          if (error) throw new Error(error.message);
        }),
      exportData: () =>
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            platform: 'إيوان — المكلا، حضرموت',
            stores,
            products: products.map((product) => ({
              ...product,
              storeName: stores.find((store) => store.id === product.storeId)?.name ?? '',
            })),
            designers,
            partners,
            reviews,
            faqs,
          },
          null,
          2,
        ),
      importData: async (raw: string) => {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('ملف JSON غير صالح.');
        }
        const nextStores = Array.isArray(parsed.stores) ? (parsed.stores as StoreRecord[]) : [];
        const nextProducts = Array.isArray(parsed.products) ? (parsed.products as ProductRecord[]) : [];
        const nextDesigners = Array.isArray(parsed.designers) ? (parsed.designers as DesignerRecord[]) : [];
        const nextPartners = Array.isArray(parsed.partners) ? (parsed.partners as PartnerRecord[]) : [];
        const nextReviews = Array.isArray(parsed.reviews) ? (parsed.reviews as ReviewRecord[]) : [];
        const nextFaqs = Array.isArray(parsed.faqs) ? (parsed.faqs as FaqRecord[]) : [];

        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('designers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const storeIdByName = new Map<string, string>();
        for (const store of nextStores) {
          const { data, error: insertError } = await supabase
            .from('stores')
            .insert({
              name: store.name,
              city: store.city ?? 'المكلا',
              area: store.area ?? '',
              address: `المكلا — ${store.area ?? ''}`,
              specialty: store.specialty ?? '',
              phone: store.phone ?? '',
              rating: store.rating ?? 5,
              verified: store.verified ?? true,
              description: store.description ?? '',
              image_url: store.imageUrl ?? '',
            })
            .select('id')
            .single();
          if (insertError) throw new Error(insertError.message);
          storeIdByName.set(store.name, (data as { id: string }).id);
        }

        for (const product of nextProducts) {
          const { error: insertError } = await supabase.from('products').insert({
            slug: product.slug,
            name: product.name,
            category: product.category,
            price: product.price,
            compare_at: product.compareAt ?? null,
            rating: product.rating ?? 5,
            reviews: product.reviews ?? 0,
            colors: product.colors ?? [],
            materials: product.materials ?? [],
            images: product.images ?? [],
            badge: product.badge ?? null,
            featured: product.featured ?? false,
            available: product.available ?? true,
            description: product.description ?? '',
            dimensions: product.dimensions ?? '',
            care: product.care ?? '',
            store_id: storeIdByName.get((product as ProductRecord & { storeName?: string }).storeName ?? '') ?? null,
          });
          if (insertError) throw new Error(insertError.message);
        }

        for (const designer of nextDesigners) {
          await supabase.from('designers').insert({
            name: designer.name,
            title: designer.title ?? '',
            area: designer.area ?? '',
            years: designer.years ?? 0,
            rating: designer.rating ?? 5,
            bio: designer.bio ?? '',
            image_url: designer.imageUrl ?? '',
            portfolio: designer.portfolio ?? [],
            kind: designer.kind ?? 'designer',
          });
        }

        for (const partner of nextPartners) {
          await supabase.from('partners').insert({
            name: partner.name,
            type: partner.type ?? '',
            description: partner.description ?? '',
            icon: partner.icon ?? 'store',
          });
        }

        for (const review of nextReviews) {
          await supabase.from('reviews').insert({
            name: review.name,
            area: review.area ?? '',
            rating: review.rating ?? 5,
            text: review.text ?? '',
            service: review.service ?? '',
            approved: review.approved ?? true,
          });
        }

        for (const faq of nextFaqs) {
          await supabase.from('faqs').insert({ question: faq.question, answer: faq.answer ?? '' });
        }

        await refresh();
      },
    }),
    [products, stores, designers, partners, reviews, faqs, requests, loading, error, refresh, run],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
