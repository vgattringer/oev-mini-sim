import { pool } from './database.js';

const UPSERT_MONITOR_SQL = `
    INSERT INTO monitors (rbl, title, payload, received_at)
    VALUES ($1, $2, $3, now())
    ON CONFLICT (rbl) DO UPDATE
    SET title = EXCLUDED.title,
        payload = EXCLUDED.payload,
        received_at = now()
`;

async function saveMonitor({ rbl, title, payload }) {
    await pool.query(UPSERT_MONITOR_SQL, [rbl, title, JSON.stringify(payload)]);
}

export { saveMonitor };