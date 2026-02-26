-- ============================================
-- Espressamente - Schema Iniziale
-- Database: espressamente_db
-- ============================================

-- ── Categorie ──
CREATE TABLE categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    description     TEXT,
    image           VARCHAR(500),
    parent_id       BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ── Brand ──
CREATE TABLE brands (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    logo            VARCHAR(500),
    description     TEXT,
    website         VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);

-- ── Prodotti ──
CREATE TABLE products (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(220) NOT NULL UNIQUE,
    short_description   VARCHAR(500),
    description         TEXT,
    product_type        VARCHAR(20) NOT NULL CHECK (product_type IN ('CAFFE', 'MACCHINA', 'ACCESSORIO')),
    price               DECIMAL(10, 2),
    price_label         VARCHAR(50),
    category_id         BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id            BIGINT REFERENCES brands(id) ON DELETE SET NULL,
    images              JSONB DEFAULT '[]'::jsonb,
    features            JSONB DEFAULT '[]'::jsonb,
    is_featured         BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    sort_order          INTEGER DEFAULT 0,
    meta_title          VARCHAR(160),
    meta_description    VARCHAR(320),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;

-- ── Richieste di Contatto ──
CREATE TABLE contact_requests (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    subject         VARCHAR(200),
    message         TEXT NOT NULL,
    contact_type    VARCHAR(20) NOT NULL DEFAULT 'INFO' CHECK (contact_type IN ('INFO', 'PREVENTIVO', 'ASSISTENZA', 'ALTRO')),
    status          VARCHAR(20) NOT NULL DEFAULT 'NUOVO' CHECK (status IN ('NUOVO', 'IN_LAVORAZIONE', 'COMPLETATO', 'ARCHIVIATO')),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_status ON contact_requests(status);
CREATE INDEX idx_contact_created ON contact_requests(created_at DESC);

-- ── Richieste di Assistenza ──
CREATE TABLE service_requests (
    id                  BIGSERIAL PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL,
    phone               VARCHAR(20),
    machine_type        VARCHAR(100),
    machine_brand       VARCHAR(100),
    machine_model       VARCHAR(100),
    issue_description   TEXT NOT NULL,
    preferred_date      DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'NUOVO' CHECK (status IN ('NUOVO', 'IN_LAVORAZIONE', 'COMPLETATO', 'ARCHIVIATO')),
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_status ON service_requests(status);
CREATE INDEX idx_service_created ON service_requests(created_at DESC);

-- ── Pagine Statiche ──
CREATE TABLE pages (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    slug                VARCHAR(220) NOT NULL UNIQUE,
    content             TEXT NOT NULL,
    meta_title          VARCHAR(160),
    meta_description    VARCHAR(320),
    is_published        BOOLEAN DEFAULT FALSE,
    sort_order          INTEGER DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pages_slug ON pages(slug);

-- ── Admin Users ──
CREATE TABLE admin_users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    email           VARCHAR(150) NOT NULL UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ── Dati Iniziali ──

-- Admin default (password: admin123 - DA CAMBIARE IN PRODUZIONE!)
INSERT INTO admin_users (username, password, full_name, email) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amministratore', 'admin@espressamente.it');

-- Categorie principali
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Caffè in Grani', 'caffe-in-grani', 'Selezione di caffè in grani delle migliori torrefazioni', 1),
('Caffè Macinato', 'caffe-macinato', 'Caffè macinato fresco per ogni tipo di preparazione', 2),
('Cialde e Capsule', 'cialde-e-capsule', 'Cialde ESE e capsule compatibili di qualità', 3),
('Macchine Espresso', 'macchine-espresso', 'Macchine da caffè espresso per casa e ufficio', 4),
('Macchine Professionali', 'macchine-professionali', 'Macchine da caffè per bar e ristoranti', 5),
('Macinacaffè', 'macinacaffe', 'Macinacaffè manuali e elettrici', 6),
('Accessori', 'accessori', 'Tazze, tamper, bricchi e tutto il necessario', 7);

-- Brand di esempio
INSERT INTO brands (name, slug, description, sort_order) VALUES
('La Marzocco', 'la-marzocco', 'Eccellenza fiorentina nelle macchine da caffè professionali', 1),
('Rocket Espresso', 'rocket-espresso', 'Design italiano e ingegneria di precisione', 2),
('Eureka', 'eureka', 'Macinacaffè di qualità superiore dal 1920', 3),
('Caffè Vergnano', 'caffe-vergnano', 'La più antica torrefazione italiana, dal 1882', 4),
('Lavazza', 'lavazza', 'Il caffè italiano per eccellenza', 5);

-- Pagine statiche
INSERT INTO pages (title, slug, content, is_published, sort_order) VALUES
('Chi Siamo', 'chi-siamo', '<h2>La Nostra Storia</h2><p>Contenuto da personalizzare...</p>', TRUE, 1),
('Assistenza', 'assistenza', '<h2>I Nostri Servizi</h2><p>Contenuto da personalizzare...</p>', TRUE, 2);
