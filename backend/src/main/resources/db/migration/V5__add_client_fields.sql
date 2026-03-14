-- Aggiunge tipo cliente e P.IVA al comodato
ALTER TABLE comodato_requests
    ADD COLUMN client_type VARCHAR(10) NOT NULL DEFAULT 'PRIVATO',
    ADD COLUMN vat_number  VARCHAR(20);

-- Aggiunge privacy consent e company ai contatti
ALTER TABLE contact_requests
    ADD COLUMN privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN company_name    VARCHAR(150);
