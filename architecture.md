# Batouri Connect — Architecture & Database Design

A marketplace app for Cameroon: houses, shops, land, businesses, and artisans. This document covers the data model, system architecture, and a path to future features (payments, AI recommendations, ads) without a rewrite.

---

## 1. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile app | **React Native (Expo)** | One codebase for Android + iOS; Android is priority-one but iOS comes free later. Expo simplifies push notifications, camera/image upload, and OTA updates — useful in low-bandwidth areas. |
| Backend API | **Node.js + NestJS (or Express)** | TypeScript end-to-end with the app; easy to scale horizontally. |
| Database | **PostgreSQL** (primary) + **Redis** (cache/sessions) | Relational data (users, listings, transactions) benefits from real joins and constraints; Postgres also supports PostGIS for geo-search by city/neighborhood. |
| File storage | **S3-compatible object storage** (e.g. AWS S3 or local MinIO) | Listing photos, ID verification docs. |
| Search | **PostgreSQL full-text + PostGIS**, upgrade to **Meilisearch/Typesense** later | Cheap to start; swap in a dedicated search engine once listings volume grows. |
| Notifications | **Firebase Cloud Messaging (FCM)** | Free, reliable push on Android. |
| Auth | **JWT access + refresh tokens**, phone-number OTP via SMS gateway (e.g. Twilio or a local aggregator) | Many users will onboard by phone number rather than email in Cameroon. |
| Admin dashboard | **Next.js web app** hitting the same API | Lets staff moderate listings from a browser. |

This is a standard **3-tier architecture** (client → API → database) with clear service boundaries, so each piece (payments, search, notifications) can be swapped or scaled independently.

---

## 2. High-Level Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  Mobile App (RN)     │     │  Admin Web (Next.js)  │
│  Android-first       │     │  Moderation dashboard │
└──────────┬───────────┘     └──────────┬────────────┘
           │            HTTPS / REST or GraphQL
           ▼                            ▼
┌─────────────────────────────────────────────────┐
│              API Gateway / Backend (NestJS)       │
│  ┌───────────┐ ┌───────────┐ ┌─────────────────┐ │
│  │ Auth       │ │ Listings   │ │ Notifications    │ │
│  │ Service    │ │ Service    │ │ Service          │ │
│  ├───────────┤ ├───────────┤ ├─────────────────┤ │
│  │ Users      │ │ Search /   │ │ Admin /          │ │
│  │ Service    │ │ Geo        │ │ Moderation       │ │
│  └───────────┘ └───────────┘ └─────────────────┘ │
│         (future) Payments │ AI Recs │ Ads Service  │
└───────────────────┬───────────────────────────────┘
                     ▼
      ┌───────────────────────────────┐
      │ PostgreSQL (+ PostGIS)         │
      │ Redis (cache, sessions, queue) │
      │ S3 (photos, documents)         │
      │ FCM (push notifications)       │
      └───────────────────────────────┘
```

Each "service" can start as a module inside one NestJS app (a modular monolith) and be split into its own microservice later, once traffic justifies it. This avoids over-engineering early while keeping clean boundaries.

---

## 3. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| full_name | text | |
| phone_number | text, unique | primary login identifier |
| email | text, unique, nullable | |
| password_hash | text, nullable | null if phone-OTP only |
| preferred_language | enum('fr','en') | default 'fr' |
| role | enum('user','artisan','admin') | |
| profile_photo_url | text, nullable | |
| city | text | |
| neighborhood | text | |
| is_verified | boolean | phone/ID verified |
| created_at, updated_at | timestamp | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name_fr | text | e.g. "Maisons à louer" |
| name_en | text | e.g. "Houses for rent" |
| slug | text, unique | houses, shops, land, businesses, artisans |
| icon | text | icon key for UI |
| parent_id | UUID, nullable | supports sub-categories (e.g. Artisans → Plumber) |

### `listings`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| owner_id | UUID FK → users | |
| category_id | UUID FK → categories | |
| title | text | |
| description | text | |
| price | numeric, nullable | nullable for services priced on request |
| price_unit | enum('total','per_month','per_night','on_request') | |
| currency | text | default 'XAF' |
| city | text | |
| neighborhood | text | |
| latitude, longitude | numeric | for map + PostGIS distance search |
| status | enum('pending','approved','rejected','archived') | admin-moderated |
| rejection_reason | text, nullable | |
| whatsapp_number | text, nullable | |
| phone_number | text, nullable | |
| views_count | integer | default 0 |
| created_at, updated_at | timestamp | |

### `listing_photos`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| listing_id | UUID FK → listings | |
| url | text | S3 URL |
| position | integer | display order |

### `favorites`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| listing_id | UUID FK → listings | |
| created_at | timestamp | unique(user_id, listing_id) |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| type | enum('new_listing','listing_approved','listing_rejected','favorite_price_drop','system') | |
| title | text | |
| body | text | |
| listing_id | UUID, nullable | |
| is_read | boolean | default false |
| created_at | timestamp | |

### `reports` (flag inappropriate listings)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| listing_id | UUID FK | |
| reported_by | UUID FK → users | |
| reason | text | |
| status | enum('open','reviewed','dismissed') | |
| created_at | timestamp | |

### Future-ready tables (create now, unused until needed)

**`transactions`** (online payments — deposits, boosted listing fees, subscriptions)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| listing_id | UUID, nullable | |
| type | enum('listing_boost','subscription','deposit') | |
| amount | numeric | |
| currency | text | |
| provider | enum('orange_money','mtn_momo','card') | Mobile Money first, since it dominates in Cameroon |
| provider_reference | text | |
| status | enum('pending','success','failed','refunded') | |
| created_at | timestamp | |

**`ads`** (sponsored placements)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| advertiser_id | UUID FK → users | |
| listing_id | UUID, nullable | can promote an existing listing or a banner |
| placement | enum('home_banner','category_top','search_top') | |
| starts_at, ends_at | timestamp | |
| budget | numeric | |
| impressions, clicks | integer | |

**`user_interactions`** (AI recommendation training data)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK, nullable | nullable for anonymous sessions |
| listing_id | UUID FK | |
| action | enum('view','favorite','contact_click','search_impression') | |
| created_at | timestamp | |

A simple recommendation model (collaborative filtering, or even a rule like "same category + same city, sorted by recency and popularity") can run as a scheduled job reading `user_interactions`, without touching the core schema.

---

## 4. Core API Endpoints (v1)

```
POST   /auth/register              phone/email + password or OTP request
POST   /auth/verify-otp
POST   /auth/login
POST   /auth/refresh

GET    /categories
GET    /listings?category=&city=&neighborhood=&min_price=&max_price=&q=
GET    /listings/:id
POST   /listings                   create (status=pending)
PATCH  /listings/:id
DELETE /listings/:id

POST   /favorites/:listingId
DELETE /favorites/:listingId
GET    /favorites

GET    /notifications
PATCH  /notifications/:id/read

# Admin only
GET    /admin/listings?status=pending
PATCH  /admin/listings/:id/approve
PATCH  /admin/listings/:id/reject
GET    /admin/reports
```

Role-based guards (`user`, `artisan`, `admin`) protect the admin routes. All list endpoints support pagination (`page`, `limit`) and are indexed on `(category_id, city, status)` for fast filtering.

---

## 5. Scalability & Future Features

- **Online payments (Orange Money / MTN MoMo):** add a `PaymentsModule` that calls the mobile money aggregator's API and writes to `transactions`. Listing "boost" becomes a paid `ads` row; no schema change needed elsewhere.
- **AI recommendations:** start with a rules-based "similar listings" query (same category/city, exclude viewed), log everything into `user_interactions`, and later swap in a proper model (e.g. a lightweight collaborative-filtering service) that reads from the same table — the API contract for the client (`GET /listings/recommended`) doesn't change.
- **Advertising:** `ads` table + a placement-serving endpoint (`GET /ads?placement=home_banner`); the mobile app just renders whatever comes back, so new placements can be added without an app update.
- **Horizontal scaling:** stateless API servers behind a load balancer; Postgres read replicas for search-heavy traffic; Redis for session/cache; background jobs (notifications, image resizing, AI scoring) run in a queue (BullMQ) so the API stays responsive.
- **Offline-friendly:** cache category and recently viewed listings on-device (SQLite via `expo-sqlite` or WatermelonDB) since connectivity in some regions of Cameroon is inconsistent.
- **Bilingual content:** every user-facing string lives in `fr.json` / `en.json` locale files in the app; category names are bilingual in the DB itself (`name_fr`, `name_en`) so listings render correctly regardless of app language.

This structure lets the team ship the MVP (registration, browsing, publishing, favorites, admin moderation) fast, while every "future" feature in the brief has a clear, additive slot rather than requiring a redesign.
