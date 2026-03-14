-- Audit log delle azioni degli amministratori
CREATE TABLE admin_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    admin_username  VARCHAR(50) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_admin   ON admin_audit_logs(admin_username);
CREATE INDEX idx_audit_entity  ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);
