-- Fix: aggiunge updated_at mancante a customer_interactions e invoice_items
ALTER TABLE customer_interactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
