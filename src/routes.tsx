import type { ReactNode } from 'react';
import { AdminGuard } from '@/components/common/AdminGuard';
import { ProviderGuard } from '@/components/common/ProviderGuard';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import DesignerPage from './pages/DesignerPage';
import DesignersPage from './pages/DesignersPage';
import FaqPage from './pages/FaqPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LookbookPage from './pages/LookbookPage';
import PartnersPage from './pages/PartnersPage';
import ProductPage from './pages/ProductPage';
import RegisterPage from './pages/RegisterPage';
import ReviewsPage from './pages/ReviewsPage';
import ShopPage from './pages/ShopPage';
import StoresPage from './pages/StoresPage';
import WishlistPage from './pages/WishlistPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'الرئيسية', path: '/', element: <HomePage />, public: true },
  { name: 'المتجر', path: '/shop', element: <ShopPage />, public: true },
  { name: 'المنتج', path: '/product/:slug', element: <ProductPage />, public: true },
  { name: 'المعارض', path: '/stores', element: <StoresPage />, public: true },
  { name: 'المصممون', path: '/designers', element: <DesignersPage />, public: true },
  { name: 'مصمم AI', path: '/designer', element: <DesignerPage />, public: true },
  { name: 'كتالوج الإلهام', path: '/lookbook', element: <LookbookPage />, public: true },
  { name: 'شركاء النجاح', path: '/partners', element: <PartnersPage />, public: true },
  { name: 'آراء العملاء', path: '/reviews', element: <ReviewsPage />, public: true },
  { name: 'الأسئلة الشائعة', path: '/faq', element: <FaqPage />, public: true },
  { name: 'السلة', path: '/cart', element: <CartPage />, public: true },
  { name: 'طلباتي', path: '/my-orders', element: <MyOrdersPage />, public: true },
  { name: 'المفضلة', path: '/wishlist', element: <WishlistPage />, public: true },
  { name: 'من نحن', path: '/about', element: <AboutPage />, public: true },
  { name: 'تواصل معنا', path: '/contact', element: <ContactPage />, public: true },
  { name: 'تسجيل الدخول', path: '/login', element: <LoginPage />, public: true },
  { name: 'إنشاء حساب', path: '/register', element: <RegisterPage />, public: true },
  { name: 'لوحة تحكم المزود', path: '/provider', element: <ProviderGuard><ProviderDashboardPage /></ProviderGuard>, public: true },
  { name: 'لوحة التحكم', path: '/admin', element: <AdminGuard><AdminPage /></AdminGuard>, public: true },
  { name: 'لوحة التحكم', path: '/dashboard', element: <AdminGuard><AdminPage /></AdminGuard>, public: true },
  // مسارات عربية بديلة (Aliases) — تعمل بنفس الصفحات
  { name: 'الرئيسية', path: '/الرئيسية', element: <HomePage />, public: true },
  { name: 'المتجر', path: '/المتجر', element: <ShopPage />, public: true },
  { name: 'المعارض', path: '/المعارض', element: <StoresPage />, public: true },
  { name: 'المصممون', path: '/المصممون', element: <DesignersPage />, public: true },
  { name: 'مصمم AI', path: '/مصمم-الذكاء-الاصطناعي', element: <DesignerPage />, public: true },
  { name: 'كتالوج الإلهام', path: '/كتالوج-الإلهام', element: <LookbookPage />, public: true },
  { name: 'شركاء النجاح', path: '/شركاء-النجاح', element: <PartnersPage />, public: true },
  { name: 'آراء العملاء', path: '/آراء-العملاء', element: <ReviewsPage />, public: true },
  { name: 'الأسئلة الشائعة', path: '/الأسئلة-الشائعة', element: <FaqPage />, public: true },
  { name: 'السلة', path: '/السلة', element: <CartPage />, public: true },
  { name: 'المفضلة', path: '/المفضلة', element: <WishlistPage />, public: true },
  { name: 'تسجيل الدخول', path: '/تسجيل-الدخول', element: <LoginPage />, public: true },
  { name: 'إنشاء حساب', path: '/إنشاء-حساب', element: <RegisterPage />, public: true },
  { name: 'من نحن', path: '/من-نحن', element: <AboutPage />, public: true },
  { name: 'بوابة المزود', path: '/بوابة-المزود', element: <ProviderGuard><ProviderDashboardPage /></ProviderGuard>, public: true },
  { name: 'لوحة التحكم', path: '/لوحة-التحكم', element: <AdminGuard><AdminPage /></AdminGuard>, public: true },
];
