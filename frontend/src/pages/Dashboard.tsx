import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import {
  ShoppingBag, FileText, GraduationCap, TrendingUp, Users, Store,
  CheckCircle2, XCircle, Clock, Search, IndianRupee, Package,
  ShieldCheck, Loader2, ArrowUpRight, Plus, Eye, Trash2, EyeOff, MessageSquare, Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Farmer / Seller Dashboard ───────────────────────────────────────────────
function FarmerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSeller = (user as any)?.sellerStatus === "approved";

  useEffect(() => {
    api.getDashboard().then((d: any) => setData(d)).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  const statusColor = (s: string) =>
    s === "delivered" ? "bg-emerald-100 text-emerald-700" :
    s === "shipped"   ? "bg-blue-100 text-blue-700" :
    s === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  const buyerStats = [
    { title: "Active Orders",        value: data?.stats?.active_orders ?? 0,  icon: ShoppingBag,   color: "text-blue-600",   bg: "bg-blue-50" },
    { title: "Land Searches",        value: data?.stats?.land_records ?? 0,   icon: FileText,      color: "text-emerald-600",bg: "bg-emerald-50" },
    { title: "Scholarships Applied", value: data?.stats?.scholarships ?? 0,   icon: GraduationCap, color: "text-amber-600",  bg: "bg-amber-50" },
    { title: "Total Spent",          value: `₹${(data?.stats?.total_spent ?? 0).toLocaleString()}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const sellerStats = data?.seller_stats ? [
    { title: "Orders Received",   value: data.seller_stats.orders_received,  icon: Package,      color: "text-blue-600",   bg: "bg-blue-50" },
    { title: "Pending Orders",    value: data.seller_stats.orders_pending,   icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50" },
    { title: "Completed Orders",  value: data.seller_stats.orders_completed, icon: CheckCircle2, color: "text-emerald-600",bg: "bg-emerald-50" },
    { title: "Sales Revenue",     value: `₹${(data.seller_stats.revenue ?? 0).toLocaleString()}`, icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Products Listed",   value: data.seller_stats.products_listed,  icon: Store,        color: "text-teal-600",   bg: "bg-teal-50" },
    { title: "Pending Approvals", value: data.seller_stats.pending_approvals ?? 0, icon: Clock,  color: "text-orange-600", bg: "bg-orange-50" },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">My Dashboard</h1>
          <p className="text-stone-500">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/profile" className={cn(buttonVariants({ variant: "outline" }))}>Edit Profile</Link>
          {isSeller && (
            <Link to="/seller/products" className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
              <Plus className="h-4 w-4" />Add Product
            </Link>
          )}
          <Link to="/shop" className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white")}>Shop Now</Link>
        </div>
      </div>

      {(((user as any)?.sellerStatus === "pending" ? 1 : 0) + (data?.seller_stats?.pending_approvals ?? 0)) > 0 && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">Remaining Platform Approvals</p>
              <p className="text-sm text-amber-700">
                You have <span className="font-bold">{((user as any)?.sellerStatus === "pending" ? 1 : 0) + (data?.seller_stats?.pending_approvals ?? 0)}</span> pending approval{(((user as any)?.sellerStatus === "pending" ? 1 : 0) + (data?.seller_stats?.pending_approvals ?? 0)) > 1 ? "s" : ""} remaining:
                { (user as any)?.sellerStatus === "pending" && " Farmer/Seller Account Verification" }
                { (user as any)?.sellerStatus === "pending" && (data?.seller_stats?.pending_approvals > 0) && " &" }
                { (data?.seller_stats?.pending_approvals > 0) && ` ${data.seller_stats.pending_approvals} Product Listing(s)` }
              </p>
            </div>
          </div>
          <Badge className="bg-amber-600 text-white self-start sm:self-auto animate-pulse">Pending Admin Action</Badge>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        {buyerStats.map(s => (
          <Card key={s.title} className="border-none shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div><p className="text-xs font-medium text-stone-500">{s.title}</p><p className="text-xl font-bold text-stone-900">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isSeller && sellerStats.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900">Seller Overview</h2>
            <div className="ml-auto flex items-center gap-3">
              <Link to="/seller/orders" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                Orders Received <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/seller/products" className="text-sm text-stone-500 hover:underline flex items-center gap-1">
                Products <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
            {sellerStats.map(s => (
              <Card key={s.title} className="border-none shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}><s.icon className="h-5 w-5" /></div>
                  <p className="text-xl font-bold text-stone-900">{s.value}</p>
                  <p className="text-xs text-stone-500 leading-tight">{s.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div><CardTitle>Recent Orders</CardTitle><CardDescription>Your latest purchases</CardDescription></div>
            <Link to="/orders" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recent_orders?.length ? (
              <div className="space-y-3">
                {data.recent_orders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100"><ShoppingBag className="h-4 w-4 text-stone-600" /></div>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">#{String(o.id).slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-stone-500">{new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900 text-sm">₹{o.total_amount?.toLocaleString()}</p>
                      <Badge className={`text-xs ${statusColor(o.status)}`}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-stone-400">
                <ShoppingBag className="mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">No orders yet.</p>
                <Link to="/shop" className="mt-2 text-sm text-emerald-600 hover:underline">Start shopping →</Link>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="border-none shadow-md bg-emerald-900 text-white">
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Access</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { to: "/orders",       icon: ShoppingBag, label: "My Orders" },
                { to: "/land-records", icon: FileText, label: "Land Records" },
                { to: "/scholarships", icon: GraduationCap, label: "Scholarships" },
                { to: "/cart", icon: ShoppingBag, label: "My Cart" },
                ...(isSeller ? [
                  { to: "/seller/orders",   icon: Package, label: "Orders Received" },
                  { to: "/seller/products", icon: Store,   label: "My Products" },
                ] : []),
              ].map(l => (
                <Link key={l.to} to={l.to} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                  <l.icon className="h-4 w-4" />{l.label}
                </Link>
              ))}
            </CardContent>
          </Card>
          {data?.upcoming_deadlines?.length > 0 && (
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3"><CardTitle className="text-base">Upcoming Deadlines</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {data.upcoming_deadlines.map((d: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold leading-tight">{d.title.slice(0, 35)}…</p>
                      <p className="text-xs text-stone-500">Deadline: {d.deadline}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Approval Card (with feedback + hide) ────────────────────────────
function ProductApprovalCard({ product: p, onApprove }: { product: any; onApprove: (id: string, status: string, feedback?: string) => void }) {
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [hideReason, setHideReason] = useState("");

  const handleReject = () => {
    onApprove(p._id, "rejected", feedback || undefined);
  };

  const handleHide = async () => {
    if (!hideReason.trim()) { toast.error("Please provide a reason for hiding"); return; }
    setHiding(true);
    try {
      await api.admin.hideProduct(p._id, { isHidden: true, hiddenReason: hideReason });
      toast.success("Product hidden and seller notified.");
      onApprove(p._id, "hidden");
    } catch (e: any) { toast.error(e.message); }
    finally { setHiding(false); }
  };

  return (
    <Card className="border border-amber-100 shadow-sm overflow-hidden">
      <div className="aspect-video overflow-hidden bg-stone-100">
        <img src={p.image} alt={p.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-stone-900 mb-1 leading-tight">{p.name}</h3>
        <p className="text-xs text-stone-500 mb-1">{p.category} · ₹{p.price?.toLocaleString()}/{p.unit} · {p.stock} in stock</p>
        <p className="text-xs text-stone-600 mb-2 line-clamp-2">{p.description}</p>
        {p.seller && (
          <p className="text-xs text-stone-500 mb-3 bg-stone-50 rounded px-2 py-1">
            Seller: <span className="font-semibold">{p.seller.firstName} {p.seller.lastName}</span>
            {p.seller.email && <span className="text-stone-400"> · {p.seller.email}</span>}
          </p>
        )}

        {/* Feedback input */}
        {showFeedback && (
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Feedback for seller (optional for approval, recommended for rejection)..."
            rows={2}
            className="w-full mb-2 rounded-lg border border-stone-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
          />
        )}

        {/* Hide reason input */}
        {hiding && (
          <div className="mb-2">
            <textarea
              value={hideReason}
              onChange={e => setHideReason(e.target.value)}
              placeholder="Reason for hiding (required — will be sent to seller)..."
              rows={2}
              className="w-full rounded-lg border border-amber-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
            <div className="flex gap-2 mt-1.5">
              <button className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-semibold text-white hover:bg-amber-600" onClick={handleHide}>Confirm Hide</button>
              <button className="flex-1 rounded-lg border border-stone-200 py-1.5 text-xs text-stone-600 hover:bg-stone-50" onClick={() => { setHiding(false); setHideReason(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {!hiding && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                onClick={() => onApprove(p._id, "approved", feedback || undefined)}>
                ✓ Approve
              </button>
              <button className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                onClick={handleReject}>
                ✗ Reject
              </button>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-lg border border-stone-200 py-1.5 text-xs text-stone-600 hover:bg-stone-50 flex items-center justify-center gap-1"
                onClick={() => setShowFeedback(v => !v)}>
                <MessageSquare className="h-3 w-3" /> {showFeedback ? "Hide" : "Add"} Feedback
              </button>
              <button
                className="flex-1 rounded-lg border border-amber-200 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1"
                onClick={() => setHiding(true)}>
                <EyeOff className="h-3 w-3" /> Hide
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats]             = useState<any>(null);
  const [farmers, setFarmers]         = useState<any[]>([]);
  const [users, setUsers]             = useState<any[]>([]);
  const [orders, setOrders]           = useState<any[]>([]);
  const [apps, setApps]               = useState<any[]>([]);
  const [pendingProducts, setPending] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm]       = useState<any>({});
  const [savingEdit, setSavingEdit]   = useState(false);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [userSearch, setUserSearch]   = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, f, u, o, a, pp, ap] = await Promise.all([
          api.admin.getOrderStats() as any,
          api.admin.getFarmers() as any,
          api.admin.getUsers() as any,
          api.admin.getAllOrders() as any,
          api.admin.getAllApplications() as any,
          api.admin.getPendingProducts() as any,
          api.admin.getAllProducts() as any,
        ]);
        setStats(s.stats); setFarmers(f.farmers); setUsers(u.users);
        setOrders(o.orders); setApps(a.applications); setPending(pp.products);
        setAllProducts(ap.products || []);
      } catch (e: any) { toast.error(e.message); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const verifyFarmer = async (id: string, body: object) => {
    try { await api.admin.verifyFarmer(id, body); toast.success("Updated!"); setFarmers(p => p.map(f => f._id === id ? { ...f, ...body } : f)); }
    catch (e: any) { toast.error(e.message); }
  };
  const updateOrder = async (id: string, orderStatus: string) => {
    try { await api.admin.updateOrderStatus(id, { orderStatus }); setOrders(p => p.map(o => o._id === id ? { ...o, orderStatus } : o)); }
    catch (e: any) { toast.error(e.message); }
  };
  const updateApp = async (id: string, status: string) => {
    try { await api.admin.updateApplicationStatus(id, { status }); setApps(p => p.map(a => a._id === id ? { ...a, status } : a)); toast.success("Updated"); }
    catch (e: any) { toast.error(e.message); }
  };
  const approveProduct = async (id: string, approvalStatus: string, feedback?: string) => {
    try {
      if (approvalStatus === "hidden") {
        setPending(p => p.filter(x => x._id !== id));
        return;
      }
      await api.admin.approveProduct(id, { approvalStatus, ...(feedback ? { feedback } : {}) });
      setPending(p => p.filter(x => x._id !== id));
      setAllProducts(p => p.map(x => x._id === id ? { ...x, approvalStatus, isActive: approvalStatus === "approved" } : x));
      toast.success(`Product ${approvalStatus}${feedback ? " with feedback" : ""}`);
    } catch (e: any) { toast.error(e.message); }
  };

  const adminHideProduct = async (id: string, isHidden: boolean, reason?: string) => {
    try {
      await api.admin.hideProduct(id, { isHidden, hiddenReason: reason || "" });
      setAllProducts(p => p.map(x => x._id === id ? { ...x, isHidden, hiddenReason: reason || "" } : x));
      toast.success(isHidden ? "Product hidden. Seller notified." : "Product restored.");
    } catch (e: any) { toast.error(e.message); }
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const d: any = await api.admin.editProduct(editingProduct._id, editForm);
      setAllProducts(p => p.map(x => x._id === editingProduct._id ? d.product : x));
      setEditingProduct(null);
      toast.success("Product updated. Seller notified.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingEdit(false); }
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setEditForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, unit: p.unit || "unit", tag: p.tag || "" });
  };
  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try { await api.admin.deleteUser(id); setUsers(p => p.filter(u => u._id !== id)); setFarmers(p => p.filter(f => f._id !== id)); toast.success("Deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  const ff = farmers.filter(f => !farmerSearch || `${f.firstName} ${f.lastName} ${f.email} ${f.farmerId || ""}`.toLowerCase().includes(farmerSearch.toLowerCase()));
  const fu = users.filter(u => !userSearch || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()));

  const oColor = (s: string) => s === "delivered" ? "bg-emerald-100 text-emerald-700" : s === "shipped" ? "bg-blue-100 text-blue-700" : s === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  const aColor = (s: string) => s === "approved" ? "bg-emerald-100 text-emerald-700" : s === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  const statCards = [
    { title: "Total Revenue",    value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Orders",     value: stats?.totalOrders ?? 0,     icon: Package,     color: "text-blue-600",   bg: "bg-blue-50" },
    { title: "Active Orders",    value: stats?.activeOrders ?? 0,    icon: ShoppingBag, color: "text-amber-600",  bg: "bg-amber-50" },
    { title: "Total Farmers",    value: stats?.totalFarmers ?? 0,    icon: Users,       color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Verified Farmers", value: stats?.verifiedFarmers ?? 0, icon: ShieldCheck, color: "text-teal-600",   bg: "bg-teal-50" },
    { title: "Pending Verify",   value: stats?.pendingFarmers ?? 0,  icon: Clock,       color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Pending Products", value: stats?.pendingProducts ?? 0, icon: Store,       color: "text-rose-600",   bg: "bg-rose-50" },
    { title: "Total Users",      value: stats?.totalUsers ?? 0,      icon: Users,       color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8"><h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1><p className="text-stone-500">Manage the KrishiSeva platform</p></div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 mb-8">
        {statCards.map(s => (
          <Card key={s.title} className="border-none shadow-md">
            <CardContent className="flex flex-col items-center gap-1.5 p-3 text-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <p className="text-lg font-bold text-stone-900">{s.value}</p>
              <p className="text-[10px] text-stone-500 leading-tight">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="farmers">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-stone-100 p-1 rounded-lg">
          <TabsTrigger value="farmers">Farmers ({farmers.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="products">Pending {pendingProducts.length > 0 && `(${pendingProducts.length})`}</TabsTrigger>
          <TabsTrigger value="all-products">All Products ({allProducts.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        </TabsList>

        {/* ── Farmers ── */}
        <TabsContent value="farmers">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-3">
              <CardTitle>Registered Farmers</CardTitle>
              <div className="relative w-64"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" /><Input placeholder="Search…" className="pl-9" value={farmerSearch} onChange={e => setFarmerSearch(e.target.value)} /></div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-semibold uppercase text-stone-400">
                  <th className="pb-3 pr-4">Farmer</th><th className="pb-3 pr-4">Farmer ID</th>
                  <th className="pb-3 pr-4">Land/Crop</th><th className="pb-3 pr-4">Verified</th>
                  <th className="pb-3 pr-4">Seller Status</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y">
                  {ff.map(f => (
                    <tr key={f._id} className="hover:bg-stone-50">
                      <td className="py-3 pr-4">
                        <button className="text-left hover:text-emerald-600 transition-colors" onClick={() => setSelectedUser(f)}>
                          <p className="font-semibold">{f.firstName} {f.lastName}</p>
                          <p className="text-xs text-stone-500">{f.email}</p>
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-stone-600 text-xs">{f.farmerId || "—"}</td>
                      <td className="py-3 pr-4 text-stone-600 text-xs">{f.landSize ? `${f.landSize}ac` : "—"}{f.primaryCrop ? ` · ${f.primaryCrop}` : ""}</td>
                      <td className="py-3 pr-4">
                        {f.isVerified
                          ? <Badge className="bg-emerald-100 text-emerald-700 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Yes</Badge>
                          : <Badge className="bg-amber-100 text-amber-700 gap-1 text-xs"><Clock className="h-3 w-3" />No</Badge>}
                      </td>
                      <td className="py-3 pr-4">
                        {f.sellerStatus === "approved" ? <Badge className="bg-emerald-100 text-emerald-700 text-xs">Approved</Badge>
                          : f.sellerStatus === "pending" ? <Badge className="bg-amber-100 text-amber-700 text-xs">Pending</Badge>
                          : <Badge className="bg-stone-100 text-stone-500 text-xs">None</Badge>}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {!f.isVerified && <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700" onClick={() => verifyFarmer(f._id, { isVerified: true })}>Verify</button>}
                          {f.sellerStatus === "pending" && <>
                            <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700" onClick={() => verifyFarmer(f._id, { sellerStatus: "approved", isVerified: true })}>Approve Seller</button>
                            <button className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => verifyFarmer(f._id, { sellerStatus: "rejected" })}>Reject</button>
                          </>}
                          <button className="rounded p-1 text-stone-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteUser(f._id)}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ff.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-stone-400">No farmers found</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Users ── */}
        <TabsContent value="users">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-3">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-64"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" /><Input placeholder="Search…" className="pl-9" value={userSearch} onChange={e => setUserSearch(e.target.value)} /></div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-semibold uppercase text-stone-400">
                  <th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">Role</th><th className="pb-3 pr-4">Phone</th><th className="pb-3 pr-4">Joined</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y">
                  {fu.map(u => (
                    <tr key={u._id} className="hover:bg-stone-50">
                      <td className="py-3 pr-4">
                        <button className="text-left hover:text-emerald-600 transition-colors" onClick={() => setSelectedUser(u)}>
                          <p className="font-semibold">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-stone-500">{u.email}</p>
                        </button>
                      </td>
                      <td className="py-3 pr-4"><Badge variant="secondary" className="capitalize text-xs">{u.role}</Badge></td>
                      <td className="py-3 pr-4 text-stone-500 text-xs">{u.phone || "—"}</td>
                      <td className="py-3 pr-4 text-stone-500 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button className="rounded p-1 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setSelectedUser(u)}><Eye className="h-3.5 w-3.5" /></button>
                          <button className="rounded p-1 text-stone-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteUser(u._id)}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fu.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-stone-400">No users found</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Product Approvals ── */}
        <TabsContent value="products">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>Product Approval Queue</CardTitle><CardDescription>Products submitted by sellers awaiting your review</CardDescription></CardHeader>
            <CardContent>
              {pendingProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                  <CheckCircle2 className="h-12 w-12 opacity-20 mb-3" />
                  <p>No pending products — all caught up!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingProducts.map(p => (
                    <ProductApprovalCard key={p._id} product={p} onApprove={approveProduct} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── All Products (admin control) ── */}
        <TabsContent value="all-products">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-3">
              <div>
                <CardTitle>All Products</CardTitle>
                <CardDescription>View, edit, hide or restore any product. Seller is notified on every change.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative w-52">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                  <Input placeholder="Search products…" className="pl-9 text-xs" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                </div>
                <select
                  className="rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={productFilter} onChange={e => setProductFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {(() => {
                const filtered = allProducts.filter(p => {
                  const q = productSearch.toLowerCase();
                  const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.seller?.firstName?.toLowerCase().includes(q) || p.seller?.lastName?.toLowerCase().includes(q);
                  const matchFilter =
                    productFilter === "all" ? true :
                    productFilter === "hidden" ? p.isHidden :
                    p.approvalStatus === productFilter;
                  return matchSearch && matchFilter;
                });
                return (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs font-semibold uppercase text-stone-400">
                        <th className="pb-3 pr-3">Product</th>
                        <th className="pb-3 pr-3">Seller</th>
                        <th className="pb-3 pr-3">Category</th>
                        <th className="pb-3 pr-3">Price / Stock</th>
                        <th className="pb-3 pr-3">Status</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map(p => (
                        <tr key={p._id} className={`hover:bg-stone-50 ${p.isHidden ? "opacity-60" : ""}`}>
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              {p.image && <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover shrink-0 bg-stone-100" referrerPolicy="no-referrer" />}
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-900 text-xs truncate max-w-[140px]">{p.name}</p>
                                {p.tag && <span className="text-[10px] text-stone-400">{p.tag}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-xs text-stone-600">
                            {p.seller ? (
                              <div>
                                <p className="font-medium">{p.seller.firstName} {p.seller.lastName}</p>
                                <p className="text-stone-400 text-[10px]">{p.seller.email}</p>
                              </div>
                            ) : <span className="text-stone-400">Admin</span>}
                          </td>
                          <td className="py-3 pr-3 text-xs text-stone-500">{p.category}</td>
                          <td className="py-3 pr-3 text-xs">
                            <p className="font-bold text-stone-900">₹{p.price?.toLocaleString()}</p>
                            <p className="text-stone-400">{p.stock} in stock</p>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex flex-col gap-1">
                              {p.isHidden
                                ? <Badge className="bg-stone-100 text-stone-600 text-[10px] gap-1"><EyeOff className="h-2.5 w-2.5" />Hidden</Badge>
                                : p.approvalStatus === "approved"
                                  ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1"><CheckCircle2 className="h-2.5 w-2.5" />Live</Badge>
                                  : p.approvalStatus === "rejected"
                                    ? <Badge className="bg-red-100 text-red-700 text-[10px]">Rejected</Badge>
                                    : <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1 flex-wrap">
                              <button
                                onClick={() => openEdit(p)}
                                className="flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              {p.isHidden ? (
                                <button
                                  onClick={() => adminHideProduct(p._id, false)}
                                  className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                                >
                                  <Eye className="h-3 w-3" /> Restore
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const reason = prompt("Reason for hiding (will be sent to seller):");
                                    if (reason !== null) adminHideProduct(p._id, true, reason);
                                  }}
                                  className="flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                                >
                                  <EyeOff className="h-3 w-3" /> Hide
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={6} className="py-10 text-center text-stone-400">No products found</td></tr>
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </CardContent>
          </Card>

          {/* ── Inline Edit Modal ── */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditingProduct(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Edit Product</h2>
                    <p className="text-xs text-stone-500 mt-0.5">Seller will be notified of changes</p>
                  </div>
                  <button onClick={() => setEditingProduct(null)} className="rounded-full p-1.5 hover:bg-stone-100"><XCircle className="h-5 w-5 text-stone-400" /></button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 block mb-1">Name</label>
                      <Input value={editForm.name || ""} onChange={e => setEditForm((f: any) => ({...f, name: e.target.value}))} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 block mb-1">Category</label>
                      <select className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        value={editForm.category || ""} onChange={e => setEditForm((f: any) => ({...f, category: e.target.value}))}>
                        {["Seeds","Fertilizers","Tools","Irrigation","Pesticides","Others"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">Description</label>
                    <textarea value={editForm.description || ""} onChange={e => setEditForm((f: any) => ({...f, description: e.target.value}))} rows={3}
                      className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 block mb-1">Price (₹)</label>
                      <Input type="number" value={editForm.price || ""} onChange={e => setEditForm((f: any) => ({...f, price: Number(e.target.value)}))} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 block mb-1">Stock</label>
                      <Input type="number" value={editForm.stock || ""} onChange={e => setEditForm((f: any) => ({...f, stock: Number(e.target.value)}))} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 block mb-1">Tag</label>
                      <Input value={editForm.tag || ""} onChange={e => setEditForm((f: any) => ({...f, tag: e.target.value}))} className="text-sm" placeholder="e.g. Organic" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setEditingProduct(null)} className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50">Cancel</button>
                  <button onClick={saveProductEdit} disabled={savingEdit}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save & Notify Seller
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Orders ── */}
        <TabsContent value="orders">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-semibold uppercase text-stone-400">
                  <th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th><th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3 pr-4">Status</th><th className="pb-3">Update</th>
                </tr></thead>
                <tbody className="divide-y">
                  {orders.map(o => (
                    <tr key={o._id} className="hover:bg-stone-50">
                      <td className="py-3 pr-4">
                        <p className="font-mono font-semibold text-stone-900 text-xs">#{o.orderNumber || String(o._id).slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-stone-500">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-xs">{o.user?.firstName} {o.user?.lastName}</p>
                        <p className="text-xs text-stone-500">{o.user?.email}</p>
                      </td>
                      <td className="py-3 pr-4 font-bold text-stone-900 text-sm">₹{o.total?.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <Badge className={o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-amber-100 text-amber-700 text-xs"}>{o.paymentStatus}</Badge>
                      </td>
                      <td className="py-3 pr-4"><Badge className={`${oColor(o.orderStatus)} text-xs`}>{o.orderStatus}</Badge></td>
                      <td className="py-3">
                        <select className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={o.orderStatus} onChange={e => updateOrder(o._id, e.target.value)}>
                          {["placed","confirmed","processing","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-stone-400">No orders yet</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Scholarship Applications ── */}
        <TabsContent value="scholarships">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>Scholarship Applications</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-semibold uppercase text-stone-400">
                  <th className="pb-3 pr-4">Applicant</th><th className="pb-3 pr-4">Scholarship</th>
                  <th className="pb-3 pr-4">Farmer Verified</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Action</th>
                </tr></thead>
                <tbody className="divide-y">
                  {apps.map(a => (
                    <tr key={a._id} className="hover:bg-stone-50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-xs">{a.user?.firstName} {a.user?.lastName}</p>
                        <p className="text-xs text-stone-500">{a.user?.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-xs leading-tight">{a.scholarship?.title?.slice(0, 35)}…</p>
                        <p className="text-xs text-stone-500">{a.scholarship?.amount}</p>
                      </td>
                      <td className="py-3 pr-4">
                        {a.user?.isVerified
                          ? <Badge className="bg-emerald-100 text-emerald-700 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Yes</Badge>
                          : <Badge className="bg-red-100 text-red-700 gap-1 text-xs"><XCircle className="h-3 w-3" />No</Badge>}
                      </td>
                      <td className="py-3 pr-4"><Badge className={`${aColor(a.status)} text-xs`}>{a.status}</Badge></td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {a.status !== "approved" && <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700" onClick={() => updateApp(a._id, "approved")}>Approve</button>}
                          {a.status !== "rejected" && <button className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => updateApp(a._id, "rejected")}>Reject</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apps.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-stone-400">No applications yet</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-stone-900">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="rounded-full p-1.5 hover:bg-stone-100"><XCircle className="h-5 w-5 text-stone-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Name",       `${selectedUser.firstName} ${selectedUser.lastName}`],
                ["Email",      selectedUser.email],
                ["Phone",      selectedUser.phone || "—"],
                ["Role",       selectedUser.role],
                ["Farmer ID",  selectedUser.farmerId || "—"],
                ["Land Size",  selectedUser.landSize ? `${selectedUser.landSize} acres` : "—"],
                ["Primary Crop", selectedUser.primaryCrop || "—"],
                ["Address",    selectedUser.address || "—"],
                ["District",   selectedUser.district || "—"],
                ["State",      selectedUser.state || "—"],
                ["Verified",   selectedUser.isVerified ? "Yes" : "No"],
                ["Seller Status", selectedUser.sellerStatus || "—"],
                ["Joined",     new Date(selectedUser.createdAt).toLocaleDateString("en-IN")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-stone-50 pb-2">
                  <span className="text-stone-500 font-medium shrink-0">{label}</span>
                  <span className="text-stone-900 text-right">{value}</span>
                </div>
              ))}
            </div>
            <button className="mt-5 w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { deleteUser(selectedUser._id); setSelectedUser(null); }}>
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Route guard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  if (!user) return <div className="container mx-auto px-4 py-20 text-center"><p className="text-stone-600">Please <Link to="/login" className="text-emerald-600 underline font-semibold">login</Link> to view your dashboard.</p></div>;
  return user.role === "admin" ? <AdminDashboard /> : <FarmerDashboard />;
}
