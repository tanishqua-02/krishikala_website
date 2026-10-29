import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Truck, ShieldCheck, CheckCircle2, Loader2,
  Banknote, ArrowRight, Lock, Package, QrCode, Building2, X, AlertCircle
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { loadStripe, Stripe, StripeCardElement } from "@stripe/stripe-js";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// ── Stripe singleton ──────────────────────────────────────────────────────────
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

interface ShippingForm {
  fullName: string; phone: string; address: string;
  city: string; state: string; pincode: string;
}
const EMPTY_FORM: ShippingForm = {
  fullName: "", phone: "", address: "", city: "", state: "Maharashtra", pincode: "",
};

// ── Sandbox Mock Modal ────────────────────────────────────────────────────────
interface MockModalProps {
  amount: number;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
}

function SandboxModal({ amount, onSuccess, onFailure, onCancel }: MockModalProps) {
  const [tab, setTab] = useState<"card" | "upi" | "netbanking">("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [simulating, setSimulating] = useState<"success" | "failure" | null>(null);

  const simulate = async (type: "success" | "failure") => {
    setSimulating(type);
    await new Promise(r => setTimeout(r, 1400));
    setSimulating(null);
    if (type === "success") onSuccess();
    else onFailure();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-indigo-950 text-white p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500 text-white tracking-wide uppercase">Sandbox</span>
                <span className="text-[10px] text-indigo-300 font-mono tracking-widest uppercase">Test Transaction</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mt-1">🌾 KrishiSeva Pay</h3>
            </div>
            <button onClick={onCancel} disabled={!!simulating} className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex justify-between items-baseline border-t border-white/10 pt-3">
            <span className="text-xs text-stone-300">Amount to pay</span>
            <span className="text-2xl font-black text-indigo-300">₹{amount.toLocaleString()}</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b text-xs font-bold text-stone-500 bg-stone-50">
          {(["card", "upi", "netbanking"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-center border-b-2 transition-all capitalize ${tab === t ? "border-indigo-600 text-indigo-700 bg-white" : "border-transparent hover:text-stone-700"}`}>
              {t === "netbanking" ? "Net Banking" : t === "upi" ? "UPI / QR" : "Card"}
            </button>
          ))}
        </div>
        {/* Tab body */}
        <div className="flex-1 overflow-y-auto max-h-[280px]">
          {tab === "card" && (
            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Card Number</Label>
                <div className="relative">
                  <Input value={card.number} onChange={e => setCard(p => ({ ...p, number: e.target.value }))}
                    placeholder="4242 4242 4242 4242" maxLength={19} className="rounded-xl pr-10 border-stone-200" />
                  <CreditCard className="absolute right-3 top-3 h-4 w-4 text-stone-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Expiry (MM/YY)</Label>
                  <Input value={card.expiry} onChange={e => setCard(p => ({ ...p, expiry: e.target.value }))}
                    placeholder="12/28" maxLength={5} className="rounded-xl border-stone-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">CVV</Label>
                  <Input value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv: e.target.value }))}
                    placeholder="123" type="password" maxLength={3} className="rounded-xl border-stone-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cardholder Name</Label>
                <Input value={card.name} onChange={e => setCard(p => ({ ...p, name: e.target.value }))}
                  placeholder="Rajesh Kumar" className="rounded-xl border-stone-200" />
              </div>
            </div>
          )}
          {tab === "upi" && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center bg-stone-50 rounded-xl p-4 border border-dashed border-stone-200">
                <div className="bg-white p-3 rounded-lg shadow-sm border"><QrCode className="h-28 w-28 text-stone-800" /></div>
                <p className="text-[10px] text-stone-500 mt-2 font-semibold">Scan QR code using any UPI App</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Or Pay via UPI ID</Label>
                <Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="farmer@okaxis" className="rounded-xl border-stone-200" />
              </div>
            </div>
          )}
          {tab === "netbanking" && (
            <div className="p-5 space-y-3">
              <span className="text-xs font-semibold text-stone-700 block">Select Popular Bank</span>
              <div className="grid grid-cols-2 gap-2">
                {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB Bank", "Kotak Bank"].map(b => (
                  <button key={b} onClick={() => setBank(b)}
                    className={`flex items-center gap-2 p-3 text-xs border rounded-xl transition-all text-left font-medium
                      ${bank === b ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-bold" : "border-stone-200 hover:bg-stone-50 text-stone-700"}`}>
                    <Building2 className="h-4 w-4 text-stone-400 shrink-0" />{b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="p-4 border-t border-stone-100 flex flex-col gap-2 bg-stone-50/50">
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={() => simulate("failure")} disabled={!!simulating}
              className="flex-1 border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl font-bold h-11">
              {simulating === "failure" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Declining…</> : "Simulate Decline"}
            </Button>
            <Button onClick={() => simulate("success")} disabled={!!simulating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11">
              {simulating === "success" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : "Simulate Success"}
            </Button>
          </div>
          <p className="text-[10px] text-center text-stone-400">Sandbox mode — no real money is charged.</p>
        </div>
        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t flex items-center justify-between text-[10px] text-stone-400">
          <div className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /><span>Secured Sandbox Environment</span></div>
          <span>Powered by KrishiPay</span>
        </div>
      </div>
    </div>
  );
}

// ── Real Stripe Card Form ─────────────────────────────────────────────────────
interface StripeCardFormProps {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

function StripeCardForm({ clientSecret, publishableKey, amount, onSuccess, onCancel }: StripeCardFormProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardElementRef = useRef<StripeCardElement | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStripe(publishableKey).then(stripe => {
      if (!stripe || !mounted || !cardRef.current) return;
      stripeRef.current = stripe;
      const elements = stripe.elements();
      const card = elements.create("card", {
        style: {
          base: { fontSize: "16px", color: "#1c1917", fontFamily: "inherit", "::placeholder": { color: "#a8a29e" } },
          invalid: { color: "#e11d48" },
        },
        hidePostalCode: true,
      });
      card.mount(cardRef.current);
      card.on("change", e => setCardError(e.error?.message || ""));
      card.on("ready", () => setCardReady(true));
      cardElementRef.current = card;
    });
    return () => { mounted = false; cardElementRef.current?.destroy(); };
  }, [publishableKey]);

  const handlePay = async () => {
    if (!stripeRef.current || !cardElementRef.current) return;
    setIsProcessing(true);
    setCardError("");
    const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElementRef.current },
    });
    if (error) {
      setCardError(error.message || "Payment failed.");
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setCardError("Payment not completed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden">
        <div className="bg-gradient-to-r from-stone-900 to-indigo-950 text-white p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">🌾 KrishiSeva Pay</h3>
              <p className="text-xs text-indigo-300 mt-0.5">Secured by Stripe</p>
            </div>
            <button onClick={onCancel} disabled={isProcessing} className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex justify-between items-baseline border-t border-white/10 pt-3">
            <span className="text-xs text-stone-300">Amount to pay</span>
            <span className="text-2xl font-black text-indigo-300">₹{amount.toLocaleString()}</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-stone-700 mb-2 block">Card Details</Label>
            <div ref={cardRef} className={`border rounded-xl px-4 py-3.5 transition-colors ${cardError ? "border-rose-400 bg-rose-50" : "border-stone-200 bg-white"} ${!cardReady ? "opacity-50" : ""}`} />
            {cardError && <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{cardError}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1 rounded-xl h-11">Cancel</Button>
            <Button onClick={handlePay} disabled={isProcessing || !cardReady}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11">
              {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : <><Lock className="mr-2 h-4 w-4" />Pay ₹{amount.toLocaleString()}</>}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>256-bit SSL · Powered by Stripe · PCI DSS compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Checkout Component ───────────────────────────────────────────────────
export default function Checkout() {
  const [step, setStep]                   = useState<"shipping" | "payment" | "success">("shipping");
  const [form, setForm]                   = useState<ShippingForm>(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isProcessing, setIsProcessing]   = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState("");

  // Stripe state
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeData, setStripeData] = useState<{
    clientSecret: string; publishableKey: string; orderDbId: string; amount: number; isMock: boolean;
  } | null>(null);

  const navigate    = useNavigate();
  const { subtotal, shipping, total, refreshCart, items, itemCount } = useCart();
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        phone:    user.phone || "",
      }));
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Lock className="mx-auto h-12 w-12 text-stone-300 mb-4" />
        <p className="text-lg text-stone-600">Please <Link to="/login" className="text-emerald-600 underline font-semibold">sign in</Link> to continue checkout.</p>
      </div>
    );
  }
  if (itemCount === 0 && step !== "success") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="mx-auto h-12 w-12 text-stone-300 mb-4" />
        <p className="text-lg text-stone-600">Your cart is empty. <Link to="/shop" className="text-emerald-600 underline font-semibold">Continue shopping</Link></p>
      </div>
    );
  }

  const updateField = (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleShippingContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Stripe success handler (real + mock) ─────────────────────────────────
  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!stripeData) return;
    try {
      const verified: any = await api.confirmStripePayment({
        paymentIntentId,
        orderDbId: stripeData.orderDbId,
      });
      setCompletedOrderId(verified.order.orderNumber || verified.order._id);
      await refreshCart();
      setStep("success");
      setShowStripeModal(false);
      toast.success("Payment successful! 🌾");
    } catch (err: any) {
      toast.error(err.message || "Payment confirmation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeCancel = () => {
    setShowStripeModal(false);
    setIsProcessing(false);
    toast.error("Payment cancelled.");
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const shippingAddress = {
        fullName: form.fullName, phone: form.phone, address: form.address,
        city: form.city, state: form.state, pincode: form.pincode,
      };

      if (paymentMethod === "cod") {
        const data: any = await api.createOrder({ shippingAddress, paymentMethod: "cod" });
        setCompletedOrderId(data.order.orderNumber || data.order._id);
        await refreshCart();
        setStep("success");
        setIsProcessing(false);
      } else {
        // Stripe
        const data: any = await api.createPaymentIntent({ shippingAddress });
        setStripeData({
          clientSecret:   data.clientSecret,
          publishableKey: data.publishableKey,
          orderDbId:      data.orderDbId,
          amount:         Math.round(data.amount / 100),
          isMock:         data.isMock,
        });
        setShowStripeModal(true);
        // Don't reset isProcessing — modal is now open
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          </div>
          <span className="absolute -right-2 -top-2 text-3xl">🌾</span>
        </div>
        <h1 className="text-4xl font-bold text-stone-900">Order Placed!</h1>
        {completedOrderId && (
          <p className="mt-3 text-base font-mono text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
            Order #{completedOrderId}
          </p>
        )}
        <p className="mt-4 max-w-md text-lg text-stone-600 leading-relaxed">
          Thank you for shopping with KrishiSeva. Your farming supplies will be delivered within 3–5 business days.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <Truck className="h-4 w-4 text-emerald-600" />
          Free delivery on orders above ₹2,000
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8" onClick={() => navigate("/dashboard")}>
            View My Orders
          </Button>
          <Button variant="outline" className="h-12 px-8" onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // ── Progress indicator ────────────────────────────────────────────────────
  const StepBadge = ({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) => (
    <div className="flex items-center gap-2">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors
        ${done ? "bg-emerald-600 text-white" : active ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-500"}`}>
        {done ? "✓" : n}
      </div>
      <span className={`text-sm font-medium hidden sm:inline ${active || done ? "text-stone-900" : "text-stone-400"}`}>{label}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 pb-20">
      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-3">
        <StepBadge n={1} label="Shipping" active={step === "shipping"} done={step === "payment"} />
        <div className="flex-1 h-px bg-stone-200 mx-1" />
        <StepBadge n={2} label="Payment" active={step === "payment"} done={false} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Left column: form ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping step */}
          {step === "shipping" && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" /> Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form id="shipping-form" onSubmit={handleShippingContinue} className="grid gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={form.fullName} onChange={updateField("fullName")} placeholder="Rajesh Kumar" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={form.phone} onChange={updateField("phone")} placeholder="+91 98765 43210" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Village / Street Address</Label>
                    <Input id="address" value={form.address} onChange={updateField("address")} placeholder="Village name, street, landmark" required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City / Town</Label>
                      <Input id="city" value={form.city} onChange={updateField("city")} placeholder="Pune" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={form.state} onChange={updateField("state")} placeholder="Maharashtra" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" value={form.pincode} onChange={updateField("pincode")} placeholder="411027" maxLength={6} required />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" form="shipping-form" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base">
                  Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Payment step */}
          {step === "payment" && (
            <>
              {/* Shipping summary */}
              <Card className="border-none shadow-sm bg-stone-50">
                <CardContent className="flex items-start justify-between p-4">
                  <div className="text-sm">
                    <p className="font-semibold text-stone-900">{form.fullName} · {form.phone}</p>
                    <p className="text-stone-600">{form.address}, {form.city}, {form.state} — {form.pincode}</p>
                  </div>
                  <button onClick={() => setStep("shipping")} className="text-xs text-emerald-600 hover:underline font-medium shrink-0 ml-4">Edit</button>
                </CardContent>
              </Card>

              {/* Payment method selector */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" /> Choose Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
                    {[
                      {
                        value: "stripe",
                        icon: <CreditCard className="h-5 w-5 text-indigo-600" />,
                        label: "Pay by Card / UPI",
                        desc: "Visa, Mastercard, RuPay, UPI — secured by Stripe",
                        badge: "Most Popular",
                        badgeColor: "bg-indigo-100 text-indigo-700",
                      },
                      {
                        value: "cod",
                        icon: <Banknote className="h-5 w-5 text-amber-600" />,
                        label: "Cash on Delivery",
                        desc: "Pay in cash when your order arrives at your door",
                        badge: null,
                        badgeColor: "",
                      },
                    ].map(opt => (
                      <label key={opt.value} htmlFor={opt.value}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all
                          ${paymentMethod === opt.value ? "border-emerald-500 bg-emerald-50" : "border-stone-200 hover:border-stone-300 bg-white"}`}>
                        <RadioGroupItem value={opt.value} id={opt.value} className="shrink-0" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 shrink-0">{opt.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{opt.label}</span>
                            {opt.badge && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${opt.badgeColor}`}>{opt.badge}</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {paymentMethod === "stripe" && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-stone-500">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      Secured by Stripe · Supports UPI · Cards (Visa, Mastercard, RuPay) · Net Banking
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-13 text-base py-3"
                    onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing…</>
                    ) : paymentMethod === "cod" ? (
                      <><Package className="mr-2 h-5 w-5" />Place Order (Pay on Delivery)</>
                    ) : (
                      <><Lock className="mr-2 h-5 w-5" />Pay ₹{total.toLocaleString()} Securely</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>

        {/* ── Right column: order summary ───────────────────────────────── */}
        <div className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                      <img src={(item as any).image_url || (item as any).image} alt={item.name}
                        className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                      <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Delivery</span>
                  <span className={`font-medium ${shipping === 0 ? "text-emerald-600" : ""}`}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-700">₹{total.toLocaleString()}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Add ₹{(2000 - subtotal).toLocaleString()} more for free delivery
                </p>
              )}
            </CardContent>
          </Card>
          <div className="rounded-xl bg-stone-50 border border-stone-100 p-4 space-y-2 text-xs text-stone-500">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><span>256-bit SSL encryption</span></div>
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /><span>3–5 day delivery across India</span></div>
            <div className="flex items-center gap-2"><Package className="h-4 w-4 text-emerald-600" /><span>7-day easy returns on tools</span></div>
          </div>
        </div>
      </div>

      {/* ── Payment Modals ────────────────────────────────────────────────── */}
      {showStripeModal && stripeData && (
        stripeData.isMock ? (
          <SandboxModal
            amount={stripeData.amount}
            onSuccess={() => handleStripeSuccess(`pi_dev_${Math.random().toString(36).substring(2, 10)}`)}
            onFailure={() => { toast.error("Sandbox simulated transaction declined. Try again."); }}
            onCancel={handleStripeCancel}
          />
        ) : (
          <StripeCardForm
            clientSecret={stripeData.clientSecret}
            publishableKey={stripeData.publishableKey}
            amount={stripeData.amount}
            onSuccess={handleStripeSuccess}
            onCancel={handleStripeCancel}
          />
        )
      )}
    </div>
  );
}
