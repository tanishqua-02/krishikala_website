import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { items, subtotal, shipping, total, updateItem, removeItem } = useCart();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-stone-300" />
        <h2 className="text-2xl font-bold">Please login to view your cart</h2>
        <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700" asChild><Link to="/login">Login</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-400"><ShoppingBag className="h-10 w-10" /></div>
        <h2 className="text-2xl font-bold text-stone-900">Your cart is empty</h2>
        <p className="mt-2 text-stone-600">Looks like you haven't added any farming supplies yet.</p>
        <Button className="mt-8 bg-emerald-600 hover:bg-emerald-700" asChild><Link to="/shop">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-stone-900">Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <Card key={item.id} className="border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <img src={item.image_url} alt={item.name} className="h-20 w-20 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold text-stone-900">{item.name}</h3>
                  <p className="text-sm text-stone-500">₹{item.price.toLocaleString()} per unit</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></Button>
                  <span className="w-4 text-center font-bold">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}><Plus className="h-3 w-3" /></Button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-stone-600">Subtotal</span><span className="font-bold">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-stone-600">Shipping</span><span className="font-bold">{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-emerald-600">₹{total.toLocaleString()}</span></div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg" asChild>
                <Link to="/checkout">Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </Card>
          <div className="rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
            <p>• Free shipping on orders above ₹2,000</p>
            <p className="mt-1">• 7-day easy return policy</p>
            <p className="mt-1">• Secure payment processing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
