import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Loader2, Info, ShoppingBag, Store, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

type Role = "user" | "farmer";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole]         = useState<Role>((searchParams.get("role") as Role) || "user");
  const [isLoading, setIsLoading] = useState(false);
  const [primaryCrop, setPrimaryCrop] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsLoading(true);
    try {
      await register({
        firstName:   fd.get("firstName"),
        lastName:    fd.get("lastName"),
        email:       fd.get("email"),
        phone:       fd.get("phone"),
        password:    fd.get("password"),
        role,
        ...(role === "farmer" && {
          farmerId:    fd.get("farmerId") || undefined,
          landSize:    fd.get("landSize") ? Number(fd.get("landSize")) : undefined,
          primaryCrop: primaryCrop || undefined,
        }),
      });
      toast.success("Account created! Welcome to KrishiSeva.");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="w-full max-w-[600px] space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">Join KrishiSeva</h1>
          <p className="text-stone-500 mt-1">Create your account to get started</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: "user",   icon: ShoppingBag, label: "Buyer / User",    desc: "Shop for agri-products" },
            { key: "farmer", icon: Store,        label: "Farmer / Seller", desc: "Sell products & access services" },
          ] as const).map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all
                ${role === r.key ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}
            >
              <r.icon className="h-6 w-6" />
              <span>{r.label}</span>
              <span className={`text-xs font-normal ${role === r.key ? "text-emerald-600" : "text-stone-400"}`}>{r.desc}</span>
            </button>
          ))}
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>{role === "farmer" ? "Farmer Registration" : "User Registration"}</CardTitle>
            <CardDescription>
              {role === "farmer"
                ? "Provide your farming details. Admin will verify your account before you can sell."
                : "Create a buyer account to start shopping."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label>First Name</Label><Input name="firstName" placeholder="Rajesh" required /></div>
                <div className="grid gap-2"><Label>Last Name</Label><Input name="lastName" placeholder="Kumar" required /></div>
              </div>
              <div className="grid gap-2"><Label>Email Address</Label><Input name="email" type="email" placeholder="name@example.com" required /></div>
              <div className="grid gap-2"><Label>Phone Number</Label><Input name="phone" type="tel" placeholder="+91 98765 43210" /></div>

              {role === "farmer" && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2"><Label>Farmer ID (Optional)</Label><Input name="farmerId" placeholder="e.g. MH-123456" /></div>
                    <div className="grid gap-2"><Label>Land Size (Acres)</Label><Input name="landSize" type="number" step="0.1" placeholder="e.g. 5.5" /></div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Primary Crop</Label>
                    <Select onValueChange={setPrimaryCrop}>
                      <SelectTrigger><SelectValue placeholder="Select Primary Crop" /></SelectTrigger>
                      <SelectContent>
                        {["Wheat","Rice","Cotton","Sugarcane","Vegetables","Maize","Soybean","Onion"].map(c => (
                          <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid gap-2"><Label>Password</Label><Input name="password" type="password" required minLength={6} /></div>

              {role === "farmer" && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-100">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Farmer accounts require admin verification before you can list products. You can still shop and access all other features immediately.</p>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>By registering, you agree to our terms and conditions.</p>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
