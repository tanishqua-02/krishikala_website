import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Package, Loader2, CheckCircle2, Clock, XCircle,
  EyeOff, Pencil, Trash2, RefreshCw, X, Image,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const CATEGORIES = ["Seeds","Fertilizers","Tools","Irrigation","Pesticides","Others"];
const UNITS = ["kg","litre","packet","set","unit","quintal"];

function statusBadge(p: any) {
  if (p.isHidden)                    return <Badge className="bg-stone-100 text-stone-600 gap-1 text-xs"><EyeOff className="h-3 w-3" />Hidden</Badge>;
  if (p.approvalStatus === "approved") return <Badge className="bg-emerald-100 text-emerald-700 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Live</Badge>;
  if (p.approvalStatus === "rejected") return <Badge className="bg-red-100 text-red-700 gap-1 text-xs"><XCircle className="h-3 w-3" />Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 gap-1 text-xs"><Clock className="h-3 w-3" />Pending</Badge>;
}

interface ProductForm {
  name: string; description: string; price: string; stock: string;
  category: string; unit: string; image: string; tag: string;
}
const EMPTY: ProductForm = { name:"", description:"", price:"", stock:"", category:"", unit:"kg", image:"", tag:"" };

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [form, setForm]           = useState<ProductForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const isSeller = user?.role === "farmer" && (user as any)?.sellerStatus === "approved";

  useEffect(() => {
    if (isSeller) {
      api.getMyProducts()
        .then((d: any) => setProducts(d.products || []))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [isSeller]);

  if (!user) return null;

  if (!isSeller) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-stone-300 mb-4" />
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Seller Access Required</h2>
        <p className="text-stone-500 mb-6">
          {(user as any).sellerStatus === "pending"
            ? "Your seller account is pending admin verification. You'll be notified once approved."
            : "Register as a farmer to become a seller on KrishiSeva."}
        </p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const openAdd = () => { setEditProduct(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), category: p.category, unit: p.unit || "kg", image: p.image || "", tag: p.tag || "" });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditProduct(null); setForm(EMPTY); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast.error("Please select a category"); return; }
    setSubmitting(true);
    try {
      const body = {
        name: form.name, description: form.description,
        price: Number(form.price), stock: Number(form.stock),
        category: form.category, unit: form.unit,
        image: form.image || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400",
        tag: form.tag || undefined,
      };
      if (editProduct) {
        const d: any = await api.sellerUpdateProduct(editProduct._id, body);
        setProducts(prev => prev.map(p => p._id === editProduct._id ? d.product : p));
        toast.success("Product updated and re-submitted for review.");
      } else {
        const d: any = await api.createProduct(body);
        setProducts(prev => [d.product, ...prev]);
        toast.success("Product submitted for admin review!");
      }
      closeForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from your listings?`)) return;
    try {
      await api.sellerDeleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product removed.");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleReEnable = async (id: string) => {
    try {
      await api.requestReEnable(id);
      toast.success("Re-enable request sent to admin.");
      setProducts(prev => prev.map(p => p._id === id ? { ...p, reEnableRequested: true } : p));
    } catch (err: any) { toast.error(err.message); }
  };

  const pending  = products.filter(p => p.approvalStatus === "pending");
  const approved = products.filter(p => p.approvalStatus === "approved" && !p.isHidden);
  const hidden   = products.filter(p => p.isHidden);
  const rejected = products.filter(p => p.approvalStatus === "rejected");

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">My Products</h1>
          <p className="text-stone-500">Manage your listings on KrishiSeva</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
          <Plus className="h-4 w-4" /> Add New Product
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Live",     count: approved.length, color: "bg-emerald-100 text-emerald-700" },
          { label: "Pending",  count: pending.length,  color: "bg-amber-100 text-amber-700" },
          { label: "Hidden",   count: hidden.length,   color: "bg-stone-100 text-stone-600" },
          { label: "Rejected", count: rejected.length, color: "bg-red-100 text-red-700" },
        ].map(s => (
          <span key={s.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
            {s.label}: {s.count}
          </span>
        ))}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <Card className="border-none shadow-lg mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>{editProduct ? "Edit Product" : "List a New Product"}</CardTitle>
              <CardDescription>
                {editProduct ? "Changes will be re-submitted for admin review." : "Your product will be reviewed by admin before going live."}
              </CardDescription>
            </div>
            <button onClick={closeForm} className="rounded-full p-1.5 hover:bg-stone-100 transition-colors">
              <X className="h-5 w-5 text-stone-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Product Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Organic Wheat Seeds" required />
                </div>
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description *</Label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe your product — quality, usage, benefits..." />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="grid gap-2">
                  <Label>Price (₹) *</Label>
                  <Input type="number" min="1" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required />
                </div>
                <div className="grid gap-2">
                  <Label>Stock *</Label>
                  <Input type="number" min="1" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} required />
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select value={form.unit} onValueChange={v => setForm(f => ({...f, unit: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tag</Label>
                  <Input value={form.tag} onChange={e => setForm(f => ({...f, tag: e.target.value}))} placeholder="e.g. Organic" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2"><Image className="h-4 w-4 text-stone-400" />Image URL</Label>
                <Input type="url" value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} placeholder="https://... (leave blank for default)" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editProduct ? "Update & Resubmit" : "Submit for Review"}
                </button>
                <button type="button" onClick={closeForm}
                  className="rounded-lg border border-stone-200 px-5 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products grid */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Package className="h-16 w-16 opacity-20 mb-4" />
          <p className="text-lg font-medium">No products listed yet</p>
          <p className="text-sm mt-1">Click "Add New Product" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <Card key={p._id} className={`border-none shadow-md overflow-hidden ${p.isHidden ? "opacity-70" : ""}`}>
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 left-2">{statusBadge(p)}</div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-stone-900 leading-tight mb-1">{p.name}</h3>
                <p className="text-xs text-stone-500 mb-2 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-bold text-stone-900">₹{p.price?.toLocaleString()}/{p.unit}</span>
                  <span className="text-stone-500 text-xs">{p.stock} in stock</span>
                </div>

                {/* Feedback from admin */}
                {(p.approvalStatus === "rejected" || p.isHidden) && p.hiddenReason && (
                  <div className={`mb-3 rounded-lg p-2.5 text-xs ${p.isHidden ? "bg-stone-50 text-stone-600 border border-stone-200" : "bg-red-50 text-red-700"}`}>
                    <p className="font-semibold mb-0.5">{p.isHidden ? "Admin feedback:" : "Rejection reason:"}</p>
                    <p>{p.hiddenReason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {/* Edit — only if not hidden */}
                  {!p.isHidden && (
                    <button onClick={() => openEdit(p)}
                      className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                  {/* Re-enable request if hidden */}
                  {p.isHidden && !p.reEnableRequested && (
                    <button onClick={() => handleReEnable(p._id)}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" /> Request Re-enable
                    </button>
                  )}
                  {p.isHidden && p.reEnableRequested && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-stone-50 px-3 py-1.5 text-xs text-stone-500">
                      <Clock className="h-3.5 w-3.5" /> Re-enable requested
                    </span>
                  )}
                  {/* Delete */}
                  <button onClick={() => handleDelete(p._id, p.name)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ml-auto">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
