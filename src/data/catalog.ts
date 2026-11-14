/**
 * بيانات منصة إيوان — المكلا، حضرموت.
 * جميع المعارض والمنتجات والمصممين هنا بيانات حقيقية محلية، ولا تُستخدم أي بيانات أجنبية.
 */

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  legacyId?: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  colors: ColorOption[];
  materials: string[];
  images: string[];
  badge?: string;
  featured?: boolean;
  description: string;
  dimensions: string;
  care: string;
  storeId: string;
  available: boolean;
}

export interface Store {
  id: string;
  legacyId?: string;
  name: string;
  city: string;
  area: string;
  specialty: string;
  phone: string;
  rating: number;
  verified: boolean;
  imageUrl: string;
  description: string;
}

export const getProductColorStyle = (hex?: string) => {
  if (!hex) return {};
  return {
    filter: `drop-shadow(0 0 1px ${hex}40)`,
  };
};

export interface Designer {
  id: string;
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
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
}

export interface Review {
  id: string;
  name: string;
  area: string;
  rating: number;
  text: string;
  service: string;
  approved: boolean;
  createdAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface RequestRecord {
  id: string;
  type: 'order' | 'custom';
  name: string;
  phone: string;
  details: string;
  status: 'new' | 'contacted' | 'done';
  createdAt: string;
}

export const IMG = {
  kitchen: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_fe4c048c-2c2d-4c51-8d9e-7df749f22aaf.jpg',
  sofa: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6d7234b8-1729-43a8-ac36-a22885d92245.jpg',
  bedroom: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_528e41bf-416b-4769-91cc-0d997545a968.jpg',
  dining: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b1a41b3f-361b-4f3b-80ed-849b089526ce.jpg',
  armchair: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e33daea6-202c-4c2e-82e1-f700dd9ebf09.jpg',
  tvUnit: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_135df80f-2725-4447-ab1d-6e6da5322a8c.jpg',
  majlis: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_553090e8-f382-4a61-a6b1-3b2342de7487.jpg',
  lighting: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_42b64abe-730c-47e8-a520-371f2bd26d43.jpg',
  wardrobe: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_94334c38-52a0-4ca7-8aad-c653a732d755.jpg',
  coffee: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_fbed43ea-cf88-4079-b733-4b2d5c60d4b0.jpg',
  showroomKitchen: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_78aa34e5-681b-4848-bfe0-195d58369e7e.jpg',
  showroomSofa: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_39070c50-1e8e-4666-8b15-8f864a70b3cf.jpg',
  showroomLuxury: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ec438492-8c6d-4b65-b7e2-cff91e6f8073.jpg',
  showroomMajlis: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a9d8dc61-3466-4cbe-8821-acdae8514239.jpg',
  showroomDining: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5a2878cf-fad2-4ec9-bac6-bda7443674b1.jpg',
  showroomBedroom: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9173cea8-9fcb-475f-9ed5-4aca3f30c4d8.jpg',
  showroomEntry: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_cd734572-e5da-45c2-b602-84b6a330a377.jpg',
  showroomLiving: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d89701e6-0c04-42b9-a587-559076c606f3.jpg',
  designerMale: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3cdc8131-6ee1-4c02-b0b4-9553fd29c8e1.jpg',
  designerFemale: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_28f508b9-6f9b-47e1-8b41-f439a1844698.jpg',
  carpenter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_267de19f-3705-4358-862a-f5b8ae7ea806.jpg',
  visualizer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_15dbe016-5f33-4a4f-8692-bc4af4fb8c04.jpg',
};

export const heroImage = IMG.showroomLiving;

export const categories = [
  { name: 'مطابخ', image: IMG.kitchen, count: 1 },
  { name: 'كنب ومجالس', image: IMG.sofa, count: 2 },
  { name: 'غرف نوم', image: IMG.bedroom, count: 1 },
  { name: 'طاولات وكراسي', image: IMG.dining, count: 2 },
  { name: 'إضاءة', image: IMG.lighting, count: 1 },
  { name: 'وحدات تخزين', image: IMG.wardrobe, count: 2 },
  { name: 'ديكور', image: IMG.coffee, count: 1 },
];

export const areas = ['الديس', 'الشرج', 'فوة', 'باعبود', 'الأربعين', 'الصناعية'];

export const stores: Store[] = [
  {
    id: 'e8a10001-0000-4000-8000-000000000001',
    legacyId: 's-altaweel',
    name: 'معرض الطويل للأثاث',
    city: 'المكلا',
    area: 'فوة',
    specialty: 'كنب أمريكي ومجالس فاخرة وطاولات طعام',
    phone: '+967 5 301 234',
    rating: 4.9,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    description:
      'أحد أكبر وأفخم معارض الأثاث في المكلا — فوة، يقدم أطقم كنب ومجالس عصرية بتصاميم تواكب الهوية الأوروبية الدافئة.',
  },
  {
    id: 'e8a10002-0000-4000-8000-000000000002',
    legacyId: 's-homecentre',
    name: 'معرض هوم سنتر (Home Centre)',
    city: 'المكلا',
    area: 'الديس',
    specialty: 'أثاث مودرن متكامل، غرف نوم، وإكسسوارات منزلية',
    phone: '+967 5 305 678',
    rating: 4.8,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    description:
      'تشكيلات أوروبية وعصرية تواكب أحدث صيحات الديكور بتناغم دافئ وأسعار تنافسية تناسب كافة مساحات بيوت المكلا.',
  },
  {
    id: 'e8a10003-0000-4000-8000-000000000003',
    legacyId: 's-aydaroos',
    name: 'مفروشات العيدروس',
    city: 'المكلا',
    area: 'الشرج',
    specialty: 'مفروشات نوم ودواليب غرف ماستر وأطفال',
    phone: '+967 5 308 910',
    rating: 4.8,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
    description:
      'تشكيلات نوم وأثاث مريح من أجود أنواع الأخشاب الطبيعية والقشرة المقاومة للرطوبة في المكلا.',
  },
  {
    id: 's1',
    name: 'معرض أرض حمير للأثاث والمطابخ',
    city: 'المكلا',
    area: 'الديس',
    specialty: 'المطابخ الحديثة وغرف النوم والأثاث الفاخر',
    phone: '+967 5 000 101',
    rating: 4.9,
    verified: true,
    imageUrl: IMG.showroomKitchen,
    description:
      'من أعرق معارض الأثاث في المكلا، متخصص في المطابخ المتكاملة وغرف النوم الفاخرة بخامات مستوردة وتنفيذ هندسي دقيق.',
  },
  {
    id: 's2',
    name: 'مفروشات باصهيل',
    city: 'المكلا',
    area: 'الشرج',
    specialty: 'أطقم الكنب والمجالس العربية وغرف المعيشة',
    phone: '+967 5 000 102',
    rating: 4.8,
    verified: true,
    imageUrl: IMG.showroomSofa,
    description:
      'وجهة أهل المكلا لأطقم الكنب والمجالس العربية، بخيارات أقمشة واسعة وتفصيل يناسب مساحات المنازل الحضرمية.',
  },
  {
    id: 's3',
    name: 'معرض بن دول للأثاث والديكور',
    city: 'المكلا',
    area: 'فوة',
    specialty: 'أثاث منزلي ومكتبي مودرن',
    phone: '+967 5 000 103',
    rating: 4.8,
    verified: true,
    imageUrl: IMG.showroomLuxury,
    description:
      'تشكيلة مودرن للأثاث المنزلي والمكتبي، مع خدمة تنسيق ديكور متكاملة للمكاتب والمساحات التجارية.',
  },
  {
    id: 's4',
    name: 'معرض الحضرمي للمطابخ والأثاث',
    city: 'المكلا',
    area: 'الشرج',
    specialty: 'تفصيل مطابخ ألمنيوم وخشب طبيعي',
    phone: '+967 5 000 104',
    rating: 4.7,
    verified: true,
    imageUrl: IMG.showroomLiving,
    description:
      'ورشة ومعرض متكامل لتفصيل المطابخ بالألمنيوم والخشب الطبيعي، بقياسات دقيقة وضمان على التركيب.',
  },
  {
    id: 's5',
    name: 'مفروشات القصر العصري',
    city: 'المكلا',
    area: 'الديس',
    specialty: 'غرف نوم تركية ومجالس',
    phone: '+967 5 000 105',
    rating: 4.8,
    verified: true,
    imageUrl: IMG.showroomBedroom,
    description:
      'غرف نوم تركية بتصاميم هادئة ومجالس عصرية، مع خيارات تقسيط ميسّرة وتوصيل داخل المكلا.',
  },
  {
    id: 's6',
    name: 'معرض النخبة للأثاث والديكور',
    city: 'المكلا',
    area: 'فوة',
    specialty: 'طاولات طعام، مداخل، وإضاءات حديثة',
    phone: '+967 5 000 106',
    rating: 4.7,
    verified: true,
    imageUrl: IMG.showroomDining,
    description:
      'متخصص في طاولات الطعام والمداخل والإضاءات الحديثة، بقطع مختارة بعناية تناسب الذوق الحضرمي المعاصر.',
  },
  {
    id: 's7',
    name: 'مفروشات بن هلابي',
    city: 'المكلا',
    area: 'باعبود',
    specialty: 'غرف معيشة، سجاد، ومفروشات متكاملة',
    phone: '+967 5 000 107',
    rating: 4.6,
    verified: true,
    imageUrl: IMG.showroomMajlis,
    description:
      'مفروشات متكاملة تشمل غرف المعيشة والسجاد والمجالس الأرضية بتطريز حضرمي أصيل بلمسة عصرية.',
  },
  {
    id: 's8',
    name: 'معرض الفخامة للأثاث',
    city: 'المكلا',
    area: 'الأربعين',
    specialty: 'أطقم جلوس كلاسيك ونيوكلاسيك',
    phone: '+967 5 000 108',
    rating: 4.8,
    verified: true,
    imageUrl: IMG.showroomEntry,
    description:
      'أطقم جلوس كلاسيكية ونيوكلاسيكية بتفاصيل نحاسية وخشب مصقول، لمن يبحث عن حضور فخم في المجلس.',
  },
];

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'oak-kitchen-island',
    name: 'مطبخ خشب سنديان عصري متكامل بجزيرة وسطية',
    category: 'مطابخ',
    price: 1450000,
    rating: 4.9,
    reviews: 34,
    colors: [
      { name: 'سنديان طبيعي', hex: '#B98A5A' },
      { name: 'أبيض مطفي', hex: '#F2EDE4' },
      { name: 'رمادي دافئ', hex: '#9C948A' },
    ],
    materials: ['خشب سنديان طبيعي', 'رخام كوارتز', 'مفصلات هيدروليكية'],
    images: [IMG.kitchen],
    badge: 'الأكثر طلباً',
    featured: true,
    description:
      'مطبخ متكامل بجزيرة وسطية من خشب السنديان الطبيعي مع سطح رخام كوارتز، وتقسيم داخلي مدروس يمنح مساحة عمل واسعة وتخزيناً عملياً.',
    dimensions: '4 × 3 متر',
    care: 'مسح الأسطح بقطعة قماش ناعمة وتجنب المنظفات الكاشطة.',
    storeId: 's1',
    available: true,
  },
  {
    id: 'p2',
    slug: 'linen-corner-sofa',
    name: 'طقم كنب زاوية مودرن كتان بيج فاتح',
    category: 'كنب ومجالس',
    price: 680000,
    rating: 4.8,
    reviews: 52,
    colors: [
      { name: 'بيج فاتح', hex: '#D9CBB6' },
      { name: 'كريمي', hex: '#EFE7DA' },
      { name: 'رمادي دافئ', hex: '#A9A29A' },
    ],
    materials: ['خشب زان', 'قماش كتان مقاوم للبقع', 'إسفنج عالي الكثافة'],
    images: [IMG.sofa],
    badge: 'تصميم مميز',
    featured: true,
    description:
      'طقم كنب زاوية بتصميم مودرن هادئ، هيكل من خشب الزان وقماش كتان مقاوم للبقع، مثالي لغرف المعيشة العائلية الواسعة.',
    dimensions: '320 × 240 سم',
    care: 'تنظيف جاف للقماش، وتجنب أشعة الشمس المباشرة.',
    storeId: 's2',
    available: true,
  },
  {
    id: 'p3',
    slug: 'master-bedroom-set',
    name: 'غرفة نوم ماستر مودرن بتصميم هادئ — 6 قطع',
    category: 'غرف نوم',
    price: 1250000,
    rating: 4.8,
    reviews: 27,
    colors: [
      { name: 'قشرة جوز', hex: '#6B4A34' },
      { name: 'كريمي', hex: '#EFE7DA' },
    ],
    materials: ['خشب MDF ماليزي', 'قشرة جوز طبيعية', 'مفصلات هيدروليكية'],
    images: [IMG.bedroom],
    featured: true,
    description:
      'غرفة نوم ماستر من ست قطع بتصميم هادئ، خشب MDF ماليزي ملبس قشرة جوز، مع سرير رئيسي وخزانة وتسريحة وطاولتي سرير.',
    dimensions: 'السرير 180 × 200 سم',
    care: 'تلميع الخشب بزيت مخصص كل ستة أشهر.',
    storeId: 's5',
    available: true,
  },
  {
    id: 'p4',
    slug: 'walnut-round-dining-table',
    name: 'طاولة طعام دائرية خشب جوز مع 6 كراسي مبطنة',
    category: 'طاولات وكراسي',
    price: 390000,
    rating: 4.7,
    reviews: 41,
    colors: [
      { name: 'جوز داكن', hex: '#5C3D2E' },
      { name: 'بيج', hex: '#D9CBB6' },
    ],
    materials: ['خشب جوز', 'قماش مبطّن', 'طلاء مقاوم للخدش'],
    images: [IMG.dining],
    featured: true,
    description:
      'طاولة طعام دائرية من خشب الجوز مع ستة كراسي مبطنة، تصميم يجمع العائلة ويمنح غرفة الطعام حضوراً دافئاً.',
    dimensions: 'القطر 150 سم',
    care: 'استخدام قواعد لباد أسفل الأواني الساخنة.',
    storeId: 's3',
    available: true,
  },
  {
    id: 'p5',
    slug: 'boucle-lounge-chair',
    name: 'كرسي استرخاء مفرد قماش بوكليه أبيض كريمي',
    category: 'طاولات وكراسي',
    price: 165000,
    rating: 4.7,
    reviews: 63,
    colors: [
      { name: 'أبيض كريمي', hex: '#F2EDE4' },
      { name: 'بيج رملي', hex: '#D9CBB6' },
    ],
    materials: ['قماش بوكليه', 'هيكل خشب صلب', 'قاعدة معدنية'],
    images: [IMG.armchair],
    badge: 'جديد',
    featured: true,
    description:
      'كرسي استرخاء مفرد بقماش بوكليه ناعم، مثالي لزوايا القراءة وغرف الاستقبال، بتصميم انسيابي مريح.',
    dimensions: '85 × 80 × 78 سم',
    care: 'تنظيف جاف أو بالبخار الخفيف.',
    storeId: 's6',
    available: true,
  },
  {
    id: 'p6',
    slug: 'minimal-tv-unit',
    name: 'وحدة تلفزيون معلقة بتصميم مينيملست خشب وأبيض',
    category: 'وحدات تخزين',
    price: 220000,
    rating: 4.6,
    reviews: 38,
    colors: [
      { name: 'خشب وأبيض', hex: '#E4D6C3' },
      { name: 'جوز داكن', hex: '#5C3D2E' },
    ],
    materials: ['خشب MDF', 'قشرة خشب طبيعية', 'دهان مطفي'],
    images: [IMG.tvUnit],
    featured: false,
    description:
      'وحدة تلفزيون معلقة بتصميم مينيملست يجمع الخشب والأبيض، بأدراج مخفية وفتحات تهوية للشاشات والأجهزة.',
    dimensions: 'العرض 200 سم',
    care: 'مسح بقطعة قماش جافة.',
    storeId: 's1',
    available: true,
  },
  {
    id: 'p7',
    slug: 'hadrami-floor-majlis',
    name: 'مجلس عربي أرضي فاخر بتطريز حضرمي عصري',
    category: 'كنب ومجالس',
    price: 540000,
    rating: 4.9,
    reviews: 45,
    colors: [
      { name: 'بيج ذهبي', hex: '#D9CBB6' },
      { name: 'أخضر زيتي', hex: '#7C7F5B' },
      { name: 'عنابي', hex: '#7A3B3B' },
    ],
    materials: ['قماش مخملي', 'إسفنج عالي الكثافة', 'تطريز يدوي'],
    images: [IMG.majlis],
    badge: 'حضرمي أصيل',
    featured: true,
    description:
      'مجلس أرضي فاخر بتطريز حضرمي عصري، يجمع بين أصالة المجلس الحضرمي وراحة الجلسات الحديثة، مع مساند مبطنة.',
    dimensions: 'يُفصّل حسب المساحة',
    care: 'تنظيف جاف فقط للحفاظ على التطريز.',
    storeId: 's7',
    available: true,
  },
  {
    id: 'p8',
    slug: 'brass-pendant-light',
    name: 'إضاءة معلقة نحاسية دافئة لغرف الطعام والصالات',
    category: 'إضاءة',
    price: 48000,
    rating: 4.7,
    reviews: 71,
    colors: [
      { name: 'نحاسي', hex: '#B08D57' },
      { name: 'أسود مطفي', hex: '#2B2B2B' },
    ],
    materials: ['نحاس مصقول', 'زجاج أوبال', 'لمبات LED دافئة'],
    images: [IMG.lighting],
    featured: false,
    description:
      'إضاءة معلقة نحاسية بضوء دافئ يمنح غرف الطعام والصالات جواً حميمياً، بتصميم هندسي بسيط وسهل التركيب.',
    dimensions: 'القطر 40 سم',
    care: 'تلميع النحاس بقطعة ناعمة جافة.',
    storeId: 's6',
    available: true,
  },
  {
    id: 'p9',
    slug: 'four-door-wardrobe',
    name: 'خزانة ملابس 4 أبواب بتقسيم داخلي ذكي وأبواب سحاب',
    category: 'وحدات تخزين',
    price: 460000,
    rating: 4.6,
    reviews: 29,
    colors: [
      { name: 'أبيض مطفي', hex: '#F2EDE4' },
      { name: 'رمادي دافئ', hex: '#9C948A' },
    ],
    materials: ['خشب MDF', 'أبواب سحاب ألمنيوم', 'مفصلات هيدروليكية'],
    images: [IMG.wardrobe],
    featured: false,
    description:
      'خزانة ملابس بأربعة أبواب سحاب وتقسيم داخلي ذكي يشمل أدراجاً وأرففاً ومساحة للتعليق، بتصميم يوفر المساحة.',
    dimensions: 'العرض 240 سم',
    care: 'تجنب الرطوبة المباشرة وتنظيف المسارات بانتظام.',
    storeId: 's4',
    available: true,
  },
  {
    id: 'p10',
    slug: 'marble-coffee-tables',
    name: 'طقم طاولات قهوة متداخلة سطح رخامي أبيض وقاعدة خشبية',
    category: 'ديكور',
    price: 135000,
    rating: 4.8,
    reviews: 56,
    colors: [
      { name: 'رخام أبيض', hex: '#EFE7DA' },
      { name: 'خشب طبيعي', hex: '#B98A5A' },
    ],
    materials: ['سطح رخام صناعي', 'قاعدة خشب طبيعي'],
    images: [IMG.coffee],
    badge: 'الأكثر مبيعاً',
    featured: true,
    description:
      'طقم طاولات قهوة متداخلة بسطح رخامي أبيض وقاعدة خشبية، يمكن ترتيبها بثلاث طرق مختلفة لتناسب مساحة جلوسك.',
    dimensions: '60 / 45 / 35 سم',
    care: 'مسح السطح بقطعة رطبة وتجفيفه فوراً.',
    storeId: 's8',
    available: true,
  },

  // 30 منتجاً إضافياً بنمط كاسا الدافئ (Casa Warm Beige/Oak Aesthetic)
  {
    id: 'e8b10011-0000-4000-8000-000000000011',
    legacyId: 'p11',
    slug: 'aria-curved-boucle-sofa',
    name: 'كنب منحنٍ فاخر قماش بوكليه عاجي دافئ',
    category: 'كنب ومجالس',
    price: 780000,
    rating: 4.9,
    reviews: 38,
    colors: [
      { name: 'عاجي بوكليه', hex: '#FAF7F2' },
      { name: 'بيج رملي', hex: '#D9CBB6' },
      { name: 'تراكوتا دافئ', hex: '#B87A5A' }
    ],
    materials: ['خشب زان طبيعي', 'قماش بوكليه أوروبي', 'إسفنج ميموري فوم'],
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80'],
    badge: 'طراز Casa',
    featured: true,
    description: 'كنب بتصميم منحنٍ انسيابي مستوحى من طراز كاسا الهادئ، يمنح غرفة المعيشة دفئاً معمارياً استثنائياً.',
    dimensions: '260 × 105 × 75 سم',
    care: 'تنظيف جاف، واستخدام فرشاة ناعمة بانتظام.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10012-0000-4000-8000-000000000012',
    legacyId: 'p12',
    slug: 'oak-accent-armchair',
    name: 'كرسي مفرد خشب بلوط وقماش كتان طبيعي',
    category: 'كنب ومجالس',
    price: 195000,
    rating: 4.8,
    reviews: 29,
    colors: [
      { name: 'كتان طبيعي', hex: '#E5DEC9' },
      { name: 'سنديان دافئ', hex: '#C9A87C' },
      { name: 'رمادي عاجي', hex: '#D4CFC7' }
    ],
    materials: ['خشب بلوط مصمت', 'قماش كتان معالج'],
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'],
    badge: 'الأكثر طلباً',
    featured: true,
    description: 'كرسي مفرد بذراعين منحنِيتين من خشب البلوط الطبيعي وتنجيد كتان مريح لجلسات القراءة والاسترخاء.',
    dimensions: '78 × 82 × 76 سم',
    care: 'مسح الخشب بقطعة جافة وتجنب المنظفات الكيماوية.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10013-0000-4000-8000-000000000013',
    legacyId: 'p13',
    slug: 'cloud-modular-sofa',
    name: 'كنب سحابي وحدات موديولار بيج رملي',
    category: 'كنب ومجالس',
    price: 890000,
    rating: 4.9,
    reviews: 44,
    colors: [
      { name: 'بيج رملي', hex: '#D6C4AC' },
      { name: 'كريمي دافئ', hex: '#FAF7F2' },
      { name: 'رمادي حجري', hex: '#B3AAA0' }
    ],
    materials: ['هيكل خشب سويدي', 'ريش معالج وإسفنج طبقات'],
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80'],
    featured: true,
    description: 'كنب سحابي وحدات منفصلة يمكن إعادة تشكيلها بحرية لتناسب أبعاد مجلسك أو غرفة المعيشة.',
    dimensions: '300 × 180 سم',
    care: 'تقليب الوسائد دورياً وتنظيف البقع فوراً.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10014-0000-4000-8000-000000000014',
    legacyId: 'p14',
    slug: 'hadhrami-modern-majlis',
    name: 'طقم مجلس حضرمي عصري بلمسة تراكوتا دافئة',
    category: 'كنب ومجالس',
    price: 950000,
    rating: 4.9,
    reviews: 57,
    colors: [
      { name: 'تراكوتا حضرمي', hex: '#B87A5A' },
      { name: 'بيج عاجي', hex: '#EFE7DA' },
      { name: 'أخضر زيتوني', hex: '#7C8B76' }
    ],
    materials: ['خشب زان مبطن', 'قماش جاكار حضرمي مطور'],
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'],
    badge: 'طابع حضرمي',
    featured: true,
    description: 'تصميم يدمج أصالة الجلسة الحضرمية بارتفاع مريح وألوان ترابية دافئة تناسب بيوت المكلا الراقية.',
    dimensions: '4 × 3 متر متصل',
    care: 'تنظيف بالبخار الخفيف والمكنسة الكهربائية.',
    storeId: '3117f43e-d0ca-41e1-82a1-7dead277af20',
    available: true,
  },
  {
    id: 'e8b10015-0000-4000-8000-000000000015',
    legacyId: 'p15',
    slug: 'lounge-linen-chair',
    name: 'مقعد استرخاء كتان وهيكل سنديان عريض',
    category: 'كنب ومجالس',
    price: 220000,
    rating: 4.7,
    reviews: 19,
    colors: [
      { name: 'كتان عاجي', hex: '#FAF7F2' },
      { name: 'بني شوكولا', hex: '#4A3728' }
    ],
    materials: ['خشب سنديان أمريكي', 'كتان نقي'],
    images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80'],
    description: 'مقعد استرخاء واسع بزاوية ميلان مدروسة هندسياً لراحة أسفل الظهر مع وسادة دعم إضافية.',
    dimensions: '85 × 90 × 72 سم',
    care: 'مسح القماش بقطعة مبللة بالماء الفاتر.',
    storeId: '19a63b7b-9e48-47b4-9143-b8542f6fe9a8',
    available: true,
  },
  {
    id: 'e8b10016-0000-4000-8000-000000000016',
    legacyId: 'p16',
    slug: 'casa-platform-bed',
    name: 'سرير ماستر منخفض منجد كتان عاجي',
    category: 'غرف نوم',
    price: 540000,
    rating: 4.9,
    reviews: 33,
    colors: [
      { name: 'كتان عاجي', hex: '#EFE7DA' },
      { name: 'رمادي دافئ', hex: '#C2B8AE' }
    ],
    materials: ['خشب هندسي متين', 'قماش كتان مبطن'],
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'],
    badge: 'طراز Casa',
    featured: true,
    description: 'سرير ماستر بمنصة منخفضة وظهر مبطن بأناقة هادئة توفر ملاذاً مريحاً للنوم والاسترخاء.',
    dimensions: '190 × 210 × 95 سم (مرتبة 180×200)',
    care: 'تنظيف بالفرشاة الجافة.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10017-0000-4000-8000-000000000017',
    legacyId: 'p17',
    slug: 'fluted-oak-nightstand',
    name: 'طاولتا سرير خشب سنديان مضلع مع درج مخفي',
    category: 'غرف نوم',
    price: 135000,
    rating: 4.8,
    reviews: 21,
    colors: [
      { name: 'سنديان طبيعي', hex: '#C9A87C' },
      { name: 'جوزي داكن', hex: '#5C3D2E' }
    ],
    materials: ['خشب سنديان طبيعي', 'سكك هيدروليك إيطالية'],
    images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1000&q=80'],
    description: 'طقم طاولتي سرير بتفاصيل تضليع عمودية مميزة ومقابض مدمجة تضفي لمسة فندقية راقية.',
    dimensions: '50 × 42 × 48 سم (قطعتين)',
    care: 'تلميع بزيت الخشب الطبيعي مرتين سنوياً.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10018-0000-4000-8000-000000000018',
    legacyId: 'p18',
    slug: 'linen-arch-headboard-bed',
    name: 'سرير نوم مزدوج ظهر قوسي مبطن',
    category: 'غرف نوم',
    price: 490000,
    rating: 4.8,
    reviews: 17,
    colors: [
      { name: 'بيج رملي', hex: '#D9CBB6' },
      { name: 'أخضر هادئ', hex: '#8F9E8B' }
    ],
    materials: ['قاعدة خشبية صلبة', 'إسفنج فندقي', 'قماش بوكليه ناعم'],
    images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80'],
    description: 'سرير عصري بتاج مقوس ناعم ولمسات خياطة يدوية بارزة تعزز الطابع الجمالي الدافئ لغرفتك.',
    dimensions: '170 × 205 × 110 سم',
    care: 'تنظيف جاف للبقع.',
    storeId: 'e8a10003-0000-4000-8000-000000000003',
    available: true,
  },
  {
    id: 'e8b10019-0000-4000-8000-000000000019',
    legacyId: 'p19',
    slug: 'minimalist-wardrobe-6door',
    name: 'خزانة ملابس 6 أبواب سنديان وأبيض هادئ',
    category: 'غرف نوم',
    price: 820000,
    rating: 4.9,
    reviews: 26,
    colors: [
      { name: 'سنديان وأبيض', hex: '#EAE5DD' },
      { name: 'جوزي كامل', hex: '#4E3629' }
    ],
    materials: ['خشب HDF ألماني مقاوم للرطوبة', 'مفصلات بلوم نمساوية'],
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'],
    description: 'خزانة ملابس واسعة بتقسيم داخلي متوازن (تعليق فساتين وبشوت، أدراج إكسسوارات مبطنة مخمل، وأرفف علوية).',
    dimensions: '270 × 220 × 60 سم',
    care: 'مسح الأبواب بقطعة مايكروفايبر معقمة.',
    storeId: '3117f43e-d0ca-41e1-82a1-7dead277af20',
    available: true,
  },
  {
    id: 'e8b10020-0000-4000-8000-000000000020',
    legacyId: 'p20',
    slug: 'boucle-bed-bench',
    name: 'بنش مقعد سرير بوكليه دافئ بقوائم خشب',
    category: 'غرف نوم',
    price: 95000,
    rating: 4.7,
    reviews: 14,
    colors: [
      { name: 'كريمي', hex: '#FAF7F2' },
      { name: 'بني تراكوتا', hex: '#9C6644' }
    ],
    materials: ['خشب سنديان', 'قماش بوكليه تيدي'],
    images: ['https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=80'],
    description: 'مقعد جانبي يوضع عند طرف السرير أو في المداخل يجمع بين العملية والشكل الديكوري الجذاب.',
    dimensions: '120 × 40 × 45 سم',
    care: 'شفط الغبار بالمكنسة الكهربائية برأس مخصص.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10021-0000-4000-8000-000000000021',
    legacyId: 'p21',
    slug: 'solid-oak-dining-table',
    name: 'طاولة طعام خشب بلوط مصمت 8 أشخاص',
    category: 'طاولات وكراسي',
    price: 620000,
    rating: 4.9,
    reviews: 31,
    colors: [
      { name: 'بلوط طبيعي فاتح', hex: '#D6BE96' },
      { name: 'بلوط مدخن', hex: '#7A5A42' }
    ],
    materials: ['خشب بلوط أوروبي مصمت 100%'],
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80'],
    badge: 'خشب طبيعي 100%',
    featured: true,
    description: 'طاولة طعام استثنائية من الخشب الطبيعي المعالج بزيت شمعي نباتي يحافظ على عروق الخشب الطبيعية لسنوات.',
    dimensions: '220 × 100 × 76 سم',
    care: 'استخدام قواعد للأكواب الساخنة وتجديد الزيت سنوياً.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10022-0000-4000-8000-000000000022',
    legacyId: 'p22',
    slug: 'travertine-round-coffee',
    name: 'طاولة قهوة دائرية حجر ترافنتين بيج',
    category: 'طاولات وكراسي',
    price: 280000,
    rating: 4.9,
    reviews: 24,
    colors: [
      { name: 'ترافنتين كلاسيك بيج', hex: '#E2D7C5' },
      { name: 'رخام رمادي دافئ', hex: '#B8B0A5' }
    ],
    materials: ['حجر ترافنتين طبيعي مصقول'],
    images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=80'],
    badge: 'طراز Casa',
    featured: true,
    description: 'قطعة فنية من حجر الترافنتين الطبيعي بمساماته الطبيعية وقاعدته الأسطوانية المتينة، ترفع مستوى أي صالون.',
    dimensions: 'قطر 90 سم × ارتفاع 36 سم',
    care: 'تنظيف بقطعة قماش رطبة دون مواد حمضية.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10023-0000-4000-8000-000000000023',
    legacyId: 'p23',
    slug: 'cane-dining-chairs-set',
    name: 'طقم 6 كراسي سفرة خيزران راتان وسنديان',
    category: 'طاولات وكراسي',
    price: 310000,
    rating: 4.8,
    reviews: 19,
    colors: [
      { name: 'خيزران طبيعي', hex: '#D8C39E' },
      { name: 'أسود مطفي وسنديان', hex: '#2A2421' }
    ],
    materials: ['خشب سنديان', 'شبك خيزران طبيعي منسوج يدوياً'],
    images: ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80'],
    description: 'طقم كراسي سفرة متناغم يجمع بين الدفء الخشبي والخفة البصرية لشبك الخيزران الطبيعي.',
    dimensions: 'العرض 48 × العمق 52 × الارتفاع 82 سم (6 كراسي)',
    care: 'تنظيف الخيزران بفرشاة ناعمة جافة.',
    storeId: '19a63b7b-9e48-47b4-9143-b8542f6fe9a8',
    available: true,
  },
  {
    id: 'e8b10024-0000-4000-8000-000000000024',
    legacyId: 'p24',
    slug: 'sculptural-side-table',
    name: 'طاولة جانبية منحوتة خشب جوز طبيعي',
    category: 'طاولات وكراسي',
    price: 85000,
    rating: 4.7,
    reviews: 16,
    colors: [
      { name: 'جوز طبيعي', hex: '#5E3E2B' },
      { name: 'سنديان مبيض', hex: '#EBE4D8' }
    ],
    materials: ['كتلة خشب جوز منحوتة'],
    images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=1000&q=80'],
    description: 'طاولة جانبية مدمجة بتصميم نحتي مميز تصلح بجانب الكنب أو كحامل للمصابيح والقطع الديكورية.',
    dimensions: 'قطر 38 سم × ارتفاع 48 سم',
    care: 'مسح دوري بقماش جاف.',
    storeId: '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c',
    available: true,
  },
  {
    id: 'e8b10025-0000-4000-8000-000000000025',
    legacyId: 'p25',
    slug: 'nesting-oak-tables',
    name: 'طقم طاولات خدمة متداخلة خشب بلوط (3 قطع)',
    category: 'طاولات وكراسي',
    price: 115000,
    rating: 4.8,
    reviews: 42,
    colors: [
      { name: 'بلوط دافئ', hex: '#C9A87C' },
      { name: 'بيج عاجي', hex: '#F0E9DF' }
    ],
    materials: ['خشب بلوط', 'قواعد حديد مطفي برونزي'],
    images: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80'],
    description: 'طقم عملي للغاية من 3 طاولات خدمة متداخلة توفر المساحة عند عدم الاستخدام وتلبي متطلبات الضيافة.',
    dimensions: 'أقطار: 55 سم / 45 سم / 35 سم',
    care: 'تجنب ترك السوائل على الخشب لفترات طويلة.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10026-0000-4000-8000-000000000026',
    legacyId: 'p26',
    slug: 'nordic-island-kitchen',
    name: 'مطبخ إسكندنافي سنديان ورخام كلكتا متكامل',
    category: 'مطابخ',
    price: 1650000,
    rating: 4.9,
    reviews: 15,
    colors: [
      { name: 'سنديان ورخام أبيض', hex: '#F4EFEB' },
      { name: 'رمادي حجري دافئ', hex: '#8C827A' }
    ],
    materials: ['خشب مقاوم للرطوبة والحرارة', 'أسطح كوارتز كلكتا إسباني'],
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80'],
    badge: 'تصميم فاخر',
    featured: true,
    description: 'مطبخ متكامل بجزيرة طهي مركزية، خزائن علوية مخفية المقابض، وإضاءة ليد دافئة مدمجة تحت الرفوف.',
    dimensions: 'تفصيل حسب مساحة مطبخك (3.5 × 4.2 م افتراضي)',
    care: 'تنظيف أسطح الكوارتز بالماء والصابون المعتدل.',
    storeId: '3117f43e-d0ca-41e1-82a1-7dead277af20',
    available: true,
  },
  {
    id: 'e8b10027-0000-4000-8000-000000000027',
    legacyId: 'p27',
    slug: 'fluted-glass-sideboard',
    name: 'بوفيه كونسول سفرة زجاج مضلع وخشب سنديان',
    category: 'مطابخ',
    price: 380000,
    rating: 4.8,
    reviews: 23,
    colors: [
      { name: 'سنديان طبيعي', hex: '#C4A47C' },
      { name: 'جوزي داكن', hex: '#453327' }
    ],
    materials: ['خشب بلوط طبيعي', 'زجاج مضلع عاكس خفيف'],
    images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=1000&q=80'],
    description: 'وحدة تخزين سفرة أنيقة بأبواب زجاجية مضلعة تخفي محتويات الضيافة جزئياً وتضفي رقياً هندسياً.',
    dimensions: '160 × 45 × 80 سم',
    care: 'تنظيف الزجاج بملمع معتاد والخشب بقطعة رطبة.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10028-0000-4000-8000-000000000028',
    legacyId: 'p28',
    slug: 'oak-barstools-set',
    name: 'طقم كراسي كاونتر جزيرة خشب مريح (قطعتين)',
    category: 'مطابخ',
    price: 95000,
    rating: 4.7,
    reviews: 18,
    colors: [
      { name: 'خشب طبيعي وكتان', hex: '#EBE2D5' },
      { name: 'خشب بني محروق', hex: '#3B2D24' }
    ],
    materials: ['خشب زان مصمت', 'تنجيد مقعد كتان مضغوط'],
    images: ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80'],
    description: 'كرسيا بار مجهزان بمسند قدم فولاذي مطفي ومقعد محشو مريح لجلسات الإفطار السريعة في المطبخ.',
    dimensions: 'ارتفاع المقعد 65 سم (يناسب كاونتر 90 سم)',
    care: 'مسح الإطار بقطعة جافة.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10029-0000-4000-8000-000000000029',
    legacyId: 'p29',
    slug: 'ceramic-kitchen-prep-table',
    name: 'جزيرة مطبخ متحركة بسطح سيراميك دافئ',
    category: 'مطابخ',
    price: 420000,
    rating: 4.8,
    reviews: 12,
    colors: [
      { name: 'أبيض عاجي وسنديان', hex: '#F0ECE4' },
      { name: 'رمادي غامق', hex: '#4A4644' }
    ],
    materials: ['سطح سيراميك حراري مقاوم للخدش', 'هيكل خشب زان بعجلات مخفية'],
    images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1000&q=80'],
    description: 'حل مثالي لزيادة مساحة العمل والتقطيع في المطابخ مع رفوف سفلية لترتيب الأواني وأدوات الطهي.',
    dimensions: '130 × 75 × 90 سم',
    care: 'سطح السيراميك يتحمل الحرارة العالية وسهل التنظيف.',
    storeId: '3117f43e-d0ca-41e1-82a1-7dead277af20',
    available: true,
  },
  {
    id: 'e8b10030-0000-4000-8000-000000000030',
    legacyId: 'p30',
    slug: 'brass-pendant-light',
    name: 'ثريا معلقة نحاس مطفي وزجاج حليبي دافئ',
    category: 'إضاءة',
    price: 75000,
    rating: 4.9,
    reviews: 37,
    colors: [
      { name: 'نحاس مطفي', hex: '#C69249' },
      { name: 'أسود مطفي', hex: '#262423' }
    ],
    materials: ['نحاس نقي مصقول', 'زجاج أوبالين أبيض حليبي'],
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'],
    badge: 'طراز Casa',
    featured: true,
    description: 'إضاءة معلقة توفر توهجاً هادئاً بدون أي توهج مزعج للعين، مثالية فوق طاولة الطعام أو جزيرة المطبخ.',
    dimensions: 'قطر 35 سم، سلك قابل للتعديل حتى 150 سم',
    care: 'مسح الزجاج بقطعة قماش ناعمة جافة.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10031-0000-4000-8000-000000000031',
    legacyId: 'p31',
    slug: 'travertine-table-lamp',
    name: 'أباجورة طاولة قاعدة ترافنتين وغطاء كتان',
    category: 'إضاءة',
    price: 55000,
    rating: 4.8,
    reviews: 28,
    colors: [
      { name: 'ترافنتين طبيعي', hex: '#DFD5C6' },
      { name: 'غطاء كتان بيج', hex: '#EDE6DA' }
    ],
    materials: ['حجر ترافنتين طبيعي', 'شيد قماش كتان بيج'],
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'],
    description: 'أباجورة جانبية مميزة بقاعدة حجرية صلبة وغطاء ينشر ضوءاً ذهبياً دافئاً في زوايا الغرف.',
    dimensions: 'قطر 28 سم × ارتفاع 42 سم',
    care: 'تنظيف الغطاء برول إزالة الوبر.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10032-0000-4000-8000-000000000032',
    legacyId: 'p32',
    slug: 'linen-pleated-floor-lamp',
    name: 'مصباح أرضي غطاء قماش بليسيه وعمود خشب جوز',
    category: 'إضاءة',
    price: 98000,
    rating: 4.9,
    reviews: 22,
    colors: [
      { name: 'بليسيه كريمي', hex: '#FAF6EE' },
      { name: 'جوز طبيعي', hex: '#5A3D2A' }
    ],
    materials: ['خشب جوز طبيعي', 'شيد قماش بليسيه مطوي يدوي'],
    images: ['https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80'],
    description: 'مصباح أرضي بطول متناسق يضفي هيبة بصرية وإضاءة محيطية ساحرة لزوايا الصالونات وغرف النوم.',
    dimensions: 'قطر 45 سم × ارتفاع 155 سم',
    care: 'نفض الغبار بريشة ناعمة.',
    storeId: '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c',
    available: true,
  },
  {
    id: 'e8b10033-0000-4000-8000-000000000033',
    legacyId: 'p33',
    slug: 'ceramic-ribbed-sconce',
    name: 'إضاءة جدارية سيراميك مضلع إنارة دافئة',
    category: 'إضاءة',
    price: 42000,
    rating: 4.7,
    reviews: 16,
    colors: [
      { name: 'سيراميك ترابي مطفي', hex: '#E2D9CC' },
      { name: 'تراكوتا هادئ', hex: '#BA7C5B' }
    ],
    materials: ['سيراميك طيني مطبوخ يدوياً'],
    images: ['https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80'],
    description: 'أبليك جداري يوجه الضوء للأعلى والأسفل بانسيابية ناعمة لإنارة الممرات وجدار السرير.',
    dimensions: '18 × 12 × 24 سم',
    care: 'مسح بقطعة قماش ناعمة.',
    storeId: '3b3d9526-cd59-436d-802c-d7f1fd352d76',
    available: true,
  },
  {
    id: 'e8b10034-0000-4000-8000-000000000034',
    legacyId: 'p34',
    slug: 'minimal-oak-bookcase',
    name: 'مكتبة جدارية رفوف خشب بلوط مفتوحة',
    category: 'وحدات تخزين',
    price: 260000,
    rating: 4.8,
    reviews: 20,
    colors: [
      { name: 'بلوط طبيعي', hex: '#CBAF88' },
      { name: 'أبيض عاجي', hex: '#F2EDE4' }
    ],
    materials: ['خشب بلوط هندسي متين', 'دعامات فولاذية مخفية'],
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80'],
    description: 'مكتبة بتصميم مفتوح بدون ظهر تمنح إحساساً بالاتساع والرحابة لعرض الكتب والتحف والمقتنيات الفنية.',
    dimensions: '120 × 35 × 190 سم',
    care: 'تنظيف الرفوف بقطعة قطنية جافة.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10035-0000-4000-8000-000000000035',
    legacyId: 'p35',
    slug: 'fluted-tv-credenza',
    name: 'وحدة تلفزيون معلقة خشب سنديان بيج مضلع',
    category: 'وحدات تخزين',
    price: 310000,
    rating: 4.9,
    reviews: 35,
    colors: [
      { name: 'بيج سنديان طبيعي', hex: '#D6C5AD' },
      { name: 'بني جوزي دافئ', hex: '#523A2A' }
    ],
    materials: ['خشب سنديان طبيعي مع واجهات مضلعة'],
    images: ['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_135df80f-2725-4447-ab1d-6e6da5322a8c.jpg'],
    badge: 'طراز Casa',
    featured: true,
    description: 'طاولة تلفزيون معلقة على الجدار تمنح الصالة مظهراً عصرياً واسعاً وسهولة تامة في تنظيف الأرضية تحتها.',
    dimensions: '220 × 40 × 38 سم',
    care: 'مسح الخشب بزيت مخصص كل فترة.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10036-0000-4000-8000-000000000036',
    legacyId: 'p36',
    slug: 'shoe-cabinet-rattan',
    name: 'خزانة أحذية ومدخل بواجهات راتان طبيعي',
    category: 'وحدات تخزين',
    price: 175000,
    rating: 4.8,
    reviews: 27,
    colors: [
      { name: 'خشب طبيعي وراتان', hex: '#DFCEB4' },
      { name: 'أسود مطفي', hex: '#2B2623' }
    ],
    materials: ['خشب زان', 'شبك راتان طبيعي للتهوية'],
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'],
    description: 'خزانة أحذية رفيعة للمداخل تضمن تهوية ممتازة بفضل شبك الراتان وتتسع لأكثر من 18 زوجاً بأناقة.',
    dimensions: '100 × 30 × 110 سم',
    care: 'تنظيف الواجهات برفق بفرشاة ناعمة.',
    storeId: '19a63b7b-9e48-47b4-9143-b8542f6fe9a8',
    available: true,
  },
  {
    id: 'e8b10037-0000-4000-8000-000000000037',
    legacyId: 'p37',
    slug: 'entryway-console-mirror',
    name: 'كونسول مدخل رفيع مع مرآة قوسية',
    category: 'وحدات تخزين',
    price: 210000,
    rating: 4.9,
    reviews: 18,
    colors: [
      { name: 'سنديان ورخام بيج', hex: '#EAE1D3' },
      { name: 'خشب جوز ونحاس', hex: '#583D2A' }
    ],
    materials: ['خشب سنديان', 'سطح حجر رخامي', 'مرآة بلجيكية نقية'],
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'],
    description: 'طقم كونسول متناسق بعمق ضحل مثالي لمداخل المنازل والشقق في المكلا لترتيب المفاتيح والعطور.',
    dimensions: 'الكونسول: 110 × 32 × 85 سم، المرآة: 60 × 90 سم',
    care: 'تنظيف المرآة بملمع زجاج.',
    storeId: 'e7100a86-752b-48d5-8482-13a09c9a9401',
    available: true,
  },
  {
    id: 'e8b10038-0000-4000-8000-000000000038',
    legacyId: 'p38',
    slug: 'organic-wool-rug',
    name: 'سجادة صوف طبيعي منسوجة يدوياً نقش هندسي',
    category: 'ديكور',
    price: 185000,
    rating: 4.9,
    reviews: 31,
    colors: [
      { name: 'عاجي وخطوط بني', hex: '#FAF6EE' },
      { name: 'بيج رملي دافئ', hex: '#DBCBB5' }
    ],
    materials: ['صوف نيوزيلندي طبيعي 100% غير مصبوغ'],
    images: ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80'],
    badge: 'صوف طبيعي',
    featured: true,
    description: 'سجادة صوفية وثيرة بملمس ناعم تحت الأقدام وألوان طبيعية بدون صبغات كيماوية لتنعم بمساحة هادئة.',
    dimensions: '200 × 300 سم',
    care: 'مكنسة بدون رأس خشن والتدوير كل 6 أشهر.',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    available: true,
  },
  {
    id: 'e8b10039-0000-4000-8000-000000000039',
    legacyId: 'p39',
    slug: 'wabi-sabi-ceramic-vases',
    name: 'طقم مزهريات سيراميك وابي سابي رملي (3 قطع)',
    category: 'ديكور',
    price: 48000,
    rating: 4.8,
    reviews: 46,
    colors: [
      { name: 'رملي خشن', hex: '#DED3C4' },
      { name: 'تراكوتا ترابي', hex: '#B87858' }
    ],
    materials: ['سيراميك خزفي بطبقة رملية يدوية'],
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'],
    description: 'ثلاث مزهريات بارتفاعات متفاوتة وملمس رملي عضوي تجسد فلسفة البساطة وتكتمل بأغصان الزيتون الجافة.',
    dimensions: 'ارتفاعات: 28 سم / 20 سم / 14 سم',
    care: 'مسح جاف فقط.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },
  {
    id: 'e8b10040-0000-4000-8000-000000000040',
    legacyId: 'p40',
    slug: 'arch-brass-full-mirror',
    name: 'مرآة جدارية طويلة إطار نحاسي مقوس',
    category: 'ديكور',
    price: 130000,
    rating: 4.9,
    reviews: 39,
    colors: [
      { name: 'نحاس دافئ', hex: '#CBA063' },
      { name: 'أسود كربوني', hex: '#262220' }
    ],
    materials: ['إطار ألمنيوم معالج بلون نحاسي مطفي', 'مرآة فضية فائقة الوضوح'],
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80'],
    badge: 'طراز Casa',
    featured: true,
    description: 'مرآة بطول كامل تضاعف الضوء في الغرفة وتمنح عمقاً بصرياً فخماً، يمكن تعليقها أو إسنادها على الجدار.',
    dimensions: '70 × 175 سم',
    care: 'تنظيف الزجاج بقماش قطني مخصص.',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    available: true,
  },

];

export const designers: Designer[] = [
  {
    id: 'd1',
    name: 'م. سالم باوزير',
    title: 'مهندس تصميم داخلي وديكور',
    area: 'المكلا',
    years: 7,
    rating: 4.9,
    phone: '+967 5 000 201',
    bio: 'متخصص في التصميم المودرن وتوزيع الإضاءة والمساحات، مع خبرة في تنفيذ مشاريع سكنية وتجارية داخل المكلا.',
    imageUrl: IMG.designerMale,
    portfolio: [IMG.showroomLiving, IMG.showroomDining, IMG.showroomEntry],
    kind: 'designer',
  },
  {
    id: 'd2',
    name: 'المعلم عبدالله بن محفوظ',
    title: 'نجار موبيليا وتفصيل أثاث خاص',
    area: 'المكلا - الصناعية',
    years: 14,
    rating: 4.9,
    phone: '+967 5 000 202',
    bio: 'تفصيل غرف نوم وخزائن حائط وأبواب خشب طبيعي، بخبرة أربعة عشر عاماً في الورشة الحضرمية.',
    imageUrl: IMG.carpenter,
    portfolio: [IMG.wardrobe, IMG.bedroom, IMG.tvUnit],
    kind: 'carpenter',
  },
  {
    id: 'd3',
    name: 'م. ريم الكثيري',
    title: 'مصممة مساحات داخلية وتنسيق لوني',
    area: 'المكلا',
    years: 5,
    rating: 4.8,
    phone: '+967 5 000 203',
    bio: 'متخصصة في الطابع الدافئ Minimalist & Boho، وتنسيق الألوان والخامات بما يناسب الإضاءة الطبيعية للمنزل.',
    imageUrl: IMG.designerFemale,
    portfolio: [IMG.showroomBedroom, IMG.armchair, IMG.coffee],
    kind: 'designer',
  },
  {
    id: 'd4',
    name: 'ورشة باجابر للنجارة الحديثة والديكور',
    title: 'ورشة نجارة وديكور',
    area: 'المكلا - الديس',
    years: 10,
    rating: 4.7,
    phone: '+967 5 000 204',
    bio: 'تفصيل مطابخ خشبية وطاولات طعام وديكورات جدارية، بخط إنتاج حديث وضمان على التنفيذ.',
    imageUrl: IMG.carpenter,
    portfolio: [IMG.kitchen, IMG.dining, IMG.showroomKitchen],
    kind: 'carpenter',
  },
  {
    id: 'd5',
    name: 'م. عمر بن سميط',
    title: 'مصمم ثلاثي الأبعاد 3D Visualizer',
    area: 'المكلا',
    years: 6,
    rating: 4.8,
    phone: '+967 5 000 205',
    bio: 'تحويل المخططات إلى صور واقعية قبل التنفيذ، لمساعدة العملاء على رؤية النتيجة النهائية بدقة.',
    imageUrl: IMG.visualizer,
    portfolio: [IMG.showroomLiving, IMG.showroomLuxury, IMG.showroomMajlis],
    kind: 'designer',
  },
];

export const partners: Partner[] = [
  {
    id: 'pt1',
    name: 'معرض أرض حمير للأثاث والمطابخ',
    type: 'معرض شريك',
    description: 'شريك معتمد للمطابخ المتكاملة وغرف النوم الفاخرة في المكلا.',
    icon: 'store',
  },
  {
    id: 'pt2',
    name: 'مفروشات باصهيل',
    type: 'معرض شريك',
    description: 'شريك معتمد لأطقم الكنب والمجالس العربية وغرف المعيشة.',
    icon: 'sofa',
  },
  {
    id: 'pt3',
    name: 'ورشة باجابر للنجارة الحديثة',
    type: 'ورشة نجارة معتمدة',
    description: 'تنفيذ تفصيل المطابخ والطاولات والديكورات الجدارية بجودة مضمونة.',
    icon: 'hammer',
  },
  {
    id: 'pt4',
    name: 'مكتب باوزير للاستشارات الهندسية',
    type: 'مكتب هندسي',
    description: 'دراسات وتصاميم داخلية وإشراف على التنفيذ للمشاريع السكنية.',
    icon: 'ruler',
  },
  {
    id: 'pt5',
    name: 'شركة حضرموت للتوصيل والتركيب',
    type: 'توصيل وتركيب',
    description: 'توصيل وتركيب الأثاث داخل المكلا ومدن حضرموت بفريق فني متخصص.',
    icon: 'truck',
  },
  {
    id: 'pt6',
    name: 'معرض النخبة للأثاث والديكور',
    type: 'معرض شريك',
    description: 'شريك معتمد لطاولات الطعام والمداخل والإضاءات الحديثة.',
    icon: 'lamp',
  },
];

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'أحمد بامطرف',
    area: 'الديس',
    rating: 5,
    text: 'تعاملت مع معرض أرض حمير على مطبخ متكامل، والنتيجة فاقت التوقعات. القياسات دقيقة والتركيب نظيف.',
    service: 'معرض أرض حمير للأثاث والمطابخ',
    approved: true,
    createdAt: '2026-09-12',
  },
  {
    id: 'r2',
    name: 'فاطمة بن سلمان',
    area: 'الشرج',
    rating: 5,
    text: 'طقم الكنب من باصهيل وصل بوقت قياسي، والقماش فعلاً مقاوم للبقع كما وعدوا. خدمة راقية.',
    service: 'مفروشات باصهيل',
    approved: true,
    createdAt: '2026-09-28',
  },
  {
    id: 'r3',
    name: 'خالد العمودي',
    area: 'فوة',
    rating: 4,
    text: 'استفدت من مصمم الذكاء الاصطناعي في ترتيب مجلسي، ثم نفّذت التصميم مع ورشة باجابر. تجربة مريحة.',
    service: 'مصمم الذكاء الاصطناعي',
    approved: true,
    createdAt: '2026-10-05',
  },
  {
    id: 'r4',
    name: 'سالم بن هلابي',
    area: 'باعبود',
    rating: 5,
    text: 'المجلس الأرضي بتطريز حضرمي من مفروشات بن هلابي أضاف لبيتنا طابعاً أصيلاً. شكراً للفريق.',
    service: 'مفروشات بن هلابي',
    approved: true,
    createdAt: '2026-10-19',
  },
  {
    id: 'r5',
    name: 'نور باحسين',
    area: 'الأربعين',
    rating: 5,
    text: 'م. ريم ساعدتني في تنسيق ألوان غرفة النوم، والنتيجة هادئة ومريحة جداً. أنصح بها.',
    service: 'م. ريم الكثيري',
    approved: true,
    createdAt: '2026-10-27',
  },
];

export const faqs: Faq[] = [
  {
    id: 'f1',
    question: 'كيف أطلب من معرض في المكلا؟',
    answer:
      'تصفح صفحة المعارض واختر المعرض المناسب، ثم اضغط «تصفح منتجات المعرض» لاستعراض قطعه، أو «محادثة المعرض» للتواصل المباشر. يمكنك أيضاً إضافة القطعة إلى السلة وإتمام الطلب، وسيتواصل معك فريق المعرض لتأكيد التفاصيل وموعد التسليم.',
  },
  {
    id: 'f2',
    question: 'كيف يعمل مصمم الذكاء الاصطناعي؟',
    answer:
      'اختر نوع المساحة والميزانية والطابع الذي تحبه، وسيقترح عليك المصمم تشكيلة من قطع المعارض المحلية المناسبة لمساحتك وميزانيتك، مع إمكانية تعديل الاختيارات وإرسالها كطلب استشارة لمصمم بشري.',
  },
  {
    id: 'f3',
    question: 'كيف أطلب تفصيلاً خاصاً من النجارين؟',
    answer:
      'من صفحة «المصممون والنجارون» اختر الورشة أو النجار المناسب واضغط «طلب تفصيل خاص»، ثم أدخل المقاسات والخامة المطلوبة ورقم التواصل. يصلك عرض سعر ومدة تنفيذ خلال ٤٨ ساعة عمل.',
  },
  {
    id: 'f4',
    question: 'ما طرق الدفع والتوصيل داخل المكلا وحضرموت؟',
    answer:
      'الدفع نقداً عند التسليم أو تحويل بنكي محلي. التوصيل داخل المكلا مجاني للطلبات فوق ٣٠٠٬٠٠٠ ر.ي، ويتم التوصيل إلى مدن حضرموت الأخرى (الشحر، سيئون، تريم) برسوم تحدد حسب المسافة وحجم القطعة.',
  },
  {
    id: 'f5',
    question: 'ما سياسة الضمان على الأثاث؟',
    answer:
      'جميع القطع المفصّلة تحصل على ضمان سنتين على الهيكل والخشب، وسنة على المفصلات والإكسسوارات. الأثاث الجاهز يخضع لضمان المصنّع، ويشمل الضمان عيوب التصنيع ولا يشمل سوء الاستخدام أو الرطوبة.',
  },
  {
    id: 'f6',
    question: 'هل يمكنني معاينة القطعة قبل الشراء؟',
    answer:
      'نعم، جميع المعارض المعروضة على المنصة لها عنوان حقيقي في المكلا ويمكن زيارتها. ننصح بالمعاينة للقطع الكبيرة مثل المطابخ وغرف النوم قبل تأكيد الطلب.',
  },
];

export interface LookbookItem {
  id: string;
  dbId?: string;
  title: string;
  area: string;
  style: string;
  image: string;
  description: string;
}

export const lookbook: LookbookItem[] = [
  {
    id: 'l1',
    title: 'مجلس حضرمي معاصر',
    area: 'الديس',
    style: 'حضرمي معاصر',
    image: IMG.showroomLiving,
    description:
      'مجلس أرضي بمساند مبطنة وأقمشة كتانية دافئة، مع إضاءة جانبية خفيفة تحافظ على طابع البيت الحضرمي.',
  },
  {
    id: 'l2',
    title: 'غرفة نوم هادئة',
    area: 'القصر العصري',
    style: 'مودرن دافئ',
    image: IMG.showroomBedroom,
    description:
      'غرفة نوم ماستر بألوان كريمية وخشب جوز، وتوزيع إضاءة غير مباشر يمنح المساحة هدوءاً كاملاً.',
  },
  {
    id: 'l3',
    title: 'غرفة طعام دافئة',
    area: 'فوة',
    style: 'نيوكلاسيك',
    image: IMG.showroomDining,
    description:
      'طاولة دائرية من خشب الجوز مع ست كراسي مبطنة، وإضاءة نحاسية معلقة فوق الطاولة مباشرة.',
  },
  {
    id: 'l4',
    title: 'مدخل منزلي أنيق',
    area: 'الأربعين',
    style: 'مينيمالست',
    image: IMG.showroomEntry,
    description:
      'مدخل بسيط بوحدة تخزين معلقة ومرآة كبيرة، يعطي انطباعاً بالاتساع دون زحام بصري.',
  },
  {
    id: 'l5',
    title: 'تصور ثلاثي الأبعاد',
    area: 'م. عمر بن سميط',
    style: 'تصوير معماري',
    image: IMG.visualizer,
    description:
      'تحويل مخطط المساحة إلى صورة واقعية قبل التنفيذ، لاختبار الألوان والقياسات وتجنّب التعديلات المكلفة.',
  },
  {
    id: 'l6',
    title: 'مجلس عربي فاخر',
    area: 'باعبود',
    style: 'حضرمي معاصر',
    image: IMG.showroomMajlis,
    description:
      'مجلس بتطريز حضرمي عصري ومساند مريحة، مناسب لاستقبال الضيوف في المساحات الواسعة.',
  },
];

export const features = [
  {
    icon: 'hammer' as const,
    title: 'تفصيل حسب مقاسك',
    description: 'ورش نجارة محلية معتمدة تنفّذ القطعة على قياس مساحتك بالضبط.',
  },
  {
    icon: 'truck' as const,
    title: 'توصيل وتركيب في المكلا',
    description: 'فريق تركيب متخصص يصل إلى باب منزلك داخل المكلا ومدن حضرموت.',
  },
  {
    icon: 'leaf' as const,
    title: 'خامات مختارة بعناية',
    description: 'خشب طبيعي وأقمشة مقاومة للبقع بضمان حقيقي على التصنيع.',
  },
];

export const formatPrice = (value: number) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ر.ي`;

export const storeName = (storeId: string) =>
  stores.find((store) => store.id === storeId)?.name ?? 'معرض إيوان';

export const storeById = (storeId: string) => stores.find((store) => store.id === storeId);

/** القطع والمعارض المنفذة لكل إلهام */
export const lookbookPieces: Record<string, { productId: string; storeId: string }[]> = {
  l1: [
    { productId: 'p7', storeId: 's7' },
    { productId: 'p5', storeId: 's6' },
  ],
  l2: [
    { productId: 'p3', storeId: 's5' },
    { productId: 'p9', storeId: 's4' },
  ],
  l3: [
    { productId: 'p4', storeId: 's3' },
    { productId: 'p8', storeId: 's6' },
  ],
  l4: [
    { productId: 'p6', storeId: 's1' },
    { productId: 'p10', storeId: 's8' },
  ],
  l5: [
    { productId: 'p1', storeId: 's1' },
    { productId: 'p2', storeId: 's2' },
  ],
  l6: [
    { productId: 'p7', storeId: 's7' },
    { productId: 'p2', storeId: 's2' },
  ],
};
