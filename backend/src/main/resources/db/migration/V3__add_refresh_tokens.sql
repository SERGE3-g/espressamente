-- ─────────────────────────────────────────────────────────────────────────────
-- V3: Refresh tokens per autenticazione JWT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE refresh_tokens (
    id            BIGSERIAL PRIMARY KEY,
    token         VARCHAR(512) NOT NULL UNIQUE,
    admin_user_id BIGINT       NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at    TIMESTAMP    NOT NULL,
    revoked       BOOLEAN      NOT NULL DEFAULT FALSE,
    revoked_at    TIMESTAMP,
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(255),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token       ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user        ON refresh_tokens(admin_user_id);
CREATE INDEX idx_refresh_tokens_expires     ON refresh_tokens(expires_at);
