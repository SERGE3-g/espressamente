-- Aggiunge consenso privacy a service_requests (era mancante a differenza di contact/comodato)
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN NOT NULL DEFAULT FALSE;
