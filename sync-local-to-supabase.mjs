import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const catalog = require('./src/data/catalog.ts');

const SUPABASE_URL = 'https://xreahhaivntkriiaegra.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZWFoaGFpdm50a3JpaWFlZ3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2Mzg4NzIsImV4cCI6MjExMDIxNDg3Mn0.Wcgovbcc4BhWh5LPfgIAv9h_IOXTO57-mFNFArVf6Ho';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const storeLegacyToUuid = {
  's-altaweel': 'e8a10001-0000-4000-8000-000000000001',
  's-homecentre': 'e8a10002-0000-4000-8000-000000000002',
  's-aydaroos': 'e8a10003-0000-4000-8000-000000000003',
  's1': '3117f43e-d0ca-41e1-82a1-7dead277af20',
  's2': '19a63b7b-9e48-47b4-9143-b8542f6fe9a8',
  's3': '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c',
  's4': 'bb034e56-54b2-4c5b-b15d-4602d49bb90d',
  's5': 'c913879b-4070-459d-b3ad-7c7a0909d514',
  's6': '3b3d9526-cd59-436d-802c-d7f1fd352d76',
  's7': 'e7100a86-752b-48d5-8482-13a09c9a9401',
  's8': 'ec65b6cd-afc8-49bf-93ce-0d1f05714848',
};

const resolveStoreUuid = (rawId) => {
  if (!rawId) return 'e8a10002-0000-4000-8000-000000000002';
  const clean = rawId.trim();
  if (storeLegacyToUuid[clean]) return storeLegacyToUuid[clean];
  if (storeLegacyToUuid[clean.toLowerCase()]) return storeLegacyToUuid[clean.toLowerCase()];
  return clean;
};

async function syncAll() {
  console.log('🚀 Starting sync of clean local catalog data to Supabase...\n');

  // ==========================================
  // 1. Sync STORES
  // ==========================================
  console.log('📦 1. Synchronizing Stores (المعارض الـ 11)...');
  for (const store of catalog.stores) {
    const realUuid = resolveStoreUuid(store.id);
    const legacyId = store.id.startsWith('s') ? store.id : (store.legacyId || null);

    const storePayload = {
      id: realUuid,
      legacy_id: legacyId,
      name: store.name,
      city: store.city || 'المكلا',
      area: store.area || 'المكلا',
      address: store.address || `المكلا — ${store.area}`,
      specialty: store.specialty,
      phone: store.phone,
      rating: Number(store.rating) || 4.8,
      verified: Boolean(store.verified ?? true),
      approval_status: 'approved',
      description: store.description,
      image_url: store.imageUrl,
    };

    // Update by id first
    const { data: updated, error: updateErr } = await supabase
      .from('stores')
      .update(storePayload)
      .eq('id', realUuid)
      .select('id, name');

    if (!updateErr && updated && updated.length > 0) {
      console.log(`  ✓ Updated store: ${store.name}`);
    } else {
      // Upsert
      const { error: upsertErr } = await supabase.from('stores').upsert(storePayload);
      if (upsertErr) {
        console.error(`  ✗ Error upserting store ${store.name}:`, upsertErr.message);
      } else {
        console.log(`  ✓ Upserted store: ${store.name}`);
      }
    }
  }

  // ==========================================
  // 2. Clean up corrupted or junk products
  // ==========================================
  console.log('\n🧹 2. Cleaning up corrupted/junk test products from Supabase...');
  const { data: allSupabaseProducts } = await supabase.from('products').select('id, slug, name');
  const validSlugs = new Set(catalog.products.map((p) => p.slug));

  for (const sbP of allSupabaseProducts || []) {
    // If slug is empty, begins with dash, or is corrupted test
    const isJunk =
      !sbP.slug ||
      sbP.slug === '-' ||
      sbP.slug.startsWith('-') ||
      sbP.name === 'اختبار تجريبي فحص' ||
      sbP.name.includes('test') ||
      sbP.slug.includes('test-');

    if (isJunk) {
      await supabase.from('products').delete().eq('id', sbP.id);
      console.log(`  🗑 Deleted junk product: [${sbP.id}] ${sbP.name} (slug: ${sbP.slug})`);
    }
  }

  // ==========================================
  // 3. Sync clean PRODUCTS
  // ==========================================
  console.log('\n✨ 3. Synchronizing clean Products with high-res photos (40 قطعة)...');
  let updatedCount = 0;
  let insertedCount = 0;

  for (const prod of catalog.products) {
    const targetStoreId = resolveStoreUuid(prod.storeId);
    const legacyId = prod.id.startsWith('p') ? prod.id : (prod.legacyId || null);

    const productPayload = {
      slug: prod.slug,
      name: prod.name,
      category: prod.category,
      price: Number(prod.price) || 50000,
      compare_at: prod.compareAt ? Number(prod.compareAt) : null,
      description: prod.description || 'قطعة أثاث فاخرة بتصميم متقن وخامات عالية الجودة.',
      dimensions: prod.dimensions || 'مقاس قياسي',
      care: prod.care || 'مسح بقطعة قماش ناعمة وجافة.',
      materials: prod.materials || [],
      colors: prod.colors || [],
      images: prod.images || [],
      badge: prod.badge || (prod.featured ? 'مميز' : 'متوفر'),
      featured: Boolean(prod.featured),
      available: Boolean(prod.available ?? true),
      store_id: targetStoreId,
      legacy_id: legacyId,
    };

    // Try update by slug first (so clean cloud image replaces old Base64)
    const { data: updatedBySlug, error: slugErr } = await supabase
      .from('products')
      .update(productPayload)
      .eq('slug', prod.slug)
      .select('id, name');

    if (!slugErr && updatedBySlug && updatedBySlug.length > 0) {
      updatedCount++;
      console.log(`  ✓ Updated product [${prod.slug}]: ${prod.name}`);
      continue;
    }

    // Try update by exact name
    const { data: updatedByName } = await supabase
      .from('products')
      .update(productPayload)
      .eq('name', prod.name)
      .select('id, name');

    if (updatedByName && updatedByName.length > 0) {
      updatedCount++;
      console.log(`  ✓ Updated product by name: ${prod.name}`);
      continue;
    }

    // Otherwise insert new with real UUID
    const insertPayload = {
      ...productPayload,
    };
    if (prod.id.includes('-') && prod.id.length === 36) {
      insertPayload.id = prod.id;
    }

    const { error: insertErr } = await supabase.from('products').insert(insertPayload);
    if (insertErr) {
      console.error(`  ✗ Error inserting product ${prod.name}:`, insertErr.message);
    } else {
      insertedCount++;
      console.log(`  + Inserted product: ${prod.name}`);
    }
  }

  console.log(`\n🎉 Sync Complete! Updated: ${updatedCount}, Inserted: ${insertedCount}`);
}

syncAll().catch(console.error);
