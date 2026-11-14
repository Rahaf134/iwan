import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
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

/** مفتاح تخزين جديد خاص بالنسخة العربية — لا يتعارض مع بيانات النسخة الإنجليزية القديمة */
const STORAGE_KEY = 'ewan_v4_ar_data';

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

const readPersisted = (): PersistedState => {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return EMPTY_STATE;
    const record = parsed as Record<string, unknown>;
    const cart = Array.isArray(record.cart)
      ? record.cart.filter(isCartLine).map((line) => ({
          key: line.key,
          productId: line.productId,
          color: line.color,
          quantity: Math.max(1, Math.min(9, Math.round(line.quantity))),
        }))
      : [];
    const wishlist = Array.isArray(record.wishlist)
      ? record.wishlist.filter((id): id is string => typeof id === 'string')
      : [];
    return { cart, wishlist };
  } catch {
    return EMPTY_STATE;
  }
};

const writePersisted = (state: PersistedState) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // التخزين غير متاح (وضع التصفح الخاص) — نتابع بدون حفظ
  }
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { products } = useCatalog();
  const [cart, setCart] = useState<CartLine[]>(() => readPersisted().cart);
  const [wishlist, setWishlist] = useState<string[]>(() => readPersisted().wishlist);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    writePersisted({ cart, wishlist });
  }, [cart, wishlist]);

  const addToCart = useCallback(
    (product: Product, color: string, quantity = 1, options?: { silent?: boolean }) => {
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
    [],
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

  const clearCart = useCallback(() => setCart([]), []);

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
