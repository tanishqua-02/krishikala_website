const SYSTEM_PROMPT = `You are "KrishiBot" — the official AI assistant for KrishiSeva, India's digital platform for farmers.

## Platform How-To Guide
1. How to Shop: /shop → Add to Cart → /cart → Checkout → Fill address → COD or Razorpay → Place Order. Free shipping above Rs.2000.
2. How to Sell: Register as Farmer → Admin verifies → Go to /seller/products → Add New Product → Submit for review → Goes live after admin approval.
3. How to Apply Scholarship: /scholarships → Click scholarship → View details → Apply Now → Track in /dashboard.
4. How to Search Land Records: /land-records → Select type → Enter District, Taluka, Village, Survey No → Search.
5. How to Track Orders: /dashboard → Recent Orders section. Full history in /profile → Purchase History.
6. How to Check Notifications: Click bell icon in navbar for product approvals, rejections, account updates.

## Platform Offerings
- Agriculture Shop: Seeds, Fertilizers, Tools, Irrigation, Pesticides, Homemade products (pickles, jams, honey, ghee, turmeric). Free shipping above Rs.2000.
- Scholarships: Post-Matric Maharashtra, NABARD Agri-Business, Krishi Ratna Merit, PM-KISAN Education Support.
- Land Records: 7/12 extract and Khateutara via Maharashtra Bhulekh.
- Government Schemes: PM-KISAN, PM Fasal Bima Yojana, Mudra Loans, Kisan Credit Card.
- Seller Portal: Verified farmers can list and sell products after admin approval.

## Rules
- Reply in the same language as the user (English/Hindi/Marathi).
- Be concise, practical, farmer-friendly. Max 150 words unless step-by-step needed.
- Never invent prices or scheme amounts. Never give medical/legal/financial advice.`;

export const chat = async (req, res) => {
  const { message, language = "en", history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: "Message is required." });

  // Auto-detect language
  const devanagari = /[\u0900-\u097F]/;
  let lang = language;
  if (devanagari.test(message)) {
    const marathiWords = ["बियाणे","सातबारा","शिष्यवृत्ती","खते","आहे","नमस्कार","कशी","करा","पाहिजे","तुमचे","आमचे"];
    lang = marathiWords.some(w => message.includes(w)) ? "mr" : "hi";
  }

  const messages = [
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: message.trim() },
  ];

  // Gemini (only if key looks valid)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
    try {
      const contents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, generationConfig: { maxOutputTokens: 512, temperature: 0.3 } }),
      });
      if (r.ok) {
        const d = await r.json();
        const reply = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return res.status(200).json({ success: true, reply, language: lang });
      }
    } catch (e) { console.error("Gemini error:", e.message); }
  }

  // Anthropic (only if key looks valid — starts with sk-ant-)
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-")) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const r = await client.messages.create({ model: "claude-3-5-haiku-20241022", max_tokens: 512, system: SYSTEM_PROMPT, messages });
      return res.status(200).json({ success: true, reply: r.content[0].text, language: lang });
    } catch (e) { console.error("Anthropic error:", e.message); }
  }

  // OpenAI (only if key looks valid — starts with sk-)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) {
    try {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await client.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages] });
      return res.status(200).json({ success: true, reply: r.choices[0].message.content, language: lang });
    } catch (e) { console.error("OpenAI error:", e.message); }
  }

  // ── Rule-based fallback ───────────────────────────────────────────────────
  const lowerMsg = message.toLowerCase();

  const R = {
    how_shop: {
      en: "**How to Shop on KrishiSeva:**\n1. Go to [Shop](/shop)\n2. Browse or search products\n3. Click **Add to Cart**\n4. Go to [Cart](/cart) → **Proceed to Checkout**\n5. Fill shipping address\n6. Choose **COD** or **Razorpay**\n7. Click **Place Order** ✅\n\nFree shipping on orders above ₹2,000!",
      hi: "**KrishiSeva पर खरीदारी कैसे करें:**\n1. [दुकान](/shop) पर जाएं → उत्पाद खोजें\n2. **कार्ट में जोड़ें** → [कार्ट](/cart) → **चेकआउट**\n3. पता भरें → COD या Razorpay चुनें\n4. **ऑर्डर दें** ✅\n\n₹2,000 से अधिक पर मुफ्त डिलीवरी!",
      mr: "**KrishiSeva वर खरेदी कशी करावी:**\n1. [दुकान](/shop) ला जा → उत्पादने शोधा\n2. **कार्टमध्ये जोडा** → [कार्ट](/cart) → **चेकआउट**\n3. पत्ता भरा → COD किंवा Razorpay निवडा\n4. **ऑर्डर द्या** ✅\n\n₹२,००० पेक्षा जास्त खरेदीवर मोफत डिलिव्हरी!",
    },
    how_sell: {
      en: "**How to Sell on KrishiSeva:**\n1. [Register](/register) as a **Farmer**\n2. Wait for **admin verification** (you'll get a 🔔 notification)\n3. Once approved → go to [My Products](/seller/products)\n4. Click **Add New Product** → fill details\n5. Submit → Admin reviews → Product goes **live** 🌾",
      hi: "**KrishiSeva पर बेचने के लिए:**\n1. **किसान** के रूप में [रजिस्टर](/register) करें\n2. एडमिन वेरिफिकेशन का इंतजार करें (🔔 नोटिफिकेशन मिलेगा)\n3. अनुमोदन के बाद [मेरे उत्पाद](/seller/products) → **नया उत्पाद जोड़ें**\n4. विवरण भरें → सबमिट करें → एडमिन अनुमोदन के बाद लाइव 🌾",
      mr: "**KrishiSeva वर विकण्यासाठी:**\n1. **शेतकरी** म्हणून [नोंदणी](/register) करा\n2. अॅडमिन व्हेरिफिकेशनची प्रतीक्षा करा (🔔 नोटिफिकेशन येईल)\n3. मंजुरीनंतर [माझी उत्पादने](/seller/products) → **नवीन उत्पादन जोडा**\n4. तपशील भरा → सबमिट करा → अॅडमिन मंजुरीनंतर लाइव्ह 🌾",
    },
    how_scholarship: {
      en: "**How to Apply for Scholarships:**\n1. Go to [Scholarships](/scholarships)\n2. Search/filter scholarships\n3. Click a scholarship to see **full details & eligibility**\n4. Click **Apply Now** (login required)\n5. Track status in [Dashboard](/dashboard) ✅",
      hi: "**छात्रवृत्ति के लिए आवेदन:**\n1. [छात्रवृत्ति](/scholarships) पर जाएं\n2. छात्रवृत्ति खोजें और विवरण देखें\n3. **अभी आवेदन करें** पर क्लिक करें (लॉगिन आवश्यक)\n4. [डैशबोर्ड](/dashboard) में स्थिति ट्रैक करें ✅",
      mr: "**शिष्यवृत्तीसाठी अर्ज:**\n1. [शिष्यवृत्ती](/scholarships) वर जा\n2. शिष्यवृत्ती शोधा आणि तपशील पाहा\n3. **आता अर्ज करा** वर क्लिक करा (लॉगिन आवश्यक)\n4. [डॅशबोर्ड](/dashboard) मध्ये स्थिती तपासा ✅",
    },
    how_track: {
      en: "**Track Your Order:**\n1. Go to [Dashboard](/dashboard) → Recent Orders\n2. Status: Placed → Confirmed → Processing → Shipped → **Delivered**\n3. Full history: [Profile](/profile) → Purchase History tab",
      hi: "**ऑर्डर ट्रैक करें:**\n1. [डैशबोर्ड](/dashboard) → हाल के ऑर्डर\n2. स्थिति: रखा → पुष्टि → प्रसंस्करण → भेजा → **डिलीवर**\n3. पूरा इतिहास: [प्रोफ़ाइल](/profile) → खरीद इतिहास",
      mr: "**ऑर्डर ट्रॅक करा:**\n1. [डॅशबोर्ड](/dashboard) → अलीकडील ऑर्डर्स\n2. स्थिती: ठेवला → पुष्टी → प्रक्रिया → पाठवला → **डिलिव्हर**\n3. संपूर्ण इतिहास: [प्रोफाइल](/profile) → खरेदी इतिहास",
    },
    scholarships: {
      en: "KrishiSeva has 4 active scholarships:\n- **Post-Matric Scholarship (Maharashtra)**\n- **NABARD Agri-Business Fellowship**\n- **Krishi Ratna Merit Scholarship**\n- **PM-KISAN Education Support**\n\nVisit [Scholarships](/scholarships) to apply!",
      hi: "KrishiSeva पर 4 छात्रवृत्तियां उपलब्ध हैं:\n- पोस्ट-मैट्रिक (महाराष्ट्र)\n- NABARD कृषि-व्यवसाय\n- कृषि रत्न मेरिट\n- PM-KISAN शिक्षा सहायता\n\n[छात्रवृत्ति](/scholarships) पर आवेदन करें!",
      mr: "KrishiSeva वर ४ शिष्यवृत्ती उपलब्ध आहेत:\n- पोस्ट-मॅट्रिक (महाराष्ट्र)\n- NABARD कृषी-व्यवसाय\n- कृषी रत्न गुणवत्ता\n- PM-KISAN शैक्षणिक मदत\n\n[शिष्यवृत्ती](/scholarships) वर अर्ज करा!",
    },
    seeds: {
      en: "Our shop has premium seeds: **Wheat (₹450/kg)**, **Hybrid Tomato (₹150/pkt)**, **Basmati Rice**, **Cotton BT**, **Onion**, **Maize**, **Soybean**, **Chilli** and more. Visit [Shop](/shop)!",
      hi: "हमारी दुकान में: **गेहूं (₹450/kg)**, **हाइब्रिड टमाटर (₹150/pkt)**, बासमती चावल, BT कपास, प्याज, मक्का, सोयाबीन, मिर्च और अधिक। [दुकान](/shop) पर जाएं!",
      mr: "आमच्या दुकानात: **गहू (₹450/kg)**, **हायब्रीड टोमॅटो (₹150/pkt)**, बासमती तांदूळ, BT कापूस, कांदा, मका, सोयाबीन, मिरची आणि बरेच काही. [दुकान](/shop) ला भेट द्या!",
    },
    homemade: {
      en: "We also sell farm-fresh homemade products: **Mango Aachar (₹180)**, **Mixed Veg Pickle**, **Wild Honey (₹450)**, **Desi Ghee (₹680)**, **Strawberry Jam**, **Turmeric Powder**, **Jaggery (Gul)**, **Kokum Syrup** and more! Visit [Shop](/shop) → Others category.",
      hi: "हम घर के बने उत्पाद भी बेचते हैं: **आम का अचार (₹180)**, **मिश्रित सब्जी अचार**, **जंगली शहद (₹450)**, **देसी घी (₹680)**, **स्ट्रॉबेरी जैम**, **हल्दी पाउडर**, **गुड़**, **कोकम सिरप** और अधिक! [दुकान](/shop) → Others श्रेणी।",
      mr: "आम्ही घरगुती उत्पादनेही विकतो: **आंब्याचे लोणचे (₹180)**, **मिश्र भाजी लोणचे**, **जंगली मध (₹450)**, **देशी तूप (₹680)**, **स्ट्रॉबेरी जॅम**, **हळद पावडर**, **गूळ**, **कोकम सरबत** आणि बरेच काही! [दुकान](/shop) → Others श्रेणी.",
    },
    fertilizers: {
      en: "Our fertilizers: **Organic NPK**, **Vermicompost**, **DAP (50kg)**, **Urea (45kg)**, **Jeevamrit Liquid**. All available at [Shop](/shop)!",
      hi: "हमारे खाद: **ऑर्गेनिक NPK**, **वर्मीकंपोस्ट**, **DAP (50kg)**, **यूरिया (45kg)**, **जीवामृत**। [दुकान](/shop) पर उपलब्ध!",
      mr: "आमची खते: **सेंद्रिय NPK**, **वर्मीकंपोस्ट**, **DAP (50kg)**, **युरिया (45kg)**, **जीवामृत**. [दुकान](/shop) वर उपलब्ध!",
    },
    tools: {
      en: "Tools & equipment: **Power Tiller 5HP**, **Knapsack Sprayer 16L**, **Sickle Set**, **Soil pH Kit**, **Grafting Knife**, **Drip Irrigation Kit**, **Rain Gun Sprinkler**, **Solar Pump 1HP**. Shop at [Agriculture Shop](/shop)!",
      hi: "औजार और उपकरण: **पावर टिलर 5HP**, **नैपसैक स्प्रेयर 16L**, **दरांती सेट**, **मिट्टी pH किट**, **ड्रिप किट**, **रेन गन**, **सोलर पंप 1HP**। [दुकान](/shop) पर खरीदें!",
      mr: "अवजारे आणि उपकरणे: **पॉवर टिलर 5HP**, **नॅपसॅक स्प्रेयर 16L**, **विळा सेट**, **माती pH किट**, **ठिबक संच**, **रेन गन**, **सोलर पंप 1HP**. [दुकान](/shop) वर खरेदी करा!",
    },
    land: {
      en: "Search your **7/12 extract (Satbara)** or **Khateutara** records online via Maharashtra Bhulekh integration. Go to [Land Records](/land-records).",
      hi: "महाराष्ट्र भूलेख के माध्यम से अपना **7/12 उद्धरण** या **खातेउतारा** ऑनलाइन खोजें। [भूमि रिकॉर्ड](/land-records) पर जाएं।",
      mr: "महाराष्ट्र भूलेखद्वारे तुमचा **७/१२ उतारा** किंवा **खातेउतारा** ऑनलाइन शोधा. [जमीन अभिलेख](/land-records) वर जा.",
    },
    schemes: {
      en: "Government schemes available:\n- **PM-KISAN**: ₹6,000/year to farmers\n- **PM Fasal Bima**: Crop insurance\n- **Kisan Credit Card (KCC)**\n- **MUDRA Loans** up to ₹10 Lakh\n\nDetails at [Sarkari Yojana](/sarkari-yojana).",
      hi: "सरकारी योजनाएं:\n- **PM-KISAN**: ₹6,000/वर्ष\n- **PM फसल बीमा**: फसल सुरक्षा\n- **किसान क्रेडिट कार्ड**\n- **मुद्रा लोन** ₹10 लाख तक\n\n[सरकारी योजनाएं](/sarkari-yojana) पर देखें।",
      mr: "सरकारी योजना:\n- **PM-KISAN**: वर्षाला ₹६,०००\n- **PM Fasal Bima**: पीक विमा\n- **किसान क्रेडिट कार्ड**\n- **मुद्रा कर्ज** ₹१० लाखांपर्यंत\n\n[सरकारी योजना](/sarkari-yojana) वर पाहा.",
    },
    orders: {
      en: "Orders are delivered in **3–5 business days**. We offer **COD** and **Razorpay** (UPI/Cards). Free shipping above ₹2,000. 7-day return on tools. Track orders at [Dashboard](/dashboard).",
      hi: "ऑर्डर **3-5 दिनों** में डिलीवर होते हैं। **COD** और **Razorpay** उपलब्ध है। ₹2,000 से अधिक पर मुफ्त डिलीवरी। औजारों पर 7-दिन वापसी। [डैशबोर्ड](/dashboard) पर ट्रैक करें।",
      mr: "ऑर्डर **३-५ दिवसांत** डिलिव्हर होतात. **COD** आणि **Razorpay** उपलब्ध. ₹२,००० पेक्षा जास्त खरेदीवर मोफत डिलिव्हरी. अवजारांवर ७ दिवस परतावा. [डॅशबोर्ड](/dashboard) वर ट्रॅक करा.",
    },
    support: {
      en: "Need help? Contact **KrishiSeva Support**:\n📞 **1800-123-4567** (Mon–Sat, 9AM–6PM)\n✉️ **support@krishiseva.in**\nWe're always here for our farming community!",
      hi: "मदद चाहिए? **KrishiSeva सपोर्ट** से संपर्क करें:\n📞 **1800-123-4567** (सोम–शनि, 9AM–6PM)\n✉️ **support@krishiseva.in**",
      mr: "मदत हवी? **KrishiSeva सपोर्ट**शी संपर्क साधा:\n📞 **1800-123-4567** (सोम–शनि, सकाळी ९–संध्याकाळी ६)\n✉️ **support@krishiseva.in**",
    },
    greetings: {
      en: "Hello! I'm **KrishiBot** 🌾, your KrishiSeva assistant. I can help you with:\n- 🛒 How to shop\n- 🏪 How to sell products\n- 🎓 Scholarships\n- 📋 Land records\n- 🏛️ Government schemes\n- 📦 Order tracking\n\nWhat would you like to know?",
      hi: "नमस्ते! मैं **KrishiBot** 🌾 हूँ। मैं इनमें मदद कर सकता हूँ:\n- 🛒 खरीदारी कैसे करें\n- 🏪 उत्पाद कैसे बेचें\n- 🎓 छात्रवृत्ति\n- 📋 भूमि रिकॉर्ड\n- 🏛️ सरकारी योजनाएं\n- 📦 ऑर्डर ट्रैकिंग\n\nआप क्या जानना चाहते हैं?",
      mr: "नमस्कार! मी **KrishiBot** 🌾 आहे. मी यात मदत करू शकतो:\n- 🛒 खरेदी कशी करावी\n- 🏪 उत्पादने कशी विकावीत\n- 🎓 शिष्यवृत्ती\n- 📋 जमीन अभिलेख\n- 🏛️ सरकारी योजना\n- 📦 ऑर्डर ट्रॅकिंग\n\nतुम्हाला काय जाणून घ्यायचे आहे?",
    },
    agri_advice: {
      en: "Yellowing leaves are often caused by **Nitrogen deficiency** (use Urea or NPK from our [Shop](/shop)), over-watering, or fungal disease (use neem-based pesticide or copper oxychloride). Ensure good soil drainage!",
      hi: "पत्तों का पीला होना अक्सर **नाइट्रोजन की कमी** (यूरिया या NPK उपयोग करें), अधिक पानी, या फफूंद रोग (नीम तेल या कॉपर ऑक्सीक्लोराइड) के कारण होता है। मिट्टी में उचित जल निकासी सुनिश्चित करें!",
      mr: "पाने पिवळी पडणे हे **नायट्रोजनच्या कमतरतेमुळे** (युरिया किंवा NPK वापरा), जास्त पाणी, किंवा बुरशीजन्य रोगामुळे (निम तेल किंवा कॉपर ऑक्सीक्लोराइड) होते. जमिनीतील पाण्याचा निचरा योग्य ठेवा!",
    },
    default: {
      en: "I can help you with shopping, selling products, scholarships, land records, government schemes, or order tracking. What would you like to know? You can also ask farming questions like 'why are my tomato leaves yellow'.",
      hi: "मैं खरीदारी, उत्पाद बेचने, छात्रवृत्ति, भूमि रिकॉर्ड, सरकारी योजनाओं या ऑर्डर ट्रैकिंग में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?",
      mr: "मी खरेदी, उत्पादने विकणे, शिष्यवृत्ती, जमीन अभिलेख, सरकारी योजना किंवा ऑर्डर ट्रॅकिंगमध्ये मदत करू शकतो. तुम्हाला काय जाणून घ्यायचे आहे?",
    },
  };

  // Intent detection
  let intent = "default";
  if (/how.*(shop|buy|order|purchase|kharide|खरेदी|कैसे खरीद)/i.test(message) || /खरेदी कशी|कसे खरेदी|कैसे खरीदें/.test(message)) intent = "how_shop";
  else if (/how.*(sell|upload|list|product|becho|विकणे|बेचना)/i.test(message)) intent = "how_sell";
  else if (/how.*(scholarship|apply.*scholar|शिष्यवृत्ती.*कशी|छात्रवृत्ति.*कैसे)/i.test(message)) intent = "how_scholarship";
  else if (/track|order status|where.*order|ऑर्डर कुठे|ऑर्डर कहाँ/i.test(message)) intent = "how_track";
  else if (/aachar|pickle|jam|honey|ghee|turmeric|jaggery|gul|kokum|homemade|घरगुती|अचार|जैम|शहद|घी|हल्दी|गुड़/i.test(message)) intent = "homemade";
  else if (/scholarship|education|student|nabard|ratna|छात्रवृत्ति|शिष्यवृत्ती|शिक्षण/i.test(message)) intent = "scholarships";
  else if (/seed|wheat|tomato|rice|cotton|sugarcane|onion|maize|soybean|chilli|बीज|बियाणे|गहू|टमाटर/i.test(message)) intent = "seeds";
  else if (/yellow|leaf|leaves|disease|pest|soil|grow|पीला|रोग|पाने|माती/i.test(message)) intent = "agri_advice";
  else if (/fertilizer|urea|npk|compost|vermi|dap|jeevamrit|खाद|खते|युरिया/i.test(message)) intent = "fertilizers";
  else if (/tool|tiller|sprayer|sickle|ph kit|grafting|irrigation|drip|pump|sprinkler|औजार|सिंचाई|अवजारे/i.test(message)) intent = "tools";
  else if (/land|7\/12|satbara|khateutara|bhulekh|record|जमीन|सातबारा/i.test(message)) intent = "land";
  else if (/scheme|yojana|pm.?kisan|insurance|loan|kcc|mudra|योजना|विमा/i.test(message)) intent = "schemes";
  else if (/order|pay|cod|delivery|shipping|return|refund|ऑर्डर|डिलिव्हरी/i.test(message)) intent = "orders";
  else if (/contact|support|phone|help|helpline|संपर्क|मदत/i.test(message)) intent = "support";
  else if (/hello|hi\b|hey|namaste|नमस्कार|नमस्ते|who are you/i.test(message)) intent = "greetings";

  const reply = R[intent]?.[lang] || R[intent]?.en || R.default.en;
  res.status(200).json({ success: true, reply, language: lang });
};
