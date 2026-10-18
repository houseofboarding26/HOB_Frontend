import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { VideoProvider } from './context/VideoContext'
import { BannerProvider } from './context/BannerContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import CustomerRoute from './components/common/CustomerRoute'
import HostSetupRoute from './components/common/HostSetupRoute'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RegisterHost from './pages/auth/RegisterHost'
import RoleSelection from './pages/auth/RoleSelection'
import AuthCallback from './pages/auth/AuthCallback'
import ForgotPassword from './pages/auth/ForgotPassword'

import BrowseHosts from './pages/customer/BrowseHosts'
import HostDetail from './pages/customer/HostDetail'

import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import CancellationPolicy from './pages/CancellationPolicy'
import SafetyPolicy from './pages/SafetyPolicy'

import CustomerProfile from './pages/customer/CustomerProfile'
import BookingFlow from './pages/customer/BookingFlow'
import MyBookings from './pages/customer/MyBookings'
import PetProfileForm from './pages/customer/PetProfileForm'
import PetProfileDetail from './pages/customer/PetProfileDetail'

import HostDashboard from './pages/host/HostDashboard'
import PropertyForm from './pages/host/PropertyForm'
import BookingRequests from './pages/host/BookingRequests'
import Earnings from './pages/host/Earnings'

import AdminDashboard from './pages/admin/AdminDashboard'
import AllBookings from './pages/admin/AllBookings'
import PaymentManagement from './pages/admin/PaymentManagement'
import UserManagement from './pages/admin/UserManagement'
import HostProfile from './pages/admin/HostProfile'
import VideoManagement from './pages/admin/VideoManagement'
import BannerManagement from './pages/admin/BannerManagement'
import { AdminUsersProvider } from './context/AdminUsersContext'

export default function App() {
  return (
    <AuthProvider>
      <VideoProvider>
      <BannerProvider>
      <AdminUsersProvider>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/hosts" element={<BrowseHosts />} />
          <Route path="/hosts/:id" element={<HostDetail />} />

          {/* Static legal pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/safety-policy" element={<SafetyPolicy />} />

          {/* Customer — no dashboard, lives inside the public layout */}
          <Route element={<CustomerRoute />}>
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/book" element={<BookingFlow />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/pet-profile" element={<PetProfileForm />} />
            <Route path="/pet-profile/:id/edit" element={<PetProfileForm />} />
            <Route path="/pet-profile/:id" element={<PetProfileDetail />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/host" element={<RegisterHost />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Become a Host — standalone property setup form (no dashboard chrome).
            Role becomes 'host' only after the form is submitted. */}
        <Route path="/become-host" element={<HostSetupRoute />}>
          <Route index element={<PropertyForm />} />
        </Route>

        {/* Legacy /customer/* paths → redirect to the new public routes */}
        <Route path="/customer" element={<Navigate to="/hosts" replace />} />
        <Route path="/customer/dashboard" element={<Navigate to="/profile" replace />} />
        <Route path="/customer/browse" element={<Navigate to="/hosts" replace />} />
        <Route path="/customer/host/:id" element={<Navigate to="/hosts" replace />} />
        <Route path="/customer/book" element={<Navigate to="/book" replace />} />
        <Route path="/customer/my-bookings" element={<Navigate to="/my-bookings" replace />} />
        <Route path="/customer/pet-profile" element={<Navigate to="/pet-profile" replace />} />

        {/* Host */}
        <Route path="/host" element={<ProtectedRoute roles={['host']} />}>
          <Route path="dashboard" element={<HostDashboard />} />
          <Route path="property" element={<PropertyForm />} />
          <Route path="requests" element={<BookingRequests />} />
          <Route path="earnings" element={<Earnings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<HostProfile />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="bookings" element={<AllBookings />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="videos" element={<VideoManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AdminUsersProvider>
      </BannerProvider>
      </VideoProvider>
    </AuthProvider>
  )
}
