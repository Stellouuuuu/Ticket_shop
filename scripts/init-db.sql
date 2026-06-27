CREATE DATABASE IF NOT EXISTS festichill_tickets
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE festichill_tickets;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  delivery_zone VARCHAR(255) NOT NULL,
  ticket_type ENUM('standard', 'vip') NOT NULL DEFAULT 'standard',
  ticket_count INT NOT NULL,
  unit_price INT NOT NULL,
  total_amount INT NOT NULL,
  status ENUM('pending', 'contacted', 'confirmed', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  assigned_to VARCHAR(50) NULL,
  delivery_date DATE NULL,
  internal_note TEXT NULL,
  customer_note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
