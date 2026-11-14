import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layouts/Footer';
import { Navbar } from '@/components/layouts/Navbar';
import { SearchDialog } from '@/components/layouts/SearchDialog';

export const SiteLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchDialog />
    </div>
  );
};
