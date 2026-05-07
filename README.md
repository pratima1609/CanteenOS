<p align="center">
  <img src="https://img.shields.io/badge/🍽️_Canteen_OS-v1.0-blueviolet?style=for-the-badge" alt="Canteen OS" />
</p>

<h1 align="center">Canteen OS</h1>
<h3 align="center">🏪 Multi-Outlet Food Court Management System</h3>

<p align="center">
  <em>One cart. Multiple stalls. Zero queues.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🌟 What is Canteen OS?

**Canteen OS** is a full-stack platform that reimagines how food courts operate. Instead of standing in separate queues at each stall, students browse all vendors in one place, build a **unified cart** with items from multiple stalls, and checkout once. The system does the rest — automatically splitting the order, assigning pickup tokens, and managing real-time queues.

> 💡 **Think of it as Swiggy/Zomato, but for your college food court — with real-time queue tracking and token-based pickup.**

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎓 For Students
- 🏪 Browse all open & approved stalls
- 🛒 **Unified multi-stall cart** — order from 3 stalls, pay once
- 🔀 Automatic order splitting into per-stall sub-orders
- 🎟️ Unique **8-character pickup tokens** per stall
- 📊 Real-time queue position & estimated wait time
- 📜 Complete order history

</td>
<td width="50%">

### 🍳 For Stall Owners
- 📋 Full menu CRUD with image uploads
- 🟢 Toggle stall open/close status
- 📺 **Kanban-style live queue** (Received → Accepted → Preparing → Ready)
- ✅ Accept or reject incoming orders
- 🔍 Token-based pickup verification scanner
- 📈 Order history & analytics

</td>
</tr>
<tr>
<td colspan="2">

### 👨‍💼 For Admins
- ✅ Approve, reject, or suspend vendor stalls
- 🏷️ Manage food categories platform-wide
- 📊 Platform analytics (Total GMV, order counts)

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐         ┌─────────────────┐
│                          │  HTTP   │                          │  mysql2  │                 │
│   React 18 + Vite        │◄───────►│   Express 5 API Server   │◄────────►│   MySQL 8.0     │
│   localhost:5173          │  REST   │   localhost:5000          │  Pool    │   localhost:3306 │
│                          │ + JWT   │                          │         │                 │
└──────────────────────────┘         └──────────────────────────┘         └─────────────────┘
       Frontend                            Backend                          Database
```

### 📁 Project Structure

```
canteen-os/
├── 📂 client/                          # ⚛️ React Frontend (Vite)
│   ├── src/
│   │   ├── api/axios.js                # Axios with JWT interceptor
│   │   ├── context/                    # AuthContext + CartContext
│   │   ├── components/                 # Navbar, StatusBadge, Skeleton, EmptyState
│   │   └── pages/
│   │       ├── student/                # BrowseStalls, StallMenu, Cart, OrderTracker, MyOrders
│   │       ├── stall/                  # Dashboard, MenuManager, StallQueue, PickupScanner
│   │       └── admin/                  # AdminDashboard
│   └── index.html
│
├── 📂 server/                          # 🟢 Node.js Backend
│   ├── database/
│   │   ├── db.js                       # MySQL pool + dbAsync wrapper
│   │   ├── schema.sql                  # All table definitions
│   │   └── seed.sql                    # Admin + categories seed data
│   ├── middleware/auth.js              # JWT + RBAC + stall approval check
│   ├── routes/
│   │   ├── auth.js                     # Register + Login
│   │   ├── admin.js                    # Stall approvals, categories, analytics
│   │   ├── stall.js                    # Menu CRUD, queue, pickup verification
│   │   ├── stalls.js                   # Public: browse stalls, menus, slots
│   │   ├── cart.js                     # Cart CRUD
│   │   └── orders.js                   # Checkout, tracking, queue position
│   ├── uploads/                        # Menu item images
│   └── server.js                       # Entry point
│
├── 📄 Canteen_OS_Postman.json          # 🧪 Full API test collection (30+ requests)
├── 📄 BLACKBOOK_REPORT.md              # 📘 Academic project report
├── 📄 DIAGRAMS.md                      # 📊 10 Mermaid diagrams (ER, DFD, Use Case, etc.)
├── 📄 RUNNING_INSTRUCTIONS.md          # 📋 Quick start guide
└── 📄 README.md                        # 📖 You are here!
```

---

## 🔄 Order Flow

```
  Student browses        Adds items from        Clicks "Pay &         System creates         Each stall sees
  multiple stalls  ───►  multiple stalls   ───►  Split Order"   ───►  sub-orders with  ───►  their own queue
                         to ONE cart                                  pickup tokens          independently

  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │  🏪 Browse   │  ───► │  🛒 Cart     │  ───► │  💳 Checkout │  ───► │  🎟️ Tokens   │  ───► │  📺 Queue    │
  │  Stalls      │       │  (unified)   │       │  (atomic)    │       │  (per stall) │       │  (Kanban)    │
  └─────────────┘       └─────────────┘       └─────────────┘       └─────────────┘       └─────────────┘
```

**Sub-order lifecycle per stall:**
> `received` → `accepted` → `preparing` → `ready` → `picked_up`

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| MySQL | 8.0+ | `mysql --version` or Docker |
| Git | Any | `git --version` |

---

### 🐧 Linux Setup

<details>
<summary><b>Click to expand full Linux guide</b></summary>

#### Step 1 — Clone the repository
```bash
git clone https://github.com/your-username/canteen-os.git
cd canteen-os
```

#### Step 2 — Set up MySQL via Docker (Recommended)
```bash
# Pull and run MySQL/MariaDB container
docker run -d \
  --name my-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  mariadb:lts

# Wait a few seconds for the container to initialize, then create the database
docker exec -i my-mysql mariadb -u root -proot < server/database/schema.sql
docker exec -i my-mysql mariadb -u root -proot < server/database/seed.sql
```

**Alternative: Native MySQL (Arch/Manjaro)**
```bash
sudo pacman -S mysql
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl start mysqld
sudo systemctl enable mysqld
mysql -u root < server/database/schema.sql
mysql -u root < server/database/seed.sql
```

**Alternative: Native MySQL (Ubuntu/Debian)**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/seed.sql
```

#### Step 3 — Configure environment
```bash
cat > server/.env << 'EOF'
PORT=5000
JWT_SECRET=super_secret_jwt_key_canteen_os_2026
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=canteen_os
EOF
```

#### Step 4 — Install dependencies
```bash
# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

#### Step 5 — Start both servers
Open **two terminals**:

```bash
# Terminal 1 — Backend
cd canteen-os/server
npm run dev
# ✅ Should print: "Server running on port 5000" + "Connected to the MySQL database."

# Terminal 2 — Frontend
cd canteen-os/client
npm run dev
# ✅ Should print: "Local: http://localhost:5173/"
```

#### Step 6 — Open the app
```
🌐  http://localhost:5173
```

</details>

---

### 🪟 Windows Setup

<details>
<summary><b>Click to expand full Windows guide</b></summary>

#### Step 1 — Clone the repository
```powershell
git clone https://github.com/your-username/canteen-os.git
cd canteen-os
```

#### Step 2 — Set up MySQL via Docker Desktop
1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Open PowerShell and run:
```powershell
docker run -d --name my-mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mariadb:lts
```
3. Wait 10 seconds, then initialize the database:
```powershell
Get-Content server\database\schema.sql | docker exec -i my-mysql mariadb -u root -proot
Get-Content server\database\seed.sql | docker exec -i my-mysql mariadb -u root -proot
```

**Alternative: MySQL Installer**
1. Download [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
2. During installation, set root password to `root`
3. Open MySQL Command Line Client:
```sql
SOURCE C:/path/to/canteen-os/server/database/schema.sql;
SOURCE C:/path/to/canteen-os/server/database/seed.sql;
```

#### Step 3 — Configure environment

Create `server\.env` with Notepad or PowerShell:
```powershell
@"
PORT=5000
JWT_SECRET=super_secret_jwt_key_canteen_os_2026
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=canteen_os
"@ | Out-File -FilePath server\.env -Encoding utf8
```

#### Step 4 — Install dependencies
```powershell
# Backend
cd server
npm install
cd ..

# Frontend
cd client
npm install
cd ..
```

#### Step 5 — Start both servers

Open **two separate PowerShell/CMD windows**:

```powershell
# Window 1 — Backend
cd canteen-os\server
npm run dev

# Window 2 — Frontend
cd canteen-os\client
npm run dev
```

#### Step 6 — Open the app
```
🌐  http://localhost:5173
```

</details>

---

## 🔑 Default Credentials

| Role | Email | Password | What You'll See |
|------|-------|----------|-----------------|
| 👨‍💼 Admin | `admin@canteen.com` | `admin123` | Stall approvals, categories, analytics |
| 🍳 Stall Owner | *Register your own* | *Your password* | Menu management, live queue, scanner |
| 🎓 Student | *Register your own* | *Your password* | Browse stalls, cart, order tracking |

### 🎮 First-Time Walkthrough

```
1. Login as Admin (admin@canteen.com / admin123)
   └── Add food categories if needed

2. Register as a Stall Owner
   └── Login as Admin → Approve the new stall

3. Login as Stall Owner
   ├── Add menu items (name, price, category, image)
   └── Toggle stall to "Open"

4. Register as a Student
   ├── Browse stalls → Add items to cart
   ├── Checkout → Get pickup tokens
   └── Track order in real-time

5. Back to Stall Owner
   ├── See incoming orders in the queue
   ├── Accept → Prepare → Mark Ready
   └── Verify pickup token at counter
```

---

## 🧪 API Testing with Postman

A ready-to-import collection is included at the project root:

📄 **`Canteen_OS_Postman.json`** — 30+ requests with sample data

### How to use:
1. Open Postman → **Import** → select `Canteen_OS_Postman.json`
2. The collection auto-saves JWT tokens on login
3. Requests are organized by role:

| Folder | Endpoints |
|--------|-----------|
| 🔐 Authentication | Register (Student/Owner), Login (Admin/Student/Owner) |
| 👨‍💼 Admin | Get stalls, approve/reject/suspend, categories, analytics |
| 🍳 Stall Owner | Menu CRUD, toggle status, queue, accept/prepare/ready, pickup verify, history |
| 🎓 Student | Browse stalls, menu, cart CRUD, checkout, order tracking, queue position |
| ❤️ Health | Server health check |

---

## 📊 Diagrams

All system diagrams are in **`DIAGRAMS.md`** using Mermaid syntax:

| # | Diagram | What It Shows |
|---|---------|---------------|
| 1 | ER Diagram | All 9 tables with relationships |
| 2 | Use Case Diagram | Actor-feature mapping for all 3 roles |
| 3 | DFD Level 0 | System context with external actors |
| 4 | DFD Level 1 | Internal module data flow |
| 5 | State Diagram | Sub-order lifecycle transitions |
| 6 | Architecture | 3-tier system layout |
| 7 | Checkout Sequence | Step-by-step order splitting flow |
| 8 | Auth Sequence | Login → JWT → role redirect flow |
| 9 | Queue Polling | Real-time status update mechanism |
| 10 | Deployment | Dev vs production topology |

> 💡 **Tip:** Install the [Markdown Preview Mermaid](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) VS Code extension to render diagrams in-editor.

---

## 🔒 Security

| Layer | Implementation |
|-------|---------------|
| 🔐 Passwords | bcrypt (10 salt rounds) |
| 🎫 Auth | JWT with 24h expiry |
| 🛡️ RBAC | `authorizeRoles()` middleware |
| 🏪 Stall Gate | `checkStallApproval()` blocks unapproved stalls |
| 💉 SQL Injection | Parameterized queries (`?`) everywhere |
| 🌐 Headers | Helmet.js security headers |
| 🔗 CORS | Configured for cross-origin frontend |
| ✅ Validation | express-validator on auth routes |
| 💾 Transactions | `BEGIN/COMMIT/ROLLBACK` on checkout & registration |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="110">
<b>React 18</b><br/><sub>Frontend</sub>
</td>
<td align="center" width="110">
<b>Vite</b><br/><sub>Build Tool</sub>
</td>
<td align="center" width="110">
<b>Express 5</b><br/><sub>API Server</sub>
</td>
<td align="center" width="110">
<b>MySQL 8</b><br/><sub>Database</sub>
</td>
<td align="center" width="110">
<b>JWT</b><br/><sub>Auth</sub>
</td>
<td align="center" width="110">
<b>Docker</b><br/><sub>DB Container</sub>
</td>
</tr>
</table>

**Full dependency list:**

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mysql2` | MySQL driver with connection pooling |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT token generation & verification |
| `multer` | File upload handling |
| `helmet` | Security HTTP headers |
| `cors` | Cross-origin resource sharing |
| `express-validator` | Input validation |
| `express-rate-limit` | API rate limiting |
| `uuid` | Pickup token generation |
| `dotenv` | Environment variable management |
| `nodemon` | Dev server auto-restart |
| `axios` | Frontend HTTP client |
| `react-router-dom` | Client-side routing |
| `react-hot-toast` | Toast notifications |

---

## 🗺️ Roadmap

- [ ] 🔌 WebSocket real-time updates (Socket.IO)
- [ ] 💳 Razorpay/Stripe payment integration
- [ ] 📱 React Native mobile app
- [ ] 📷 QR code pickup tokens
- [ ] 🔔 Push notifications (Firebase)
- [ ] ⭐ Ratings & reviews system
- [ ] 📦 Inventory management
- [ ] 🏢 Multi-campus tenant support
- [ ] 📊 Advanced analytics dashboard
- [ ] 🤖 ML-based food recommendations

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [`README.md`](README.md) | This file — setup, usage, and overview |
| [`BLACKBOOK_REPORT.md`](BLACKBOOK_REPORT.md) | Full academic project report (14 sections) |
| [`DIAGRAMS.md`](DIAGRAMS.md) | 10 Mermaid diagrams (ER, DFD, Use Case, etc.) |
| [`RUNNING_INSTRUCTIONS.md`](RUNNING_INSTRUCTIONS.md) | Quick start reference |
| [`Canteen_OS_Postman.json`](Canteen_OS_Postman.json) | Postman API collection |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Built with ❤️ for food courts everywhere</b><br/>
  <sub>Canteen OS — Making food court chaos a thing of the past.</sub>
</p>
