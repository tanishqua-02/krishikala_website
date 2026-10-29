import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star, ShoppingCart, Loader2, ArrowLeft, Truck, ShieldCheck,
  RefreshCw, Plus, Minus, Package, TrendingUp,
} from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  tag: string;
  stock: number;
  unit: string;
}

interface Recommendation {
  _id: string;
  name: string;
  price: number;
  image: string;
  tag: string;
  rating: number;
  count: number;
}

export default function ProductDetail() {
  const { id }                          = useParams<{ id: string }>();
  const navigate                        = useNavigate();
  const [product, setProduct]           = useState<Product | null>(null);
  const [recs, setRecs]                 = useState<Recommendation[]>([]);
  const [qty, setQty]                   = useState(1);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [addingMain, setAddingMain]     = useState(false);
  const [addingRec, setAddingRec]       = useState<string | null>(null);
  const [bundleSelected, setBundleSelected] = useState<Set<string>>(new Set());
  const { addToCart }                   = useCart();

  useEffect(() => {
    if (!id) return;
    setLoadingProduct(true);
    Promise.all([
      api.getProduct(id),
      api.getFrequentlyBought(id),
    ]).then(([pData, rData]: any[]) => {
      setProduct(pData.product);
      const recList: Recommendation[] = rData.recommendations || [];
      setRecs(recList);
      // Pre-select all recs in bundle
      setBundleSelected(new Set(recList.map((r: Recommendation) => r._id)));
    }).catch(() => toast.error("Failed to load product"))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Product not found. <Link to="/shop" className="text-emerald-600 underline">Go back to shop</Link></p>
      </div>
    );
  }

  const bundleTotal = product.price * qty
    + recs.filter(r => bundleSelected.has(r._id)).reduce((s, r) => s + r.price, 0);

  const handleAddMain = async () => {
    setAddingMain(true);
    for (let i = 0; i < qty; i++) await addToCart(product._id, 1);
    setAddingMain(false);
  };

  const handleAddRec = async (recId: string) => {
    setAddingRec(recId);
    await addToCart(recId);
    setAddingRec(null);
  };

  const handleAddBundle = async () => {
    setAddingMain(true);
    await addToCart(product._id, qty);
    for (const recId of bundleSelected) await addToCart(recId, 1);
    toast.success("Bundle added to cart! 🛒");
    setAddingMain(false);
  };

  const toggleBundle = (recId: string) => {
    setBundleSelected(prev => {
      const next = new Set(prev);
      if (next.has(recId)) next.delete(recId); else next.add(recId);
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 pb-20">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          {product.tag && (
            <Badge className="absolute left-4 top-4 bg-white/90 text-stone-900">{product.tag}</Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-1">{product.category}</p>
            <h1 className="text-3xl font-bold text-stone-900 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-stone-700">{product.rating}</span>
              <span className="text-sm text-stone-400">({product.reviewCount} reviews)</span>
            </div>
          </div>

          <div>
            <span className="text-4xl font-extrabold text-stone-900">₹{product.price.toLocaleString()}</span>
            <span className="text-stone-500 ml-2 text-sm">/ {product.unit}</span>
          </div>

          <p className="text-stone-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-emerald-600" />
            {product.stock > 0
              ? <span className="text-emerald-700 font-medium">{product.stock} units in stock</span>
              : <span className="text-red-600 font-medium">Out of stock</span>
            }
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-stone-700">Quantity:</span>
              <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
                <button
                  className="px-3 py-2 hover:bg-stone-100 transition-colors disabled:opacity-40"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-bold text-stone-900 min-w-[3rem] text-center">{qty}</span>
                <button
                  className="px-3 py-2 hover:bg-stone-100 transition-colors disabled:opacity-40"
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <Button
            className="h-13 text-base py-3 bg-emerald-600 hover:bg-emerald-700"
            disabled={product.stock === 0 || addingMain}
            onClick={handleAddMain}
          >
            {addingMain
              ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              : <ShoppingCart className="mr-2 h-5 w-5" />
            }
            {product.stock === 0 ? "Out of Stock" : `Add ${qty > 1 ? `${qty} × ` : ""}to Cart`}
          </Button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck,       label: "Free delivery\nover ₹2,000" },
              { icon: ShieldCheck, label: "Quality\ncertified" },
              { icon: RefreshCw,   label: "7-day\nreturns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-stone-50 p-3 text-center">
                <Icon className="h-5 w-5 text-emerald-600" />
                <p className="text-[11px] text-stone-600 whitespace-pre-line leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Frequently Bought Together ─────────────────────────────────────── */}
      {recs.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-stone-900">Frequently Bought Together</h2>
          </div>

          {/* Bundle visualizer */}
          <Card className="border-2 border-emerald-100 shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Main product thumbnail */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-xl overflow-hidden bg-stone-100 border-2 border-emerald-400">
                    <img src={product.image} alt={product.name}
                      className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">✓</div>
                </div>

                {recs.map((rec, i) => (
                  <div key={rec._id} className="flex items-center gap-4">
                    <span className="text-2xl font-light text-stone-400">+</span>
                    <div className="relative">
                      <button
                        onClick={() => toggleBundle(rec._id)}
                        className={`h-24 w-24 rounded-xl overflow-hidden border-2 transition-all
                          ${bundleSelected.has(rec._id)
                            ? "border-emerald-400 opacity-100"
                            : "border-stone-200 opacity-50"}`}
                      >
                        <img src={rec.image} alt={rec.name}
                          className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                      <div className={`absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors
                        ${bundleSelected.has(rec._id) ? "bg-emerald-600 text-white" : "bg-stone-300 text-stone-500"}`}>
                        {bundleSelected.has(rec._id) ? "✓" : "○"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              {/* Individual rec cards */}
              <div className="space-y-3 mb-5">
                {recs.map(rec => (
                  <div key={rec._id}
                    className={`flex items-center gap-4 rounded-xl p-3 transition-colors cursor-pointer
                      ${bundleSelected.has(rec._id) ? "bg-emerald-50" : "bg-stone-50 opacity-60"}`}
                    onClick={() => toggleBundle(rec._id)}
                  >
                    <input
                      type="checkbox"
                      checked={bundleSelected.has(rec._id)}
                      onChange={() => toggleBundle(rec._id)}
                      onClick={e => e.stopPropagation()}
                      className="h-4 w-4 accent-emerald-600 cursor-pointer"
                    />
                    <img src={rec.image} alt={rec.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{rec.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-stone-500">{rec.rating}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-stone-900">₹{rec.price.toLocaleString()}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 h-6 text-[10px] px-2"
                        disabled={addingRec === rec._id}
                        onClick={e => { e.stopPropagation(); handleAddRec(rec._id); }}
                      >
                        {addingRec === rec._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add solo"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bundle total + add button */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-900 text-white px-5 py-4">
                <div>
                  <p className="text-xs text-emerald-200">Bundle Total ({1 + bundleSelected.size} items)</p>
                  <p className="text-2xl font-extrabold">₹{bundleTotal.toLocaleString()}</p>
                </div>
                <Button
                  className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
                  disabled={addingMain}
                  onClick={handleAddBundle}
                >
                  {addingMain ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                  Add Bundle to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
