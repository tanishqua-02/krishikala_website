import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, ShieldCheck, Map, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function LandRecords() {
  const [isLoading, setIsLoading] = useState(false);
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");
  const [surveyNo, setSurveyNo] = useState("");
  const [recordType, setRecordType] = useState("712");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      api.getLandRecordHistory().then((d: any) => setHistory(d.records || [])).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error("Please login to search land records"); return; }
    setIsLoading(true);
    try {
      const data: any = await api.searchLandRecord({ district, taluka, village, surveyNumber: surveyNo, recordType });
      setResult(data.result);
      toast.success("Land record found!");
      api.getLandRecordHistory().then((d: any) => setHistory(d.records || [])).catch(() => {});
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-stone-900">Land Records Online</h1>
          <p className="text-stone-600">Access your 7/12 (Satbara) and Khateutara instantly</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 border border-emerald-100">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium">Official Government Data Integration</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={recordType} onValueChange={setRecordType}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="712" className="text-lg py-3">7/12 Extract</TabsTrigger>
              <TabsTrigger value="khateutara" className="text-lg py-3">Khateutara (8A)</TabsTrigger>
            </TabsList>
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-stone-50 rounded-t-xl border-b">
                <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-emerald-600" />Search Land Records</CardTitle>
                <CardDescription>Enter your land details to fetch the official records.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {!isLoggedIn ? (
                  <div className="text-center py-8">
                    <p className="text-stone-600 mb-4">Please login to search land records.</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" asChild><Link to="/login">Login</Link></Button>
                  </div>
                ) : (
                  <form onSubmit={handleSearch} className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>District</Label>
                        <Select value={district} onValueChange={setDistrict} required>
                          <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                          <SelectContent>
                            {["Pune","Mumbai","Nashik","Nagpur","Aurangabad","Kolhapur"].map(d => <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Taluka</Label>
                        <Select value={taluka} onValueChange={setTaluka} required>
                          <SelectTrigger><SelectValue placeholder="Select Taluka" /></SelectTrigger>
                          <SelectContent>
                            {["Haveli","Mulshi","Maval","Khed","Shirur"].map(t => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Village</Label><Input placeholder="Enter Village Name" value={village} onChange={e => setVillage(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Survey / Gat Number</Label><Input placeholder="e.g. 124/A" value={surveyNo} onChange={e => setSurveyNo(e.target.value)} /></div>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading || !district || !taluka}>
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Search className="mr-2 h-5 w-5" />Search Records</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
            {result && (
              <Card className="mt-8 border-none shadow-md">
                <CardHeader><CardTitle className="text-emerald-700">Record Found</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(result.data).map(([k, v]: any) => (
                      <div key={k}><p className="text-xs font-bold uppercase text-stone-400">{k.replace(/_/g, " ")}</p><p className="font-medium">{v}</p></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </Tabs>
        </div>
        <aside className="flex flex-col gap-6">
          {isLoggedIn && history.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-stone-400" />Recent Searches</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {history.map((h: any) => (
                    <div key={h.id} className="rounded-lg bg-stone-50 p-3 text-sm">
                      <p className="font-bold">{h.record_type === "712" ? "7/12" : "Khateutara"} - {h.survey_no || "N/A"}</p>
                      <p className="text-xs text-stone-500">{h.district}, {h.taluka}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="bg-emerald-50 border-emerald-100">
            <CardHeader><CardTitle className="text-lg text-emerald-900">Why Digital Records?</CardTitle></CardHeader>
            <CardContent className="text-sm text-emerald-800 space-y-3">
              <p>• Faster processing for bank loans</p>
              <p>• Direct verification for scholarships</p>
              <p>• Secure and tamper-proof digital copies</p>
              <p>• Available 24/7 from your home</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
