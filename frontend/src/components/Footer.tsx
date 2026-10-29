import { Leaf, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-stone-50 text-stone-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-emerald-900">
                KrishiSeva
              </span>
            </Link>
            <p className="text-sm text-stone-600 leading-relaxed">
              Empowering farmers with technology and essential resources. Your one-stop destination for seeds, tools, and agricultural knowledge.
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 text-stone-400 hover:text-emerald-600 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-stone-400 hover:text-emerald-600 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-stone-400 hover:text-emerald-600 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-stone-600">
              <li><Link to="/shop" className="hover:text-emerald-600 transition-colors">Shop Products</Link></li>
              <li><Link to="/scholarships" className="hover:text-emerald-600 transition-colors">Scholarships</Link></li>
              <li><Link to="/land-records" className="hover:text-emerald-600 transition-colors">Land Records</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-900">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-stone-600">
              <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-600 transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="hover:text-emerald-600 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Contact Us</h3>
            <div className="flex items-start gap-3 text-sm text-stone-600">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>123 Agri Park, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <Phone className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>+91 1800-123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>support@krishiseva.com</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-stone-200 pt-8 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} KrishiSeva. All rights reserved. Designed for the Indian Farmer.</p>
        </div>
      </div>
    </footer>
  );
}
