import { pool } from './database.js';

const UPSERT_MONITOR_SQL = `
    INSERT INTO monitors (rbl, title, payload, received_at)
    VALUES ($1, $2, $3, now())
    ON CONFLICT (rbl) DO UPDATE
    SET title = EXCLUDED.title,
        payload = EXCLUDED.payload,
        received_at = now()
`;

const SELECT_MONITOR_PAYLOAD_SQL = `
    SELECT payload
    FROM monitors
    WHERE rbl = $1
`;

async function findMonitorPayloadByRbl(rbl) {
    const result = await pool.query(SELECT_MONITOR_PAYLOAD_SQL, [rbl]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0].payload;
}

async function saveMonitor({ rbl, title, payload }) {
    await pool.query(UPSERT_MONITOR_SQL, [rbl, title, JSON.stringify(payload)]);
}

export { saveMonitor, findMonitorPayloadByRbl };