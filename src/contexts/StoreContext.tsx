import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCatalog } from '@/contexts/CatalogContext';
import type { Product } from '@/data/catalog';

export interface CartLine {
  key: string;
  productId: string;
  color: string;
  quantity: number;
}

interface StoreContextValue {
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (
    product: Product,
    color: string,
    quantity?: number,
    options?: { silent?: boolean },
  ) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

/** تنظيف فوري وشامل لأي مفتاح موحد قديم لمنع توريث سلات سابقة للزوار */
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('ewan_v4_ar_data');
    window.localStorage.removeItem('cart_items_guest');
    window.localStorage.removeItem('cart_items_undefined');
    window.localStorage.removeItem('cart_items_null');
  } catch {
    // تجاهل في بيئات الحماية
  }
}

/** توليد مفتاح سلة معزول ومخصص للمستخدم الحالي */
const getCartStorageKey = (uid: string | null | undefined): string => {
  if (!uid || uid === 'undefined' || uid === 'null') {
    return 'cart_items_guest';
  }
  return `cart_items_${uid}`;
};

/** توليد مفتاح مفضلة معزول */
const getWishlistStorageKey = (uid: string | null | undefined): string => {
  if (!uid || uid === 'undefined' || uid === 'null') {
    return 'wishlist_guest';
  }
  return `wishlist_${uid}`;
};

interface PersistedState {
  cart: CartLine[];
  wishlist: string[];
}

const EMPTY_STATE: PersistedState = { cart: [], wishlist: [] };

const isCartLine = (value: unknown): value is CartLine => {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.key === 'string' &&
    typeof line.productId === 'string' &&
    typeof line.color === 'string' &&
    typeof line.quantity === 'number' &&
    Number.isFinite(line.quantity) &&
    line.quantity > 0
  );
};

const readPersisted = (uid: string | null | undefined): PersistedState => {
  if (typeof window === 'undefined') return EMPTY_STATE;
  // الزائر غير المسجل: السلة تبدأ دائماً فارغة تماماً (0) لضمان الاستقلالية
  if (!uid || uid === 'undefined' || uid === 'null') {
    let wishlist: string[] = [];
    try {
      const raw = window.localStorage.getItem(getWishlistStorageKey(null));
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          wishlist = parsed.filter((id): id is string => typeof id === 'string');
        }
      }
    } catch {}
    return { cart: [], wishlist };
  }

  try {
    const rawCart = window.localStorage.getItem(getCartStorageKey(uid));
    const rawWishlist = window.localStorage.getItem(getWishlistStorageKey(uid));

    let cart: CartLine[] = [];
    if (rawCart) {
      const parsed: unknown = JSON.parse(rawCart);
      if (Array.isArray(parsed)) {
        cart = parsed.filter(isCartLine).map((line) => ({
          key: line.key,
          productId: line.productId,
          color: line.color,
          quantity: Math.max(1, Math.min(9, Math.round(line.quantity))),
        }));
      }
    }

    let wishlist: string[] = [];
    if (rawWishlist) {
      const parsed: unknown = JSON.parse(rawWishlist);
      if (Array.isArray(parsed)) {
        wishlist = parsed.filter((id): id is string => typeof id === 'string');
      }
    }

    return { cart, wishlist };
  } catch {
    return EMPTY_STATE;
  }
};

const writePersisted = (uid: string | null | undefined, state: PersistedState) => {
  if (typeof window === 'undefined') return;
  try {
    // إذا كان زائر: لا نحفظ سلة مشتركة أبداً، السلة تبقى دائماً فارغة للزوار
    if (!uid || uid === 'undefined' || uid === 'null') {
      window.localStorage.removeItem('cart_items_guest');
      window.localStorage.setItem(getWishlistStorageKey(null), JSON.stringify(state.wishlist));
    } else {
      window.localStorage.setItem(getCartStorageKey(uid), JSON.stringify(state.cart));
      window.localStorage.setItem(getWishlistStorageKey(uid), JSON.stringify(state.wishlist));
    }
  } catch {
    // وضع التصفح الخاص
  }
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { products } = useCatalog();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // تحديد هوية المستخدم الفريدة (معرّف الحساب أو بريده)
  const currentUserId = user?.id || profile?.id || null;

  // عند فتح الموقع لأول مرة أو كزائر: السلة تبدأ بقيمة 0 تماماً
  const [cart, setCart] = useState<CartLine[]>(() => {
    return readPersisted(currentUserId).cart;
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return readPersisted(currentUserId).wishlist;
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // عند تغيّر حالة المستخدم (تسجيل دخول، تسجيل خروج، تبديل جلسة)
  useEffect(() => {
    if (!currentUserId) {
      // زائر جديد أو تم تسجيل الخروج: تصفير السلة فوراً إلى 0
      setCart([]);
      setWishlist(readPersisted(null).wishlist);
    } else {
      // مستخدم مسجل: تحميل سلته المعزولة فقط
      const userState = readPersisted(currentUserId);
      setCart(userState.cart);
      setWishlist(userState.wishlist);
    }
  }, [currentUserId]);

  // حفظ السلة والمفضلة داخل المفتاح المخصص للمستخدم فقط
  useEffect(() => {
    writePersisted(currentUserId, { cart, wishlist });
  }, [currentUserId, cart, wishlist]);

  const addToCart = useCallback(
    (product: Product, color: string, quantity = 1, options?: { silent?: boolean }) => {
      // تحقق حاسم: منع الإضافة للسلة لغير المسجلين لحماية السلة وضمان ارتباطها بالمستخدم
      const isAuthenticated = Boolean(user || profile);
      if (!isAuthenticated) {
        toast.error('يرجى تسجيل الدخول أولاً لإضافة القطع إلى السلة', {
          description: 'سجّل دخولك لمتابعة التسوق وإضافة المنتجات إلى سلتك الخاصة.',
        });
        navigate('/login');
        return;
      }

      const key = `${product.id}-${color}`;
      setCart((current) => {
        const existing = current.find((line) => line.key === key);
        if (existing) {
          return current.map((line) =>
            line.key === key ? { ...line, quantity: line.quantity + quantity } : line,
          );
        }
        return [...current, { key, productId: product.id, color, quantity }];
      });
      if (!options?.silent) {
        toast.success('تمت الإضافة إلى السلة', {
          description: `${product.name} · ${color} · الكمية ${quantity}`,
        });
      }
    },
    [user, profile, navigate],
  );

  const removeLine = useCallback((key: string) => {
    setCart((current) => current.filter((line) => line.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setCart((current) =>
      current.map((line) =>
        line.key === key ? { ...line, quantity: Math.max(1, Math.min(9, quantity)) } : line,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== 'undefined' && currentUserId) {
      try {
        window.localStorage.removeItem(getCartStorageKey(currentUserId));
      } catch {}
    }
  }, [currentUserId]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((current) => {
      if (current.includes(product.id)) {
        toast(`${product.name} أُزيل من المفضلة`);
        return current.filter((id) => id !== product.id);
      }
      toast.success(`${product.name} أُضيف إلى المفضلة`, {
        description: 'تجدينه في صفحة المفضلة من القائمة.',
      });
      return [...current, product.id];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const cartCount = useMemo(
    () => cart.reduce((total, line) => total + line.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () =>
      cart.reduce((total, line) => {
        const product = products.find((item) => item.id === line.productId);
        return total + (product ? product.price * line.quantity : 0);
      }, 0),
    [cart, products],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      subtotal,
      addToCart,
      removeLine,
      setQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
    }),
    [
      cart,
      cartCount,
      subtotal,
      addToCart,
      removeLine,
      setQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      cartOpen,
      searchOpen,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
};
