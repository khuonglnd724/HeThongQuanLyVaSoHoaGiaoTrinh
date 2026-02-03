\connect logs_db;

CREATE TABLE IF NOT EXISTS system_logs (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NULL,
  service VARCHAR(100) NULL,
  level VARCHAR(20) NULL,
  message TEXT NULL,
  trace_id VARCHAR(128) NULL,
  span_id VARCHAR(128) NULL,
  labels JSONB NULL,
  raw JSONB NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_ts ON system_logs (ts DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_service ON system_logs (service);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs (level);
