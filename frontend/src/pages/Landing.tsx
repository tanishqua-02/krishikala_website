import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Leaf, ShoppingBag, GraduationCap, FileText, Landmark,
  ShieldCheck, Truck, Users, TrendingUp, ArrowRight,
  Store, UserCheck, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-emerald-900">KrishiSeva</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 py-24 px-4 text-white">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto relative text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-sm px-4 py-1.5">
              🌾 India's Digital Farming Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Empowering Farmers<br />
              <span className="text-emerald-400">with Technology</span>
            </h1>
            <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Buy quality agri-products, sell your harvest, access land records, apply for scholarships, and discover government schemes — all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register?role=user">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white h-14 px-8 text-base gap-2">
                  <ShoppingBag className="h-5 w-5" /> Join as Buyer
                </Button>
              </Link>
              <Link to="/register?role=farmer">
                <Button size="lg" className="border border-white/50 bg-white/10 !text-white hover:bg-white/20 h-14 px-8 text-base gap-2 cursor-pointer">
                  <Store className="h-5 w-5" /> Join as Farmer/Seller
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-emerald-300/70">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-300 underline underline-offset-2 hover:text-white">Sign in here</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="bg-emerald-600 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: "1M+", label: "Registered Farmers" },
              { value: "₹50Cr+", label: "Products Sold" },
              { value: "500+", label: "Scholarships Awarded" },
              { value: "28", label: "States Covered" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-emerald-100 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is it for ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-stone-900">Built for Everyone in Agriculture</h2>
            <p className="text-stone-500 mt-3 text-lg">Three portals, one platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                color: "bg-blue-100 text-blue-600",
                title: "Buyers / Users",
                desc: "Browse and purchase quality seeds, fertilizers, tools, and irrigation equipment from verified sellers.",
                cta: "Shop Now",
                link: "/register?role=user",
                features: ["Browse 500+ products", "Secure checkout", "Track orders", "Apply for scholarships"],
              },
              {
                icon: Store,
                color: "bg-emerald-100 text-emerald-600",
                title: "Farmers / Sellers",
                desc: "Register as a farmer, get verified by admin, and start selling your products directly to buyers.",
                cta: "Sell on KrishiSeva",
                link: "/register?role=farmer",
                features: ["List your products", "Manage orders", "Track revenue", "Access land records"],
                highlight: true,
              },
              {
                icon: LayoutDashboard,
                color: "bg-purple-100 text-purple-600",
                title: "Administrators",
                desc: "Manage the platform — verify farmers, approve products, oversee orders and scholarship applications.",
                cta: "Admin Login",
                link: "/login?portal=admin",
                features: ["Verify farmers", "Approve products", "Manage orders", "Platform analytics"],
              },
            ].map(card => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-8 flex flex-col gap-5 ${card.highlight ? "bg-emerald-900 text-white shadow-2xl scale-105" : "bg-white shadow-lg"}`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.highlight ? "bg-emerald-700" : card.color}`}>
                  <card.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${card.highlight ? "text-white" : "text-stone-900"}`}>{card.title}</h3>
                  <p className={`text-sm leading-relaxed ${card.highlight ? "text-emerald-200" : "text-stone-500"}`}>{card.desc}</p>
                </div>
                <ul className="space-y-2">
                  {card.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${card.highlight ? "text-emerald-100" : "text-stone-600"}`}>
                      <ShieldCheck className={`h-4 w-4 shrink-0 ${card.highlight ? "text-emerald-400" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={card.link} className="mt-auto">
                  <Button className={`w-full gap-2 ${card.highlight ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-stone-900 hover:bg-stone-800 text-white"}`}>
                    {card.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-stone-900">Everything You Need</h2>
            <p className="text-stone-500 mt-3">A complete ecosystem for Indian agriculture</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag,   color: "bg-emerald-100 text-emerald-600", title: "Agriculture Shop",   desc: "Seeds, fertilizers, tools, irrigation — all quality-verified." },
              { icon: GraduationCap, color: "bg-blue-100 text-blue-600",       title: "Scholarships",       desc: "Find and apply for scholarships for farmer families." },
              { icon: FileText,      color: "bg-amber-100 text-amber-600",     title: "Land Records",       desc: "Access 7/12 and Khateutara records instantly online." },
              { icon: Landmark,      color: "bg-purple-100 text-purple-600",   title: "Sarkari Yojana",     desc: "PM-KISAN, Fasal Bima, MUDRA loans and more." },
              { icon: Store,         color: "bg-rose-100 text-rose-600",       title: "Sell Products",      desc: "Verified farmers can list and sell their produce." },
              { icon: UserCheck,     color: "bg-teal-100 text-teal-600",       title: "Farmer Verification",desc: "Admin-verified farmer profiles build buyer trust." },
              { icon: TrendingUp,    color: "bg-orange-100 text-orange-600",   title: "Sales Analytics",    desc: "Track revenue, orders, and performance over time." },
              { icon: Truck,         color: "bg-indigo-100 text-indigo-600",   title: "Village Delivery",   desc: "Delivery to even the most remote farming villages." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-stone-900 mb-1">{f.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-emerald-900 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Farming?</h2>
          <p className="text-emerald-200 text-lg mb-10">Join over 1 million farmers already using KrishiSeva</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register?role=user">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-stone-100 h-14 px-8 text-base">
                Create Free Account
              </Button>
            </Link>
            <Link to="/register?role=farmer">
              <Button size="lg" className="border border-white/50 bg-white/10 !text-white hover:bg-white/20 h-14 px-8 text-base cursor-pointer">
                Register as Farmer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-white font-bold">KrishiSeva</span>
          </div>
          <p className="text-sm">© 2025 KrishiSeva. Empowering Indian Farmers.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
