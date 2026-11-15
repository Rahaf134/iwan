import { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Headphones,
  Heart,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageCircle,
  PackageCheck,
  Search,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/common/Logo';
import { AccountSettingsModal } from '@/components/account/AccountSettingsModal';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useCatalog } from '@/contexts/CatalogContext';
import { useChat } from '@/contexts/ChatContext';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';

const primaryLinks = [
  { label: 'الرئيسية', to: '/' },
  { label: 'المنتجات', to: '/shop' },
  { label: 'المتاجر', to: '/stores' },
  { label: 'المصممون', to: '/designers' },
  { label: 'مصمم الذكاء الاصطناعي', to: '/designer' },
  { label: 'كتالوج الإلهام', to: '/lookbook' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useStore();
  const { profile, isAdmin, isProvider, signOut } = useAuth();
  const { threads, totalUnread, isDrawerOpen, setDrawerOpen } = useChat();
  const { requests } = useCatalog();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ewan_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // إشعارات حقيقية تفاعلية معزولة تماماً للمستخدم الحالي فقط
  const notifications = useMemo(() => {
    if (!profile) return [];

    const list: { id: string; title: string; desc: string; time: string; link?: string; type: 'order' | 'chat' }[] = [];

    // 1. إشعارات الرسائل الواردة الخاصة بالمستخدم الحالي فقط
    threads.forEach((t) => {
      const lastMsg = t.messages[t.messages.length - 1];
      if (lastMsg && lastMsg.from === 'provider') {
        list.push({
          id: `msg-${t.threadId}-${lastMsg.id}`,
          title: `رد جديد من ${t.name}`,
          desc: lastMsg.text,
          time: new Date(lastMsg.at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
          type: 'chat',
        });
      }
    });

    // 2. إشعارات الطلبات الخاصة بالمستخدم المسجل حالياً فقط
    const userEmail = (profile.email || '').trim().toLowerCase();
    const userId = profile.id;
    const userPhone = (profile.phone || '').replace(/\D/g, '');
    const userName = (profile.fullName || '').trim().toLowerCase();

    const userOrders = requests
      .filter((r) => {
        if (r.type !== 'order') return false;
        let details: any = null;
        try {
          details = JSON.parse(r.details);
        } catch {
          details = {};
        }

        if (details?.customerEmail && details.customerEmail.trim().toLowerCase() === userEmail) {
          return true;
        }
        if (userId && details?.userId && details.userId === userId) {
          return true;
        }
        const orderPhone = (details?.phone || r.phone || '').replace(/\D/g, '');
        if (
          userPhone &&
          orderPhone &&
          (orderPhone === userPhone || orderPhone.endsWith(userPhone) || userPhone.endsWith(orderPhone))
        ) {
          return true;
        }
        const orderName = (details?.customerName || r.name || '').trim().toLowerCase();
        if (
          userName &&
          orderName &&
          (orderName === userName || (userName.length > 3 && orderName.includes(userName)))
        ) {
          return true;
        }

        return false;
      })
      .slice(0, 5);

    userOrders.forEach((req) => {
      const statusTitle =
        req.status === 'done'
          ? 'تم تسليم طلبك بنجاح'
          : req.status === 'contacted'
          ? 'طلبك قيد التجهيز بالمعرض'
          : 'تم تأكيد طلبك في إيوان';
      list.push({
        id: `ord-${req.dbId}-${req.status}`,
        title: statusTitle,
        desc: `طلبك برقم #${req.dbId.slice(-4).toUpperCase()} يتم متابعته في المكلا`,
        time: new Date(req.createdAt || Date.now()).toLocaleDateString('ar-YE'),
        link: '/my-orders',
        type: 'order',
      });
    });

    return list;
  }, [threads, requests, profile]);

  const unreadNotificationsCount = notifications.filter((n) => !notificationsRead.includes(n.id)).length;

  const markAllNotificationsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setNotificationsRead(allIds);
    try {
      localStorage.setItem('ewan_read_notifications', JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-[#E5DEC9] bg-[#FAF7F2]/95 backdrop-blur-md transition-shadow duration-300',
          scrolled ? 'shadow-[0_10px_30px_-24px_rgba(35,31,30,0.3)]' : 'shadow-none',
        )}
      >
        <div className="@container mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:h-20 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="فتح القائمة"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#231F1E] transition-colors hover:bg-[#F3EDE2] md:hidden"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[86%] max-w-xs flex-col gap-0 border-l border-[#E5DEC9] bg-[#FAF7F2] p-0 text-right"
                dir="rtl"
              >
                <SheetTitle className="sr-only">قائمة إيوان</SheetTitle>
                <div className="border-b border-[#E5DEC9] px-6 py-5 bg-[#F3EDE2]">
                  <Logo showTagline={false} />
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <ul className="space-y-1">
                    {primaryLinks.map((link) => (
                      <li key={link.to}>
                        <NavLink
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex min-h-12 items-center rounded-full px-4 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-[#231F1E] text-white shadow-xs'
                                : 'text-[#231F1E] hover:bg-[#F3EDE2]',
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/my-orders"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#9C6644] hover:bg-[#F3EDE2]"
                      >
                        <PackageCheck className="h-4 w-4" />
                        طلباتي وتتبع الشحنات
                      </Link>
                    </li>
                    {isProvider && (
                      <li>
                        <NavLink
                          to="/provider"
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-[#9C6644] text-white'
                                : 'text-[#9C6644] hover:bg-[#F3EDE2]',
                            )
                          }
                        >
                          <LayoutDashboard className="h-4 w-4" strokeWidth={1.6} />
                          لوحة تحكم المعرض/المصمم
                        </NavLink>
                      </li>
                    )}
                    {isAdmin && (
                      <li>
                        <NavLink
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-[#9C6644] text-white'
                                : 'text-[#9C6644] hover:bg-[#F3EDE2]',
                            )
                          }
                        >
                          <LayoutDashboard className="h-4 w-4" strokeWidth={1.6} />
                          لوحة إشراف الإدارة
                        </NavLink>
                      </li>
                    )}
                  </ul>
                </nav>
                <div className="border-t border-[#E5DEC9] px-4 py-4 bg-[#F3EDE2]/60">
                  {profile ? (
                    <div className="space-y-2">
                      <p className="px-2 text-xs text-[#786C65]">أهلاً، {profile.fullName}</p>
                      <button
                        type="button"
                        onClick={() => {
                          void signOut();
                          setMobileOpen(false);
                        }}
                        className="flex min-h-12 w-full items-center justify-center rounded-full border border-[#E5DEC9] bg-[#FAF7F2] text-sm text-[#231F1E] hover:bg-[#F3EDE2]"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#231F1E] text-sm font-semibold text-white hover:bg-[#9C6644]"
                    >
                      <LogIn className="h-4 w-4" strokeWidth={1.6} />
                      تسجيل الدخول / إنشاء حساب
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Logo />
          </div>

          <nav className="hidden flex-1 items-center justify-center md:flex">
            <ul className="flex items-center gap-1">
              {primaryLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'relative inline-flex items-center whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors',
                        isActive ? 'text-[#231F1E] font-bold' : 'text-[#5C534E] hover:text-[#9C6644]',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        <span
                          className={cn(
                            'absolute inset-x-3 -bottom-0.5 h-0.5 bg-[#9C6644] rounded-full transition-opacity',
                            isActive ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* زر البحث */}
            <button
              type="button"
              aria-label="البحث"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#231F1E] transition-colors hover:bg-[#F3EDE2] hover:text-[#9C6644]"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>

            {/* أيقونة المحادثات المباشرة (Messages Inbox) */}
            <button
              type="button"
              aria-label="المحادثات"
              onClick={() => {
                if (!profile) {
                  navigate('/login');
                  return;
                }
                if (isProvider) {
                  navigate('/provider');
                  return;
                }
                setDrawerOpen(true);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#231F1E] transition-colors hover:bg-[#F3EDE2] hover:text-[#9C6644]"
              title="محادثاتي مع المعارض والمصممين"
            >
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {profile && totalUnread > 0 && (
                <span className="absolute 1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9C6644] px-1 text-[10px] font-bold text-white shadow-2xs">
                  {totalUnread}
                </span>
              )}
            </button>

            {/* أيقونة جرس الإشعارات (Working Notifications) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="الإشعارات"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#231F1E] transition-colors hover:bg-[#F3EDE2] hover:text-[#9C6644]"
                  title="الإشعارات"
                >
                  <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  {profile && unreadNotificationsCount > 0 && (
                    <span className="absolute 1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-2xs animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-0 text-right shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-[#E5DEC9] bg-[#F3EDE2] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#9C6644]" />
                    <span className="text-xs font-bold text-[#231F1E]">الإشعارات والتحديثات</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-medium text-[#9C6644] hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" />
                      تحديد كمقروء
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#E5DEC9]/60 p-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#786C65]">
                      لا توجد إشعارات جديدة حالياً
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !notificationsRead.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          className={cn(
                            'p-3 rounded-2xl transition-colors',
                            isUnread ? 'bg-[#F3EDE2]/80' : 'hover:bg-[#F3EDE2]/40',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#231F1E] flex items-center gap-1.5">
                              {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                              {n.title}
                            </p>
                            <span className="text-[10px] text-[#786C65] font-mono shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-[#5C534E] mt-1 line-clamp-2">{n.desc}</p>
                          {n.type === 'chat' && (
                            <button
                              type="button"
                              onClick={() => setDrawerOpen(true)}
                              className="mt-2 text-[11px] font-bold text-[#9C6644] hover:underline block"
                            >
                              عرض المحادثة والرد ←
                            </button>
                          )}
                          {n.link && (
                            <Link
                              to={n.link}
                              className="mt-2 text-[11px] font-bold text-[#9C6644] hover:underline block"
                            >
                              تتبع الشحنة بالتفصيل ←
                            </Link>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* المفضلة */}
            <Link
              to="/wishlist"
              aria-label="المفضلة"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-[#231F1E] transition-colors hover:bg-[#F3EDE2] hover:text-[#9C6644] md:flex"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="absolute 1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9C6644] px-1 text-[10px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* سلة التسوق */}
            <button
              type="button"
              aria-label="سلة التسوق"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 items-center gap-1.5 rounded-full px-2.5 text-[#231F1E] transition-colors hover:bg-[#F3EDE2] hover:text-[#9C6644]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
              <span className="text-xs font-bold">{cartCount}</span>
            </button>

            {/* حساب المستخدم: تسجيل الدخول للزائر، أو القائمة المنسدلة للمسجل */}
            {!profile ? (
              <Link
                to="/login"
                className="flex h-10 items-center gap-2 rounded-full border border-[#E5DEC9] bg-[#F3EDE2]/70 px-3.5 text-xs font-semibold text-[#231F1E] transition-all hover:border-[#9C6644] hover:bg-[#F3EDE2]"
              >
                <LogIn className="h-4 w-4 text-[#9C6644]" strokeWidth={1.8} />
                <span>تسجيل الدخول</span>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 items-center gap-2 rounded-full border border-[#E5DEC9] bg-[#F3EDE2]/70 px-3 text-xs font-semibold text-[#231F1E] transition-all hover:border-[#9C6644] hover:bg-[#F3EDE2]"
                  >
                    <User className="h-4 w-4 text-[#9C6644]" strokeWidth={1.8} />
                    <span className="hidden max-w-28 truncate md:inline">
                      {profile.fullName.split(' ')[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-2 text-right shadow-2xl"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-right">
                    <p className="text-xs font-bold text-[#231F1E]">{profile.fullName}</p>
                    <p className="text-[11px] text-[#786C65] font-normal truncate mt-0.5">
                      {profile.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E5DEC9]" />

                  {/* 1. لوحة تحكم المزود للمعرض/المصمم، أو طلباتي للعميل */}
                  {isProvider ? (
                    <DropdownMenuItem asChild className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#9C6644]">
                      <Link to="/provider" className="flex items-center gap-2.5 font-bold">
                        <LayoutDashboard className="h-4 w-4 text-[#9C6644]" />
                        <span className="text-xs">لوحة تحكم المعرض/المصمم</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#231F1E]">
                      <Link to="/my-orders" className="flex items-center gap-2.5">
                        <PackageCheck className="h-4 w-4 text-[#9C6644]" />
                        <span className="text-xs font-bold">طلباتي وتتبع الشحنات</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* 2. محادثاتي */}
                  <DropdownMenuItem
                    className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#231F1E]"
                    onClick={() => {
                      if (isProvider) {
                        navigate('/provider');
                      } else {
                        setDrawerOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <MessageCircle className="h-4 w-4 text-[#9C6644]" />
                        <span className="text-xs font-bold">محادثاتي</span>
                      </div>
                      {totalUnread > 0 && (
                        <span className="rounded-full bg-[#9C6644] px-2 py-0.5 text-[10px] text-white font-bold">
                          {totalUnread}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>

                  {/* 3. المفضلة */}
                  <DropdownMenuItem asChild className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#231F1E]">
                    <Link to="/wishlist" className="flex items-center gap-2.5">
                      <Heart className="h-4 w-4 text-[#9C6644]" />
                      <span className="text-xs font-bold">المفضلة</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* 4. إعدادات الحساب */}
                  <DropdownMenuItem
                    className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#231F1E]"
                    onClick={() => setAccountSettingsOpen(true)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-[#9C6644]" />
                      <span className="text-xs font-bold">إعدادات الحساب</span>
                    </div>
                  </DropdownMenuItem>

                  {/* 5. تواصل معنا والمساعدة */}
                  <DropdownMenuItem asChild className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#231F1E]">
                    <Link to="/contact" className="flex items-center gap-2.5">
                      <Headphones className="h-4 w-4 text-[#9C6644]" />
                      <span className="text-xs font-bold">تواصل معنا والمساعدة</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* 6. لوحة إشراف الآدمن لمديرة المنصة فقط */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-[#E5DEC9]" />
                      <DropdownMenuItem asChild className="rounded-2xl cursor-pointer py-2.5 focus:bg-[#F3EDE2] text-[#9C6644]">
                        <Link to="/admin" className="flex items-center gap-2.5 font-bold">
                          <LayoutDashboard className="h-4 w-4 text-[#9C6644]" />
                          <span className="text-xs">لوحة إشراف الآدمن</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-[#E5DEC9]" />

                  {/* 7. تسجيل الخروج */}
                  <DropdownMenuItem
                    className="rounded-2xl cursor-pointer py-2.5 text-rose-700 focus:bg-rose-50"
                    onClick={() => void signOut()}
                  >
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* درج الشات والمحادثات المباشرة الداخلي */}
      <ChatDrawer open={isDrawerOpen} onOpenChange={setDrawerOpen} />

      {/* نافذة إعدادات الحساب */}
      <AccountSettingsModal open={accountSettingsOpen} onOpenChange={setAccountSettingsOpen} />
    </>
  );
};
