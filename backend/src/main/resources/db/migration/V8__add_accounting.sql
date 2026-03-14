-- Registrazioni contabili
CREATE TABLE accounting_entries (
    id                  BIGSERIAL PRIMARY KEY,
    type                VARCHAR(10) NOT NULL CHECK (type IN ('ENTRATA', 'USCITA')),
    category            VARCHAR(30) NOT NULL CHECK (category IN (
                            'VENDITA', 'COMODATO', 'ASSISTENZA',
                            'FORNITORE', 'AFFITTO', 'UTENZE', 'PERSONALE',
                            'MARKETING', 'LOGISTICA', 'ALTRO'
                        )),
    amount              NUMERIC(10,2) NOT NULL,
    description         VARCHAR(255) NOT NULL,
    date                DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_id          BIGINT REFERENCES invoices(id) ON DELETE SET NULL,
    customer_id         BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accounting_date ON accounting_entries(date);
CREATE INDEX idx_accounting_type ON accounting_entries(type);
CREATE INDEX idx_accounting_invoice ON accounting_entries(invoice_id);
