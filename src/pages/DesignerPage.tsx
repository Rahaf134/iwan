import { useState, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronsLeftRight,
  Coffee,
  ImagePlus,
  Loader2,
  Maximize2,
  Palette,
  Scan,
  Sofa,
  Sparkles,
  Tag,
  Upload,
  UtensilsCrossed,
  Wand2,
  Bed,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCatalog } from '@/contexts/CatalogContext';
import { formatPrice, IMG } from '@/data/catalog';
import { cn } from '@/lib/utils';

// غرف التصميم
const roomOptions = [
  { id: 'living', label: 'غرفة معيشة', icon: Sofa, keyword: 'معيشة' },
  { id: 'bedroom', label: 'غرفة نوم', icon: Bed, keyword: 'نوم' },
  { id: 'majlis', label: 'مجلس عربي', icon: Sparkles, keyword: 'مجلس' },
  { id: 'dining', label: 'غرفة طعام', icon: UtensilsCrossed, keyword: 'طعام' },
  { id: 'coffee', label: 'ركن قهوة', icon: Coffee, keyword: 'ديكور' },
] as const;

type RoomId = (typeof roomOptions)[number]['id'];

// الطابع اللوني
const styleOptions = [
  { id: 'warm', label: 'دافئ خشبي', hex: '#8C6D53', desc: 'خشب جوز طبيعي وأقمشة كتانية' },
  { id: 'cream', label: 'كريمي ناعم', hex: '#DED6C8', desc: 'ألوان بيج وعاجي هادئة' },
  { id: 'sand', label: 'رملي عصري', hex: '#A68966', desc: 'نغمات رملية تمنح اتساعاً' },
  { id: 'espresso', label: 'إسبريسو فاخر', hex: '#231F1E', desc: 'خشب داكن وفخامة معاصرة' },
] as const;

type StyleId = (typeof styleOptions)[number]['id'];

// خيارات المساحة السريعة
const dimensionPresets = [
  { label: 'صغيرة (3×4 م)', width: 3, length: 4 },
  { label: 'متوسطة (4×5 م)', width: 4, length: 5 },
  { label: 'واسعة (5×7 م)', width: 5, length: 7 },
];

// خيارات الميزانية
const budgetPresets = [
  { id: 'economy', label: 'اقتصادية', range: 'حتى 300,000 ر.ي' },
  { id: 'medium', label: 'متوسطة', range: '300,000 - 700,000 ر.ي' },
  { id: 'luxury', label: 'فاخرة', range: '+700,000 ر.ي' },
];

// صور الغرف (قبل وبعد والتوليد)
const roomImages: Record<
  RoomId,
  {
    before: string;
    after: string;
    generated: string;
  }
> = {
  living: {
    before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    after: IMG.showroomLiving,
    generated: IMG.showroomLuxury,
  },
  bedroom: {
    before: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    after: IMG.showroomBedroom,
    generated: IMG.bedroom,
  },
  majlis: {
    before: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
    after: IMG.showroomMajlis,
    generated: IMG.majlis,
  },
  dining: {
    before: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    after: IMG.showroomDining,
    generated: IMG.dining,
  },
  coffee: {
    before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    after: IMG.coffee,
    generated: IMG.showroomEntry,
  },
};

// نقاط التسوق التفاعلية فوق قطع الأثاث (Hotspots)
interface HotspotPin {
  id: string;
  top: number; // percentage
  left: number; // percentage
  label: string;
  defaultSlug: string;
}

const roomHotspots: Record<RoomId, HotspotPin[]> = {
  living: [
    { id: 'h1', top: 62, left: 52, label: 'طقم كنب زاوية كتان', defaultSlug: 'linen-corner-sofa' },
    { id: 'h2', top: 78, left: 36, label: 'طاولات قهوة متداخلة', defaultSlug: 'marble-coffee-tables' },
    { id: 'h3', top: 22, left: 48, label: 'إضاءة سقفية دافئة', defaultSlug: 'brass-pendant-light' },
  ],
  bedroom: [
    { id: 'h1', top: 62, left: 50, label: 'سرير نوم ماستر خشب جوز', defaultSlug: 'master-bedroom-set' },
    { id: 'h2', top: 48, left: 22, label: 'خزانة ملابس 4 أبواب', defaultSlug: 'four-door-wardrobe' },
    { id: 'h3', top: 26, left: 66, label: 'إضاءة معلقة دافئة', defaultSlug: 'brass-pendant-light' },
  ],
  majlis: [
    { id: 'h1', top: 68, left: 50, label: 'مجلس عربي أرضي فاخر', defaultSlug: 'hadrami-floor-majlis' },
    { id: 'h2', top: 76, left: 26, label: 'طاولات خدمة رخام', defaultSlug: 'marble-coffee-tables' },
    { id: 'h3', top: 20, left: 46, label: 'إضاءة عربية دافئة', defaultSlug: 'brass-pendant-light' },
  ],
  dining: [
    { id: 'h1', top: 68, left: 48, label: 'طاولة طعام دائرية خشب جوز', defaultSlug: 'walnut-round-dining-table' },
    { id: 'h2', top: 28, left: 50, label: 'إضاءة نحاسية معلقة', defaultSlug: 'brass-pendant-light' },
  ],
  coffee: [
    { id: 'h1', top: 65, left: 35, label: 'كرسي استرخاء بوكليه', defaultSlug: 'boucle-lounge-chair' },
    { id: 'h2', top: 74, left: 62, label: 'طاولة قهوة جانبية', defaultSlug: 'marble-coffee-tables' },
  ],
};

const DesignerPage = () => {
  const { products, stores } = useCatalog();

  // خيارات التصميم
  const [selectedRoom, setSelectedRoom] = useState<RoomId>('living');
  const [selectedStyle, setSelectedStyle] = useState<StyleId>('warm');
  const [roomWidth, setRoomWidth] = useState<number>(4);
  const [roomLength, setRoomLength] = useState<number>(5);
  const [selectedBudget, setSelectedBudget] = useState<string>('medium');

  // رفع الصور وأنماط التحليل
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'redesign' | 'visual_search'>('redesign');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // حالة التوليد والمقارنة
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [split, setSplit] = useState<number>(50);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // نتائج التحليل البصري ومطابقة Gemini
  const [analysisResult, setAnalysisResult] = useState<{
    palette: string[];
    detectedType: string;
    styleSummary: string;
    matchedProducts: { product: (typeof products)[0]; score: number }[];
  } | null>(null);

  // حاوية السلايدر
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const activeRoomData = roomOptions.find((r) => r.id === selectedRoom) ?? roomOptions[0];
  const activeStyleData = styleOptions.find((s) => s.id === selectedStyle) ?? styleOptions[0];

  // القطع المطابقة لنوع الغرفة من الكتالوج
  const matchingPieces = useMemo(() => {
    const list = products.filter(
      (p) =>
        p.category.includes(activeRoomData.keyword) ||
        p.description.includes(activeRoomData.keyword),
    );
    return (list.length > 0 ? list : products).slice(0, 4);
  }, [products, activeRoomData.keyword]);

  // تعيين أبعاد سريعة
  const handleApplyPreset = (width: number, length: number) => {
    setRoomWidth(width);
    setRoomLength(length);
  };

  // التحكم في السلايدر عبر تحريك المؤشر
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSplit(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingSlider(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // قراءة ورفع الصورة
  const handlePhotoUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setUserPhoto(dataUrl);
      setPhase('idle');
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // توليد التصميم وتحليل الصورة بالذكاء الاصطناعي
  const handleGenerateDesign = async () => {
    setPhase('analyzing');
    setActiveHotspotId(null);

    // محاكاة أو تشغيل التحليل
    window.setTimeout(() => {
      // إعداد نتائج التحليل البصري الذكي
      const baseScores = [96, 92, 88, 85];
      const matched = matchingPieces.map((p, idx) => ({
        product: p,
        score: baseScores[idx] ?? 82,
      }));

      setAnalysisResult({
        palette: [activeStyleData.hex, '#DED6C8', '#8C6D53', '#5C3D2E'],
        detectedType: activeRoomData.label,
        styleSummary: `${activeStyleData.label} — تناغم ألوان دافئة مع استغلال أمثل لمساحة ${roomWidth}×${roomLength} م`,
        matchedProducts: matched,
      });

      setPhase('done');
      setSplit(50); // ضبط المقبض في المنتصف مباشرة
    }, 1800);
  };

  // الصورة الحالية لـ (قبل وبعد)
  const currentBeforeImage = userPhoto ?? roomImages[selectedRoom].before;
  const currentAfterImage =
    phase === 'done'
      ? roomImages[selectedRoom].generated
      : roomImages[selectedRoom].after;

  // النقاط التفاعلية للغرفة المحددة
  const currentHotspots = roomHotspots[selectedRoom] ?? [];

  return (
    <>
      <PageMeta
        title="مصمم الذكاء الاصطناعي الشامل — إيوان"
        description="صمم غرفتك بذكاء، قارن بين قبل وبعد، استكشف نقاط الأثاث التفاعلية، وطابق صور أثاثك المفضل مع معارض المكلا."
      />

      <div className="min-h-screen bg-[#FAF7F2] pt-12 md:pt-16 mt-6 pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          {/* ترويسة الصفحة */}
          <div className="border-b border-[#E5DEC9] pb-8 md:pb-10">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#231F1E]">
              تخيل مساحتك قبل أن تشتري
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-sm sm:text-base leading-relaxed text-[#6B5E55]">
              حدد خيارات غرفتك أو ارفع صورة مساحتك، واستكشف التصميم التفاعلي مع نقاط تسوق مباشرة للقطع المتوفرة في معارض المكلا.
            </p>
          </div>

          {/* الشبكة الرئيسية: خيارات على اليمين والمعاينة على اليسار */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* العمود الأيمن: خيارات التصميم المرتبة (lg:col-span-5) */}
            <div className="space-y-6 lg:col-span-5">
              {/* 1. نوع الغرفة كأزرار كبسولية أنيقة مع أيقونات */}
              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-5 shadow-xs">
                <label className="text-sm font-semibold text-[#231F1E] flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#9C6644]" />
                  ١. نوع الغرفة
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roomOptions.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRoom === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoom(item.id);
                          setPhase('idle');
                          setActiveHotspotId(null);
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95',
                          isSelected
                            ? 'bg-[#231F1E] text-white shadow-sm border border-[#231F1E]'
                            : 'bg-[#FAF7F2] text-[#4A423D] border border-[#E5DEC9] hover:border-[#9C6644] hover:bg-white',
                        )}
                      >
                        <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : 'text-[#9C6644]')} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. الطابع اللوني والستايل */}
              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-5 shadow-xs">
                <label className="text-sm font-semibold text-[#231F1E] flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#9C6644]" />
                  ٢. الطابع اللوني والستايل
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {styleOptions.map((item) => {
                    const isSelected = selectedStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedStyle(item.id);
                          setPhase('idle');
                        }}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-2.5 text-right transition-all duration-200',
                          isSelected
                            ? 'border-[#9C6644] bg-[#FAF7F2] ring-1 ring-[#9C6644]'
                            : 'border-[#E5DEC9] bg-white hover:border-[#9C6644]/50',
                        )}
                      >
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: item.hex }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#231F1E] truncate">{item.label}</p>
                          <p className="text-[10px] text-[#786C65] truncate">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. مساحة الغرفة وأبعادها */}
              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#231F1E] flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-[#9C6644]" />
                    ٣. مساحة الغرفة وأبعادها
                  </label>
                  <span className="text-xs font-semibold text-[#9C6644]">
                    {roomWidth * roomLength} م²
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {dimensionPresets.map((preset) => {
                    const isSelected = roomWidth === preset.width && roomLength === preset.length;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset.width, preset.length)}
                        className={cn(
                          'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                          isSelected
                            ? 'bg-[#9C6644] text-white shadow-xs'
                            : 'bg-[#FAF7F2] text-[#5C534E] border border-[#E5DEC9] hover:bg-white',
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#786C65] font-medium mb-1 block">
                      العرض (متر):
                    </span>
                    <Input
                      type="number"
                      min={2}
                      max={12}
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(Number(e.target.value) || 3)}
                      className="h-10 text-center font-semibold rounded-xl border-[#E5DEC9] bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#786C65] font-medium mb-1 block">
                      الطول (متر):
                    </span>
                    <Input
                      type="number"
                      min={2}
                      max={15}
                      value={roomLength}
                      onChange={(e) => setRoomLength(Number(e.target.value) || 4)}
                      className="h-10 text-center font-semibold rounded-xl border-[#E5DEC9] bg-[#FAF7F2]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. الميزانية التقديرية */}
              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-5 shadow-xs">
                <label className="text-sm font-semibold text-[#231F1E] flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#9C6644]" />
                  ٤. الميزانية التقديرية (بالريال اليمني)
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {budgetPresets.map((b) => {
                    const isSelected = selectedBudget === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBudget(b.id)}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all',
                          isSelected
                            ? 'border-2 border-[#9C6644] bg-[#FAF7F2] shadow-xs'
                            : 'border border-[#E5DEC9] bg-white hover:border-[#9C6644]/50',
                        )}
                      >
                        <span className="text-xs font-semibold text-[#231F1E]">{b.label}</span>
                        <span className="text-[10px] text-[#786C65] mt-0.5">{b.range}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. صورة مساحتك أو المطابقة العكسية */}
              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#231F1E] flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-[#9C6644]" />
                    ٥. صورة مساحتك (اختياري)
                  </label>
                  {userPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserPhoto(null);
                        setAnalysisResult(null);
                      }}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      إلغاء الصورة
                    </button>
                  )}
                </div>

                {/* وضع رفع الصورة */}
                {userPhoto && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#FAF7F2] p-1.5 border border-[#E5DEC9]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('redesign')}
                      className={cn(
                        'flex-1 rounded-lg py-1.5 text-xs font-medium transition-all',
                        uploadMode === 'redesign'
                          ? 'bg-white text-[#231F1E] shadow-xs font-semibold'
                          : 'text-[#6B5E55] hover:text-[#231F1E]',
                      )}
                    >
                      إعادة تصميم غرفتي
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('visual_search')}
                      className={cn(
                        'flex-1 rounded-lg py-1.5 text-xs font-medium transition-all',
                        uploadMode === 'visual_search'
                          ? 'bg-white text-[#9C6644] shadow-xs font-semibold'
                          : 'text-[#6B5E55] hover:text-[#231F1E]',
                      )}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Scan className="h-3 w-3" />
                        ابحث لي عن أثاث مطابق
                      </span>
                    </button>
                  </div>
                )}

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPhoto(true);
                  }}
                  onDragLeave={() => setIsDraggingPhoto(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPhoto(false);
                    handlePhotoUpload(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors',
                    isDraggingPhoto
                      ? 'border-[#9C6644] bg-[#FAF7F2]'
                      : 'border-[#D8CCBA] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]',
                  )}
                >
                  {userPhoto ? (
                    <div className="relative w-full">
                      <img
                        src={userPhoto}
                        alt="صورة المساحة المرفوعة"
                        className="h-28 w-full rounded-lg object-cover border border-[#E5DEC9]"
                      />
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                        جاهزة للتحليل
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-[#9C6644]" />
                      <p className="mt-1 text-xs text-[#5C534E]">اسحب صورتك هنا أو ارفعها من جهازك</p>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 h-8 rounded-full border-[#C9B9A6] px-4 text-xs font-medium hover:border-[#9C6644]"
                  >
                    {userPhoto ? 'استبدال الصورة' : 'اختيار صورة'}
                  </Button>
                </div>
              </div>

              {/* زر توليد التصميم بالذكاء الاصطناعي */}
              <Button
                onClick={handleGenerateDesign}
                disabled={phase === 'analyzing'}
                className="h-13 w-full rounded-full bg-[#231F1E] text-white hover:bg-[#9C6644] shadow-md text-sm font-semibold transition-all active:scale-95"
              >
                {phase === 'analyzing' ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جارٍ تحليل المساحة وتوزيع الأثاث بالذكاء الاصطناعي…
                  </>
                ) : (
                  <>
                    <Wand2 className="ml-2 h-4 w-4" />
                    توليد التصميم ومطابقة الأثاث
                  </>
                )}
              </Button>
            </div>

            {/* العمود الأيسر: معاينة الصورة وسلايدر المقارنة والنقاط التفاعلية (lg:col-span-7) */}
            <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-6">
              {/* صندوق المعاينة التفاعلي */}
              <div className="overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#F3EDE2]/70 shadow-md">
                {/* رأس صندوق المعاينة */}
                <div className="flex items-center justify-between border-b border-[#F0EAE1] bg-[#FAF7F2] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-[#231F1E]">
                      معاينة المساحة: {activeRoomData.label} · {activeStyleData.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#786C65]">
                    {roomWidth}×{roomLength} متر
                  </span>
                </div>

                {/* صورة المقارنة المباشرة مع شريط السحب التفاعلي */}
                <div
                  ref={sliderContainerRef}
                  dir="ltr"
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#231F1E] select-none"
                >
                  {/* الطبقة السفلية: صورة "قبل" */}
                  <img
                    src={currentBeforeImage}
                    alt="قبل التصميم"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* الطبقة العلوية المقتطعة: صورة "بعد" */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                  >
                    <img
                      src={currentAfterImage}
                      alt="بعد التصميم"
                      className="h-full w-full object-cover pointer-events-auto"
                    />
                  </div>

                  {/* النقاط التفاعلية والبطاقات المنبثقة خارج حاوية القص بـ z-50 */}
                  {phase === 'done' && (
                    <div className="absolute inset-0 pointer-events-none z-40">
                      {currentHotspots.map((pin) => {
                        const targetProduct =
                          products.find((p) => p.slug === pin.defaultSlug) ||
                          products.find((p) => p.category.includes(activeRoomData.keyword)) ||
                          products[0];
                        const store = stores.find(
                          (s) => s.id === targetProduct?.storeId || s.dbId === targetProduct?.storeId || s.legacyId === targetProduct?.storeId,
                        );
                        const isPopOpen = activeHotspotId === pin.id;

                        return (
                          <div
                            key={pin.id}
                            style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-40"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspotId(isPopOpen ? null : pin.id);
                            }}
                          >
                            {/* الدائرة النابضة */}
                            <div className="relative group/pin cursor-pointer">
                              <span className="absolute -inset-2 rounded-full bg-[#9C6644]/40 animate-ping" />
                              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#9C6644] shadow-lg border-2 border-[#9C6644] transition-transform duration-200 hover:scale-125">
                                <span className="text-xs font-bold">+</span>
                              </div>
                            </div>

                            {/* البطاقة المنبثقة Popover Card خارج حاوية القص بـ z-50 */}
                            {isPopOpen && targetProduct && (
                              <div
                                dir="rtl"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-9 right-1/2 translate-x-1/2 w-64 rounded-2xl border border-[#E5DEC9] bg-white p-3 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-200"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={targetProduct.images[0]}
                                    alt={targetProduct.name}
                                    className="h-14 w-14 rounded-xl object-cover border border-[#E5DEC9]"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-xs font-bold text-[#231F1E]">
                                      {targetProduct.name}
                                    </h4>
                                    <p className="text-[10px] text-[#9C6644] font-medium mt-0.5">
                                      {store?.name ?? 'معرض معتمد'}
                                    </p>
                                    <p className="text-xs font-bold text-[#231F1E] mt-1">
                                      {formatPrice(targetProduct.price)}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-[#F0EAE1]">
                                  <Link
                                    to={`/product/${targetProduct.slug}`}
                                    className="flex w-full items-center justify-center gap-1 rounded-full bg-[#231F1E] py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#9C6644]"
                                  >
                                    عرض القطعة والطلب
                                    <ArrowLeft className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* الخط العمودي الفاصل مع مقبض السحب المزدوج < > — يتحرك فقط عند سحب المقبض */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none z-30"
                    style={{ left: `${split}%` }}
                  >
                    <div
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#231F1E] shadow-xl border border-black/10 select-none cursor-ew-resize pointer-events-auto touch-none hover:scale-110 active:scale-95 transition-transform"
                    >
                      <ChevronsLeftRight className="h-4 w-4 text-[#9C6644]" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* شارات التعريف على زوايا الصورة */}
                  <span className="absolute left-3 bottom-3 rounded-md bg-black/65 px-2.5 py-1 text-[11px] text-white backdrop-blur z-10 pointer-events-none">
                    قبل (المساحة الأصلية)
                  </span>
                  <span className="absolute right-3 bottom-3 rounded-md bg-[#9C6644]/90 px-2.5 py-1 text-[11px] text-white backdrop-blur z-10 pointer-events-none">
                    بعد (التصميم المؤثث)
                  </span>

                  {/* مؤشر التحميل أثناء التوليد */}
                  {phase === 'analyzing' && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-sm text-white">
                      <Loader2 className="h-8 w-8 animate-spin text-[#D8CCBA]" />
                      <p className="text-sm font-semibold">
                        نحلّل الأبعاد والإضاءة ونطابق الأثاث الحضرمي…
                      </p>
                    </div>
                  )}
                </div>

                {/* تذييل المعاينة وإرشادات التفاعل */}
                <div className="flex items-center justify-between border-t border-[#F0EAE1] p-4 text-xs text-[#6B5E55]">
                  <span className="flex items-center gap-1.5">
                    <ChevronsLeftRight className="h-4 w-4 text-[#9C6644]" />
                    اسحب الخط فوق الصورة للمقارنة المباشرة
                  </span>
                  {phase === 'done' && (
                    <span className="flex items-center gap-1 text-[#9C6644] font-semibold">
                      اضغط على دوائر (+) فوق الأثاث للتفاصيل
                    </span>
                  )}
                </div>
              </div>

              {/* نتائج المطابقة العكسية (الوضع الثاني: ابحث لي عن أثاث مطابق) */}
              {userPhoto && uploadMode === 'visual_search' && phase === 'done' && analysisResult && (
                <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scan className="h-5 w-5 text-[#9C6644]" />
                      <h3 className="text-base font-bold text-[#231F1E]">
                        قطع مشابهة للصورة متوفرة في معارض إيوان
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-[#9C6644] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E5DEC9]">
                      مطابقة بصرية ذكية
                    </span>
                  </div>

                  {/* الألوان المستخرجة */}
                  <div className="flex items-center gap-3 rounded-xl bg-[#FAF7F2] p-3 text-xs text-[#5C534E]">
                    <span className="font-semibold text-[#231F1E]">الألوان السائدة المستخرجة:</span>
                    <div className="flex items-center gap-1.5">
                      {analysisResult.palette.map((color, i) => (
                        <span
                          key={i}
                          className="h-4 w-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* قائمة القطع المطابقة */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {analysisResult.matchedProducts.map(({ product, score }) => {
                      const store = stores.find(
                        (s) => s.id === product.storeId || s.dbId === product.storeId || s.legacyId === product.storeId,
                      );
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 rounded-2xl border border-[#E5DEC9] p-3 hover:border-[#9C6644] transition-all bg-[#FAF7F2]/60"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-16 w-16 rounded-xl object-cover border border-[#E5DEC9]"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="inline-block rounded-md bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold mb-1">
                              تطابق {score}%
                            </span>
                            <h4 className="truncate text-xs font-semibold text-[#231F1E]">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-[#786C65]">{store?.name}</p>
                            <p className="text-xs font-bold text-[#9C6644] mt-0.5">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <Link
                            to={`/product/${product.slug}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#231F1E] text-white hover:bg-[#9C6644] transition-colors"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* القطع المقترحة المنفذة لهذا التصميم (الوضع الافتراضي) */}
              {phase === 'done' && (uploadMode === 'redesign' || !userPhoto) && (
                <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#9C6644]" />
                      <h3 className="text-sm sm:text-base font-bold text-[#231F1E]">
                        القطع المقترحة لتنفيذ هذا التصميم
                      </h3>
                    </div>
                    <span className="text-xs text-[#786C65]">أسعار الريال اليمني</span>
                  </div>

                  <ul className="space-y-3">
                    {matchingPieces.map((product) => {
                      const store = stores.find(
                        (s) => s.id === product.storeId || s.dbId === product.storeId || s.legacyId === product.storeId,
                      );
                      return (
                        <li
                          key={product.dbId || product.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-3 hover:border-[#9C6644] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-14 w-14 shrink-0 rounded-xl object-cover border border-[#E5DEC9]"
                            />
                            <div className="min-w-0">
                              <h4 className="truncate text-xs sm:text-sm font-semibold text-[#231F1E]">
                                {product.name}
                              </h4>
                              <p className="text-xs text-[#9C6644] font-medium mt-0.5">
                                {store?.name ?? 'معرض إيوان المعتمد'}
                              </p>
                              <p className="text-xs font-bold text-[#231F1E] mt-0.5">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/product/${product.slug}`}
                            className="flex shrink-0 items-center gap-1 rounded-full bg-[#231F1E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9C6644]"
                          >
                            اطلب
                            <ArrowLeft className="h-3 w-3" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesignerPage;
