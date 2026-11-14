const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://xreahhaivntkriiaegra.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZWFoaGFpdm50a3JpaWFlZ3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2Mzg4NzIsImV4cCI6MjExMDIxNDg3Mn0.Wcgovbcc4BhWh5LPfgIAv9h_IOXTO57-mFNFArVf6Ho';

const supabase = createClient(url, key);

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function run() {
  console.log('Fetching all live data from Supabase...');
  const { data: stores } = await supabase.from('stores').select('*').order('name');
  const { data: products } = await supabase.from('products').select('*').order('name');
  const { data: designers } = await supabase.from('designers').select('*').order('name');
  const { data: partners } = await supabase.from('partners').select('*').order('name');
  const { data: reviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  const { data: faqs } = await supabase.from('faqs').select('*').order('sort_order');
  const { data: requests } = await supabase.from('requests').select('*').order('created_at', { ascending: false });

  let sql = `-- ==============================================================================
-- مشروع إيوان — المنصة الرقمية الموحدة لأثاث المكلا والتصميم الداخلي
-- ملف قاعدة البيانات السحابية الشامل والموحد (EWAN FULL MASTER SQL)
-- الربط المباشر: Supabase Cloud (xreahhaivntkriiaegra)
-- التاريخ: ${new Date().toISOString()}
-- ==============================================================================

-- 1. تفعيل الامتدادات الضرورية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. إنشاء الجداول الأساسية
-- ==============================================================================

-- جدول المعارض والمتاجر (Stores)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'المكلا',
  area TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  specialty TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  approval_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول المنتجات والقطع (Products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at NUMERIC(12,2),
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  reviews INTEGER NOT NULL DEFAULT 0,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NOT NULL DEFAULT '',
  dimensions TEXT NOT NULL DEFAULT '',
  care TEXT NOT NULL DEFAULT '',
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول المصممين وورش النجارة (Designers & Carpenters)
CREATE TABLE IF NOT EXISTS public.designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  years INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  bio TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
  kind TEXT NOT NULL DEFAULT 'designer',
  phone TEXT NOT NULL DEFAULT '',
  approval_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الشركاء والخدمات اللوجستية (Partners)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'store',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول التقييمات وآراء العملاء (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الأسئلة الشائعة (FAQs)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الطلبات وتتبع الشحنات والاستشارات (Requests & Orders)
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'order',
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. الفهارس ومحفزات التحديث (Indexes & Triggers)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_store_id_idx ON public.products (store_id);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS requests_created_at_idx ON public.requests (created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END $$;

DROP TRIGGER IF EXISTS products_touch_updated_at ON public.products;
CREATE TRIGGER products_touch_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ==============================================================================
-- 4. إعدادات الأمان وسياسات الوصول السحابي (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stores_all" ON public.stores;
CREATE POLICY "stores_all" ON public.stores FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_all" ON public.products;
CREATE POLICY "products_all" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "designers_all" ON public.designers;
CREATE POLICY "designers_all" ON public.designers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "partners_all" ON public.partners;
CREATE POLICY "partners_all" ON public.partners FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_all" ON public.reviews;
CREATE POLICY "reviews_all" ON public.reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "faqs_all" ON public.faqs;
CREATE POLICY "faqs_all" ON public.faqs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "requests_all" ON public.requests;
CREATE POLICY "requests_all" ON public.requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. إدراج وتزامن البيانات الحية (Seed Data)
-- ==============================================================================
`;

  // Stores
  if (stores && stores.length > 0) {
    sql += `\n-- معارض ومتاجر أثاث المكلا المعتمدة (${stores.length} معرض)\n`;
    for (const s of stores) {
      sql += `INSERT INTO public.stores (id, legacy_id, name, city, area, address, specialty, phone, rating, verified, description, image_url)
VALUES (${escapeSql(s.id)}, ${escapeSql(s.legacy_id)}, ${escapeSql(s.name)}, ${escapeSql(s.city)}, ${escapeSql(s.area)}, ${escapeSql(s.address)}, ${escapeSql(s.specialty)}, ${escapeSql(s.phone)}, ${s.rating || 5.0}, ${s.verified ? 'TRUE' : 'FALSE'}, ${escapeSql(s.description)}, ${escapeSql(s.image_url)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  specialty = EXCLUDED.specialty,
  phone = EXCLUDED.phone,
  rating = EXCLUDED.rating,
  image_url = EXCLUDED.image_url;\n`;
    }
  }

  // Products
  if (products && products.length > 0) {
    sql += `\n-- منتجات الأثاث الحية (${products.length} منتج)\n`;
    for (const p of products) {
      sql += `INSERT INTO public.products (id, legacy_id, slug, name, category, price, compare_at, rating, reviews, colors, materials, images, badge, featured, available, description, dimensions, care, store_id)
VALUES (${escapeSql(p.id)}, ${escapeSql(p.legacy_id)}, ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.category)}, ${p.price || 0}, ${escapeSql(p.compare_at)}, ${p.rating || 5.0}, ${p.reviews || 0}, ${escapeSql(p.colors)}, ${escapeSql(p.materials)}, ${escapeSql(p.images)}, ${escapeSql(p.badge)}, ${p.featured ? 'TRUE' : 'FALSE'}, ${p.available !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(p.description)}, ${escapeSql(p.dimensions)}, ${escapeSql(p.care)}, ${escapeSql(p.store_id)})
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;\n`;
    }
  }

  // Designers
  if (designers && designers.length > 0) {
    sql += `\n-- المصممون وورش النجارة (${designers.length} مسجل)\n`;
    for (const d of designers) {
      sql += `INSERT INTO public.designers (id, legacy_id, name, title, area, years, rating, bio, image_url, portfolio, kind)
VALUES (${escapeSql(d.id)}, ${escapeSql(d.legacy_id)}, ${escapeSql(d.name)}, ${escapeSql(d.title)}, ${escapeSql(d.area)}, ${d.years || 0}, ${d.rating || 5.0}, ${escapeSql(d.bio)}, ${escapeSql(d.image_url)}, ${escapeSql(d.portfolio)}, ${escapeSql(d.kind)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  rating = EXCLUDED.rating;\n`;
    }
  }

  // Partners
  if (partners && partners.length > 0) {
    sql += `\n-- شركاء النجاح والخدمات اللوجستية (${partners.length} شريك)\n`;
    for (const pr of partners) {
      sql += `INSERT INTO public.partners (id, legacy_id, name, type, description, icon)
VALUES (${escapeSql(pr.id)}, ${escapeSql(pr.legacy_id)}, ${escapeSql(pr.name)}, ${escapeSql(pr.type)}, ${escapeSql(pr.description)}, ${escapeSql(pr.icon)})
ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // Reviews
  if (reviews && reviews.length > 0) {
    sql += `\n-- تقييمات العملاء المعتمدة (${reviews.length} تقييم)\n`;
    for (const r of reviews) {
      sql += `INSERT INTO public.reviews (id, legacy_id, name, area, rating, text, service, approved)
VALUES (${escapeSql(r.id)}, ${escapeSql(r.legacy_id)}, ${escapeSql(r.name)}, ${escapeSql(r.area)}, ${r.rating || 5}, ${escapeSql(r.text)}, ${escapeSql(r.service)}, ${r.approved ? 'TRUE' : 'FALSE'})
ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // FAQs
  if (faqs && faqs.length > 0) {
    sql += `\n-- الأسئلة الشائعة (${faqs.length} سؤال)\n`;
    for (const f of faqs) {
      sql += `INSERT INTO public.faqs (id, legacy_id, question, answer, sort_order)
VALUES (${escapeSql(f.id)}, ${escapeSql(f.legacy_id)}, ${escapeSql(f.question)}, ${escapeSql(f.answer)}, ${f.sort_order || 0})
ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // Requests
  if (requests && requests.length > 0) {
    sql += `\n-- طلبات الشراء وتتبع الشحنات المعتمدة (${requests.length} طلب)\n`;
    for (const rq of requests) {
      sql += `INSERT INTO public.requests (id, type, name, phone, details, status, created_at)
VALUES (${escapeSql(rq.id)}, ${escapeSql(rq.type)}, ${escapeSql(rq.name)}, ${escapeSql(rq.phone)}, ${escapeSql(rq.details)}, ${escapeSql(rq.status)}, ${escapeSql(rq.created_at)})
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  details = EXCLUDED.details;\n`;
    }
  }

  const outPath = path.resolve(__dirname, '..', 'EWAN_SUPABASE_FULL.sql');
  fs.writeFileSync(outPath, sql, 'utf-8');
  console.log(`Successfully generated master SQL file at: ${outPath} (${sql.length} bytes)`);
}

run().catch((err) => {
  console.error('Error generating master SQL:', err);
  process.exit(1);
});
