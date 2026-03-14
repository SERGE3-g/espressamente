-- ============================================================
-- V6: CRM — Customers + Customer Interactions
-- ============================================================

CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    company_name    VARCHAR(150),
    vat_number      VARCHAR(20),
    fiscal_code     VARCHAR(16),
    client_type     VARCHAR(10) NOT NULL DEFAULT 'PRIVATO',
    address         VARCHAR(255),
    city            VARCHAR(100),
    province        VARCHAR(5),
    cap             VARCHAR(5),
    country         VARCHAR(50) DEFAULT 'Italia',
    notes           TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(LOWER(full_name));
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = TRUE;

CREATE TABLE customer_interactions (
    id              BIGSERIAL PRIMARY KEY,
    customer_id     BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('NOTA', 'CHIAMATA', 'EMAIL', 'INCONTRO', 'PREVENTIVO')),
    subject         VARCHAR(200),
    description     TEXT,
    date            TIMESTAMP NOT NULL DEFAULT NOW(),
    admin_user_id   BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_customer ON customer_interactions(customer_id);

ALTER TABLE comodato_requests ADD COLUMN customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE contact_requests ADD COLUMN customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE service_requests ADD COLUMN customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL;
