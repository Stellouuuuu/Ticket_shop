-- Migration : ajout du type de ticket (standard / vip)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS ticket_type ENUM('standard', 'vip') NOT NULL DEFAULT 'standard'
  AFTER delivery_zone;
