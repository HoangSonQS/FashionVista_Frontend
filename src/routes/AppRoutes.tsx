import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import ProductDetailPage from '../pages/public/ProductDetail';
import CartPage from '../pages/user/CartPage';
import CheckoutPage from '../pages/user/CheckoutPage';
import ProfilePage from '../pages/user/ProfilePage';
import ProductCreatePage from '../pages/admin/ProductCreate';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/products/new" element={<ProductCreatePage />} />
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};
