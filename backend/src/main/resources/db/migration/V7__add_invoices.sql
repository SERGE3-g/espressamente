-- Sequence per numerazione fatture
CREATE SEQUENCE invoice_number_seq START WITH 1 INCREMENT BY 1;

-- Fatture
CREATE TABLE invoices (
    id                  BIGSERIAL PRIMARY KEY,
    invoice_number      VARCHAR(20) NOT NULL UNIQUE,
    customer_id         BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'BOZZA'
                        CHECK (status IN ('BOZZA', 'INVIATA', 'PAGATA', 'SCADUTA', 'ANNULLATA')),
    payment_method      VARCHAR(20)
                        CHECK (payment_method IN ('CONTANTI', 'BONIFICO', 'CARTA', 'PAYPAL', 'ALTRO')),
    issue_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date            DATE,
    paid_date           DATE,
    subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_rate            NUMERIC(5,2) NOT NULL DEFAULT 22.00,
    tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
    total               NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Righe fattura
CREATE TABLE invoice_items (
    id                  BIGSERIAL PRIMARY KEY,
    invoice_id          BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id          BIGINT REFERENCES products(id) ON DELETE SET NULL,
    description         VARCHAR(255) NOT NULL,
    quantity            INTEGER NOT NULL DEFAULT 1,
    unit_price          NUMERIC(10,2) NOT NULL DEFAULT 0,
    total               NUMERIC(10,2) NOT NULL DEFAULT 0,
    sort_order          INTEGER DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
