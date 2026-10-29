import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import Scholarship from "./models/Scholarship.js";
import User from "./models/User.js";

dotenv.config();

const products = [
  // ── Original 8 ──────────────────────────────────────────────────────────────
  { name: "Premium Wheat Seeds", description: "High-yield wheat seeds suitable for Rabi season. Resistant to rust and drought conditions.", price: 450, category: "Seeds", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400", tag: "Best Seller", stock: 500, rating: 4.8, reviewCount: 124, unit: "kg" },
  { name: "Organic NPK Fertilizer", description: "Balanced NPK (10-10-10) organic fertilizer for all crops. Improves soil health and yield.", price: 890, category: "Fertilizers", image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400", tag: "Eco Friendly", stock: 300, rating: 4.5, reviewCount: 89, unit: "kg" },
  { name: "Hand Trowel Set", description: "Stainless steel hand trowel set with ergonomic handles. Set of 3 tools for transplanting and weeding.", price: 320, category: "Tools", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400", tag: "Durable", stock: 150, rating: 4.2, reviewCount: 56, unit: "set" },
  { name: "Drip Irrigation Kit", description: "Complete drip irrigation system for up to 1 acre. Includes pipes, emitters, and filter.", price: 2499, category: "Irrigation", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=400", tag: "New Arrival", stock: 75, rating: 4.9, reviewCount: 45, unit: "set" },
  { name: "Hybrid Tomato Seeds", description: "F1 hybrid tomato seeds with high yield potential. Suitable for open field and greenhouse cultivation.", price: 150, category: "Seeds", image: "https://images.unsplash.com/photo-1592841200221-a6898f307bac?auto=format&fit=crop&q=80&w=400", tag: "High Yield", stock: 800, rating: 4.6, reviewCount: 210, unit: "packet" },
  { name: "Power Tiller 5HP", description: "5HP diesel power tiller for soil preparation. Lightweight, fuel-efficient, and easy to operate.", price: 45000, category: "Tools", image: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=400", tag: "Heavy Duty", stock: 20, rating: 4.7, reviewCount: 12, unit: "unit" },
  { name: "Neem-based Pesticide", description: "Organic neem oil based pesticide. Effective against a wide range of pests without harming beneficial insects.", price: 280, category: "Pesticides", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400", tag: "Organic", stock: 400, rating: 4.4, reviewCount: 98, unit: "litre" },
  { name: "Sprinkler Irrigation System", description: "Portable sprinkler system covering 0.5 acres. Easy to install and operate, ideal for vegetable crops.", price: 1850, category: "Irrigation", image: "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?auto=format&fit=crop&q=80&w=400", tag: "Popular", stock: 60, rating: 4.3, reviewCount: 34, unit: "set" },

  // ── Seeds ────────────────────────────────────────────────────────────────────
  { name: "Basmati Rice Seeds", description: "Premium long-grain Basmati rice seeds. Aromatic variety with excellent cooking quality. Suitable for Kharif season.", price: 380, category: "Seeds", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400", tag: "Premium", stock: 600, rating: 4.7, reviewCount: 145, unit: "kg" },
  { name: "Hybrid Onion Seeds", description: "High-yielding hybrid onion seeds. Produces large, firm bulbs with excellent shelf life. Suitable for Rabi and Kharif.", price: 220, category: "Seeds", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400", tag: "High Yield", stock: 700, rating: 4.5, reviewCount: 178, unit: "packet" },
  { name: "Cotton Seeds BT", description: "Bollgard II BT cotton seeds with built-in pest resistance. High ginning percentage and fibre quality.", price: 950, category: "Seeds", image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=400", tag: "Pest Resistant", stock: 400, rating: 4.6, reviewCount: 92, unit: "packet" },
  { name: "Soybean Seeds", description: "High-protein soybean seeds suitable for Kharif season. Disease-resistant variety with good nodulation.", price: 290, category: "Seeds", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400", tag: "Protein Rich", stock: 550, rating: 4.4, reviewCount: 67, unit: "kg" },
  { name: "Maize Hybrid Seeds", description: "High-yielding hybrid maize seeds. Suitable for both grain and fodder purposes. Drought tolerant variety.", price: 340, category: "Seeds", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400", tag: "Drought Tolerant", stock: 480, rating: 4.5, reviewCount: 83, unit: "kg" },
  { name: "Chilli Seeds (Jwala)", description: "Jwala variety chilli seeds known for high pungency and yield. Suitable for dry and fresh market.", price: 180, category: "Seeds", image: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&q=80&w=400", tag: "Spicy", stock: 650, rating: 4.3, reviewCount: 112, unit: "packet" },

  // ── Fertilizers ──────────────────────────────────────────────────────────────
  { name: "Vermicompost (Organic)", description: "Premium quality vermicompost made from earthworm castings. Improves soil structure, water retention and microbial activity.", price: 450, category: "Fertilizers", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400", tag: "100% Organic", stock: 350, rating: 4.8, reviewCount: 203, unit: "kg" },
  { name: "DAP Fertilizer (50kg)", description: "Di-Ammonium Phosphate fertilizer. Essential for root development and early crop growth. Suitable for all crops.", price: 1350, category: "Fertilizers", image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400", tag: "Essential", stock: 200, rating: 4.6, reviewCount: 156, unit: "bag" },
  { name: "Urea Fertilizer (45kg)", description: "High nitrogen content urea fertilizer for vegetative growth. Suitable for all cereal crops and vegetables.", price: 680, category: "Fertilizers", image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400", tag: "High Nitrogen", stock: 280, rating: 4.4, reviewCount: 134, unit: "bag" },
  { name: "Jeevamrit Liquid Fertilizer", description: "Traditional organic liquid fertilizer made from cow dung, cow urine, jaggery and gram flour. Boosts soil microbes.", price: 320, category: "Fertilizers", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400", tag: "Traditional", stock: 180, rating: 4.7, reviewCount: 89, unit: "litre" },

  // ── Tools ────────────────────────────────────────────────────────────────────
  { name: "Knapsack Sprayer 16L", description: "Manual knapsack sprayer with 16-litre capacity. Adjustable nozzle for fine mist or jet spray. Ideal for pesticide application.", price: 1200, category: "Tools", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400", tag: "Must Have", stock: 120, rating: 4.5, reviewCount: 78, unit: "unit" },
  { name: "Sickle (Drati) Set of 2", description: "High-carbon steel sickle for harvesting wheat, rice and grass. Ergonomic wooden handle for comfortable grip.", price: 280, category: "Tools", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400", tag: "Traditional", stock: 200, rating: 4.3, reviewCount: 45, unit: "set" },
  { name: "Soil pH Testing Kit", description: "Easy-to-use soil pH testing kit. Includes 100 tests. Helps determine soil acidity/alkalinity for optimal fertilizer use.", price: 450, category: "Tools", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400", tag: "Smart Farming", stock: 90, rating: 4.6, reviewCount: 62, unit: "kit" },
  { name: "Grafting Knife Set", description: "Professional grafting knife set with 3 blades. Stainless steel blades for clean cuts. Ideal for fruit tree grafting.", price: 380, category: "Tools", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400", tag: "Professional", stock: 75, rating: 4.4, reviewCount: 38, unit: "set" },

  // ── Irrigation ───────────────────────────────────────────────────────────────
  { name: "Solar Water Pump 1HP", description: "1HP solar-powered water pump for irrigation. No electricity required. Suitable for wells up to 30 feet depth.", price: 18500, category: "Irrigation", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=400", tag: "Solar Powered", stock: 25, rating: 4.8, reviewCount: 29, unit: "unit" },
  { name: "HDPE Irrigation Pipe (100m)", description: "High-density polyethylene pipe for irrigation. UV resistant, durable and flexible. 32mm diameter.", price: 1650, category: "Irrigation", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=400", tag: "Durable", stock: 80, rating: 4.3, reviewCount: 41, unit: "roll" },
  { name: "Rain Gun Sprinkler", description: "Long-range rain gun sprinkler covering up to 30m radius. Ideal for large fields and orchards.", price: 3200, category: "Irrigation", image: "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?auto=format&fit=crop&q=80&w=400", tag: "Large Coverage", stock: 40, rating: 4.5, reviewCount: 23, unit: "unit" },

  // ── Pesticides ───────────────────────────────────────────────────────────────
  { name: "Trichoderma Bio-Fungicide", description: "Biological fungicide containing Trichoderma viride. Controls soil-borne fungal diseases. Safe for environment.", price: 350, category: "Pesticides", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400", tag: "Bio-Control", stock: 220, rating: 4.5, reviewCount: 67, unit: "kg" },
  { name: "Chlorpyrifos Insecticide", description: "Broad-spectrum insecticide for controlling termites, stem borers and soil insects. Use as directed on label.", price: 420, category: "Pesticides", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400", tag: "Broad Spectrum", stock: 180, rating: 4.2, reviewCount: 54, unit: "litre" },
  { name: "Copper Oxychloride Fungicide", description: "Contact fungicide for controlling downy mildew, leaf spot and blight in vegetables and fruits.", price: 290, category: "Pesticides", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400", tag: "Trusted", stock: 260, rating: 4.3, reviewCount: 78, unit: "kg" },

  // ── Others (Homemade / Value-Added Products) ─────────────────────────────────
  { name: "Homemade Mango Aachar (Pickle)", description: "Traditional sun-dried raw mango pickle made with mustard oil, fenugreek and spices. No preservatives. 500g jar.", price: 180, category: "Others", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400", tag: "Homemade", stock: 120, rating: 4.9, reviewCount: 234, unit: "jar" },
  { name: "Mixed Vegetable Aachar", description: "Assorted vegetable pickle with carrot, cauliflower, turnip and green chilli in mustard oil. Traditional recipe. 500g.", price: 160, category: "Others", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400", tag: "Homemade", stock: 100, rating: 4.7, reviewCount: 189, unit: "jar" },
  { name: "Pure Honey (Wild Forest)", description: "Raw unprocessed wild forest honey collected from natural beehives. Rich in antioxidants and enzymes. 500g bottle.", price: 450, category: "Others", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400", tag: "Pure & Natural", stock: 80, rating: 4.9, reviewCount: 312, unit: "bottle" },
  { name: "Organic Desi Ghee", description: "Pure A2 cow ghee made using traditional bilona method. Rich aroma and golden colour. 500ml glass jar.", price: 680, category: "Others", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400", tag: "A2 Cow", stock: 60, rating: 4.8, reviewCount: 267, unit: "jar" },
  { name: "Strawberry Jam (Homemade)", description: "Fresh strawberry jam made with farm-grown strawberries and natural sugar. No artificial colours or preservatives. 250g.", price: 140, category: "Others", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400", tag: "Fresh Made", stock: 90, rating: 4.6, reviewCount: 143, unit: "jar" },
  { name: "Mixed Fruit Jam", description: "Delicious mixed fruit jam with mango, guava and pineapple. Made from fresh farm fruits. No preservatives. 250g.", price: 130, category: "Others", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400", tag: "Farm Fresh", stock: 110, rating: 4.5, reviewCount: 98, unit: "jar" },
  { name: "Turmeric Powder (Organic)", description: "Pure organic turmeric powder from Sangli. High curcumin content. No additives or artificial colour. 200g pack.", price: 120, category: "Others", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400", tag: "Organic", stock: 300, rating: 4.8, reviewCount: 421, unit: "pack" },
  { name: "Cold-Pressed Groundnut Oil", description: "Traditional wood-pressed groundnut oil. Retains natural nutrients and flavour. No chemicals used. 1 litre bottle.", price: 320, category: "Others", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400", tag: "Cold Pressed", stock: 70, rating: 4.7, reviewCount: 198, unit: "bottle" },
  { name: "Jaggery (Kolhapuri Gul)", description: "Pure sugarcane jaggery from Kolhapur. Rich in iron and minerals. No chemicals. 1kg block.", price: 95, category: "Others", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400", tag: "Pure", stock: 400, rating: 4.6, reviewCount: 356, unit: "kg" },
  { name: "Amla (Gooseberry) Murabba", description: "Sweet amla murabba preserved in sugar syrup. Rich in Vitamin C. Traditional recipe. 500g jar.", price: 200, category: "Others", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400", tag: "Vitamin C Rich", stock: 85, rating: 4.5, reviewCount: 112, unit: "jar" },
  { name: "Dried Figs (Anjeer)", description: "Sun-dried premium quality figs from Pune region. Rich in fibre and natural sweetness. 250g pack.", price: 280, category: "Others", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400", tag: "Sun Dried", stock: 95, rating: 4.7, reviewCount: 167, unit: "pack" },
  { name: "Kokum Syrup (Agal)", description: "Pure kokum concentrate for making refreshing kokum sharbat. No artificial flavours. 500ml bottle.", price: 160, category: "Others", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400", tag: "Refreshing", stock: 130, rating: 4.6, reviewCount: 89, unit: "bottle" },
];

const scholarships = [
  // ── Existing ──────────────────────────────────────────────────────────────
  {
    title: "Post-Matric Scholarship for Farmer Children",
    provider: "State Government of Maharashtra",
    amount: "₹10,000 - ₹50,000 per year",
    deadline: "31st August 2026",
    deadlineDate: new Date("2026-08-31"),
    eligibility: "Children of farmers with annual family income less than ₹8 Lakhs per annum. Must have passed Class 10.",
    category: "Higher Education",
    description: "This scholarship supports farmer children pursuing higher education by covering tuition fees and providing a monthly stipend.",
    requiredDocuments: ["Income Certificate", "7/12 Extract", "Previous Marksheet", "Aadhar Card", "Bank Passbook Copy", "Caste Certificate (if applicable)"],
    applicationLink: "https://mahadbt.maharashtra.gov.in/",
    officialLink: "https://mahadbt.maharashtra.gov.in/",
  },
  {
    title: "Agri-Business Excellence Scholarship",
    provider: "National Bank for Agriculture (NABARD)",
    amount: "Full Tuition Fee Waiver",
    deadline: "15th July 2026",
    deadlineDate: new Date("2026-07-15"),
    eligibility: "Students pursuing B.Sc Agriculture, M.Sc Agriculture, or related agricultural fields from recognized universities.",
    category: "Agriculture Studies",
    description: "NABARD's flagship scholarship for students excelling in agricultural sciences to promote agri-business development.",
    requiredDocuments: ["Admission Letter", "Income Certificate", "Farmer ID", "Academic Transcripts", "Aadhar Card"],
    applicationLink: "https://www.nabard.org/",
    officialLink: "https://www.nabard.org/",
  },
  {
    title: "Krishi Ratna Merit Scholarship",
    provider: "KrishiSeva Foundation",
    amount: "₹25,000 one-time",
    deadline: "Open Year Round",
    eligibility: "Top 10% students in rural government schools from farming families.",
    category: "Merit Based",
    description: "Recognizing academic excellence among children of farmers to encourage education in rural India.",
    requiredDocuments: ["School Marksheet", "Principal's Certificate", "Family Income Proof", "Farmer ID", "Aadhar Card"],
    applicationLink: "#",
    officialLink: "#",
  },

  // ── Government Schemes (as Scholarships/Benefits) ─────────────────────────
  {
    title: "PM-KISAN — Pradhan Mantri Kisan Samman Nidhi",
    provider: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
    amount: "₹6,000 per year (3 instalments of ₹2,000)",
    deadline: "Open Year Round",
    eligibility: "Small and marginal farmer families with combined landholding up to 2 hectares. Must have valid Aadhaar and bank account. Institutional landholders and government employees excluded.",
    category: "Government Scheme",
    description: "Direct income support of ₹6,000 per year deposited directly into the farmer's bank account via DBT in three equal instalments. Check your beneficiary status and register on the official PM-KISAN portal.",
    requiredDocuments: ["Aadhaar Card", "Bank Passbook", "Land Records / 7/12 Extract", "Mobile Number linked to Aadhaar"],
    applicationLink: "https://pmkisan.gov.in",
    officialLink: "https://pmkisan.gov.in",
    benefits: "₹6,000/year direct bank transfer. Check status at pmkisan.gov.in/rpt_beneficiarystatus_pub.aspx",
  },
  {
    title: "PM Fasal Bima Yojana — Crop Insurance",
    provider: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
    amount: "Full crop loss coverage (farmer pays only 1.5–5% premium)",
    deadline: "31st July 2026 (Kharif) / 31st December 2026 (Rabi)",
    deadlineDate: new Date("2026-07-31"),
    eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops. Loanee farmers auto-enrolled; non-loanee must apply before sowing deadline.",
    category: "Government Scheme",
    description: "Comprehensive crop insurance against natural calamities, pests, and diseases. Farmers pay only 1.5% for Rabi, 2% for Kharif, and 5% for horticulture crops. Government pays the balance premium.",
    requiredDocuments: ["Aadhaar Card", "Bank Passbook", "Land Records / 7/12 Extract", "Sowing Certificate", "Crop Details"],
    applicationLink: "https://pmfby.gov.in",
    officialLink: "https://pmfby.gov.in",
    benefits: "Full financial protection against crop loss. Premium as low as 1.5% for Rabi crops.",
  },
  {
    title: "Kisan Credit Card (KCC) via PM-Kisan Portal",
    provider: "NABARD / All Scheduled Commercial Banks",
    amount: "Credit limit up to ₹3 Lakh at 7% interest (effective 4% with subvention)",
    deadline: "Open Year Round",
    eligibility: "All farmers, sharecroppers, tenant farmers, SHGs, and JLGs engaged in crop cultivation or allied activities. No minimum land requirement.",
    category: "Government Scheme",
    description: "Flexible revolving credit for cultivation expenses, post-harvest costs, and farm maintenance. Interest subvention of 2% + prompt repayment incentive of 3% makes effective rate as low as 4% p.a. Apply via PM-Kisan portal or nearest bank.",
    requiredDocuments: ["Aadhaar Card", "Land Ownership / Lease Deed", "Passport Photo", "Bank Account Details", "Crop Details"],
    applicationLink: "https://pmkisan.gov.in",
    officialLink: "https://pmkisan.gov.in",
    benefits: "Short-term credit at 4–7% interest. No collateral for loans up to ₹1.6 Lakh.",
  },
  {
    title: "MahaDBT Farmer Scheme — Maharashtra",
    provider: "Government of Maharashtra — Agriculture Department",
    amount: "Varies by scheme (subsidies up to 50–75% on farm equipment & inputs)",
    deadline: "Open Year Round",
    eligibility: "Registered farmers in Maharashtra with valid 7/12 extract, Aadhaar, and bank account. Specific eligibility varies by individual scheme.",
    category: "State Scheme",
    description: "Maharashtra's unified DBT portal for all farmer benefit schemes including subsidies on farm machinery, seeds, fertilizers, irrigation equipment, and more. Apply for multiple schemes in one place.",
    requiredDocuments: ["Aadhaar Card", "7/12 Extract", "8A Land Record", "Bank Passbook", "Caste Certificate (if applicable)", "Farmer Registration Certificate"],
    applicationLink: "https://mahadbt.maharashtra.gov.in/Farmer/AgriLogin/AgriLogin",
    officialLink: "https://mahadbt.maharashtra.gov.in/Farmer/AgriLogin/AgriLogin",
    benefits: "Subsidies on tractors, pumps, seeds, fertilizers, drip irrigation, and more.",
  },
  {
    title: "Maharashtra Bhulekh — Land Record Verification",
    provider: "Maharashtra Revenue Department",
    amount: "Free Service",
    deadline: "Open Year Round",
    eligibility: "Any farmer or landowner in Maharashtra can access their land records (7/12 Utara, 8A) online.",
    category: "Government Portal",
    description: "Official Maharashtra land records portal. Verify your 7/12 Utara (Satbara), 8A, and property card online. Required for most government scheme applications. Essential for loan applications and legal purposes.",
    requiredDocuments: ["Survey Number / Gat Number", "Village Name", "District Name"],
    applicationLink: "https://bhulekh.mahabhumi.gov.in",
    officialLink: "https://bhulekh.mahabhumi.gov.in",
    benefits: "Free online access to 7/12 Utara, 8A, and property card records.",
  },
  {
    title: "Maharashtra Farmer Registry (AgriStack)",
    provider: "Government of Maharashtra — Agriculture Department",
    amount: "Free Registration",
    deadline: "Open Year Round",
    eligibility: "All farmers in Maharashtra. Registration enables access to all government schemes and benefits through a single farmer ID.",
    category: "Government Portal",
    description: "Register on Maharashtra's Farmer Registry (AgriStack) to get a unique Farmer ID. This ID is required to access all state and central government agricultural schemes, subsidies, and benefits. Enables seamless DBT transfers.",
    requiredDocuments: ["Aadhaar Card", "Mobile Number", "Land Records", "Bank Account Details"],
    applicationLink: "https://mhfr.agristack.gov.in/farmer-registry-mh/#/analsye",
    officialLink: "https://mhfr.agristack.gov.in/farmer-registry-mh/#/analsye",
    benefits: "Single Farmer ID for all government scheme access. Enables faster DBT transfers.",
  },

  // ── Additional Government Scholarships for Farmers & Children ─────────────
  {
    title: "National Scholarship Portal — Central Schemes",
    provider: "Ministry of Electronics & IT / Various Central Ministries",
    amount: "₹5,000 – ₹1,20,000 per year (varies by scheme)",
    deadline: "31st October 2026",
    deadlineDate: new Date("2026-10-31"),
    eligibility: "Students from SC/ST/OBC/Minority/EWS categories including farmer families. Income limit varies by scheme (generally below ₹2.5–8 Lakh/year). Must be enrolled in recognized institution.",
    category: "Higher Education",
    description: "India's unified scholarship portal hosting 50+ central government scholarships including Pre-Matric, Post-Matric, Merit-cum-Means, and Top Class scholarships for students from farmer and rural backgrounds.",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Marksheet", "Bank Passbook", "Bonafide Certificate", "Admission Receipt"],
    applicationLink: "https://scholarships.gov.in",
    officialLink: "https://scholarships.gov.in",
    benefits: "50+ scholarships in one portal. Covers tuition, maintenance allowance, and book grants.",
  },
  {
    title: "Swanath Scholarship for Orphan & Farmer Children",
    provider: "All India Council for Technical Education (AICTE)",
    amount: "₹50,000 per year",
    deadline: "30th September 2026",
    deadlineDate: new Date("2026-09-30"),
    eligibility: "Students pursuing technical education (B.Tech/Diploma) who are orphans or children of farmers who died due to farming-related causes. Family income below ₹8 Lakh/year.",
    category: "Higher Education",
    description: "AICTE's Swanath Scholarship provides financial support to orphan students and children of farmers who lost their lives due to farming-related accidents or distress, enabling them to pursue technical education.",
    requiredDocuments: ["Aadhaar Card", "Death Certificate of Parent (if applicable)", "Income Certificate", "Admission Letter", "Marksheet", "Bank Passbook"],
    applicationLink: "https://scholarships.gov.in",
    officialLink: "https://www.aicte-india.org/bureaus/swanath",
    benefits: "₹50,000/year for up to 4 years of technical education.",
  },
  {
    title: "Ishan Uday — Special Scholarship for North East",
    provider: "University Grants Commission (UGC)",
    amount: "₹5,400 – ₹7,800 per month",
    deadline: "31st October 2026",
    deadlineDate: new Date("2026-10-31"),
    eligibility: "Students from North East states (including children of farmers) pursuing general degree courses. Family income below ₹4.5 Lakh/year. Must have passed Class 12 from a North East state school.",
    category: "Higher Education",
    description: "UGC scholarship for students from North Eastern states to pursue higher education. Covers general, technical, and professional courses. Particularly beneficial for children of tea garden and hill farmers.",
    requiredDocuments: ["Aadhaar Card", "Domicile Certificate (NE State)", "Income Certificate", "Class 12 Marksheet", "Admission Letter", "Bank Passbook"],
    applicationLink: "https://scholarships.gov.in",
    officialLink: "https://scholarships.gov.in",
    benefits: "Monthly stipend of ₹5,400 (general) or ₹7,800 (professional courses).",
  },
  {
    title: "PM Scholarship Scheme for RPF/RPSF Personnel",
    provider: "Ministry of Railways, Govt. of India",
    amount: "₹2,500 – ₹3,000 per month",
    deadline: "31st October 2026",
    deadlineDate: new Date("2026-10-31"),
    eligibility: "Children of ex-RPF/RPSF personnel including those from farming backgrounds who served in railways. Pursuing first professional degree (B.E./B.Tech/MBBS/BDS/MBA/MCA etc.).",
    category: "Merit Based",
    description: "Scholarship for children of Railway Protection Force personnel pursuing professional degrees. Many RPF personnel come from farming families, making this relevant for rural students.",
    requiredDocuments: ["Aadhaar Card", "Service Certificate of Parent", "Marksheet (min 60%)", "Admission Letter", "Bank Passbook"],
    applicationLink: "https://scholarships.gov.in",
    officialLink: "https://scholarships.gov.in",
    benefits: "₹3,000/month for boys, ₹3,000/month for girls pursuing professional courses.",
  },
  {
    title: "Paramparagat Krishi Vikas Yojana (PKVY) Training Grant",
    provider: "Ministry of Agriculture & Farmers Welfare",
    amount: "₹50,000 per hectare over 3 years",
    deadline: "Open Year Round",
    eligibility: "Farmer clusters of minimum 20 farmers forming a 50-acre cluster willing to adopt organic farming. All states eligible; preference to NE and hilly regions.",
    category: "Government Scheme",
    description: "Financial support for farmers transitioning to organic farming. Covers cost of organic inputs, training, certification (PGS-India), and marketing support. Promotes traditional farming methods like jeevamrit and panchgavya.",
    requiredDocuments: ["Farmer Group Registration", "Land Records", "Aadhaar Card", "Bank Account", "Cluster Formation Certificate"],
    applicationLink: "https://pgsindia-ncof.gov.in/PKVY/Index.aspx",
    officialLink: "https://pgsindia-ncof.gov.in/PKVY/Index.aspx",
    benefits: "₹50,000/ha for 3 years + free organic certification + marketing support.",
  },
  {
    title: "Rajiv Gandhi National Fellowship for SC Students",
    provider: "University Grants Commission (UGC)",
    amount: "₹25,000 – ₹28,000 per month + HRA",
    deadline: "Open (check UGC website)",
    eligibility: "SC students pursuing M.Phil/Ph.D in any subject including Agriculture, Rural Development, and related fields. Must have cleared NET/SLET or equivalent.",
    category: "Research",
    description: "Fellowship for SC students pursuing research degrees. Particularly relevant for children of farmers pursuing agricultural research, rural development, or related fields at university level.",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate", "NET/SLET Certificate", "Admission Letter", "Bank Passbook", "Income Certificate"],
    applicationLink: "https://scholarships.gov.in",
    officialLink: "https://ugc.gov.in/page/Scholarships.aspx",
    benefits: "JRF: ₹25,000/month; SRF: ₹28,000/month + HRA + contingency grant.",
  },
  {
    title: "Inspire Scholarship for Higher Education (SHE)",
    provider: "Department of Science & Technology, Govt. of India",
    amount: "₹80,000 per year",
    deadline: "31st December 2026",
    deadlineDate: new Date("2026-12-31"),
    eligibility: "Students in top 1% of Class 12 board results pursuing B.Sc/B.S/Int. M.Sc in Natural Sciences including Agriculture, Botany, Zoology, Environmental Science. Age below 22 years.",
    category: "Merit Based",
    description: "Scholarship for meritorious students pursuing natural sciences. Highly relevant for children of farmers pursuing agricultural sciences, botany, environmental science, or related fields at undergraduate level.",
    requiredDocuments: ["Class 12 Marksheet (top 1% proof)", "Aadhaar Card", "Admission Letter", "Bank Passbook", "Income Certificate"],
    applicationLink: "https://online-inspire.gov.in",
    officialLink: "https://online-inspire.gov.in",
    benefits: "₹80,000/year for 5 years of B.Sc/Int. M.Sc studies.",
  },
  {
    title: "Begum Hazrat Mahal National Scholarship (Minority Girls)",
    provider: "Maulana Azad Education Foundation, Govt. of India",
    amount: "₹5,000 – ₹6,000 per year",
    deadline: "30th September 2026",
    deadlineDate: new Date("2026-09-30"),
    eligibility: "Minority community girls (Muslim, Christian, Sikh, Buddhist, Jain, Zoroastrian) from Classes 9–12. Family income below ₹2 Lakh/year. Minimum 50% marks in previous class.",
    category: "Higher Education",
    description: "Scholarship for minority community girls from economically weaker sections including farming families. Covers Classes 9–12 to prevent dropout and encourage continuation of education.",
    requiredDocuments: ["Aadhaar Card", "Minority Community Certificate", "Income Certificate", "Previous Marksheet", "Bank Passbook", "School Bonafide Certificate"],
    applicationLink: "https://scholarships.gov.in",
    officialLink: "https://maef.nic.in",
    benefits: "₹5,000/year for Class 9–10; ₹6,000/year for Class 11–12.",
  },
];


const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    await Scholarship.deleteMany({});

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    await Scholarship.insertMany(scholarships);
    console.log(`✅ ${scholarships.length} scholarships seeded`);

    // Create admin user
    const adminExists = await User.findOne({ email: "admin@krishiseva.com" });
    if (!adminExists) {
      await User.create({
        firstName: "Admin",
        lastName: "KrishiSeva",
        email: "admin@krishiseva.com",
        password: "Admin@1234",
        role: "admin",
        isVerified: true,
        sellerStatus: "none",
      });
      console.log("✅ Admin user created: admin@krishiseva.com / Admin@1234");
    }

    // Create demo farmer/seller
    const demoExists = await User.findOne({ email: "rajesh@example.com" });
    if (!demoExists) {
      await User.create({
        firstName: "Rajesh",
        lastName: "Kumar",
        email: "rajesh@example.com",
        password: "Farmer@1234",
        phone: "+91 98765 43210",
        farmerId: "MH-88291",
        landSize: 12.5,
        primaryCrop: "Sugarcane",
        address: "Village Sangvi, District Pune, MH",
        district: "Pune",
        state: "Maharashtra",
        role: "farmer",
        isVerified: true,
        sellerStatus: "approved",
      });
      console.log("✅ Demo farmer created: rajesh@example.com / Farmer@1234");
    }

    // Create demo regular user
    const userExists = await User.findOne({ email: "user@example.com" });
    if (!userExists) {
      await User.create({
        firstName: "Priya",
        lastName: "Sharma",
        email: "user@example.com",
        password: "User@1234",
        phone: "+91 87654 32109",
        role: "user",
        isVerified: true,
        sellerStatus: "none",
      });
      console.log("✅ Demo user created: user@example.com / User@1234");
    }

    console.log("\n🌾 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
