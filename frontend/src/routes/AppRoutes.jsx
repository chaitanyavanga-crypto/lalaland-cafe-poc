import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from '../components/common/Loader';
import ProtectedRoute from './ProtectedRoute';
import { MANAGEMENT_ROLES, STAFF_ROLES } from '../constants/roles';

// Route-level code splitting: each page ships as its own chunk
const MenuPage = lazy(() => import('../pages/Menu/MenuPage'));
const DrinkCustomize = lazy(() => import('../pages/Menu/DrinkCustomize'));
const QRCodeDisplay = lazy(() => import('../pages/Menu/QRCodeDisplay'));
const CartPage = lazy(() => import('../pages/Cart/CartPage'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const InventoryPage = lazy(() => import('../pages/Admin/InventoryPage'));
const MenuManagementPage = lazy(() => import('../pages/Admin/MenuManagementPage'));
const QueuePage = lazy(() => import('../pages/Kitchen/QueuePage'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/item/:itemId" element={<DrinkCustomize />} />
        <Route path="/item/:itemId/qr" element={<QRCodeDisplay />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute roles={STAFF_ROLES}>
              <QueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={MANAGEMENT_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute roles={MANAGEMENT_ROLES}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute roles={MANAGEMENT_ROLES}>
              <MenuManagementPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
