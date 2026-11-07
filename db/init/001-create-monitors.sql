-- Wird vom Postgres-Container nur beim ersten Start mit leerem Volume ausgeführt.
CREATE TABLE IF NOT EXISTS monitors (
    rbl integer PRIMARY KEY,
    title text NOT NULL,
    payload jsonb NOT NULL,
    received_at timestamptz NOT NULL DEFAULT now()
);