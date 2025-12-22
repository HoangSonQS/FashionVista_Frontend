import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from '../App';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ProductDetailPage from '../pages/public/ProductDetail';
import ProductList from '../pages/public/ProductList';
import SearchResultsPage from '../pages/public/SearchResults';
import CollectionsPage from '../pages/public/Collections';
import CollectionDetailPage from '../pages/public/CollectionDetail';
import CategoryPage from '../pages/public/CategoryPage';
import SalePage from '../pages/public/SalePage';
import CartPage from '../pages/user/CartPage';
import CheckoutPage from '../pages/user/CheckoutPage';
import ProfilePage from '../pages/user/ProfilePage';
import UserOrdersPage from '../pages/user/UserOrders';
import UserOrderDetailPage from '../pages/user/UserOrderDetail';
import PaymentResultPage from '../pages/public/PaymentResult';
import PaymentSuccessPage from '../pages/public/PaymentSuccessPage';
import PaymentFailedPage from '../pages/public/PaymentFailedPage';
import WishlistPage from '../pages/user/WishlistPage';
import MyReviewsPage from '../pages/user/MyReviewsPage';
import ProductCreatePage from '../pages/admin/ProductCreate';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProductList from '../pages/admin/AdminProductList';
import AdminCollectionCreate from '../pages/admin/AdminCollectionCreate';
import AdminCollections from '../pages/admin/AdminCollections';
import AdminCollectionProducts from '../pages/admin/AdminCollectionProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import AdminProductVisibility from '../pages/admin/AdminProductVisibility';
import AdminShippingFeeConfig from '../pages/admin/AdminShippingFeeConfig';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminVouchers from '../pages/admin/AdminVouchers';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminProductVariants from '../pages/admin/AdminProductVariants';
import AdminProductImages from '../pages/admin/AdminProductImages';
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
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId/detail" element={<AdminUserDetail />} />
            <Route path="shipping-fee-configs" element={<AdminShippingFeeConfig />} />
          </Route>
        </Route>

        {/* Catch-all route - redirect về home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
