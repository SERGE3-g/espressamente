-- Espandi colonne a TEXT per supportare dati cifrati AES-256-GCM (base64 > VARCHAR limit originale)

ALTER TABLE customers
    ALTER COLUMN full_name   TYPE TEXT,
    ALTER COLUMN email       TYPE TEXT,
    ALTER COLUMN phone       TYPE TEXT,
    ALTER COLUMN company_name TYPE TEXT,
    ALTER COLUMN vat_number  TYPE TEXT,
    ALTER COLUMN fiscal_code TYPE TEXT,
    ALTER COLUMN address     TYPE TEXT,
    ALTER COLUMN city        TYPE TEXT,
    ALTER COLUMN province    TYPE TEXT,
    ALTER COLUMN cap         TYPE TEXT;

ALTER TABLE contact_requests
    ALTER COLUMN full_name TYPE TEXT,
    ALTER COLUMN email     TYPE TEXT,
    ALTER COLUMN phone     TYPE TEXT;

ALTER TABLE service_requests
    ALTER COLUMN full_name TYPE TEXT,
    ALTER COLUMN email     TYPE TEXT,
    ALTER COLUMN phone     TYPE TEXT;

ALTER TABLE comodato_requests
    ALTER COLUMN full_name    TYPE TEXT,
    ALTER COLUMN email        TYPE TEXT,
    ALTER COLUMN phone        TYPE TEXT,
    ALTER COLUMN company_name TYPE TEXT,
    ALTER COLUMN address      TYPE TEXT,
    ALTER COLUMN vat_number   TYPE TEXT;
