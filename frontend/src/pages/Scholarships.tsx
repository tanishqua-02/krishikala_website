import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GraduationCap, Calendar, ArrowRight, CheckCircle2, Loader2,
  Search, ExternalLink, FileText, IndianRupee, X, SortAsc,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [filtered, setFiltered]         = useState<any[]>([]);
  const [applying, setApplying]         = useState<string | null>(null);
  const [applied, setApplied]           = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("deadline");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected]         = useState<any | null>(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    api.getScholarships()
      .then((d: any) => { setScholarships(d.scholarships); setFiltered(d.scholarships); })
      .finally(() => setIsLoading(false));
    if (isLoggedIn) {
      api.getMyApplications().then((d: any) => {
        setApplied(new Set(d.applications.map((a: any) => a.scholarship?._id || a.scholarship)));
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  // Filter + sort
  useEffect(() => {
    let list = [...scholarships];
    if (search) list = list.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.eligibility.toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter !== "All") list = list.filter(s => s.category === categoryFilter);
    if (sortBy === "deadline") list.sort((a, b) => new Date(a.deadlineDate || 0).getTime() - new Date(b.deadlineDate || 0).getTime());
    else if (sortBy === "amount") list.sort((a, b) => {
      const getNum = (s: string) => parseInt(s.replace(/[^0-9]/g, "")) || 0;
      return getNum(b.amount) - getNum(a.amount);
    });
    else if (sortBy === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    setFiltered(list);
  }, [search, sortBy, categoryFilter, scholarships]);

  const categories = ["All", ...Array.from(new Set(scholarships.map(s => s.category)))];

  const handleApply = async (id: string) => {
    if (!isLoggedIn) { toast.error("Please login to apply"); return; }
    setApplying(id);
    try {
      await api.applyScholarship(id);
      setApplied(prev => new Set([...prev, id]));
      toast.success("Application submitted!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-600 hover:bg-blue-100">Educational Support</Badge>
        <h1 className="text-4xl font-bold text-stone-900 md:text-5xl">Scholarships for Farmers</h1>
        <p className="mx-auto mt-3 max-w-2xl text-stone-500">Find and apply for scholarships. Click any card to see full details and eligibility.</p>
      </div>

      {/* Search + Filter + Sort bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input placeholder="Search scholarships, providers, eligibility…" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SortAsc className="mr-2 h-4 w-4 text-stone-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Sort: Deadline</SelectItem>
            <SelectItem value="amount">Sort: Amount</SelectItem>
            <SelectItem value="title">Sort: Title A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cards */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <Search className="h-12 w-12 opacity-20 mb-3" />
                <p>No scholarships match your search.</p>
              </div>
            ) : filtered.map((s, i) => {
              const id = s._id || s.id;
              const isApplied = applied.has(id);
              return (
                <motion.div key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card
                    className={`overflow-hidden border-l-4 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      ["Government Scheme","State Scheme"].includes(s.category) ? "border-l-emerald-600" :
                      s.category === "Government Portal" ? "border-l-teal-600" :
                      "border-l-blue-600"
                    }`}
                    onClick={() => setSelected(s)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">{s.category}</Badge>
                        <div className="flex items-center gap-1.5 text-sm text-stone-500">
                          <Calendar className="h-3.5 w-3.5" />Deadline: {s.deadline}
                        </div>
                      </div>
                      <CardTitle className="mt-2 text-xl hover:text-blue-700 transition-colors">{s.title}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{s.provider}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid gap-3 md:grid-cols-2 mb-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Amount</p>
                          <p className="font-bold text-stone-900 flex items-center gap-1"><IndianRupee className="h-4 w-4 text-emerald-600" />{s.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Eligibility</p>
                          <p className="text-sm text-stone-600 line-clamp-2">{s.eligibility}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1" onClick={e => { e.stopPropagation(); setSelected(s); }}>
                          View full details <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        {/* Always show portal link if available; show KrishiSeva apply only for scholarship (not scheme/portal) categories */}
                        {(s.officialLink && s.officialLink !== "#") ? (
                          <a
                            href={s.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {["Government Portal","Government Scheme","State Scheme"].includes(s.category) ? "Open Portal" : "Apply on Portal"}
                          </a>
                        ) : !["Government Portal","Government Scheme","State Scheme"].includes(s.category) ? (
                          <Button
                            size="sm"
                            className={isApplied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}
                            disabled={isApplied || applying === id}
                            onClick={e => { e.stopPropagation(); handleApply(id); }}
                          >
                            {applying === id ? <Loader2 className="h-4 w-4 animate-spin" /> :
                             isApplied ? <><CheckCircle2 className="mr-1.5 h-4 w-4" />Applied</> :
                             <>Apply Now</>}
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <Card className="bg-stone-900 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-blue-400" />Need Help?</CardTitle>
                <CardDescription className="text-stone-400">Our counselors guide you through the application process.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {["Document Verification","Application Tracking","Eligibility Check"].map(item => (
                  <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span className="text-sm">{item}</span></div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Required Documents</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-stone-600">
                  {["Income Certificate","Farmer ID / 7/12 Extract","Previous Year Marksheet","Aadhar Card","Bank Passbook Copy"].map(d => (
                    <li key={d} className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-stone-400 shrink-0" />{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {isLoggedIn && applied.size > 0 && (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-800">Applied Scholarships</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-700">{applied.size}</p>
                  <p className="text-sm text-emerald-600">applications submitted</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <Badge className="mb-2 bg-blue-50 text-blue-700">{selected.category}</Badge>
                  <h2 className="text-xl font-bold text-stone-900 leading-tight">{selected.title}</h2>
                  <p className="text-blue-600 font-medium text-sm mt-0.5">{selected.provider}</p>
                </div>
                <button onClick={() => setSelected(null)} className="shrink-0 rounded-full p-1.5 hover:bg-stone-100 transition-colors">
                  <X className="h-5 w-5 text-stone-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Key info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase text-stoneald-500 mb-1">Amount</p>
                    <p className="text-lg font-bold text-emerald-700">{selected.amount}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase text-stone-500 mb-1">Deadline</p>
                    <p className="text-lg font-bold text-amber-700">{selected.deadline}</p>
                  </div>
                </div>

                {/* Description */}
                {selected.description && (
                  <div>
                    <h3 className="font-bold text-stone-900 mb-2">About this Scholarship</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {/* Eligibility */}
                <div>
                  <h3 className="font-bold text-stone-900 mb-2">Eligibility Criteria</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{selected.eligibility}</p>
                </div>

                {/* Required documents */}
                {selected.requiredDocuments?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-stone-900 mb-2">Required Documents</h3>
                    <ul className="space-y-1.5">
                      {selected.requiredDocuments.map((doc: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {selected.officialLink && selected.officialLink !== "#" && (
                    <a href={selected.officialLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <ExternalLink className="h-4 w-4" /> Open Official Portal
                      </Button>
                    </a>
                  )}
                  {selected.applicationLink && selected.applicationLink !== "#" && selected.applicationLink !== selected.officialLink && (
                    <a href={selected.applicationLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                        <ExternalLink className="h-4 w-4" /> Apply on Official Site
                      </Button>
                    </a>
                  )}
                  {(() => {
                    const id = selected._id || selected.id;
                    const isApplied = applied.has(id);
                    // Don't show KrishiSeva apply button for portal/scheme entries
                    const isPortal = ["Government Portal", "Government Scheme", "State Scheme"].includes(selected.category);
                    if (isPortal) return null;
                    return (
                      <Button
                        className={`flex-1 ${isApplied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-stone-900 hover:bg-stone-800"}`}
                        disabled={isApplied || applying === id}
                        onClick={() => handleApply(id)}
                      >
                        {applying === id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :
                         isApplied ? <><CheckCircle2 className="mr-2 h-4 w-4" />Applied on KrishiSeva</> :
                         "Apply via KrishiSeva"}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
