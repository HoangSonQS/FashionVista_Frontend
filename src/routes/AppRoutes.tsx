import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from '../App';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import ProductDetailPage from '../pages/public/ProductDetail';
import ProductList from '../pages/public/ProductList';
import SearchResultsPage from '../pages/public/SearchResults';
import CartPage from '../pages/user/CartPage';
import CheckoutPage from '../pages/user/CheckoutPage';
import ProfilePage from '../pages/user/ProfilePage';
import ProductCreatePage from '../pages/admin/ProductCreate';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProductList from '../pages/admin/AdminProductList';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<App />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<ProductCreatePage />} />
            <Route path="products/:id/edit" element={<ProductCreatePage />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId/detail" element={<AdminUserDetail />} />
          </Route>
        </Route>

        {/* Catch-all route - redirect về home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
