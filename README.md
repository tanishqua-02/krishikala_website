# 🌾 KrishiSeva v3.0 — Full Stack Application

A comprehensive digital platform for Indian farmers: e-commerce, OTP login, AI chatbot, ML recommendations, Razorpay payments, and government scheme discovery.

## 📁 Project Structure

```
krishiseva-fullstack/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Password + OTP passwordless auth
│   │   ├── cartController.js     # Cart CRUD
│   │   ├── chatController.js     # AI chatbot (Claude/OpenAI/mock)
│   │   ├── landRecordController.js
│   │   ├── orderController.js    # COD + Razorpay checkout + webhooks
│   │   ├── productController.js  # Products + Trending + Frequently Bought
│   │   └── scholarshipController.js
│   ├── middleware/auth.js        # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── Cart.js
│   │   ├── LandRecord.js
│   │   ├── Order.js              # includes razorpayOrderId, razorpayPaymentId
│   │   ├── Product.js
│   │   ├── ProductMetric.js      # ML interaction tracking (click/search/purchase)
│   │   ├── Scholarship.js
│   │   └── User.js               # includes otp, otpExpires, isVerified
│   ├── routes/
│   │   ├── auth.js               # /send-otp, /verify-otp endpoints
│   │   ├── cart.js
│   │   ├── chat.js
│   │   ├── landRecords.js
│   │   ├── orders.js             # /create-razorpay-order, /verify-razorpay
│   │   ├── products.js           # /trending, /:id/frequently-bought
│   │   └── scholarships.js
│   ├── server.js                 # Entry point (webhook registered before json())
│   ├── seed.js
│   ├── package.json
│   └── .env.example              # All environment variables documented
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.tsx   # otpSent state, sendOtp(), verifyOtp()
        │   └── CartContext.tsx   # Live cart sync
        ├── lib/api.ts            # Centralised fetch (all endpoints)
        ├── components/
        │   ├── ChatbotWidget.tsx # Floating EN/HI/MR chatbot
        │   ├── Navbar.tsx        # + Sarkari Yojana link
        │   └── Footer.tsx
        └── pages/
            ├── Home.tsx          # Trending Products Carousel + 4-feature grid
            ├── Shop.tsx          # → links to ProductDetail
            ├── ProductDetail.tsx # Frequently Bought Together bundle calculator
            ├── Checkout.tsx      # 2-step flow: Shipping → Razorpay / COD
            ├── SarkariYojana.tsx # MSP ticker + 6-scheme expandable cards
            ├── Login.tsx         # Password mode + OTP 6-digit mode with countdown
            ├── Register.tsx
            ├── Cart.tsx
            ├── Scholarships.tsx
            ├── LandRecords.tsx
            ├── Dashboard.tsx
            └── Profile.tsx
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB URI (free at [mongodb.com/atlas](https://mongodb.com/atlas))

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET (required)
# Fill in RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET for payments (optional: test mode works)
npm run seed    # Seeds products, scholarships, demo accounts
npm run dev     # → http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
# .env.example already has VITE_API_URL=http://localhost:5000/api
npm run dev     # → http://localhost:3000
```

## 🔑 Demo Accounts (after seeding)

| Role   | Email                    | Password    |
|--------|--------------------------|-------------|
| Farmer | rajesh@example.com       | Farmer@1234 |
| Admin  | admin@krishiseva.com     | Admin@1234  |

## ✨ Feature Overview

### Step 1 — OTP Passwordless Authentication
- `POST /api/auth/send-otp` — generates cryptographic 6-digit OTP, hashes with bcrypt, sets 5-min TTL
- `POST /api/auth/verify-otp` — compares against hash, issues JWT on success
- Frontend: Login page has **Password / OTP toggle** with 6-box digit input, countdown timer, and resend
- Dev mode: OTP printed to console (`[DEV OTP]` prefix); swap in Twilio/MSG91/Brevo for production

### Step 2 — Multilingual AI Chatbot
- `POST /api/chat` — context-aware system prompt covering all KrishiSeva products/services
- Supports English, Hindi (हिंदी), Marathi (मराठी) auto-detect + manual switch
- Floating widget fixed to `bottom-right`; smooth typing animation; 10-message history window
- Plug in Anthropic Claude (`@anthropic-ai/sdk`) or OpenAI in `chatController.js` — stubs are ready

### Step 3 — ML Recommendation Engines
- **ProductMetric** model tracks `click`, `search`, `addToCart`, `purchase` events
- `GET /api/products/trending` — 7-day rolling aggregation, falls back to top-rated if no metrics
- `GET /api/products/:id/frequently-bought` — market basket analysis on completed orders, top 3
- Home page: horizontal scrollable **Trending Carousel** with auto-scroll arrows
- Product detail page: **"Frequently Bought Together"** section with checkbox bundle selection and live price calculator

### Step 4 — Razorpay Checkout
- `POST /api/orders/create-razorpay-order` — server computes totals from DB (never trust client), creates pending Order, returns signed receipt
- `POST /api/orders/verify-razorpay` — HMAC-SHA256 signature verification, updates order to `paid`
- `POST /api/webhooks/razorpay` — un-guarded webhook, raw-body HMAC check, handles `payment.captured`
- Frontend: **2-step checkout** (Shipping → Payment); Razorpay JS loaded dynamically; supports UPI / Card / NetBanking; cart cleared on success
- Uses mock Razorpay order IDs in dev (`order_dev_xxx`); swap comments in `orderController.js` to go live

### Step 5 — Sarkari Yojana Hub
- Standalone route `/sarkari-yojana` with animated MSP commodity ticker banner
- 6 fully documented schemes: PM-KISAN, PM Fasal Bima, MUDRA, Kisan Credit Card, PKVY, PM Kisan Maan-Dhan
- Each card: category badge, tagline, stats, expandable eligibility + how-to-apply section
- Category filter tabs + search bar; deep-links to official government portals

## 📡 API Reference

| Method | Route                           | Auth     | Description                              |
|--------|---------------------------------|----------|------------------------------------------|
| POST   | /api/auth/register              | —        | Register farmer                          |
| POST   | /api/auth/login                 | —        | Password login                           |
| POST   | /api/auth/send-otp              | —        | Send 6-digit OTP via email/SMS           |
| POST   | /api/auth/verify-otp            | —        | Verify OTP, issue JWT                    |
| GET    | /api/auth/me                    | ✅ JWT   | Get current user                         |
| PUT    | /api/auth/update-profile        | ✅ JWT   | Update profile                           |
| PUT    | /api/auth/change-password       | ✅ JWT   | Change password                          |
| GET    | /api/products                   | —        | List + filter products                   |
| GET    | /api/products/trending          | —        | ML trending engine (7-day)               |
| GET    | /api/products/:id               | —        | Product detail (logs click metric)       |
| GET    | /api/products/:id/frequently-bought | —    | Market basket recommendations (top 3)    |
| GET    | /api/cart                       | ✅ JWT   | Get cart with live product prices        |
| POST   | /api/cart/add                   | ✅ JWT   | Add item to cart                         |
| PUT    | /api/cart/update                | ✅ JWT   | Update quantity                          |
| DELETE | /api/cart/remove/:productId     | ✅ JWT   | Remove item                              |
| DELETE | /api/cart/clear                 | ✅ JWT   | Clear cart                               |
| POST   | /api/orders                     | ✅ JWT   | Create COD order                         |
| POST   | /api/orders/create-razorpay-order | ✅ JWT | Create Razorpay order receipt            |
| POST   | /api/orders/verify-razorpay     | ✅ JWT   | Verify Razorpay HMAC signature           |
| GET    | /api/orders                     | ✅ JWT   | My orders                                |
| GET    | /api/orders/:id                 | ✅ JWT   | Order detail                             |
| POST   | /api/webhooks/razorpay          | ⚡ Raw   | Razorpay payment.captured webhook        |
| GET    | /api/scholarships               | —        | List scholarships                        |
| POST   | /api/land-records/search        | ✅ JWT   | Search land record                       |
| GET    | /api/land-records/my-records    | ✅ JWT   | Saved land records                       |
| POST   | /api/chat                       | —        | AI chatbot (EN/HI/MR)                    |
| GET    | /api/health                     | —        | Health check                             |

## 🛠 Tech Stack

**Backend:** Node.js 18, Express 4, MongoDB + Mongoose 8, JWT, bcryptjs, express-async-errors  
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, Sonner  
**Payments:** Razorpay (HMAC-SHA256 verification, webhook support)  
**Auth:** JWT Bearer tokens + OTP via bcrypt-hashed tokens with TTL  
**AI:** Claude (Anthropic) or GPT-4o-mini (OpenAI) — plug-and-play stubs  
**State:** React Context — AuthContext + CartContext  

## 🔌 Going Live Checklist

- [ ] Set `NODE_ENV=production` and strong `JWT_SECRET`
- [ ] Swap mock Razorpay IDs: uncomment `import Razorpay from "razorpay"` in `orderController.js`
- [ ] Add SMS gateway: uncomment Twilio/MSG91 block in `authController.js`
- [ ] Add AI: uncomment Anthropic/OpenAI block in `chatController.js`
- [ ] Register Razorpay webhook URL in Razorpay dashboard → `POST /api/webhooks/razorpay`
- [ ] Replace MSP ticker in `SarkariYojana.tsx` with live Agmarknet/data.gov.in API
- [ ] Add rate limiting (`express-rate-limit`) on OTP endpoints
- [ ] Move JWT from localStorage to `httpOnly` cookies for XSS protection
