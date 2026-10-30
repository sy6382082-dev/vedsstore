# Brother — E-Commerce Website (Phase 3 Master Implementation)

A full-stack, enterprise-grade e-commerce application built with **Next.js 16 (App Router + Turbopack)**, **TypeScript 5**, **Tailwind CSS 4**, and **Prisma ORM 5**.

Official brand: **Brother** (`brother` lowercase wordmark in authentic brand blue `#0047BA`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 2. Install Dependencies
```bash
cd nexacart
npm install
```

### 3. Environment Configuration
Ensure `.env` contains:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Database Setup & Idempotent Seeding
```bash
# Push schema changes to SQLite (or run migrations)
npx prisma db push

# Idempotently seed categories, products, and 4-Pack bundle relations
npm run db:seed
```

### 5. Secure Admin Provisioning
Provision the initial administrator securely via CLI:
```bash
npm run admin:provision admin@brother.in YourSecurePassword123!
```
*Note: Public admin registration is strictly disabled. Roles cannot be escalated from the customer portal.*

### 6. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🏷️ Brand & Media Asset Reference

- **Store Name**: **Brother** (`at your side • India`)
- **Visual Identity**: Official lowercase wordmark `brother` rendered in authentic royal blue (`#0047BA`).
- **Product Packaging Asset**: `public/images/brother-ink-products.jpg` (used as the bundle pack image for the 4-colour ink set and category banner).

---

## 🖨️ Database Catalog & 5 Core Brother Products

The database is seeded idempotently via `prisma/seed.ts` using `upsert`. The 5 primary listings feature exact OEM specifications:

| Product Name | SKU | Color | Demo Price | MRP | Inventory Type |
|---|---|---|---|---|---|
| **Brother BT5000C Cyan Ink Bottle** | `BRO-BT5000C` | Blue/Cyan | ₹499 | ₹799 | Physical (23 units) |
| **Brother BT5000M Magenta Ink Bottle** | `BRO-BT5000M` | Red/Magenta | ₹499 | ₹799 | Physical (18 units) |
| **Brother BT5000Y Yellow Ink Bottle** | `BRO-BT5000Y` | Yellow | ₹499 | ₹799 | Physical (31 units) |
| **Brother BTD60BK Black Ink Bottle** | `BRO-BTD60BK` | Black | ₹599 | ₹899 | Physical (41 units) |
| **Brother BT5000 Ink Bottle Set — Pack of 4** | `BRO-BT5000-SET4` | CMYK 4-Pack | ₹1,899 | ₹2,999 | **Virtual Dynamic** (`min(components)` = 18 units) |

*All prices and stock levels are designated demo values.*

---

## 📦 Virtual Bundle Inventory Architecture

- **Zero Duplicate Physical Stock**: The bundle product `brother-bt5000-set4` holds no independent warehouse inventory.
- **Dynamic Calculation**: Available bundle inventory is computed dynamically via `src/lib/inventory.ts`:
  $$\text{Bundle Stock} = \min(\text{Stock}_{\text{Cyan}}, \text{Stock}_{\text{Magenta}}, \text{Stock}_{\text{Yellow}}, \text{Stock}_{\text{Black}})$$
- **Stock Depletion Safety**: If any single component bottle reaches `0`, the 4-Pack bundle automatically displays as **Out of Stock** with purchases blocked server-side.
- **Storefront Display**: The product detail page for the bundle lists all 4 component bottles, each with real-time stock status, SKU, color indicator, and thumbnail.

---

## 🛡️ Administrative Console (`/admin`)

Access is restricted exclusively to authenticated users with `role: "ADMIN"`. Protected both at the edge via **Next.js Middleware/Proxy** and on every API endpoint via `requireAdmin()`.

### Admin Capabilities:
1. **Catalog Overview & Metrics**: Real-time KPI cards for Total Products, Published Items, Low Stock Alerts, and Bundles.
2. **Product CRUD**:
   - Create new products with title, SKU, category, price, MRP, stock count, low stock alert trigger, description, and status.
   - Edit existing products with automatic discount percentage computation.
   - Safe deletion: permanently deletes unpurchased items, or gracefully archives products referencing historical orders to maintain ledger integrity.
3. **Status Switcher**: Toggle items between `published` (visible on storefront), `draft` (hidden), and `archived` (soft-deleted).
4. **Safe Image Uploads (`/api/admin/upload`)**:
   - Validates MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`).
   - Restricts file sizes to 5MB.
   - Writes sanitized filenames to `public/uploads/` with instant UI preview.
5. **Confirmation Dialogs**: Built-in modal dialogs for deletion and state changes.

---

## 🛒 Guest Shopping & Server-Validated Checkout

- **Frictionless Guest Experience**: Visitors can browse, search, filter, adjust quantities, and view product pages without logging in.
- **Session Cart Persistence**: Guest items remain preserved in `localStorage` under `brother_cart` (only product IDs and quantities; zero sensitive personal data stored).
- **Checkout Authentication Gate**:
  - When a guest proceeds to checkout (`/checkout`), the gate displays:
    > *"Please log in or create an account to continue with your order."*
  - Links to `/auth/login?redirect=/checkout` and `/auth/register?redirect=/checkout` ensure seamless return to `/checkout` after authentication.
  - The cart remains preserved and ready for review upon login.
- **Server Validation (`POST /api/checkout/validate`)**:
  - Validates current database prices (preventing client-side tampering).
  - Checks component inventory for individual items and multi-pack bundles.
  - Generates authoritative subtotal, 18% GST breakdown, and shipping (FREE above ₹499, otherwise ₹49).
- **Phase 3 Scope Notice**: Clean simulation pre-order check with verified reference ID. No real credit card charges or fake orders are fabricated.

---

## 🧪 Verification & Quality Assurance

To verify code quality and build stability:

```bash
# Run ESLint (0 errors, 0 warnings)
npm run lint

# Run Production Build (all 28 routes compiled)
npm run build

# Test Database Seeding (idempotent run)
npm run db:seed
```

---

## 🗺️ Implementation Summary & Roadmap

### Completed in Phase 3:
- [x] Official Brother branding (`brother` lowercase blue wordmark `#0047BA`).
- [x] 5 core Brother products seeded with SKUs (`BRO-BT5000C`, `BRO-BT5000M`, `BRO-BT5000Y`, `BRO-BTD60BK`, `BRO-BT5000-SET4`).
- [x] Virtual bundle inventory engine (`computeProductStock`, `validateServerCart`).
- [x] Secure `/admin` dashboard with full product CRUD and live status controls.
- [x] Safe multipart image upload endpoint (`/api/admin/upload`).
- [x] First admin provisioning script (`npm run admin:provision`).
- [x] Guest shopping persistence and authentication checkout gate.
- [x] Server-side checkout validation endpoint (`/api/checkout/validate`).
- [x] Storefront bundle breakdown display on product detail pages.

### Planned for Phase 4:
- [ ] Live payment gateway integration (Razorpay / UPI / Netbanking / Cards).
- [ ] Automated SMS / WhatsApp OTP verification in production.
- [ ] Courier shipping tracking and logistics webhook integration.
- [ ] Customer PDF invoices and return management.
