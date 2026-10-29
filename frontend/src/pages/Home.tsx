import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Sprout, ShieldCheck, Truck, GraduationCap,
  FileText, ShoppingBag, Star, ChevronLeft, ChevronRight,
  ShoppingCart, TrendingUp, Loader2, Landmark,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  tag: string;
  stock: number;
  trendingScore?: number;
}

// ── Trending Carousel ──────────────────────────────────────────────────────────
function TrendingCarousel() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId]   = useState<string | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const trackRef                  = useRef<HTMLDivElement>(null);
  const { addToCart }             = useCart();

  useEffect(() => {
    api.getTrending()
      .then((d: any) => setProducts(d.products))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    setTimeout(() => setScrollPos(el.scrollLeft), 350);
  };

  const handleAdd = async (product: Product) => {
    setAddingId(product._id);
    await addToCart(product._id);
    setAddingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-56 h-72 rounded-2xl bg-stone-100 animate-pulse" />
        ))}
      </div>
    );
  }
  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-stone-100 hover:bg-stone-50 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-stone-700" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-stone-100 hover:bg-stone-50 transition-colors"
      >
        <ChevronRight className="h-5 w-5 text-stone-700" />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={e => setScrollPos((e.target as HTMLDivElement).scrollLeft)}
      >
        {products.map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group flex-shrink-0 w-56"
          >
            <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <Badge className="absolute left-2 top-2 bg-white/90 text-stone-900 text-[10px] hover:bg-white">
                  {product.tag || product.category}
                </Badge>
                {product.trendingScore && (
                  <div className="absolute right-2 top-2 flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5" /> Hot
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-emerald-600 font-medium mb-0.5">{product.category}</p>
                <h3 className="text-sm font-bold text-stone-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-stone-700">{product.rating}</span>
                  <span className="text-xs text-stone-400">({product.reviewCount})</span>
                </div>
                <p className="text-base font-bold text-stone-900 mt-1">₹{product.price.toLocaleString()}</p>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                  disabled={product.stock === 0 || addingId === product._id}
                  onClick={() => handleAdd(product)}
                >
                  {addingId === product._id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <><ShoppingCart className="mr-1.5 h-3 w-3" />Add to Cart</>
                  }
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const features = [
    {
      title: "Quality Seeds & Tools",
      description: "Get the best quality seeds and modern farming tools delivered to your doorstep.",
      icon: Sprout,
      color: "bg-emerald-100 text-emerald-600",
      link: "/shop",
    },
    {
      title: "Scholarships",
      description: "Explore and apply for government and private scholarships for farmer children.",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-600",
      link: "/scholarships",
    },
    {
      title: "Land Records",
      description: "Easily access your 7/12 and Khateutara land records online without any hassle.",
      icon: FileText,
      color: "bg-amber-100 text-amber-600",
      link: "/land-records",
    },
    {
      title: "Sarkari Yojana",
      description: "Discover PM-KISAN, Fasal Bima Yojana, Mudra Loans and all central government schemes.",
      icon: Landmark,
      color: "bg-purple-100 text-purple-600",
      link: "/sarkari-yojana",
    },
  ];

  const categories = [
    { name: "Seeds",       image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400" },
    { name: "Fertilizers", image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400" },
    { name: "Tools",       image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400" },
    { name: "Irrigation",  image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[600px] w-full overflow-hidden bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"
          alt="Farmer in field"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="container relative mx-auto flex h-full flex-col justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">Trusted by 1M+ Farmers</Badge>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              Modern Solutions for{" "}
              <span className="text-emerald-400">Traditional Farming</span>
            </h1>
            <p className="mb-8 text-lg text-stone-200 leading-relaxed">
              KrishiSeva brings technology to your doorstep. Buy seeds, access land records, find scholarships, and discover government schemes — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link to="/shop">Start Shopping <ShoppingBag className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" className="border border-white/50 bg-white/10 !text-white hover:bg-white/20 cursor-pointer" asChild>
                <Link to="/sarkari-yojana">Sarkari Yojana</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trending Products Carousel ─────────────────────────────────── */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl font-bold text-stone-900">Trending This Week</h2>
            </div>
            <p className="text-stone-500 text-sm">Most popular products among farmers like you</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/shop">View All <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
        <TrendingCarousel />
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow group">
                <CardHeader>
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <p className="text-sm text-stone-500 leading-relaxed">{feature.description}</p>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="p-0 text-emerald-600 hover:text-emerald-700" asChild>
                    <Link to={feature.link}>Learn more <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Shop by Category ──────────────────────────────────────────── */}
      <section className="bg-stone-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-stone-900">Shop by Category</h2>
              <p className="text-stone-500">Everything you need for a successful harvest</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/shop?category=${cat.name}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-200"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-emerald-900 px-8 py-12 text-white md:px-16 md:py-20 lg:flex lg:items-center lg:justify-between">
          <div className="lg:max-w-xl">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Why Indian Farmers Trust KrishiSeva?</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold">Verified Products</h4>
                  <p className="text-sm text-emerald-100/80">Quality tested and government certified.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold">Village Delivery</h4>
                  <p className="text-sm text-emerald-100/80">We deliver to even the most remote villages.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 lg:mt-0">
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-stone-100 w-full sm:w-auto" asChild>
              <Link to="/register">Join Our Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
