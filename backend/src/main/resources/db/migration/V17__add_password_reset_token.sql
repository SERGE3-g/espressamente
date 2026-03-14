-- V17: Aggiunge campi per il reset password
ALTER TABLE admin_users ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN password_reset_token_expiry TIMESTAMP;

CREATE INDEX idx_admin_users_reset_token ON admin_users(password_reset_token);
