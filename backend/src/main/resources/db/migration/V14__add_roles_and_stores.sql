-- ============================================================
-- V13: Roles & Stores — multi-store employee management
-- ============================================================

-- Tabella negozi
CREATE TABLE stores (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(255),
    city        VARCHAR(100),
    phone       VARCHAR(30),
    email       VARCHAR(150),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Aggiungi ruolo e negozio a admin_users
ALTER TABLE admin_users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'SUPER_ADMIN';
ALTER TABLE admin_users ADD COLUMN store_id BIGINT REFERENCES stores(id);

-- Seed: due punti vendita
INSERT INTO stores (name, address, city) VALUES
    ('Punto Vendita 1', '', ''),
    ('Punto Vendita 2', '', '');

-- L'utente admin esistente diventa SUPER_ADMIN (già default)
