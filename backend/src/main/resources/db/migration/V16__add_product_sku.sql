-- Add SKU (Stock Keeping Unit) code to products
ALTER TABLE products ADD COLUMN sku VARCHAR(50);
CREATE UNIQUE INDEX idx_products_sku ON products (sku) WHERE sku IS NOT NULL;
