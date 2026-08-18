import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & UI Components
import Navbar from './components/Navbar';
import ProductDetail from './components/ProductDetail';
import Products from './pages/user/Products';
import Category from './pages/user/Category';
import Home from './pages/user/Home';
import Team from './pages/user/Team';
import Profile from './pages/user/Profile';
import LikesPage from './pages/user/LikesPage';
import About from './pages/user/About'
import Contact from './pages/user/Contact'
import ScrollToTop from './components/ScrollToTop';
// Checkout Components
import CheckoutAddress from './pages/user/CheckoutAddress';
import CheckoutPayment from './pages/user/CheckoutPayment';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import LoginWithOTP from './pages/auth/LoginWithOTP';
import ProtectedRoute from './routes/ProtectedRoute';

// Super Admin Components
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManageClients from './pages/superadmin/ManageClients';
import ManageUsers from './pages/superadmin/ManageUsers';
import ManageCategories from './pages/superadmin/ManageCategories';
import SuperAdminAudits from './pages/superadmin/SuperAdminAudits';

// Client Components
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProducts from './pages/client/ClientProducts';
import ClientVariants from './pages/client/ClientVariants';
import ClientManagers from './pages/client/ClientManagers';
import ClientInventory from './pages/client/ClientInventory';
import ClientDiscounts from './pages/client/ClientDiscounts';
import ClientReports from './pages/client/ClientReports';
import ClientOrders from './pages/client/ClientOrders';

// Manager Components
import ManagerLayout from "./pages/manager/ManagerLayout";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerProducts from "./pages/manager/ManagerProducts";
import ManagerVariants from "./pages/manager/ManagerVariants";
import ManagerInventory from "./pages/manager/ManagerInventory";
import ManagerReports from "./pages/manager/ManagerReports";
import ManagerOrders from "./pages/manager/ManagerOrders";
import ManagerDiscounts from "./pages/manager/ManagerDiscounts";

const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
    <Navbar />
    <main className="flex-grow">{children}</main>
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />

      {/* DIRECTORY / CATEGORY ROUTES */}
      <Route path="/category/:categoryName" element={<PublicLayout><Category /></PublicLayout>} />

      {/* PRODUCT LISTING ROUTES */}
      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/products/:gender/:category" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/products/:gender/:category/:type" element={<PublicLayout><Products /></PublicLayout>} />

      {/* INDIVIDUAL PRODUCT */}
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* USER & PAGES */}
      <Route path="/team" element={<PublicLayout><Team /></PublicLayout>} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/likes" element={<PublicLayout><LikesPage /></PublicLayout>} />

      {/* CHECKOUT */}
      <Route path="/checkout/address" element={<CheckoutAddress />} />
      <Route path="/checkout/payment" element={<CheckoutPayment />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/login-otp" element={<LoginWithOTP />} />

      {/* SUPER ADMIN */}
      <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><SuperAdminLayout /></ProtectedRoute>}>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="clients" element={<ManageClients />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="audits" element={<SuperAdminAudits />} />
      </Route>

      {/* CLIENT */}
      <Route path="/client" element={<ProtectedRoute roles={['client']}><ClientLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="orders" element={<ClientOrders />} />
        <Route path="inventory" element={<ClientInventory />} />
        <Route path="products" element={<ClientProducts />} />
        <Route path="products/:productId/variants" element={<ClientVariants />} />
        <Route path="managers" element={<ClientManagers />} />
        <Route path="discounts" element={<ClientDiscounts />} />
        <Route path="reports" element={<ClientReports />} />
      </Route>

      {/* MANAGER */}
      <Route path="/manager" element={<ProtectedRoute roles={['manager']}><ManagerLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="orders" element={<ManagerOrders />} />
        <Route path="products" element={<ManagerProducts />} />
        <Route path="products/:productId/variants" element={<ManagerVariants />} />
        <Route path="discounts" element={<ManagerDiscounts />} />
        <Route path="inventory" element={<ManagerInventory />} />
        <Route path="reports" element={<ManagerReports />} />
      </Route>

      {/* 404 FALLBACK */}
      <Route path="*" element={<div className="p-20 font-black text-center text-4xl">404 | NOT FOUND</div>} />
          </Routes>
    </>
  );
}

export default App;