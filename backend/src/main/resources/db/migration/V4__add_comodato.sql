-- ─────────────────────────────────────────────────────────────────────────────
-- V4: Richieste comodato d'uso macchine da caffè
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE comodato_requests (
    id              BIGSERIAL PRIMARY KEY,
    -- Dati richiedente
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    company_name    VARCHAR(150),
    -- Indirizzo
    address         VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    province        VARCHAR(5),
    -- Preferenze
    machine_id      BIGINT REFERENCES products(id) ON DELETE SET NULL,
    machine_name    VARCHAR(200),          -- nome macchina se machine_id non disponibile
    delivery_type   VARCHAR(20) NOT NULL DEFAULT 'CONSEGNA',
    notes           TEXT,
    -- Gestione admin
    status          VARCHAR(20) NOT NULL DEFAULT 'NUOVO',
    internal_notes  TEXT,
    -- Audit
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comodato_status     ON comodato_requests(status);
CREATE INDEX idx_comodato_created    ON comodato_requests(created_at DESC);
CREATE INDEX idx_comodato_email      ON comodato_requests(email);
