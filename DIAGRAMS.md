# Canteen OS — Mermaid Diagrams

This file contains all architectural and design diagrams for the Canteen OS project in Mermaid syntax.
Render them using any Mermaid-compatible viewer (VS Code extension, GitHub markdown, mermaid.live, etc.)

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        int id PK
        varchar email UK
        varchar password_hash
        varchar name
        enum role "admin | stall_owner | student"
        enum status "pending | approved | rejected | active"
        tinyint verified
        varchar verification_token
        datetime created_at
    }

    STALL_PROFILES {
        int id PK
        int user_id FK
        varchar stall_name
        text description
        varchar fssai_number
        tinyint is_open
        enum approval_status "pending | approved | rejected"
        int max_orders_per_slot
        datetime approved_at
    }

    CATEGORIES {
        int id PK
        varchar name UK
    }

    MENU_ITEMS {
        int id PK
        int stall_id FK
        int category_id FK
        varchar name
        text description
        decimal price
        tinyint is_veg
        tinyint is_available
        varchar image_url
        int prep_time_minutes
    }

    MASTER_ORDERS {
        int id PK
        int student_id FK
        varchar order_ref UK
        decimal total_amount
        enum status "processing | partial | complete | cancelled"
        datetime created_at
    }

    SUB_ORDERS {
        int id PK
        int master_order_id FK
        int stall_id FK
        varchar pickup_token UK
        enum status "received | accepted | preparing | ready | picked_up | rejected | cancelled"
        decimal subtotal
        datetime pickup_slot_start
        int queue_number
        text rejection_reason
        datetime picked_up_at
    }

    SUB_ORDER_ITEMS {
        int id PK
        int sub_order_id FK
        int menu_item_id FK
        int quantity
        decimal unit_price
        varchar item_name_snapshot
    }

    CART_ITEMS {
        int id PK
        int student_id FK
        int menu_item_id FK
        int stall_id FK
        int quantity
        datetime added_at
    }

    PICKUP_SLOTS {
        int id PK
        int stall_id FK
        datetime slot_start
        datetime slot_end
        int max_orders
        int booked_count
    }

    USERS ||--o{ STALL_PROFILES : "owns"
    USERS ||--o{ MASTER_ORDERS : "places"
    USERS ||--o{ CART_ITEMS : "has"
    STALL_PROFILES ||--o{ MENU_ITEMS : "offers"
    STALL_PROFILES ||--o{ SUB_ORDERS : "receives"
    STALL_PROFILES ||--o{ PICKUP_SLOTS : "schedules"
    CATEGORIES ||--o{ MENU_ITEMS : "classifies"
    MASTER_ORDERS ||--o{ SUB_ORDERS : "splits into"
    SUB_ORDERS ||--o{ SUB_ORDER_ITEMS : "contains"
    MENU_ITEMS ||--o{ SUB_ORDER_ITEMS : "referenced by"
    MENU_ITEMS ||--o{ CART_ITEMS : "added to"
    STALL_PROFILES ||--o{ CART_ITEMS : "sourced from"
```

---

## 2. Use Case Diagram

```mermaid
graph TB
    subgraph "Canteen OS System"
        UC1["Browse Open Stalls"]
        UC2["View Stall Menu"]
        UC3["Add to Unified Cart"]
        UC4["Checkout & Pay"]
        UC5["Track Order Status"]
        UC6["View Pickup Token"]
        UC7["View Order History"]

        UC8["Manage Menu Items"]
        UC9["Toggle Stall Open/Close"]
        UC10["View Live Queue"]
        UC11["Accept / Reject Orders"]
        UC12["Update Order Status"]
        UC13["Verify Pickup Token"]
        UC14["View Stall History"]

        UC15["Approve / Reject Stalls"]
        UC16["Manage Food Categories"]
        UC17["View Platform Analytics"]
    end

    Student(("🎓 Student"))
    StallOwner(("🍳 Stall Owner"))
    Admin(("👨‍💼 Admin"))

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7

    StallOwner --> UC8
    StallOwner --> UC9
    StallOwner --> UC10
    StallOwner --> UC11
    StallOwner --> UC12
    StallOwner --> UC13
    StallOwner --> UC14

    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
```

---

## 3. Data Flow Diagram (Level 0 — Context)

```mermaid
graph LR
    Student(("🎓 Student"))
    StallOwner(("🍳 Stall Owner"))
    Admin(("👨‍💼 Admin"))

    System["Canteen OS\nSystem"]

    Student -- "Browse, Order, Track" --> System
    System -- "Menu, Tokens, Status" --> Student

    StallOwner -- "Menu CRUD, Status Updates" --> System
    System -- "Queue, Order Details" --> StallOwner

    Admin -- "Approve Stalls, Categories" --> System
    System -- "Analytics, Stall List" --> Admin
```

---

## 4. Data Flow Diagram (Level 1 — Detailed)

```mermaid
graph TB
    Student(("🎓 Student"))
    StallOwner(("🍳 Stall Owner"))
    Admin(("👨‍💼 Admin"))

    subgraph "Canteen OS Backend"
        AUTH["1.0 Authentication"]
        BROWSE["2.0 Browse & Menu"]
        CART["3.0 Cart Management"]
        ORDER["4.0 Order Processing"]
        QUEUE["5.0 Queue Management"]
        PICKUP["6.0 Pickup Verification"]
        ADMIN_MOD["7.0 Admin Module"]
    end

    DB[("MySQL Database")]

    Student --> AUTH
    Student --> BROWSE
    Student --> CART
    Student --> ORDER

    StallOwner --> AUTH
    StallOwner --> QUEUE
    StallOwner --> PICKUP

    Admin --> AUTH
    Admin --> ADMIN_MOD

    AUTH --> DB
    BROWSE --> DB
    CART --> DB
    ORDER --> DB
    QUEUE --> DB
    PICKUP --> DB
    ADMIN_MOD --> DB

    ORDER -- "Splits into Sub-Orders" --> QUEUE
    QUEUE -- "Status: ready" --> PICKUP
    PICKUP -- "All picked up" --> ORDER
```

---

## 5. Order Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> Cart: Student adds items

    Cart --> Processing: Checkout
    Processing --> Received: Sub-order created per stall

    state "Per Stall Sub-Order" as PerStall {
        Received --> Accepted: Stall accepts
        Received --> Rejected: Stall rejects
        Accepted --> Preparing: Start cooking
        Preparing --> Ready: Food done
        Ready --> PickedUp: Token verified
    }

    Received --> PerStall
    PerStall --> MasterCheck: Sub-order reaches terminal state

    state MasterCheck <<choice>>
    MasterCheck --> Complete: All sub-orders finished (any picked up)
    MasterCheck --> Cancelled: All sub-orders rejected/cancelled
    MasterCheck --> Processing: Some sub-orders still active

    Complete --> [*]
    Cancelled --> [*]
```

---

## 6. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client - React + Vite :5173"
        UI["React SPA"]
        CTX["Auth & Cart Context"]
        PAGES["Pages: Student | Stall | Admin"]
        API_CLIENT["Axios HTTP Client"]
    end

    subgraph "Server - Node.js + Express :5000"
        MW["Middleware: JWT Auth + RBAC"]
        ROUTES["Routes: auth | admin | stall | stalls | cart | orders"]
        DB_LAYER["Database Layer: dbAsync wrapper"]
    end

    subgraph "Database - MySQL :3306"
        MYSQL[("MySQL / MariaDB\ncanteen_os")]
    end

    UI --> CTX
    CTX --> PAGES
    PAGES --> API_CLIENT
    API_CLIENT -- "HTTP REST + Bearer Token" --> MW
    MW --> ROUTES
    ROUTES --> DB_LAYER
    DB_LAYER -- "mysql2/promise pool" --> MYSQL
```

---

## 7. Checkout & Order Splitting Sequence Diagram

```mermaid
sequenceDiagram
    participant S as 🎓 Student
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MySQL Database

    S->>FE: Click "Pay & Split Order"
    FE->>BE: POST /api/orders/checkout
    BE->>DB: BEGIN TRANSACTION
    BE->>DB: SELECT cart_items + menu_items + stall_profiles
    DB-->>BE: Cart data (grouped by stall)

    loop Validate each item
        BE->>BE: Check is_open & is_available
    end

    BE->>DB: INSERT master_orders
    DB-->>BE: masterId

    loop For each stall group
        BE->>BE: Generate pickup token (UUID → 8 chars)
        BE->>DB: INSERT sub_orders
        DB-->>BE: subId
        loop For each item in stall group
            BE->>DB: INSERT sub_order_items
        end
    end

    BE->>DB: DELETE cart_items (clear cart)
    BE->>DB: COMMIT
    BE-->>FE: 201 { orderRef, masterId, subOrders[] }
    FE->>FE: Navigate to /orders/:masterId
    FE-->>S: Show OrderTracker with tokens
```

---

## 8. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React App
    participant BE as Express API
    participant JWT as JWT Module
    participant DB as MySQL

    U->>FE: Submit login form
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: SELECT * FROM users WHERE email = ?
    DB-->>BE: User row

    alt Invalid credentials
        BE-->>FE: 400 { message: "Invalid credentials" }
    else Valid credentials
        BE->>JWT: jwt.sign({ id, role, name, stallId })
        JWT-->>BE: token (24h expiry)

        alt User is stall_owner
            BE->>DB: SELECT * FROM stall_profiles WHERE user_id = ?
            DB-->>BE: stallProfile
        end

        BE-->>FE: 200 { token, user, stallProfile }
        FE->>FE: Store token in localStorage
        FE->>FE: Set AuthContext, redirect by role
    end
```

---

## 9. Real-Time Queue Polling Diagram

```mermaid
sequenceDiagram
    participant S as 🎓 Student Browser
    participant BE as Express API
    participant DB as MySQL
    participant SO as 🍳 Stall Owner Browser

    loop Every 5 seconds
        S->>BE: GET /api/orders/:id
        BE->>DB: SELECT master_order + sub_orders + items
        DB-->>BE: Full order with current statuses
        BE-->>S: Order data with all sub-order statuses

        S->>BE: GET /api/orders/:id/queue/:stallId
        BE->>DB: COUNT sub_orders ahead in queue
        DB-->>BE: { ahead: N }
        BE-->>S: { queuePosition, estimatedWaitMinutes }
    end

    SO->>BE: PATCH /api/stall/sub-orders/:id/status { status: "preparing" }
    BE->>DB: UPDATE sub_orders SET status = 'preparing'
    Note over S: Next poll picks up new status automatically
```

---

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_CLIENT["Vite Dev Server\nlocalhost:5173"]
        DEV_SERVER["Nodemon + Express\nlocalhost:5000"]
        DEV_DB["Docker: MariaDB\nlocalhost:3306"]
    end

    subgraph "Production Environment"
        LB["Load Balancer / Nginx"]
        PROD_CLIENT["React Static Build\n(served by Nginx)"]
        PROD_SERVER["Node.js Express\n(PM2 managed)"]
        PROD_DB["MySQL 8.0\n(managed / RDS)"]
    end

    DEV_CLIENT -- "proxy /api" --> DEV_SERVER
    DEV_SERVER -- "mysql2 pool" --> DEV_DB

    LB --> PROD_CLIENT
    LB -- "/api/*" --> PROD_SERVER
    PROD_SERVER --> PROD_DB
```
