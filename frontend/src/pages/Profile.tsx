import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Phone, MapPin, Shield, Sprout, Landmark, Loader2,
  ShoppingBag, Store, CheckCircle2, Clock, Package, EyeOff,
  LayoutDashboard, IndianRupee, XCircle, Award, Calendar, Lock,
  Sparkles, Check, ArrowRight, UserCheck, ShieldCheck, ShoppingCart, Info
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

const orderStatusColor = (s: string) =>
  s === "delivered"  ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
  s === "shipped"    ? "bg-blue-100 text-blue-700 border border-blue-200" :
  s === "cancelled"  ? "bg-red-100 text-red-700 border border-red-200" :
  s === "processing" ? "bg-purple-100 text-purple-700 border border-purple-200" :
  "bg-amber-100 text-amber-700 border border-amber-200";

// ── Shared Security / Password Card ─────────────────────────────────────────────
function ChangePasswordCard({ changingPwd, setChangingPwd, logout }: any) {
  const [form, setForm] = useState({ currentPwd: "", newPwd: "", confirmPwd: "" });

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPwd !== form.confirmPwd) { toast.error("Passwords don't match"); return; }
    setChangingPwd(true);
    try {
      await api.changePassword({ currentPassword: form.currentPwd, newPassword: form.newPwd });
      toast.success("Password changed successfully!");
      setForm({ currentPwd: "", newPwd: "", confirmPwd: "" });
    } catch (e: any) { toast.error(e.message); }
    finally { setChangingPwd(false); }
  };

  const PwdRow = ({ label, name, value, onChange }: any) => (
    <div className="grid grid-cols-[minmax(80px,36%)_1fr] items-center gap-2.5 py-2 border-b border-stone-100 last:border-0">
      <span className="text-[11px] font-semibold text-stone-500 leading-tight">{label}</span>
      <Input type="password" value={value} onChange={onChange} required
        className="h-8 text-sm border-stone-200 focus-visible:ring-emerald-500" />
    </div>
  );

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="pb-2 border-b bg-stone-50/50">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-stone-800">
          <Lock className="h-4 w-4 text-emerald-600" /> Account Security
        </CardTitle>
        <CardDescription className="text-xs">Update your credentials to secure your profile</CardDescription>
      </CardHeader>
      <CardContent className="pt-3 px-4">
        <form onSubmit={handleChangePwd} className="flex flex-col gap-0">
          <PwdRow label="Current Pwd" value={form.currentPwd}
            onChange={(e: any) => setForm(f => ({...f, currentPwd: e.target.value}))} />
          <PwdRow label="New Password" value={form.newPwd}
            onChange={(e: any) => setForm(f => ({...f, newPwd: e.target.value}))} />
          <PwdRow label="Confirm New" value={form.confirmPwd}
            onChange={(e: any) => setForm(f => ({...f, confirmPwd: e.target.value}))} />
          <button type="submit" disabled={changingPwd}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-stone-900 hover:bg-stone-800 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-all shadow hover:shadow-md cursor-pointer">
            {changingPwd ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />} Update Password
          </button>
        </form>

        <div className="mt-3 pt-3 border-t">
          <button onClick={logout} className="w-full rounded-lg border border-red-200 hover:bg-red-50 py-2 text-xs font-bold text-red-600 transition-all cursor-pointer flex items-center justify-center gap-1.5">
            Sign Out
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Shared Personal Info Form Component ─────────────────────────────────────────
function PersonalInfoForm({ user, refreshUser, accentColor = "bg-emerald-600 hover:bg-emerald-700" }: any) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsSaving(true);
    try {
      await api.updateProfile({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        phone: fd.get("phone"),
        address: fd.get("address"),
        landSize: fd.get("landSize") ? Number(fd.get("landSize")) : null,
        primaryCrop: fd.get("primaryCrop"),
      });
      await refreshUser();
      toast.success("Profile details updated successfully!");
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSaving(false); }
  };

  // Compact horizontal row: narrow label in small styled box, wide input right
  const Row = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <div className="sm:w-[150px] shrink-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 border border-stone-200 text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
          {Icon && <Icon className="h-3.5 w-3.5 text-stone-400" />}
          {label}
        </span>
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );

  return (
    <Card className="border-none shadow-md bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-base font-bold text-stone-800">Personal Details</CardTitle>
        <CardDescription className="text-xs">Manage your contact details and platform identity</CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="pt-3 pb-2 px-5">
          <div className="flex flex-col gap-1 w-full">
            <Row label="First Name" icon={User}>
              <Input name="firstName" defaultValue={user.firstName} required
                className="h-8.5 text-sm border-stone-200 focus-visible:ring-emerald-500 w-full" />
            </Row>
            <Row label="Last Name" icon={User}>
              <Input name="lastName" defaultValue={user.lastName} required
                className="h-8.5 text-sm border-stone-200 focus-visible:ring-emerald-500 w-full" />
            </Row>
            <Row label="Email" icon={Mail}>
              <Input value={user.email} readOnly
                className="h-8.5 text-sm bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed w-full" />
            </Row>
            <Row label="Phone" icon={Phone}>
              <Input name="phone" defaultValue={user.phone || ""} placeholder="+91 98765 43210"
                className="h-8.5 text-sm border-stone-200 focus-visible:ring-emerald-500 w-full" />
            </Row>
            <Row label="Address" icon={MapPin}>
              <Input name="address" defaultValue={user.address || ""} placeholder="Village, Town, District"
                className="h-8.5 text-sm border-stone-200 focus-visible:ring-emerald-500 w-full" />
            </Row>
            {user.role === "farmer" ? (
              <>
                <Row label="Land Size" icon={Landmark}>
                  <div className="relative w-full">
                    <Input name="landSize" type="number" step="0.1" defaultValue={user.landSize || ""}
                      placeholder="e.g. 5.5" className="h-8.5 text-sm border-stone-200 focus-visible:ring-emerald-500 pr-12 w-full" />
                    <span className="absolute right-3 top-2 text-[10px] text-stone-400 font-bold uppercase">acres</span>
                  </div>
                </Row>
                <Row label="Primary Crop" icon={Sprout}>
                  <Input name="primaryCrop" defaultValue={user.primaryCrop || ""} placeholder="e.g. Wheat, Sugarcane"
                    className="h-8.5 text-sm border-stone-200 focus-visible:ring-emerald-500 w-full" />
                </Row>
              </>
            ) : (
              <Row label="Account Role" icon={Shield}>
                <span className="text-sm font-semibold text-stone-700 capitalize pl-1">{user.role}</span>
              </Row>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-stone-50/50 px-5 py-3 rounded-b-xl">
          <button type="submit" disabled={isSaving}
            className={`rounded-lg px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-all flex items-center gap-2 shadow hover:shadow-md cursor-pointer ${accentColor}`}>
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Updates
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ── Purchase History Tab ───────────────────────────────────────────────────────
function PurchaseHistoryTab() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders()
      .then((d: any) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400 text-center">
      <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="h-8 w-8 opacity-40 text-stone-500" />
      </div>
      <p className="font-semibold text-stone-700 text-sm">No orders found yet</p>
      <p className="text-xs text-stone-500 max-w-xs mt-1">Explore our product catalogue to buy seeds, crop nutrients, and machinery.</p>
      <Link to="/shop" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow hover:shadow-md">
        Start Shopping <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o._id} className="rounded-xl border border-stone-200 bg-white p-4.5 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-stone-900 text-sm">#{o.orderNumber || String(o._id).slice(-6).toUpperCase()}</span>
                <Badge className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded ${orderStatusColor(o.orderStatus)}`}>{o.orderStatus}</Badge>
              </div>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {new Date(o.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-xs text-stone-500 block">Total Amount</span>
              <span className="font-extrabold text-lg text-emerald-700">₹{o.total?.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-stone-400 block capitalize">Paid via {o.paymentMethod}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-4">
            {o.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-stone-50/70 hover:bg-stone-50 border border-stone-100 p-2.5 transition-colors">
                <img src={item.image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=100"} alt={item.name} className="h-10 w-10 rounded-md object-cover bg-stone-100" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate leading-tight">{item.name}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">₹{item.price?.toLocaleString()} · Qty: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-stone-700">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 border-t border-stone-100 pt-3">
            <Package className="h-3.5 w-3.5 text-stone-400" />
            <span>Delivering to: <strong className="text-stone-700">{o.shippingAddress?.fullName}</strong> · {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.state} ({o.shippingAddress?.pincode})</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Listed Products Tab ────────────────────────────────────────────────────────
function SellerProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getMyProducts()
      .then((d: any) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  if (products.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-stone-400 text-center">
      <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <Store className="h-8 w-8 opacity-45 text-stone-500" />
      </div>
      <p className="font-semibold text-stone-700 text-sm">No listings yet</p>
      <p className="text-xs text-stone-500 max-w-xs mt-1">Submit organic harvests, fertilizers, or tools to start selling.</p>
      <Link to="/seller/products" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow hover:shadow-md">
        Create First Product Listing <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {products.map(p => (
        <div key={p._id} className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-all">
          <img src={p.image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=150"} alt={p.name} className="h-14 w-14 rounded-lg object-cover bg-stone-100 shrink-0 border" referrerPolicy="no-referrer" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-900 text-sm truncate leading-tight">{p.name}</p>
            <p className="text-xs text-stone-500 mt-0.5">₹{p.price?.toLocaleString()}/{p.unit} · {p.stock} units stock</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {p.isHidden ? (
                <Badge className="text-[10px] bg-stone-100 text-stone-600 gap-1"><EyeOff className="h-2.5 w-2.5" />Hidden</Badge>
              ) : p.approvalStatus === "approved" ? (
                <Badge className="text-[10px] bg-emerald-100 text-emerald-700 gap-1"><CheckCircle2 className="h-2.5 w-2.5" />Live</Badge>
              ) : p.approvalStatus === "pending" ? (
                <Badge className="text-[10px] bg-amber-100 text-amber-700 gap-1"><Clock className="h-2.5 w-2.5" />Awaiting Review</Badge>
              ) : (
                <Badge className="text-[10px] bg-red-100 text-red-700 gap-1"><XCircle className="h-2.5 w-2.5" />Rejected</Badge>
              )}
            </div>
          </div>
          <Link to="/seller/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded px-2.5 py-1 hover:bg-emerald-50 transition-colors shrink-0">
            Manage
          </Link>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. BUYER PROFILE VIEW (User Role)
// ──────────────────────────────────────────────────────────────────────────────
function BuyerProfileView({ user, refreshUser, logout, changingPwd, setChangingPwd }: any) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.getOrders().then((d: any) => setOrders(d.orders || [])).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Ocean theme Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md bg-gradient-to-r from-cyan-700 via-blue-600 to-teal-600 text-white p-6 md:p-8">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 text-2xl font-black">
              {user.firstName[0]}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full backdrop-blur-sm mb-1.5 border border-white/10">
                <Sparkles className="h-3 w-3" /> KrishiSeva Customer
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-cyan-50/90 mt-1">Consumer Account · Registered since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 shrink-0">
              <span className="block text-[10px] text-cyan-100/85 uppercase font-semibold">Total Orders</span>
              <span className="text-lg font-bold">{orders.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 shrink-0">
              <span className="block text-[10px] text-cyan-100/85 uppercase font-semibold">Customer Status</span>
              <span className="text-lg font-bold flex items-center gap-1 justify-center text-cyan-200">
                <UserCheck className="h-4.5 w-4.5" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-stone-100/80 p-1.5 rounded-xl border">
              <TabsTrigger value="info" className="rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Personal Info</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">My Purchases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <PersonalInfoForm user={user} refreshUser={refreshUser} accentColor="bg-cyan-600 hover:bg-cyan-700" />
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-cyan-600" /> Purchase History
                  </CardTitle>
                  <CardDescription>View and track all items purchased by you</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <PurchaseHistoryTab />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Security & Navigation */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-stone-50/50 pb-3 border-b">
              <CardTitle className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-cyan-600" /> Buyer Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
              <Link to="/home" className="w-full text-center rounded-lg bg-stone-50 border border-stone-200 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-all flex items-center justify-center gap-1.5">
                Return to Homepage
              </Link>
              <Link to="/shop" className="w-full text-center rounded-lg bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-100 hover:shadow-md">
                <ShoppingCart className="h-4 w-4" /> Go Shop Products
              </Link>
            </CardContent>
          </Card>
          
          <ChangePasswordCard changingPwd={changingPwd} setChangingPwd={setChangingPwd} logout={logout} />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. FARMER / SELLER PROFILE VIEW (Farmer Role)
// ──────────────────────────────────────────────────────────────────────────────
function FarmerProfileView({ user, refreshUser, logout, changingPwd, setChangingPwd }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboard().catch(() => null),
      api.getOrders().catch(() => ({ orders: [] }))
    ]).then(([dashData, orderData]) => {
      setData({ ...dashData, total_purchases: orderData?.orders?.length || 0 });
      setLoading(false);
    });
  }, []);

  const isApprovedSeller = user.sellerStatus === "approved";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Farm / Sprout Emerald Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 md:p-8">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 text-2xl font-black shrink-0">
              {user.firstName[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                  <Sprout className="h-3 w-3" /> KrishiSeva Farmer
                </span>
                {isApprovedSeller && (
                  <span className="inline-flex items-center gap-1 bg-teal-500/30 text-teal-200 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-teal-500/20">
                    Approved Seller
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1.5">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-emerald-50/90 mt-1">Farm ID: <span className="font-mono font-bold text-white">{user.farmerId || "N/A"}</span> · Farmer Portal</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 min-w-[100px] text-center">
              <span className="block text-[10px] text-emerald-100/85 uppercase font-semibold">Land Size</span>
              <span className="text-base font-extrabold">{user.landSize ? `${user.landSize} Acres` : "Not Set"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 min-w-[100px] text-center">
              <span className="block text-[10px] text-emerald-100/85 uppercase font-semibold">Primary Crop</span>
              <span className="text-base font-extrabold truncate max-w-[120px]">{user.primaryCrop || "Not Set"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 min-w-[100px] text-center">
              <span className="block text-[10px] text-emerald-100/85 uppercase font-semibold">Verification</span>
              <span className="text-base font-extrabold text-emerald-200 flex items-center justify-center gap-1">
                {user.isVerified ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5 text-amber-300 animate-pulse" />}
                {user.isVerified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left column: Security & Agricultural Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats card */}
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-stone-800">Agricultural Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs text-stone-600">
              <div className="bg-stone-50 rounded-lg p-3">
                <span className="text-stone-400 block mb-0.5">Primary Crop</span>
                <span className="font-semibold text-stone-900 text-sm flex items-center gap-1.5"><Sprout className="h-4 w-4 text-emerald-600" />{user.primaryCrop || "Not configured yet"}</span>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <span className="text-stone-400 block mb-0.5">Land Area</span>
                <span className="font-semibold text-stone-900 text-sm flex items-center gap-1.5"><Landmark className="h-4 w-4 text-emerald-600" />{user.landSize ? `${user.landSize} Acres` : "Not configured yet"}</span>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <span className="text-stone-400 block mb-0.5">Seller Authorization</span>
                <span className="font-semibold text-stone-900 text-sm block">
                  {user.sellerStatus === "approved" && <span className="text-emerald-700 font-extrabold">Active Seller Account ✓</span>}
                  {user.sellerStatus === "pending" && <span className="text-amber-700 font-semibold animate-pulse">Awaiting Verification Review...</span>}
                  {user.sellerStatus !== "approved" && user.sellerStatus !== "pending" && <span className="text-stone-500 font-medium">Not Registered as Seller</span>}
                </span>
              </div>
            </CardContent>
          </Card>

          <ChangePasswordCard changingPwd={changingPwd} setChangingPwd={setChangingPwd} logout={logout} />
        </div>

        {/* Right column: Dynamic Tabs */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className={`grid w-full ${isApprovedSeller ? "grid-cols-3" : "grid-cols-2"} mb-6 bg-stone-100/80 p-1.5 rounded-xl border`}>
              <TabsTrigger value="info" className="rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Farm & Info</TabsTrigger>
              {isApprovedSeller && <TabsTrigger value="listings" className="rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">My Listings</TabsTrigger>}
              <TabsTrigger value="purchases" className="rounded-lg py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Purchases</TabsTrigger>
            </TabsList>

            {/* Farm & Info Tab */}
            <TabsContent value="info">
              <PersonalInfoForm user={user} refreshUser={refreshUser} accentColor="bg-emerald-700 hover:bg-emerald-800" />
            </TabsContent>

            {/* Listings Tab */}
            {isApprovedSeller && (
              <TabsContent value="listings">
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <Store className="h-5 w-5 text-emerald-700" /> Market Listings
                      </CardTitle>
                      <CardDescription>Browse, update, and manage the products you sell</CardDescription>
                    </div>
                    <Link to="/seller/products" className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors">
                      Full Manager <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <SellerProductsTab />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Purchases Tab */}
            <TabsContent value="purchases">
              <Card className="border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-600" /> Purchased Supplies
                  </CardTitle>
                  <CardDescription>Seeds, tools, and farming products purchased for your farm</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <PurchaseHistoryTab />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. ADMINISTRATOR PROFILE VIEW (Admin Role)
// ──────────────────────────────────────────────────────────────────────────────
function AdminProfileView({ user, refreshUser, logout, changingPwd, setChangingPwd }: any) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Tech Purple Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md bg-gradient-to-r from-violet-800 to-indigo-900 text-white p-6 md:p-8">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 text-2xl font-black shrink-0">
              {user.firstName[0]}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10 mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-200" /> System Root
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-violet-100 mt-1">Super Administrator Account · System Control Privilege</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
              <span className="block text-[10px] text-violet-200 uppercase font-semibold">Security Clearance</span>
              <span className="text-sm font-extrabold text-violet-200">Level 5 (Max)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
              <span className="block text-[10px] text-violet-200 uppercase font-semibold">Access Level</span>
              <span className="text-sm font-extrabold text-emerald-300">All Nodes Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Side: Admin Tools & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* Admin Navigation Hub */}
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-stone-50/50 pb-3 border-b">
              <CardTitle className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <LayoutDashboard className="h-4.5 w-4.5 text-violet-600" /> Quick Command Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
              <Link to="/dashboard" className="w-full text-center rounded-lg bg-violet-600 hover:bg-violet-700 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-violet-200 flex items-center justify-center gap-1">
                Open Admin Dashboard <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <ChangePasswordCard changingPwd={changingPwd} setChangingPwd={setChangingPwd} logout={logout} />
        </div>

        {/* Right Side: Details Form */}
        <div className="lg:col-span-3">
          <PersonalInfoForm user={user} refreshUser={refreshUser} accentColor="bg-violet-700 hover:bg-violet-800" />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN ROUTER CONTAINER COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [changingPwd, setChangingPwd] = useState(false);

  if (!user) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
        <div className="h-16 w-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-inner">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Access Restrained</h2>
        <p className="text-stone-500 text-sm mb-6">Please log in with your credentials to manage your agricultural account profile.</p>
        <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow hover:shadow-md">
          Proceed to Login <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );

  // Render role-specific layouts
  if (user.role === "admin") {
    return (
      <AdminProfileView
        user={user}
        refreshUser={refreshUser}
        logout={logout}
        changingPwd={changingPwd}
        setChangingPwd={setChangingPwd}
      />
    );
  }

  if (user.role === "farmer") {
    return (
      <FarmerProfileView
        user={user}
        refreshUser={refreshUser}
        logout={logout}
        changingPwd={changingPwd}
        setChangingPwd={setChangingPwd}
      />
    );
  }

  // Standard regular buyer
  return (
    <BuyerProfileView
      user={user}
      refreshUser={refreshUser}
      logout={logout}
      changingPwd={changingPwd}
      setChangingPwd={setChangingPwd}
    />
  );
}

