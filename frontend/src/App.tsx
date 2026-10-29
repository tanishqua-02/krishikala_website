import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatbotWidget from "./components/ChatbotWidget";

// Pages
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Scholarships from "./pages/Scholarships";
import LandRecords from "./pages/LandRecords";
import SarkariYojana from "./pages/SarkariYojana";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SellerProducts from "./pages/SellerProducts";
import SellerOrders from "./pages/SellerOrders";
import OrderHistory from "./pages/OrderHistory";

// Protected route — redirects to /login if not authenticated
function Protected({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Admin redirect — admin always lands on /dashboard
function AdminRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role === "admin") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/home" replace />;
}

// Layout with Navbar + Footer (used for all authenticated pages)
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-stone-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing — no navbar */}
      <Route path="/" element={<Landing />} />

      {/* Auth pages — no navbar */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* After login redirect */}
      <Route path="/home" element={
        <Protected>
          <AppLayout><Home /></AppLayout>
        </Protected>
      } />

      {/* Protected app pages */}
      <Route path="/shop" element={<Protected><AppLayout><Shop /></AppLayout></Protected>} />
      <Route path="/shop/:id" element={<Protected><AppLayout><ProductDetail /></AppLayout></Protected>} />
      <Route path="/scholarships" element={<Protected><AppLayout><Scholarships /></AppLayout></Protected>} />
      <Route path="/land-records" element={<Protected><AppLayout><LandRecords /></AppLayout></Protected>} />
      <Route path="/sarkari-yojana" element={<Protected><AppLayout><SarkariYojana /></AppLayout></Protected>} />
      <Route path="/cart" element={<Protected><AppLayout><Cart /></AppLayout></Protected>} />
      <Route path="/checkout" element={<Protected><AppLayout><Checkout /></AppLayout></Protected>} />
      <Route path="/dashboard" element={<Protected><AppLayout><Dashboard /></AppLayout></Protected>} />
      <Route path="/profile" element={<Protected><AppLayout><Profile /></AppLayout></Protected>} />
      <Route path="/seller/products" element={<Protected><AppLayout><SellerProducts /></AppLayout></Protected>} />
      <Route path="/seller/orders"   element={<Protected><AppLayout><SellerOrders /></AppLayout></Protected>} />
      <Route path="/orders"          element={<Protected><AppLayout><OrderHistory /></AppLayout></Protected>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
