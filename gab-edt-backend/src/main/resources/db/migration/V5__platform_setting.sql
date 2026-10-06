CREATE TABLE platform_setting (
    setting_key   VARCHAR(64)  PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    updated_at    TIMESTAMP    NOT NULL
);

INSERT INTO platform_setting (setting_key, setting_value, updated_at)
VALUES ('maintenance_mode', 'false', CURRENT_TIMESTAMP);
