import {
  designers as seedDesigners,
  faqs as seedFaqs,
  partners as seedPartners,
  products as seedProducts,
  reviews as seedReviews,
  stores as seedStores,
  type ColorOption,
  type Designer,
  type Faq,
  type Partner,
  type Product,
  type Review,
  type Store,
} from '@/data/catalog';
import { supabase } from '@/db/supabase';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface ProductRecord extends Product {
  dbId: string;
  storeDbId: string | null;
  legacyId?: string;
  createdAt: string;
}

export interface StoreRecord extends Store {
  dbId: string;
  legacyId?: string;
  createdAt: string;
  approvalStatus?: ApprovalStatus;
}

export interface DesignerRecord extends Designer {
  dbId: string;
  legacyId?: string;
  createdAt: string;
  approvalStatus?: ApprovalStatus;
}

export interface PartnerRecord extends Partner {
  dbId: string;
  legacyId?: string;
  createdAt: string;
}

export interface ReviewRecord extends Review {
  dbId: string;
  legacyId?: string;
  createdAt: string;
}

export interface FaqRecord extends Faq {
  dbId: string;
  legacyId?: string;
  createdAt: string;
}

export interface RequestRecordFull {
  id?: string;
  dbId: string;
  type: string;
  name: string;
  phone: string;
  details: string;
  status: 'new' | 'contacted' | 'processing' | 'shipping' | 'done' | string;
  createdAt: string;
}

export interface ProductInput {
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAt: number | null;
  description: string;
  dimensions: string;
  care: string;
  materials: string[];
  colors: ColorOption[];
  images: string[];
  badge: string | null;
  featured: boolean;
  available: boolean;
  storeId: string | null;
}

export interface StoreInput {
  name: string;
  city: string;
  area: string;
  address: string;
  specialty: string;
  phone: string;
  rating: number;
  verified: boolean;
  description: string;
  imageUrl: string;
  approvalStatus?: ApprovalStatus;
}

export interface DesignerInput {
  name: string;
  title: string;
  area: string;
  years: number;
  rating: number;
  bio: string;
  imageUrl: string;
  portfolio: string[];
  kind: 'designer' | 'carpenter';
  phone?: string;
  approvalStatus?: ApprovalStatus;
}

export interface PartnerInput {
  name: string;
  type: string;
  description: string;
  icon: string;
}

export interface ReviewInput {
  name: string;
  area: string;
  rating: number;
  text: string;
  service: string;
  approved: boolean;
}

export interface FaqInput {
  question: string;
  answer: string;
}

export interface RequestInput {
  type: string;
  name: string;
  phone: string;
  details: string;
  status?: 'new' | 'contacted' | 'processing' | 'shipping' | 'done' | string;
}

const asArray = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);

const arabicToLatinMap: Record<string, string> = {
  مطبخ: 'kitchen',
  كنب: 'sofa',
  مجلس: 'majlis',
  غرفة: 'room',
  نوم: 'bedroom',
  طاولة: 'table',
  كرسي: 'chair',
  دولاب: 'wardrobe',
  خزانة: 'cabinet',
  سرير: 'bed',
  إضاءة: 'lighting',
  ديكور: 'decor',
  سجاد: 'rug',
  تلفزيون: 'tv-unit',
  مدخل: 'entryway',
  بنش: 'bench',
  مرآة: 'mirror',
  طعام: 'dining',
  صالون: 'salon',
  رخام: 'marble',
  خشب: 'wood',
};

export const slugify = (value: string, currentSlug?: string): string => {
  if (currentSlug && currentSlug.trim() && currentSlug.trim() !== '-') {
    return currentSlug.trim();
  }

  const rawName = (value || '').trim();

  // 1. استخراج الحروف اللاتينية إن وجدت
  let latin = rawName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // 2. إذا كان الاسم عربياً بالكامل، استخراج الكلمات المفتاحية بالإنجليزية
  if (!latin) {
    const matchedWords: string[] = [];
    for (const [ar, en] of Object.entries(arabicToLatinMap)) {
      if (rawName.includes(ar)) {
        matchedWords.push(en);
      }
    }
    if (matchedWords.length > 0) {
      latin = matchedWords.slice(0, 3).join('-');
    }
  }

  const prefix = latin && latin.length >= 2 ? latin : 'piece';
  const randomSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}-${randomSuffix}`.replace(/-+/g, '-').toLowerCase();
};

// خريطة المعرّفات المسبقة للربط المباشر مع Supabase
export const knownLegacyToUuid = new Map<string, string>([
  ['s-altaweel', 'e8a10001-0000-4000-8000-000000000001'],
  ['s-homecentre', 'e8a10002-0000-4000-8000-000000000002'],
  ['s-aydaroos', 'e8a10003-0000-4000-8000-000000000003'],
  ['s1', '3117f43e-d0ca-41e1-82a1-7dead277af20'],
  ['s2', '19a63b7b-9e48-47b4-9143-b8542f6fe9a8'],
  ['s3', '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c'],
  ['s4', 'bb034e56-54b2-4c5b-b15d-4602d49bb90d'],
  ['s5', 'c913879b-4070-459d-b3ad-7c7a0909d514'],
  ['s6', '3b3d9526-cd59-436d-802c-d7f1fd352d76'],
  ['s7', 'e7100a86-752b-48d5-8482-13a09c9a9401'],
  ['s8', 'ec65b6cd-afc8-49bf-93ce-0d1f05714848'],
  ['d1', '8fa7d341-2b0f-48e0-a937-2900b86a0321'],
  ['d2', '319b0e12-45e8-477f-a2e6-76495147814b'],
  ['d3', '285c6c4b-8816-47b3-b68c-2e6de07df5ef'],
  ['d4', '1638aaca-8a33-43c5-846b-1e786f510386'],
]);

export const storeNameToUuidMap = new Map<string, string>([
  ['معرض الطويل للأثاث', 'e8a10001-0000-4000-8000-000000000001'],
  ['معرض هوم سنتر', 'e8a10002-0000-4000-8000-000000000002'],
  ['معرض هوم سنتر (Home Centre)', 'e8a10002-0000-4000-8000-000000000002'],
  ['مفروشات العيدروس', 'e8a10003-0000-4000-8000-000000000003'],
  ['معرض أرض حمير للأثاث والمطابخ', '3117f43e-d0ca-41e1-82a1-7dead277af20'],
  ['مفروشات باصهيل', '19a63b7b-9e48-47b4-9143-b8542f6fe9a8'],
  ['معرض بن دول للأثاث والديكور', '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c'],
  ['معرض الحضرمي للمطابخ والأثاث', 'bb034e56-54b2-4c5b-b15d-4602d49bb90d'],
  ['مفروشات القصر العصري', 'c913879b-4070-459d-b3ad-7c7a0909d514'],
  ['معرض النخبة للأثاث والديكور', '3b3d9526-cd59-436d-802c-d7f1fd352d76'],
  ['مفروشات بن هلابي', 'e7100a86-752b-48d5-8482-13a09c9a9401'],
  ['معرض الفخامة للأثاث', 'ec65b6cd-afc8-49bf-93ce-0d1f05714848'],
]);

export const isValidUuid = (id?: string | null): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
};

export const toDeterministicUuid = (code: string): string => {
  const clean = code.trim().toLowerCase();
  const numMatch = clean.match(/\d+$/);
  const prefixMatch = clean.match(/^[a-z]+/);

  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    const prefixChar = prefixMatch ? prefixMatch[0].charCodeAt(0).toString(16).padStart(4, '0') : '0000';
    const hexNum = num.toString(16).padStart(12, '0');
    return `00000000-${prefixChar}-4000-8000-${hexNum}`;
  }

  let hex = '';
  for (let i = 0; i < clean.length; i++) {
    hex += clean.charCodeAt(i).toString(16);
  }
  hex = hex.padEnd(12, '0').slice(0, 12);
  return `00000000-0000-4000-8000-${hex}`;
};

export const toValidUuid = (id?: string | null): string => {
  if (!id || !id.trim()) {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : '00000000-0000-4000-8000-000000000001';
  }
  const clean = id.trim();
  if (isValidUuid(clean)) return clean;

  const known = knownLegacyToUuid.get(clean.toLowerCase());
  if (known && isValidUuid(known)) return known;

  const byName = storeNameToUuidMap.get(clean);
  if (byName && isValidUuid(byName)) return byName;

  return toDeterministicUuid(clean);
};

export const toValidStoreUuid = (storeId?: string | null): string => {
  if (!storeId || !storeId.trim()) {
    return '3117f43e-d0ca-41e1-82a1-7dead277af20';
  }
  const clean = storeId.trim();
  if (isValidUuid(clean)) {
    return clean;
  }
  const known = knownLegacyToUuid.get(clean.toLowerCase());
  if (known && isValidUuid(known)) return known;

  const byName = storeNameToUuidMap.get(clean);
  if (byName && isValidUuid(byName)) return byName;

  for (const [name, uuid] of storeNameToUuidMap.entries()) {
    if (name.includes(clean) || clean.includes(name)) {
      return uuid;
    }
  }

  return '3117f43e-d0ca-41e1-82a1-7dead277af20';
};

export const fallbackStores: StoreRecord[] = seedStores.map((store) => {
  const realUuid = knownLegacyToUuid.get(store.id) ?? toDeterministicUuid(store.id);
  return {
    ...store,
    id: realUuid,
    legacyId: store.id,
    dbId: realUuid,
    createdAt: '',
  };
});

export const fallbackProducts: ProductRecord[] = seedProducts.map((product) => {
  const realProductUuid = toDeterministicUuid(product.id);
  const realStoreUuid = knownLegacyToUuid.get(product.storeId) ?? toDeterministicUuid(product.storeId);
  return {
    ...product,
    id: realProductUuid,
    legacyId: product.id,
    dbId: realProductUuid,
    storeId: realStoreUuid,
    storeDbId: realStoreUuid,
    createdAt: '',
  };
});

export const fallbackDesigners: DesignerRecord[] = seedDesigners.map((item) => {
  const realUuid = knownLegacyToUuid.get(item.id) ?? toDeterministicUuid(item.id);
  return {
    ...item,
    id: realUuid,
    legacyId: item.id,
    dbId: realUuid,
    createdAt: '',
  };
});

export const fallbackPartners: PartnerRecord[] = seedPartners.map((item) => {
  const realUuid = toDeterministicUuid(item.id);
  return {
    ...item,
    id: realUuid,
    legacyId: item.id,
    dbId: realUuid,
    createdAt: '',
  };
});

export const fallbackReviews: ReviewRecord[] = seedReviews.map((item) => {
  const realUuid = toDeterministicUuid(item.id);
  return {
    ...item,
    id: realUuid,
    legacyId: item.id,
    dbId: realUuid,
    createdAt: item.createdAt,
  };
});

export const fallbackFaqs: FaqRecord[] = seedFaqs.map((item) => {
  const realUuid = toDeterministicUuid(item.id);
  return {
    ...item,
    id: realUuid,
    legacyId: item.id,
    dbId: realUuid,
    createdAt: '',
  };
});

export async function fetchStores(): Promise<StoreRecord[]> {
  const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const legacyId = (row.legacy_id as string) || '';
    const name = (row.name as string) || '';
    if (isValidUuid(rawUuid)) {
      if (legacyId) knownLegacyToUuid.set(legacyId.toLowerCase(), rawUuid);
      if (name) storeNameToUuidMap.set(name.trim(), rawUuid);
    }
    const realId = rawUuid || (legacyId ? toDeterministicUuid(legacyId) : toValidUuid());
    return {
      id: realId,
      legacyId: legacyId || undefined,
      dbId: realId,
      name,
      city: (row.city as string) ?? 'المكلا',
      area: (row.area as string) ?? '',
      address: (row.address as string) ?? '',
      specialty: (row.specialty as string) ?? '',
      phone: (row.phone as string) ?? '',
      rating: Number(row.rating ?? 5),
      verified: Boolean(row.verified ?? true),
      imageUrl: (row.image_url as string) ?? '',
      description: (row.description as string) ?? '',
      createdAt: (row.created_at as string) ?? '',
    };
  });
}

export async function fetchProducts(_storeList: StoreRecord[]): Promise<ProductRecord[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const legacyId = (row.legacy_id as string) || '';
    const rawStoreId = (row.store_id as string) ?? null;
    const resolvedStoreUuid = rawStoreId ? toValidStoreUuid(rawStoreId) : '';
    const realId = rawUuid || (legacyId ? toDeterministicUuid(legacyId) : toValidUuid());
    return {
      id: realId,
      legacyId: legacyId || undefined,
      dbId: realId,
      slug: (row.slug as string) ?? '',
      name: row.name as string,
      category: (row.category as string) ?? '',
      price: Number(row.price ?? 0),
      compareAt: row.compare_at === null || row.compare_at === undefined ? undefined : Number(row.compare_at),
      rating: Number(row.rating ?? 5),
      reviews: Number(row.reviews ?? 0),
      colors: Array.isArray(row.colors) ? (row.colors as ColorOption[]) : [],
      materials: asArray(row.materials),
      images: asArray(row.images),
      badge: (row.badge as string) ?? undefined,
      featured: Boolean(row.featured),
      description: (row.description as string) ?? '',
      dimensions: (row.dimensions as string) ?? '',
      care: (row.care as string) ?? '',
      storeId: resolvedStoreUuid,
      storeDbId: resolvedStoreUuid || null,
      available: Boolean(row.available ?? true),
      createdAt: (row.created_at as string) ?? '',
    };
  });
}

export async function fetchDesigners(): Promise<DesignerRecord[]> {
  const { data, error } = await supabase.from('designers').select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const legacyId = (row.legacy_id as string) || '';
    const realId = rawUuid || (legacyId ? toDeterministicUuid(legacyId) : toValidUuid());
    if (isValidUuid(rawUuid) && legacyId) {
      knownLegacyToUuid.set(legacyId.toLowerCase(), rawUuid);
    }
    return {
      id: realId,
      legacyId: legacyId || undefined,
      dbId: realId,
      name: row.name as string,
      title: (row.title as string) ?? '',
      area: (row.area as string) ?? '',
      years: Number(row.years ?? 0),
      rating: Number(row.rating ?? 5),
      bio: (row.bio as string) ?? '',
      imageUrl: (row.image_url as string) ?? '',
      portfolio: asArray(row.portfolio),
      kind: ((row.kind as string) === 'carpenter' ? 'carpenter' : 'designer') as Designer['kind'],
      phone: (row.phone as string) ?? undefined,
      createdAt: (row.created_at as string) ?? '',
    };
  });
}

export async function fetchPartners(): Promise<PartnerRecord[]> {
  const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const legacyId = (row.legacy_id as string) || '';
    const realId = rawUuid || (legacyId ? toDeterministicUuid(legacyId) : toValidUuid());
    return {
      id: realId,
      legacyId: legacyId || undefined,
      dbId: realId,
      name: row.name as string,
      type: (row.type as string) ?? '',
      description: (row.description as string) ?? '',
      icon: (row.icon as string) ?? 'store',
      createdAt: (row.created_at as string) ?? '',
    };
  });
}

export async function fetchReviews(): Promise<ReviewRecord[]> {
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const legacyId = (row.legacy_id as string) || '';
    const realId = rawUuid || (legacyId ? toDeterministicUuid(legacyId) : toValidUuid());
    return {
      id: realId,
      legacyId: legacyId || undefined,
      dbId: realId,
      name: row.name as string,
      area: (row.area as string) ?? '',
      rating: Number(row.rating ?? 5),
      text: (row.text as string) ?? '',
      service: (row.service as string) ?? '',
      approved: Boolean(row.approved ?? true),
      createdAt: ((row.created_at as string) ?? '').slice(0, 10),
    };
  });
}

export async function fetchFaqs(): Promise<FaqRecord[]> {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const legacyId = (row.legacy_id as string) || '';
    const realId = rawUuid || (legacyId ? toDeterministicUuid(legacyId) : toValidUuid());
    return {
      id: realId,
      legacyId: legacyId || undefined,
      dbId: realId,
      question: row.question as string,
      answer: (row.answer as string) ?? '',
      createdAt: (row.created_at as string) ?? '',
    };
  });
}

export async function fetchRequests(): Promise<RequestRecordFull[]> {
  const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const rawUuid = (row.id as string) || '';
    const realId = rawUuid || toValidUuid();
    return {
      id: realId,
      dbId: realId,
      type: (row.type as string) || 'order',
      name: row.name as string,
      phone: (row.phone as string) ?? '',
      details: (row.details as string) ?? '',
      status: ((row.status as string) ?? 'new') as RequestRecordFull['status'],
      createdAt: (row.created_at as string) ?? '',
    };
  });
}

const productRow = (input: ProductInput) => {
  const safeSlug =
    input.slug && input.slug.trim() && input.slug.trim() !== '-'
      ? input.slug.trim()
      : slugify(input.name);

  return {
    slug: safeSlug,
    name: input.name,
    category: input.category,
    price: input.price,
    compare_at: input.compareAt,
    description: input.description,
    dimensions: input.dimensions,
    care: input.care,
    materials: input.materials,
    colors: input.colors,
    images: input.images,
    badge: input.badge,
    featured: input.featured,
    available: input.available,
    store_id: toValidStoreUuid(input.storeId),
  };
};

export async function insertProduct(input: ProductInput) {
  const row = {
    ...productRow(input),
    id: toValidUuid(),
  };
  const { error } = await supabase.from('products').insert(row);
  if (error) throw new Error(error.message);
}

export async function updateProductRow(dbId: string, input: ProductInput) {
  const row = productRow(input);
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('products').update(row).eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('products').update(row).eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('products').update(row).eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

export async function deleteProductRow(dbId: string) {
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('products').delete().eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('products').delete().eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('products').delete().eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

const storeRow = (input: StoreInput) => ({
  name: input.name,
  city: input.city,
  area: input.area,
  address: input.address,
  specialty: input.specialty,
  phone: input.phone,
  rating: input.rating,
  verified:
    input.approvalStatus === 'approved'
      ? true
      : input.approvalStatus === 'rejected' || input.approvalStatus === 'pending'
      ? false
      : Boolean(input.verified),
  description: input.description,
  image_url: input.imageUrl,
});

export async function insertStore(input: StoreInput) {
  const row = {
    ...storeRow(input),
    id: toValidUuid(),
  };
  const { error } = await supabase.from('stores').insert(row);
  if (error) throw new Error(error.message);
}

export async function updateStoreRow(dbId: string, input: StoreInput) {
  try {
    const row = storeRow(input);
    if (isValidUuid(dbId)) {
      const { error } = await supabase.from('stores').update(row).eq('id', dbId);
      if (error) console.warn('Supabase store update warn:', error.message);
    } else {
      const { error } = await supabase.from('stores').update(row).eq('legacy_id', dbId);
      if (error) {
        const validUuid = toValidUuid(dbId);
        await supabase.from('stores').update(row).eq('id', validUuid);
      }
    }
  } catch (err) {
    console.warn('Silent catch updateStoreRow:', err);
  }
}

export async function deleteStoreRow(dbId: string) {
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('stores').delete().eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('stores').delete().eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('stores').delete().eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

const designerRow = (input: DesignerInput) => ({
  name: input.name,
  title: input.title,
  area: input.area,
  years: input.years,
  rating: input.rating,
  bio: input.bio,
  image_url: input.imageUrl,
  portfolio: input.portfolio,
  kind: input.kind,
});

export async function insertDesigner(input: DesignerInput) {
  const row = {
    ...designerRow(input),
    id: toValidUuid(),
  };
  const { error } = await supabase.from('designers').insert(row);
  if (error) throw new Error(error.message);
}

export async function updateDesignerRow(dbId: string, input: DesignerInput) {
  try {
    const row = designerRow(input);
    if (isValidUuid(dbId)) {
      const { error } = await supabase.from('designers').update(row).eq('id', dbId);
      if (error) console.warn('Supabase designer update warn:', error.message);
    } else {
      const { error } = await supabase.from('designers').update(row).eq('legacy_id', dbId);
      if (error) {
        const validUuid = toValidUuid(dbId);
        await supabase.from('designers').update(row).eq('id', validUuid);
      }
    }
  } catch (err) {
    console.warn('Silent catch updateDesignerRow:', err);
  }
}

export async function deleteDesignerRow(dbId: string) {
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('designers').delete().eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('designers').delete().eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('designers').delete().eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

const partnerRow = (input: PartnerInput) => ({
  name: input.name,
  type: input.type,
  description: input.description,
  icon: input.icon,
});

export async function insertPartner(input: PartnerInput) {
  const row = {
    ...partnerRow(input),
    id: toValidUuid(),
  };
  const { error } = await supabase.from('partners').insert(row);
  if (error) throw new Error(error.message);
}

export async function updatePartnerRow(dbId: string, input: PartnerInput) {
  const row = partnerRow(input);
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('partners').update(row).eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('partners').update(row).eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('partners').update(row).eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

export async function deletePartnerRow(dbId: string) {
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('partners').delete().eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('partners').delete().eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('partners').delete().eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

const reviewRow = (input: ReviewInput) => ({
  name: input.name,
  area: input.area,
  rating: input.rating,
  text: input.text,
  service: input.service,
  approved: input.approved,
});

export async function insertReview(input: ReviewInput) {
  const row = {
    ...reviewRow(input),
    id: toValidUuid(),
  };
  const { error } = await supabase.from('reviews').insert(row);
  if (error) throw new Error(error.message);
}

export async function updateReviewRow(dbId: string, input: ReviewInput) {
  const row = reviewRow(input);
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('reviews').update(row).eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('reviews').update(row).eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('reviews').update(row).eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

export async function deleteReviewRow(dbId: string) {
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('reviews').delete().eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('reviews').delete().eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('reviews').delete().eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

export async function insertFaq(input: FaqInput) {
  const { error } = await supabase.from('faqs').insert({
    id: toValidUuid(),
    question: input.question,
    answer: input.answer,
  });
  if (error) throw new Error(error.message);
}

export async function updateFaqRow(dbId: string, input: FaqInput) {
  const row = { question: input.question, answer: input.answer };
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('faqs').update(row).eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('faqs').update(row).eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('faqs').update(row).eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

export async function deleteFaqRow(dbId: string) {
  if (isValidUuid(dbId)) {
    const { error } = await supabase.from('faqs').delete().eq('id', dbId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('faqs').delete().eq('legacy_id', dbId);
    if (error) {
      const validUuid = toValidUuid(dbId);
      const { error: retryError } = await supabase.from('faqs').delete().eq('id', validUuid);
      if (retryError) throw new Error(retryError.message);
    }
  }
}

export async function insertRequest(input: RequestInput) {
  try {
    const { error } = await supabase.from('requests').insert({
      id: toValidUuid(),
      type: input.type,
      name: input.name,
      phone: input.phone,
      details: input.details,
      status: input.status ?? 'new',
    });
    if (error) {
      console.warn('Supabase requests table insert warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase requests network error:', err);
  }
}

export async function updateRequestRow(dbId: string, status: RequestRecordFull['status']) {
  try {
    const validUuid = toValidUuid(dbId);
    const { error } = await supabase.from('requests').update({ status }).eq('id', validUuid);
    if (error) {
      console.warn('Supabase updateRequestRow warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase updateRequestRow network warning:', err);
  }
}

export async function deleteRequestRow(dbId: string) {
  const validUuid = toValidUuid(dbId);
  const { error } = await supabase.from('requests').delete().eq('id', validUuid);
  if (error) throw new Error(error.message);
}
