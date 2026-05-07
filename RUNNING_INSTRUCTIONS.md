# Canteen OS - Running Instructions

Welcome to Canteen OS! This project is a complete monorepo containing both the React frontend and the Node.js/MySQL backend.

## Prerequisites
- Node.js (v18+)
- npm
- MySQL Server (8.0+)

## Database Setup (One-time)

### 1. Install MySQL

**Arch Linux / Manjaro:**
```bash
sudo pacman -S mysql
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

**Ubuntu / Debian:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

### 2. Initialize the Database

Open a MySQL shell and run the schema and seed files:
```bash
mysql -u root < canteen-os/server/database/schema.sql
mysql -u root < canteen-os/server/database/seed.sql
```

> [!NOTE]
> This creates the `canteen_os` database, all tables, and seeds an Admin user + food categories. If your MySQL requires a password, use `mysql -u root -p` instead.

### 3. Configure Environment

Edit `server/.env` and set your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=canteen_os
```

## Starting the Application

The application consists of two parts that need to be run simultaneously in separate terminals.

### 1. Start the Backend Server

Open a terminal and navigate to the server directory:
```bash
cd canteen-os/server
npm run dev
```
*(This runs the server on `http://localhost:5000` using nodemon)*

### 2. Start the Frontend Client

Open another terminal and navigate to the client directory:
```bash
cd canteen-os/client
npm run dev
```
*(This runs the Vite dev server on `http://localhost:5173`)*

## Default Login Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@canteen.com  | admin123  |

## Architecture

- **Backend:** Node.js + Express + MySQL (mysql2)
- **Frontend:** React 18 + Vite
- **Auth:** JWT-based with role-based access control (Student, Stall Owner, Admin)

## Order Flow
1. **Student** browses stalls → adds items from multiple stalls to a unified cart → checks out
2. The system **automatically splits** the order into independent sub-orders per stall
3. Each sub-order gets a unique 8-character **pickup token**
4. **Stall Owner** manages the queue: Received → Accepted → Preparing → Ready
5. Student shows the token at pickup → **Stall Owner verifies** → order marked complete
