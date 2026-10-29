import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink, IndianRupee, Users, Calendar, CheckCircle2,
  ChevronDown, ChevronUp, TrendingUp, Wheat, Building2,
  CreditCard, Umbrella, Landmark, Search,
} from "lucide-react";
import { motion } from "motion/react";

// ── Live commodity ticker data (mock — replace with real API in production) ──
const COMMODITY_TICKER = [
  { name: "Wheat (गेहू)", msp: "₹2,275/qtl", change: "+1.2%", up: true },
  { name: "Paddy (धान)", msp: "₹2,183/qtl", change: "+0.8%", up: true },
  { name: "Cotton (कपास)", msp: "₹6,620/qtl", change: "-0.5%", up: false },
  { name: "Soybean (सोयाबीन)", msp: "₹4,600/qtl", change: "+2.1%", up: true },
  { name: "Maize (मकई)", msp: "₹2,090/qtl", change: "+0.3%", up: true },
  { name: "Mustard (सरसों)", msp: "₹5,650/qtl", change: "-0.2%", up: false },
  { name: "Sugarcane (गन्ना)", msp: "₹315/qtl",  change: "+0.0%", up: true },
  { name: "Onion (प्याज)", msp: "₹800/qtl",    change: "+5.4%", up: true },
  { name: "Tomato (टमाटर)", msp: "₹1,200/qtl", change: "+12.0%", up: true },
];

// ── Scheme data ───────────────────────────────────────────────────────────────
interface Scheme {
  id: string;
  name: string;
  hindiName: string;
  provider: string;
  category: "income" | "insurance" | "credit" | "input" | "infra";
  icon: React.ElementType;
  iconBg: string;
  tagline: string;
  benefit: string;
  eligibility: string[];
  howToApply: string;
  portalUrl: string;
  helpline: string;
  launchYear: string;
  beneficiaries: string;
}

const SCHEMES: Scheme[] = [
  {
    id: "pmkisan",
    name: "PM-KISAN",
    hindiName: "प्रधानमंत्री किसान सम्मान निधि",
    provider: "Ministry of Agriculture, Govt. of India",
    category: "income",
    icon: IndianRupee,
    iconBg: "bg-green-100 text-green-700",
    tagline: "₹6,000/year direct to your bank account",
    benefit: "₹6,000 annually in three equal instalments of ₹2,000 each, deposited directly into the farmer's bank account via DBT. Check your beneficiary status online.",
    eligibility: [
      "Small and marginal farmer families with combined landholding ≤ 2 hectares",
      "Must be an Indian citizen and have valid Aadhaar",
      "Land must be in farmer's own name",
      "Institutional landholders, former/current constitutional post holders, and professionals are excluded",
    ],
    howToApply: "Visit pmkisan.gov.in → New Farmer Registration → Enter Aadhaar, bank details, and land records. Check beneficiary status at the portal. Alternatively visit your nearest CSC or Agriculture Office.",
    portalUrl: "https://pmkisan.gov.in",
    helpline: "155261 / 011-24300606",
    launchYear: "2019",
    beneficiaries: "11+ Crore farmers",
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana",
    hindiName: "प्रधानमंत्री फसल बीमा योजना",
    provider: "Ministry of Agriculture & Farmers Welfare",
    category: "insurance",
    icon: Umbrella,
    iconBg: "bg-blue-100 text-blue-700",
    tagline: "Crop insurance at just 1.5–5% premium",
    benefit: "Full financial support against crop loss due to natural calamities, pests, and diseases. Farmers pay only 1.5% for Rabi crops, 2% for Kharif crops, and 5% for horticultural crops. Balance premium paid by Government.",
    eligibility: [
      "All farmers including sharecroppers and tenant farmers growing notified crops",
      "Loanee farmers automatically enrolled, non-loanee farmers must apply separately",
      "Enrollment before sowing deadline (31st July for Kharif, 31st Dec for Rabi)",
    ],
    howToApply: "Apply through pmfby.gov.in, nearest bank, CSC, or authorized insurance company agent before the last enrollment date for your crop season.",
    portalUrl: "https://pmfby.gov.in",
    helpline: "1800-180-1551",
    launchYear: "2016",
    beneficiaries: "5.5+ Crore farmers/season",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    hindiName: "किसान क्रेडिट कार्ड",
    provider: "NABARD / All Scheduled Commercial Banks",
    category: "credit",
    icon: CreditCard,
    iconBg: "bg-amber-100 text-amber-700",
    tagline: "Short-term credit at just 4–7% interest rate",
    benefit: "Flexible revolving credit for cultivation expenses, post-harvest costs, farm maintenance, and personal needs. Interest subvention of 2% + prompt repayment incentive of 3% = effective rate as low as 4% p.a. Apply via PM-Kisan portal or nearest bank.",
    eligibility: [
      "Farmers, sharecroppers, tenant farmers, SHGs, and JLGs",
      "Must be engaged in crop cultivation or allied activities",
      "No minimum land requirement; assessed on a case-by-case basis",
    ],
    howToApply: "Apply via PM-Kisan portal (pmkisan.gov.in) or visit any nationalized bank, SBI, or cooperative bank. Documents: land ownership/lease deed, Aadhaar, passport photo, crop details.",
    portalUrl: "https://pmkisan.gov.in",
    helpline: "1800-180-1111 (NABARD)",
    launchYear: "1998",
    beneficiaries: "7+ Crore KCC holders",
  },
  {
    id: "mahadbt",
    name: "MahaDBT Farmer Schemes",
    hindiName: "महाडीबीटी शेतकरी योजना",
    provider: "Government of Maharashtra — Agriculture Department",
    category: "input",
    icon: Wheat,
    iconBg: "bg-orange-100 text-orange-700",
    tagline: "50–75% subsidy on farm equipment & inputs",
    benefit: "Subsidies on tractors, power tillers, pumps, seeds, fertilizers, drip irrigation, sprinklers, and more. All Maharashtra state agricultural schemes in one unified portal.",
    eligibility: [
      "Registered farmers in Maharashtra with valid 7/12 extract",
      "Must have Aadhaar-linked bank account",
      "Specific eligibility varies by individual scheme",
      "Priority to small and marginal farmers",
    ],
    howToApply: "Register at mahadbt.maharashtra.gov.in/Farmer/AgriLogin/AgriLogin using your Aadhaar and 7/12 extract. Apply for multiple schemes in one place.",
    portalUrl: "https://mahadbt.maharashtra.gov.in/Farmer/AgriLogin/AgriLogin",
    helpline: "1800-120-8040",
    launchYear: "2017",
    beneficiaries: "50+ Lakh Maharashtra farmers",
  },
  {
    id: "bhulekh",
    name: "Maharashtra Bhulekh",
    hindiName: "महाराष्ट्र भूलेख — ७/१२ उतारा",
    provider: "Maharashtra Revenue Department",
    category: "infra",
    icon: Landmark,
    iconBg: "bg-teal-100 text-teal-700",
    tagline: "Free online 7/12 Utara & land records",
    benefit: "Free online access to 7/12 Utara (Satbara), 8A, and property card. Required for all government scheme applications, bank loans, and legal purposes. Download digitally signed copies.",
    eligibility: [
      "Any farmer or landowner in Maharashtra",
      "No registration required for basic record viewing",
      "Digitally signed copies available for official use",
    ],
    howToApply: "Visit bhulekh.mahabhumi.gov.in → Select district → Enter survey/gat number → View and download your 7/12 Utara and 8A records.",
    portalUrl: "https://bhulekh.mahabhumi.gov.in",
    helpline: "1800-120-8040",
    launchYear: "2013",
    beneficiaries: "All Maharashtra landowners",
  },
  {
    id: "agristack",
    name: "Maharashtra Farmer Registry",
    hindiName: "महाराष्ट्र शेतकरी नोंदणी (AgriStack)",
    provider: "Government of Maharashtra — Agriculture Department",
    category: "infra",
    icon: Users,
    iconBg: "bg-indigo-100 text-indigo-700",
    tagline: "Get your unique Farmer ID for all schemes",
    benefit: "Single Farmer ID (FID) that enables access to all state and central government agricultural schemes, subsidies, and DBT benefits. Eliminates duplicate registrations and speeds up benefit delivery.",
    eligibility: [
      "All farmers in Maharashtra",
      "Must have Aadhaar card and mobile number",
      "Land records (7/12) required for verification",
    ],
    howToApply: "Visit mhfr.agristack.gov.in → Register with Aadhaar → Link land records → Get your unique Farmer ID. Required for all new MahaDBT scheme applications.",
    portalUrl: "https://mhfr.agristack.gov.in/farmer-registry-mh/#/analsye",
    helpline: "1800-120-8040",
    launchYear: "2023",
    beneficiaries: "1+ Crore registered farmers",
  },
  {
    id: "mudra",
    name: "Pradhan Mantri MUDRA Yojana",
    hindiName: "प्रधानमंत्री मुद्रा योजना",
    provider: "MUDRA / Ministry of Finance",
    category: "credit",
    icon: CreditCard,
    iconBg: "bg-purple-100 text-purple-700",
    tagline: "Collateral-free business loans up to ₹10 Lakh",
    benefit: "Loans under three categories: Shishu (up to ₹50,000), Kishor (₹50,001–₹5 Lakh), Tarun (₹5–₹10 Lakh). No collateral required. Can be used for agri-allied activities, equipment, processing units.",
    eligibility: [
      "Non-corporate, non-farm micro/small enterprises",
      "Farmers for allied agri activities: poultry, fishery, beekeeping, etc.",
      "Age: 18–65 years; must have a viable business plan",
      "No default on previous loans",
    ],
    howToApply: "Apply at any nationalized bank, regional rural bank, cooperative bank, MFI, or NBFC. Carry business plan, Aadhaar, PAN card, proof of address, and bank statements.",
    portalUrl: "https://www.mudra.org.in",
    helpline: "1800-180-1111",
    launchYear: "2015",
    beneficiaries: "40+ Crore beneficiaries",
  },
  {
    id: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana",
    hindiName: "परम्परागत कृषि विकास योजना",
    provider: "Ministry of Agriculture & Farmers Welfare",
    category: "input",
    icon: Wheat,
    iconBg: "bg-lime-100 text-lime-700",
    tagline: "₹50,000/ha subsidy for organic farming",
    benefit: "₹50,000 per hectare over 3 years for cluster-based organic farming. Covers: organic inputs, training, PGS-India certification, and marketing. Focus on traditional inputs (jeevamrit, panchgavya, etc.).",
    eligibility: [
      "Farmer clusters of minimum 20 farmers forming a 50-acre cluster",
      "Willingness to shift to organic farming for minimum 3 years",
      "Farmers from any state; preference to north-east and hilly areas",
    ],
    howToApply: "Contact your State Department of Agriculture or State Organic Certification Agency. Applications submitted cluster-wise through lead farmers or FPOs.",
    portalUrl: "https://pgsindia-ncof.gov.in/PKVY/Index.aspx",
    helpline: "1800-180-1551",
    launchYear: "2015",
    beneficiaries: "5+ Lakh farmers",
  },
  {
    id: "pmkmy",
    name: "PM Kisan Maandhan Yojana",
    hindiName: "प्रधानमंत्री किसान मान-धन योजना",
    provider: "Ministry of Agriculture & Farmers Welfare / LIC",
    category: "income",
    icon: Users,
    iconBg: "bg-rose-100 text-rose-700",
    tagline: "₹3,000/month pension after age 60",
    benefit: "Monthly pension of ₹3,000 after the age of 60 years. Voluntary and contributory scheme — farmers contribute ₹55–₹200/month based on joining age. Central Govt. matches the contribution equally.",
    eligibility: [
      "Small and marginal farmers with landholding ≤ 2 hectares",
      "Joining age: 18–40 years",
      "Must not be covered under other pension schemes (NPS/EPFO/ESIC etc.)",
      "Must not be an income-tax payer",
    ],
    howToApply: "Visit nearest CSC with Aadhaar card, bank passbook, and mobile number. Alternatively register online at maandhan.in.",
    portalUrl: "https://maandhan.in",
    helpline: "1800-267-6888",
    launchYear: "2019",
    beneficiaries: "20+ Lakh enrolled",
  },
];

const CATEGORY_LABELS: Record<Scheme["category"], string> = {
  income: "Income Support",
  insurance: "Crop Insurance",
  credit: "Credit / Loan",
  input: "Farm Inputs",
  infra: "Infrastructure",
};

const CATEGORY_COLORS: Record<Scheme["category"], string> = {
  income:    "bg-green-100 text-green-700",
  insurance: "bg-blue-100 text-blue-700",
  credit:    "bg-purple-100 text-purple-700",
  input:     "bg-lime-100 text-lime-700",
  infra:     "bg-orange-100 text-orange-700",
};

// ── Scrolling commodity ticker ───────────────────────────────────────────────
function CommodityTicker() {
  const doubled = [...COMMODITY_TICKER, ...COMMODITY_TICKER]; // seamless loop
  return (
    <div className="overflow-hidden bg-stone-900 py-2.5 border-b border-stone-800">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm">
            <span className="text-stone-300 font-medium">{c.name}</span>
            <span className="text-white font-bold">MSP {c.msp}</span>
            <span className={`font-bold ${c.up ? "text-emerald-400" : "text-red-400"}`}>
              {c.up ? "▲" : "▼"} {c.change}
            </span>
            <span className="text-stone-600 mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Single scheme card ────────────────────────────────────────────────────────
function SchemeCard({ scheme }: { scheme: Scheme }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = scheme.icon;

  return (
    <Card className="border border-stone-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${scheme.iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge className={`text-xs ${CATEGORY_COLORS[scheme.category]}`}>
                {CATEGORY_LABELS[scheme.category]}
              </Badge>
              <span className="text-xs text-stone-400">Since {scheme.launchYear}</span>
            </div>
            <CardTitle className="text-lg leading-tight">{scheme.name}</CardTitle>
            <p className="text-xs text-stone-500 mt-0.5">{scheme.hindiName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Tagline */}
        <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 mb-3">
          <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-stone-800">{scheme.tagline}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-stone-50 p-2.5 text-center">
            <p className="text-[10px] text-stone-500 mb-0.5">Beneficiaries</p>
            <p className="text-sm font-bold text-stone-900">{scheme.beneficiaries}</p>
          </div>
          <div className="rounded-lg bg-stone-50 p-2.5 text-center">
            <p className="text-[10px] text-stone-500 mb-0.5">Helpline</p>
            <p className="text-sm font-bold text-stone-900">{scheme.helpline.split("/")[0]}</p>
          </div>
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Show less" : "View details, eligibility & how to apply"}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">Benefit</p>
              <p className="text-sm text-stone-600 leading-relaxed">{scheme.benefit}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">Eligibility</p>
              <ul className="space-y-1">
                {scheme.eligibility.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">How to Apply</p>
              <p className="text-sm text-stone-600 leading-relaxed">{scheme.howToApply}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">Provider</p>
              <p className="text-sm text-stone-600">{scheme.provider}</p>
            </div>
          </motion.div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <a
          href={scheme.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors w-full justify-center"
        >
          Apply on Official Portal <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SarkariYojana() {
  const [activeCategory, setActiveCategory] = useState<"all" | Scheme["category"]>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = SCHEMES.filter(s => {
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || s.name.toLowerCase().includes(q)
      || s.hindiName.includes(q)
      || s.tagline.toLowerCase().includes(q)
      || s.benefit.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const categoryTabs: Array<{ key: "all" | Scheme["category"]; label: string; icon: React.ElementType }> = [
    { key: "all",       label: "All Schemes",     icon: Landmark },
    { key: "income",    label: "Income Support",   icon: IndianRupee },
    { key: "insurance", label: "Crop Insurance",   icon: Umbrella },
    { key: "credit",    label: "Credit & Loans",   icon: CreditCard },
    { key: "input",     label: "Farm Inputs",      icon: Wheat },
    { key: "infra",     label: "Portals & Records",icon: Building2 },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Live MSP Ticker ─────────────────────────────────────────────── */}
      <CommodityTicker />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 py-16 px-4 text-white">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-700/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="container mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-6 w-6 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">सरकारी योजनाएँ</span>
            </div>
            <h1 className="text-4xl font-extrabold md:text-5xl leading-tight mb-3">
              Sarkari Yojana
              <span className="block text-emerald-400 mt-1">Government Schemes for Farmers</span>
            </h1>
            <p className="text-base text-emerald-100/80 max-w-xl leading-relaxed">
              Complete guide to central government schemes — PM-KISAN, Fasal Bima, MUDRA Loans, Kisan Credit Card, and more. Check eligibility and apply directly on official portals.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Users className="h-4 w-4 text-emerald-300" />
                <span>14+ Crore direct beneficiaries</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Calendar className="h-4 w-4 text-emerald-300" />
                <span>Updated for FY 2025–26</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-20 bg-white border-b border-stone-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all
                      ${activeCategory === tab.key
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="relative ml-auto w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search schemes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 pl-9 pr-4 py-1.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Scheme cards grid ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Search className="h-16 w-16 opacity-20 mb-4" />
            <p className="text-lg">No schemes found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((scheme, i) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
              >
                <SchemeCard scheme={scheme} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 rounded-2xl bg-amber-50 border border-amber-100 px-6 py-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> The scheme information above is provided for reference purposes only and is updated as of FY 2025–26. Eligibility criteria, benefit amounts, and application processes may change. Always verify the latest details on the official government portals before applying. KrishiSeva is not affiliated with any government body.
          </p>
        </div>
      </section>

      {/* Ticker CSS — injected inline since we can't modify tailwind config */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
