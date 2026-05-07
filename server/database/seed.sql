USE canteen_os;

-- Seed Admin
INSERT IGNORE INTO users (email, password_hash, name, role, status, verified) 
VALUES ('admin@canteen.com', '$2a$12$oY6nGRk8NgeabZV08FtNDOCxKiCVH3fRFWIS5QKExqCLJ1X9czqFS', 'System Admin', 'admin', 'active', 1);

-- Seed Categories
INSERT IGNORE INTO categories (name) VALUES ('Beverages');
INSERT IGNORE INTO categories (name) VALUES ('Main Course');
INSERT IGNORE INTO categories (name) VALUES ('Snacks');
INSERT IGNORE INTO categories (name) VALUES ('Desserts');
