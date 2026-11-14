const { createClient } = require('@supabase/supabase-js');

const url = 'https://xreahhaivntkriiaegra.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZWFoaGFpdm50a3JpaWFlZ3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2Mzg4NzIsImV4cCI6MjExMDIxNDg3Mn0.Wcgovbcc4BhWh5LPfgIAv9h_IOXTO57-mFNFArVf6Ho';

const supabase = createClient(url, key);

async function main() {
  console.log('1. Fixing stores in Supabase...');
  // A. Replace base64 logos with high quality showroom pictures
  const storeUpdates = [
    {
      id: 'e8a10003-0000-4000-8000-000000000003', // العيدروس للمطابخ
      name: 'مفروشات ومطابخ العيدروس',
      image_url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'bb034e56-54b2-4c5b-b15d-4602d49bb90d', // معرض الحضرمي للمطابخ والأثاث
      name: 'معرض الحضرمي للمطابخ والأثاث',
      image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_78aa34e5-681b-4848-bfe0-195d58369e7e.jpg',
    },
    {
      id: 'e8a10001-0000-4000-8000-000000000001', // معرض الطويل للأثاث
      name: 'معرض الطويل للأثاث',
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'e8a10002-0000-4000-8000-000000000002', // معرض هوم سنتر
      name: 'معرض هوم سنتر (Home Centre)',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '3117f43e-d0ca-41e1-82a1-7dead277af20', // معرض أرض حمير
      name: 'معرض أرض حمير للأثاث والمطابخ',
      image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_78aa34e5-681b-4848-bfe0-195d58369e7e.jpg',
    },
    {
      id: '19a63b7b-9e48-47b4-9143-b8542f6fe9a8', // مفروشات باصهيل
      name: 'مفروشات باصهيل',
      image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_39070c50-1e8e-4666-8b15-8f864a70b3cf.jpg',
    },
    {
      id: '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c', // معرض بن دول
      name: 'معرض بن دول للأثاث والديكور',
      image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ec438492-8c6d-4b65-b7e2-cff91e6f8073.jpg',
    },
    {
      id: 'c913879b-4070-459d-b3ad-7c7a0909d514', // مفروشات القصر العصري
      name: 'مفروشات القصر العصري',
      image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a9d8dc61-3466-4cbe-8821-acdae8514239.jpg',
    },
  ];

  for (const s of storeUpdates) {
    const { error } = await supabase.from('stores').update({
      image_url: s.image_url,
      name: s.name,
    }).eq('id', s.id);
    if (error) console.error('Error updating store:', s.name, error.message);
    else console.log('Updated store:', s.name);
  }

  console.log('\n2. Resetting featured products in Supabase...');
  // Reset all products to featured = false
  const { error: resetErr } = await supabase.from('products').update({ featured: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (resetErr) console.error('Reset featured error:', resetErr.message);

  console.log('\n3. Fixing mismatched product images...');
  // A. Fix woman cooking on kitchen
  await supabase.from('products').update({
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80'],
    featured: false,
  }).eq('id', 'e8b10026-0000-4000-8000-000000000026');
  console.log('Fixed Scandinavian kitchen image (removed woman cooking).');

  // B. Fix exterior house on TV unit
  await supabase.from('products').update({
    images: ['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_135df80f-2725-4447-ab1d-6e6da5322a8c.jpg'],
    featured: false,
  }).eq('id', 'e8b10035-0000-4000-8000-000000000035');
  console.log('Fixed TV unit image (removed exterior house/tree).');

  // C. Fix kitchen island
  await supabase.from('products').update({
    images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1200&q=80'],
    featured: false,
  }).eq('id', 'e8b10029-0000-4000-8000-000000000029');
  console.log('Fixed kitchen island image.');

  console.log('\n4. Setting the 4 core featured products...');
  const coreFeatured = [
    {
      id: '4f6fa1c4-862b-42a4-8d46-d994ba9e2b03', // مطبخ خشب سنديان عصري متكامل بجزيرة وسطية
      name: 'مطبخ خشب سنديان عصري متكامل بجزيرة وسطية',
      images: ['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_fe4c048c-2c2d-4c51-8d9e-7df749f22aaf.jpg'],
    },
    {
      id: 'fbe4a5e5-4355-405d-9c97-38bc55c27a10', // طقم كنب زاوية مودرن كتان بيج فاتح
      name: 'طقم كنب زاوية مودرن كتان بيج فاتح',
      images: ['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6d7234b8-1729-43a8-ac36-a22885d92245.jpg'],
    },
    {
      id: '02df7d9d-5bff-48b5-b041-7044b0e29f3a', // غرفة نوم ماستر مودرن بتصميم هادئ — 6 قطع
      name: 'غرفة نوم ماستر مودرن بتصميم هادئ — 6 قطع',
      images: ['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_528e41bf-416b-4769-91cc-0d997545a968.jpg'],
    },
    {
      id: '5f9c2da7-fdb4-4906-a238-a2ea0c4a6ecb', // طاولة طعام دائرية خشب جوز مع 6 كراسي مبطنة
      name: 'طاولة طعام دائرية خشب جوز مع 6 كراسي مبطنة',
      images: ['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b1a41b3f-361b-4f3b-80ed-849b089526ce.jpg'],
    },
  ];

  for (const item of coreFeatured) {
    const { error } = await supabase.from('products').update({
      featured: true,
      images: item.images,
    }).eq('id', item.id);
    if (error) console.error('Error setting featured:', item.name, error.message);
    else console.log('Successfully set featured: true for:', item.name);
  }

  console.log('\nDone updating Supabase!');
}

main().catch(console.error);
