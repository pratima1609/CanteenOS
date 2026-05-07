CREATE DATABASE IF NOT EXISTS canteen_os;
USE canteen_os;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'stall_owner', 'student') NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'active') NOT NULL DEFAULT 'active',
  verified TINYINT(1) DEFAULT 0,
  verification_token VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stall_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stall_name VARCHAR(255) NOT NULL,
  description TEXT,
  fssai_number VARCHAR(100),
  is_open TINYINT(1) DEFAULT 0,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  max_orders_per_slot INT DEFAULT 5,
  approved_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stall_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  is_veg TINYINT(1) NOT NULL DEFAULT 1,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(500),
  prep_time_minutes INT DEFAULT 5,
  FOREIGN KEY(stall_id) REFERENCES stall_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS master_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  order_ref VARCHAR(100) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('processing', 'partial', 'complete', 'cancelled') NOT NULL DEFAULT 'processing',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sub_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  master_order_id INT NOT NULL,
  stall_id INT NOT NULL,
  pickup_token VARCHAR(20) UNIQUE NOT NULL,
  status ENUM('received', 'accepted', 'preparing', 'ready', 'picked_up', 'rejected', 'cancelled') NOT NULL DEFAULT 'received',
  subtotal DECIMAL(10,2) NOT NULL,
  pickup_slot_start DATETIME,
  queue_number INT,
  rejection_reason TEXT,
  picked_up_at DATETIME,
  FOREIGN KEY(master_order_id) REFERENCES master_orders(id) ON DELETE CASCADE,
  FOREIGN KEY(stall_id) REFERENCES stall_profiles(id)
);

CREATE TABLE IF NOT EXISTS sub_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sub_order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  item_name_snapshot VARCHAR(255) NOT NULL,
  FOREIGN KEY(sub_order_id) REFERENCES sub_orders(id) ON DELETE CASCADE,
  FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS pickup_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stall_id INT NOT NULL,
  slot_start DATETIME NOT NULL,
  slot_end DATETIME NOT NULL,
  max_orders INT NOT NULL,
  booked_count INT DEFAULT 0,
  FOREIGN KEY(stall_id) REFERENCES stall_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  stall_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
  FOREIGN KEY(stall_id) REFERENCES stall_profiles(id)
);
