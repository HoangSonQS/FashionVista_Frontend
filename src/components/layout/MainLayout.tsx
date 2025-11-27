import { Outlet } from 'react-router-dom';

import SiteHeader from './SiteHeader';
import Footer from './Footer';
import { CartDrawerProvider } from '../../context/CartDrawerContext';
import CartDrawer from '../cart/CartDrawer';

const MainLayout = () => {
  return (
    <CartDrawerProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />
        <main>
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartDrawerProvider>
  );
};

export default MainLayout;

