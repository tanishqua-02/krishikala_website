import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package, Loader2, ChevronDown, ChevronUp, Truck, CheckCircle2,
  Clock, XCircle, MapPin, Phone, User, ShoppingBag, IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  placed:     "bg-stone-100 text-stone-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped:    "bg-cyan-100 text-cyan-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  placed:     <Clock className="h-3 w-3" />,
  confirmed:  <CheckCircle2 className="h-3 w-3" />,
  processing: <Package className="h-3 w-3" />,
  shipped:    <Truck className="h-3 w-3" />,
  delivered:  <CheckCircle2 className="h-3 w-3" />,
  cancelled:  <XCircle className="h-3 w-3" />,
};

// Statuses a seller is allowed to set
const SELLER_TRANSITIONS: Record<string, string[]> = {
  placed:     ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

const PAYMENT_COLORS: Record<string, string> = {
  paid:     "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  failed:   "bg-red-100 text-red-700",
  refunded: "bg-stone-100 text-stone-600",
};

const FILTER_OPTIONS = [
  { value: "all",        label: "All Orders" },
  { value: "placed",     label: "New (Placed)" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
];

// ── Order Row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onStatusChange }: { order: any; onStatusChange: (id: string, status: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const transitions = SELLER_TRANSITIONS[order.orderStatus] ?? [];

  const handleStatus = async (newStatus: string) => {
    setUpdating(true);
    await onStatusChange(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      {/* ── Summary row ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Order number + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-stone-900 text-sm">#{order.orderNumber}</span>
            <Badge className={`gap-1 text-xs ${STATUS_COLORS[order.orderStatus]}`}>
              {STATUS_ICONS[order.orderStatus]}
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </Badge>
            <Badge className={`text-xs ${PAYMENT_COLORS[order.paymentStatus]}`}>
              {order.paymentStatus}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Buyer */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 min-w-[140px]">
          <User className="h-3.5 w-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{order.buyer?.firstName} {order.buyer?.lastName}</span>
        </div>

        {/* Items summary */}
        <div className="text-xs text-stone-500 min-w-[120px]">
          {order.sellerItems.length} item{order.sellerItems.length !== 1 ? "s" : ""} ·{" "}
          <span className="font-semibold text-stone-800">₹{order.sellerSubtotal.toLocaleString()}</span>
        </div>

        {/* Expand toggle */}
        <div className="text-stone-400 shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-stone-100 bg-stone-50/50 p-4 space-y-5">

          {/* Items table */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Your Items in This Order</p>
            <div className="space-y-2">
              {order.sellerItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg border border-stone-100 p-3">
                  {item.image && (
                    <img src={item.image} alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0 bg-stone-100"
                      referrerPolicy="no-referrer" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-stone-500">₹{item.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-stone-900 text-sm shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2 pr-1">
              <p className="text-sm font-bold text-stone-900">
                Your subtotal: <span className="text-emerald-700">₹{order.sellerSubtotal.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Buyer + Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-stone-100 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Buyer</p>
              <div className="flex items-center gap-1.5 text-sm text-stone-700">
                <User className="h-3.5 w-3.5 text-stone-400" />
                {order.buyer?.firstName} {order.buyer?.lastName}
              </div>
              {order.buyer?.phone && (
                <div className="flex items-center gap-1.5 text-sm text-stone-700">
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  {order.buyer.phone}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <IndianRupee className="h-3 w-3 text-stone-400" />
                Payment: <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-stone-100 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Shipping Address</p>
              <div className="flex items-start gap-1.5 text-sm text-stone-700">
                <MapPin className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{order.shippingAddress?.fullName}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-xs text-stone-500">{order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              <span className="font-semibold">Buyer note: </span>{order.notes}
            </div>
          )}

          {/* Status control */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide shrink-0">Update Status</p>
            {transitions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {transitions.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    disabled={updating}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50
                      ${s === "cancelled"
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                  >
                    {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : STATUS_ICONS[s]}
                    Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs text-stone-400 italic">
                {order.orderStatus === "delivered" ? "Order completed ✓" : "No further actions available"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders]       = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter]       = useState("all");

  const isSeller = user?.role === "farmer" && (user as any)?.sellerStatus === "approved";

  useEffect(() => {
    if (!isSeller) { setIsLoading(false); return; }
    const params = filter !== "all" ? { status: filter } : undefined;
    api.getSellerOrders(params)
      .then((d: any) => setOrders(d.orders || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, [isSeller, filter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateSellerOrderStatus(orderId, { orderStatus: newStatus });
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, orderStatus: newStatus, deliveredAt: newStatus === "delivered" ? new Date() : o.deliveredAt } : o
      ));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (!user) return null;

  if (!isSeller) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-stone-300 mb-4" />
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Seller Access Required</h2>
        <p className="text-stone-500 mb-6">Only approved sellers can view received orders.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Summary counts
  const counts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});
  const newOrders = (counts["placed"] || 0) + (counts["confirmed"] || 0);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Orders Received</h1>
          <p className="text-stone-500">Manage and fulfil orders for your products</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/seller/products"
            className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
            <Package className="h-4 w-4" /> My Products
          </Link>
          <Link to="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "New",        count: newOrders,              color: "bg-blue-100 text-blue-700" },
          { label: "Processing", count: counts["processing"] || 0, color: "bg-indigo-100 text-indigo-700" },
          { label: "Shipped",    count: counts["shipped"] || 0,    color: "bg-cyan-100 text-cyan-700" },
          { label: "Delivered",  count: counts["delivered"] || 0,  color: "bg-emerald-100 text-emerald-700" },
          { label: "Cancelled",  count: counts["cancelled"] || 0,  color: "bg-red-100 text-red-700" },
        ].map(s => (
          <span key={s.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
            {s.label}: {s.count}
          </span>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <p className="text-sm font-medium text-stone-600 shrink-0">Filter by status:</p>
        <Select value={filter} onValueChange={v => { setFilter(v); setIsLoading(true); }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
          <ShoppingBag className="h-16 w-16 opacity-20 mb-4" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">Orders for your products will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderRow key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
