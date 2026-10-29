import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Leaf, LogOut, LayoutDashboard, Store, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin  = user?.role === "admin";
  const isSeller = user?.role === "farmer" && user?.sellerStatus === "approved";

  // Admin only sees dashboard link; others see full nav
  const navLinks = isAdmin ? [] : [
    { name: "Home",           path: "/home" },
    { name: "Shop",           path: "/shop" },
    { name: "Scholarships",   path: "/scholarships" },
    { name: "Land Records",   path: "/land-records" },
    { name: "Sarkari Yojana", path: "/sarkari-yojana" },
    ...(isSeller ? [{ name: "My Products", path: "/seller/products" }] : []),
  ];

  const isActive = (path: string) =>
    path === "/home" ? location.pathname === "/home" : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to={isLoggedIn ? (isAdmin ? "/dashboard" : "/home") : "/"} className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-900 hidden sm:inline-block">KrishiSeva</span>
        </Link>

        {/* Desktop nav links */}
        {navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive(link.path) ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`}>
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Admin label */}
        {isAdmin && (
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
            <LayoutDashboard className="h-4 w-4" /> Admin Panel
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Cart — hidden for admin */}
          {!isAdmin && isLoggedIn && (
            <Link to="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100 transition-colors">
              <ShoppingCart className="h-5 w-5 text-stone-600" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Notification bell */}
          {isLoggedIn && <NotificationBell />}

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard"
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive("/dashboard") ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-100"}`}>
                <LayoutDashboard className="h-4 w-4" />
                {isAdmin ? "Dashboard" : "Dashboard"}
              </Link>
              <Link to="/profile"
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive("/profile") ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-100"}`}>
                <User className="h-4 w-4" />
                {user?.firstName}
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">
                <User className="h-4 w-4" /> Login
              </Link>
              <Link to="/register" className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100 transition-colors md:hidden"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-1 shadow-lg">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
              className={`rounded-md px-3 py-2.5 text-base font-medium transition-colors
                ${isActive(link.path) ? "bg-emerald-50 text-emerald-700" : "text-stone-700 hover:bg-stone-100"}`}>
              {link.name}
            </Link>
          ))}
          {navLinks.length > 0 && <div className="my-2 h-px bg-stone-100" />}
          {isLoggedIn ? (
            <>
              {!isAdmin && (
                <Link to="/cart" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100">
                  <ShoppingCart className="h-4 w-4" /> Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              )}
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100">
                <LayoutDashboard className="h-4 w-4" /> {isAdmin ? "Admin Dashboard" : "Dashboard"}
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100">
                <User className="h-4 w-4" /> Profile
              </Link>
              {isSeller && (
                <Link to="/seller/products" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100">
                  <Store className="h-4 w-4" /> My Products
                </Link>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-base font-medium text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium text-emerald-700 hover:bg-emerald-50">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
