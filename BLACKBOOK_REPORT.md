# CANTEEN OS — Project Blackbook Report

**Project Title:** Canteen OS — Multi-Outlet Food Court Management System  
**Academic Year:** 2025–2026 | **Semester:** IP Sem 2  
**Technology Stack:** React 18 + Node.js/Express + MySQL (MariaDB)

---

## 1. Abstract

Canteen OS is a full-stack web application designed to digitize and streamline multi-stall food court operations. It provides a unified ordering experience where students can browse multiple stalls, build a single cart with items from different vendors, and checkout once. The system automatically splits the order into independent sub-orders per stall, each with a unique pickup token. Stall owners manage a real-time Kanban-style queue, and students track their order progress live with estimated wait times.

---

## 2. Introduction

### 2.1 Problem Statement

Traditional food courts suffer from:
- Long queues at individual counters during peak hours
- No way for students to order from multiple stalls in one transaction
- Manual token systems prone to errors and disputes
- Zero visibility into order progress or wait times
- No centralized platform for administration or analytics

### 2.2 Proposed Solution

Canteen OS solves these problems through:
- A **unified multi-stall cart** allowing cross-vendor ordering
- **Automatic order splitting** into per-stall sub-orders with unique pickup tokens
- **Real-time queue tracking** with polling-based status updates
- **Role-based access control** (Student, Stall Owner, Admin)
- **Token-based pickup verification** to eliminate disputes

### 2.3 Scope

| In Scope | Out of Scope |
|----------|-------------|
| Multi-stall cart & checkout | Payment gateway integration |
| Real-time order tracking | Push notifications (WebSockets) |
| Stall management dashboard | Inventory management |
| Admin analytics & approvals | Multi-campus support |
| JWT authentication & RBAC | Email verification flow |

---

## 3. Literature Survey

| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| React 18 | Frontend SPA | Component-based, hooks, fast dev cycle |
| Vite | Build tool | 10x faster HMR than CRA |
| Express 5 | Backend framework | Minimal, middleware-driven, mature ecosystem |
| MySQL/MariaDB | Relational database | ACID transactions for order integrity, ENUM support |
| JWT | Authentication | Stateless, scalable, role-embeddable tokens |
| Axios | HTTP client | Interceptors for auto-auth, clean promise API |
| bcryptjs | Password hashing | Salted hashing, timing-attack resistant |
| multer | File uploads | Multipart form handling for menu item images |
| react-hot-toast | Notifications | Lightweight, customizable toast system |

---

## 4. System Requirements

### 4.1 Hardware Requirements
- Processor: Intel i3 or equivalent (minimum)
- RAM: 4 GB (minimum)
- Storage: 500 MB free disk space
- Network: Internet connection for development dependencies

### 4.2 Software Requirements
- OS: Linux / macOS / Windows
- Node.js: v18+
- npm: v9+
- MySQL: 8.0+ (or MariaDB via Docker)
- Browser: Chrome 90+, Firefox 88+, or Edge 90+

---

## 5. System Architecture

### 5.1 Architecture Overview

The application follows a **3-tier client-server architecture**:

```
┌─────────────────────┐     HTTP/REST     ┌──────────────────────┐     mysql2     ┌──────────────┐
│  React SPA (Vite)   │ ◄──────────────► │  Express API Server  │ ◄───────────► │  MySQL 8.0   │
│  Port: 5173         │   Bearer Token    │  Port: 5000          │   Pool (10)   │  Port: 3306  │
└─────────────────────┘                   └──────────────────────┘               └──────────────┘
```

### 5.2 Directory Structure

```
canteen-os/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptor
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── components/         # Navbar, StatusBadge, Skeleton, etc.
│   │   └── pages/
│   │       ├── student/        # BrowseStalls, StallMenu, Cart, OrderTracker, MyOrders
│   │       ├── stall/          # StallDashboard, MenuManager, StallQueue, PickupScanner
│   │       └── admin/          # AdminDashboard
│   └── index.html
├── server/                     # Node.js Backend
│   ├── database/
│   │   ├── db.js               # MySQL connection pool + dbAsync wrapper
│   │   ├── schema.sql          # Table definitions
│   │   └── seed.sql            # Admin user + categories
│   ├── middleware/auth.js      # JWT verification + RBAC + stall approval check
│   ├── routes/
│   │   ├── auth.js             # POST /register, /login
│   │   ├── admin.js            # Stall approvals, categories, analytics
│   │   ├── stall.js            # Menu CRUD, queue management, pickup verify
│   │   ├── stalls.js           # Public browse, menu, slots
│   │   ├── cart.js             # Cart CRUD
│   │   └── orders.js           # Checkout, order history, queue position
│   ├── uploads/                # Menu item images
│   ├── server.js               # Entry point
│   └── .env                    # Environment configuration
├── Canteen_OS_Postman.json     # API test collection
├── DIAGRAMS.md                 # All Mermaid diagrams
└── RUNNING_INSTRUCTIONS.md     # Setup guide
```

---

## 6. Database Design

### 6.1 Tables Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | All user accounts | role: admin, stall_owner, student |
| `stall_profiles` | Vendor stall details | FK → users.id |
| `categories` | Food categories | Referenced by menu_items |
| `menu_items` | Individual food items | FK → stall_profiles, categories |
| `master_orders` | Top-level unified order | FK → users (student) |
| `sub_orders` | Per-stall split order | FK → master_orders, stall_profiles |
| `sub_order_items` | Line items in sub-order | FK → sub_orders, menu_items |
| `cart_items` | Student shopping cart | FK → users, menu_items, stall_profiles |
| `pickup_slots` | Time slot scheduling | FK → stall_profiles |

### 6.2 Key Design Decisions

1. **Order Splitting Pattern**: A single `master_orders` row fans out to N `sub_orders` rows (one per stall). This enables independent queue management per stall while maintaining a unified order view for the student.

2. **Snapshot Strategy**: `sub_order_items.item_name_snapshot` captures the menu item name at order time, protecting against future menu edits corrupting historical order data.

3. **Token-Based Pickup**: Each sub-order gets a unique 8-character uppercase token (derived from UUID) for physical verification at the counter.

4. **ENUM Constraints**: MySQL ENUMs enforce valid state transitions at the database level for roles, statuses, and approval states.

---

## 7. Module Description

### 7.1 Authentication Module (`/api/auth`)
- **Register**: Creates user with bcrypt-hashed password. Stall owners also get a `stall_profiles` entry (wrapped in transaction).
- **Login**: Validates credentials, returns JWT (24h expiry) with embedded `{ id, role, name, stallId }`.

### 7.2 Student Module (`/api/stalls`, `/api/cart`, `/api/orders`)
- **Browse Stalls**: Public endpoint returning approved + open stalls.
- **Cart**: Unified cart supporting items from multiple stalls. Validates stall is open and item is available before adding.
- **Checkout**: Atomic transaction that validates cart → creates master order → splits into sub-orders with pickup tokens → clears cart.
- **Order Tracking**: Polls master order status and per-stall queue positions every 5 seconds.

### 7.3 Stall Owner Module (`/api/stall`)
- **Menu CRUD**: Full create/read/update/delete with image upload support.
- **Queue Management**: Kanban-style board with columns: Received → Accepted → Preparing → Ready.
- **Status Sync**: When a sub-order reaches a terminal state, the system checks if all sibling sub-orders are done and auto-updates the master order status.
- **Pickup Verification**: Validates token, confirms stall ownership, checks order is "ready", marks as picked up.

### 7.4 Admin Module (`/api/admin`)
- **Stall Approvals**: Approve, reject, or suspend stall profiles.
- **Category Management**: CRUD for food categories used across all stalls.
- **Analytics**: Platform-wide GMV and order count aggregation.

---

## 8. API Reference

### 8.1 Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ email, password, name, role, stall_name?, fssai_number? }` | `201 { userId }` |
| POST | `/api/auth/login` | `{ email, password }` | `200 { token, user, stallProfile? }` |

### 8.2 Public (No Auth)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/stalls` | Array of open, approved stalls |
| GET | `/api/stalls/:id/menu` | Menu grouped by category |
| GET | `/api/stalls/:id/slots` | Available pickup time slots |
| GET | `/health` | `{ status: "ok" }` |

### 8.3 Student (JWT Required, role: student)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/cart` | — | Cart items with stall info |
| POST | `/api/cart/add` | `{ menu_item_id, quantity }` | Success message |
| PUT | `/api/cart/:id` | `{ quantity }` | Success message |
| DELETE | `/api/cart/:id` | — | Success message |
| POST | `/api/orders/checkout` | — | `{ orderRef, masterId, subOrders[] }` |
| GET | `/api/orders` | — | All master orders |
| GET | `/api/orders/:id` | — | Full order with sub-orders and items |
| GET | `/api/orders/:id/queue/:stallId` | — | `{ queuePosition, estimatedWaitMinutes }` |

### 8.4 Stall Owner (JWT Required, role: stall_owner, stall approved)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/stall/categories` | — | All categories |
| GET | `/api/stall/menu` | — | Stall's menu items |
| POST | `/api/stall/menu` | FormData with item fields + image | `{ id }` |
| PUT | `/api/stall/menu/:id` | FormData with updated fields | Success |
| DELETE | `/api/stall/menu/:id` | — | Success |
| PATCH | `/api/stall/status` | `{ is_open: bool }` | Success |
| GET | `/api/stall/sub-orders` | — | Active queue |
| PATCH | `/api/stall/sub-orders/:id/status` | `{ status }` | Success |
| POST | `/api/stall/pickup/verify` | `{ token }` | Success + subOrderId |
| GET | `/api/stall/history` | — | Completed/rejected orders |

### 8.5 Admin (JWT Required, role: admin)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/admin/stalls` | — | All stalls with owner info |
| PUT | `/api/admin/stalls/:id/approve` | — | Success |
| PUT | `/api/admin/stalls/:id/reject` | — | Success |
| PUT | `/api/admin/stalls/:id/suspend` | — | Success |
| GET | `/api/admin/categories` | — | All categories |
| POST | `/api/admin/categories` | `{ name }` | `{ id, name }` |
| GET | `/api/admin/analytics` | — | `{ totalGmv, totalOrders }` |

---

## 9. Security Implementation

| Measure | Implementation |
|---------|---------------|
| Password Storage | bcrypt with 10 salt rounds |
| Authentication | JWT tokens (24h expiry) in Authorization header |
| Authorization | Role-based middleware (`authorizeRoles`) |
| Stall Gating | `checkStallApproval` middleware prevents unapproved stall access |
| SQL Injection | Parameterized queries (`?` placeholders) throughout |
| XSS Protection | Helmet.js security headers |
| CORS | Configured via `cors()` middleware |
| Input Validation | `express-validator` on auth routes |
| Transaction Safety | `BEGIN/COMMIT/ROLLBACK` for checkout and registration |

---

## 10. Testing

### 10.1 API Testing
A comprehensive Postman collection (`Canteen_OS_Postman.json`) is provided with:
- 30+ requests covering all endpoints
- Sample request bodies with realistic data
- Auto-token saving on login (collection-level test script)
- Organized by role: Auth → Admin → Stall Owner → Student

### 10.2 Testing Workflow
1. Import `Canteen_OS_Postman.json` into Postman
2. Run "Login as Admin" → token auto-saved
3. Run admin actions (approve stalls, add categories)
4. Run "Login as Stall Owner" → add menu items, open stall
5. Run "Login as Student" → browse, add to cart, checkout
6. Switch back to Stall Owner → manage queue, verify pickup

---

## 11. Screenshots

> Screenshots should be captured from the running application at `http://localhost:5173` and inserted here.

- Fig 11.1: Login Page
- Fig 11.2: Student — Browse Stalls
- Fig 11.3: Student — Stall Menu with Categories
- Fig 11.4: Student — Unified Cart (Multi-Stall)
- Fig 11.5: Student — Order Tracker with Pickup Tokens
- Fig 11.6: Stall Owner — Menu Manager
- Fig 11.7: Stall Owner — Live Queue (Kanban Board)
- Fig 11.8: Stall Owner — Pickup Scanner
- Fig 11.9: Admin — Dashboard with Categories & Analytics
- Fig 11.10: Admin — Stall Approval Panel

---

## 12. Future Enhancements

1. **Real-Time Updates**: Replace polling with WebSocket (Socket.IO) for instant status pushes.
2. **Payment Integration**: Razorpay/Stripe for actual online payments.
3. **Push Notifications**: Firebase Cloud Messaging for order-ready alerts.
4. **QR Code Tokens**: Generate scannable QR codes instead of text tokens.
5. **Inventory Management**: Track ingredient stock levels per stall.
6. **Rating & Reviews**: Students rate stalls and items after pickup.
7. **Multi-Campus Support**: Tenant-based architecture for multiple food courts.
8. **Mobile App**: React Native for native iOS/Android experience.
9. **Advanced Analytics**: Per-stall revenue, peak hours, popular items dashboard.
10. **Recommendation Engine**: ML-based "You might also like" suggestions.

---

## 13. Conclusion

Canteen OS successfully demonstrates a production-grade approach to digitizing food court operations. The system's core innovation — **automatic order splitting with independent sub-order queues** — solves the fundamental challenge of multi-vendor food courts. The architecture is modular, the database design is normalized with proper referential integrity, and the API layer is secured with industry-standard JWT authentication and role-based access control.

The migration from SQLite to MySQL further demonstrates the system's adaptability and readiness for production deployment where concurrent access and data durability are critical.

---

## 14. References

1. Express.js Documentation — https://expressjs.com/
2. React Documentation — https://react.dev/
3. MySQL 8.0 Reference Manual — https://dev.mysql.com/doc/refman/8.0/en/
4. JSON Web Tokens (RFC 7519) — https://datatracker.ietf.org/doc/html/rfc7519
5. OWASP Top 10 Web Security Risks — https://owasp.org/www-project-top-ten/
6. bcrypt Password Hashing — https://en.wikipedia.org/wiki/Bcrypt
7. Vite Build Tool — https://vitejs.dev/
8. mysql2 npm Package — https://www.npmjs.com/package/mysql2
