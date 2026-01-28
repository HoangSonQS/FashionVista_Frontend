import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ScrollToTop from '../components/common/ScrollToTop';

// Public Pages
const App = React.lazy(() => import('../App'));
const ProductList = React.lazy(() => import('../pages/public/ProductList'));
const ProductDetailPage = React.lazy(() => import('../pages/public/ProductDetail'));
const SearchResultsPage = React.lazy(() => import('../pages/public/SearchResults'));
const CollectionsPage = React.lazy(() => import('../pages/public/Collections'));
const CollectionDetailPage = React.lazy(() => import('../pages/public/CollectionDetail'));
const CategoryPage = React.lazy(() => import('../pages/public/CategoryPage'));
const SalePage = React.lazy(() => import('../pages/public/SalePage'));
const PaymentResultPage = React.lazy(() => import('../pages/public/PaymentResult'));
const PaymentSuccessPage = React.lazy(() => import('../pages/public/PaymentSuccessPage'));
const PaymentFailedPage = React.lazy(() => import('../pages/public/PaymentFailedPage'));

// Auth Pages
const Register = React.lazy(() => import('../pages/auth/Register'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));
const AdminLogin = React.lazy(() => import('../pages/admin/AdminLogin'));

// User Pages
const CartPage = React.lazy(() => import('../pages/user/CartPage'));
const CheckoutPage = React.lazy(() => import('../pages/user/CheckoutPage'));
const ProfilePage = React.lazy(() => import('../pages/user/ProfilePage'));
const UserOrdersPage = React.lazy(() => import('../pages/user/UserOrders'));
const UserOrderDetailPage = React.lazy(() => import('../pages/user/UserOrderDetail'));
const WishlistPage = React.lazy(() => import('../pages/user/WishlistPage'));
const MyReviewsPage = React.lazy(() => import('../pages/user/MyReviewsPage'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const ProductCreatePage = React.lazy(() => import('../pages/admin/ProductCreate'));
const AdminReports = React.lazy(() => import('../pages/admin/AdminReports'));
const AdminProductList = React.lazy(() => import('../pages/admin/AdminProductList'));
const AdminCollectionCreate = React.lazy(() => import('../pages/admin/AdminCollectionCreate'));
const AdminCollections = React.lazy(() => import('../pages/admin/AdminCollections'));
const AdminCollectionProducts = React.lazy(() => import('../pages/admin/AdminCollectionProducts'));
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'));
const AdminCarts = React.lazy(() => import('../pages/admin/AdminCarts'));
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'));
const AdminUserDetail = React.lazy(() => import('../pages/admin/AdminUserDetail'));
const AdminProductVisibility = React.lazy(() => import('../pages/admin/AdminProductVisibility'));
const AdminShippingFeeConfig = React.lazy(() => import('../pages/admin/AdminShippingFeeConfig'));
const AdminCategories = React.lazy(() => import('../pages/admin/AdminCategories'));
const AdminVouchers = React.lazy(() => import('../pages/admin/AdminVouchers'));
const AdminPayments = React.lazy(() => import('../pages/admin/AdminPayments'));
const AdminProductVariants = React.lazy(() => import('../pages/admin/AdminProductVariants'));
const AdminProductImages = React.lazy(() => import('../pages/admin/AdminProductImages'));
const AdminReturns = React.lazy(() => import('../pages/admin/AdminReturns'));
const AdminReviews = React.lazy(() => import('../pages/admin/AdminReviews'));
const AdminLoyaltyPoints = React.lazy(() => import('../pages/admin/AdminLoyaltyPoints'));
const AdminLoginActivities = React.lazy(() => import('../pages/admin/AdminLoginActivities'));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-xl">Loading...</div>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<App />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionDetailPage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/sale" element={<SalePage />} />
            <Route path="/payment/result" element={<PaymentResultPage />} />
            <Route path="/checkout/success" element={<PaymentSuccessPage />} />
            <Route path="/checkout/failed" element={<PaymentFailedPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<UserOrdersPage />} />
              <Route path="/orders/:orderNumber" element={<UserOrderDetailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/reviews" element={<MyReviewsPage />} />
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductList />} />
              <Route path="products/new" element={<ProductCreatePage />} />
              <Route path="products/:id/edit" element={<ProductCreatePage />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="product-visibility" element={<AdminProductVisibility />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="vouchers" element={<AdminVouchers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="product-variants" element={<AdminProductVariants />} />
              <Route path="products/:productId/images" element={<AdminProductImages />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="collections/new" element={<AdminCollectionCreate />} />
              <Route path="collections/:id/edit" element={<AdminCollectionCreate />} />
              <Route path="collections/:id/products" element={<AdminCollectionProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="loyalty-points" element={<AdminLoyaltyPoints />} />
              <Route path="login-activities" element={<AdminLoginActivities />} />
              <Route path="carts" element={<AdminCarts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:userId/detail" element={<AdminUserDetail />} />
              <Route path="shipping-fee-configs" element={<AdminShippingFeeConfig />} />
            </Route>
          </Route>

          {/* Catch-all route - redirect về home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
