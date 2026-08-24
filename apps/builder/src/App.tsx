import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import HomePage from '@/pages/HomePage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import ProductsPage from '@/pages/products/ProductsPage';
import ProductFormPage from '@/pages/products/ProductFormPage';
import CollectionsPage from '@/pages/products/CollectionsPage';
import ThemesPage from '@/pages/storefront/ThemesPage';
import LandingPagesPage from '@/pages/storefront/LandingPagesPage';
import CheckoutSettingsPage from '@/pages/settings/CheckoutSettingsPage';
import ShippingSettingsPage from '@/pages/settings/ShippingSettingsPage';
import DomainsPage from '@/pages/settings/DomainsPage';
import OrdersPage from '@/pages/storefront/OrdersPage';
import AbandonedCheckoutsPage from '@/pages/storefront/AbandonedCheckoutsPage';
import ContentEditorPage from '@/pages/content/ContentEditorPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Full-screen theme editor — deliberately outside AdminLayout so it
            renders with none of the admin chrome (sidebar/topbar), matching
            how Shopify's own theme editor takes over the whole viewport. */}
        <Route
          path="/storefront/editor"
          element={
            <ProtectedRoute>
              <ContentEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/abandoned" element={<AbandonedCheckoutsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/products/collections" element={<CollectionsPage />} />
          <Route path="/customers" element={<PlaceholderPage title="Customers" />} />
          <Route path="/storefront" element={<ThemesPage />} />
          <Route path="/storefront/landing-pages" element={<LandingPagesPage />} />
          <Route path="/marketing" element={<PlaceholderPage title="Marketing" />} />
          <Route path="/discounts" element={<PlaceholderPage title="Discounts" />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="/apps" element={<PlaceholderPage title="Apps" />} />
          <Route path="/b2b" element={<PlaceholderPage title="B2B" />} />
          <Route path="/channels" element={<PlaceholderPage title="Channels" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/settings/checkout" element={<CheckoutSettingsPage />} />
          <Route path="/settings/shipping" element={<ShippingSettingsPage />} />
          <Route path="/settings/domains" element={<DomainsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
