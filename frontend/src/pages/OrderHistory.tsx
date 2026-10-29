import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package, Loader2, ChevronDown, ChevronUp, Truck, CheckCircle2,
  Clock, XCircle, MapPin, Phone, CreditCard, ShoppingBag, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

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
const PAYMENT_COLORS: Record<string, string> = {
  paid:     "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  failed:   "bg-red-100 text-red-700",
  refunded: "bg-stone-100 text-stone-600",
};

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      {/* Summary */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-stone-900 text-sm">#{order.orderNumber}</span>
            <Badge className={`gap-1 text-xs ${STATUS_COLORS[order.orderStatus] || "bg-stone-100 text-stone-600"}`}>
              {STATUS_ICONS[order.orderStatus]}
              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
            </Badge>
            <Badge className={`text-xs ${PAYMENT_COLORS[order.paymentStatus] || "bg-stone-100"}`}>
              {order.paymentStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-stone-900">₹{order.total?.toLocaleString()}</p>
            <p className="text-xs text-stone-500 capitalize">{order.paymentMethod}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-stone-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-stone-100 bg-stone-50/40 p-4 space-y-5">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Items Ordered</p>
            <div className="space-y-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg border border-stone-100 p-3">
                  {item.image && (
                    <img src={item.image} alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0 bg-stone-100"
                      referrerPolicy="no-referrer" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-stone-500">₹{item.price?.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-stone-900 text-sm shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg border border-stone-100 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? <span className="text-emerald-600 font-medium">FREE</span> : `₹${order.shippingCost}`}</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-1.5">
              <span>Total</span><span className="text-emerald-700">₹{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping address + payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />{order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-stone-100 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Payment</p>
              <div className="flex items-center gap-1.5 text-sm text-stone-700">
                <CreditCard className="h-3.5 w-3.5 text-stone-400" />
                <span className="capitalize">{order.paymentMethod}</span>
                <Badge className={`ml-1 text-xs ${PAYMENT_COLORS[order.paymentStatus]}`}>{order.paymentStatus}</Badge>
              </div>
              {order.deliveredAt && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              <span className="font-semibold">Note: </span>{order.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders]       = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter]       = useState("all");

  useEffect(() => {
    if (!user) return;
    api.getOrders()
      .then((d: any) => setOrders(d.orders || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, [user]);

  const filtered = filter === "all" ? orders : orders.filter(o => o.orderStatus === filter);

  const counts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">My Orders</h1>
          <p className="text-stone-500">Full history of all your purchases</p>
        </div>
        <Link to="/shop"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
          <ShoppingBag className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-stone-100 text-stone-700">
          Total: {orders.length}
        </span>
        {Object.entries(counts).map(([status, count]) => (
          <span key={status} className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status] || "bg-stone-100 text-stone-600"}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
          </span>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <p className="text-sm font-medium text-stone-600 shrink-0">Filter:</p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[
              { value: "all",        label: "All Orders" },
              { value: "placed",     label: "Placed" },
              { value: "confirmed",  label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "shipped",    label: "Shipped" },
              { value: "delivered",  label: "Delivered" },
              { value: "cancelled",  label: "Cancelled" },
            ].map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
          <ShoppingBag className="h-16 w-16 opacity-20 mb-4" />
          <p className="text-lg font-medium">{orders.length === 0 ? "No orders yet" : "No orders match this filter"}</p>
          {orders.length === 0 && (
            <Link to="/shop" className="mt-3 text-sm text-emerald-600 hover:underline">Start shopping →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => <OrderCard key={order._id} order={order} />)}
        </div>
      )}
    </div>
  );
}
