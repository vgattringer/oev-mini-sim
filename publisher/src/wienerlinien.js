import { readFileSync } from 'node:fs';
import path from 'node:path';

// Datenquelle: Wiener Linien, Open Government Data (Lizenz CC BY),
// Datenherkunft: Stadt Wien - data.wien.gv.at, https://www.wienerlinien.at/open-data

const MONITOR_URL = 'https://www.wienerlinien.at/ogd_realtime/monitor';
const MAXIMUM_DEPARTURES_PER_LINE = 2;
const REQUEST_TIMEOUT_MILLISECONDS = 10_000;
const STOP_IDS_FILE_PATH = path.join(import.meta.dirname, '..', '..', 'data', 'echtzeit-haltepunkte.json');

// RBL-Nummern (Haltepunkte) aus der gemeinsamen Datei, siehe README
const STOP_IDS = JSON.parse(readFileSync(STOP_IDS_FILE_PATH, 'utf-8')).rbls;

// Eine einzige Anfrage für alle Haltepunkte, damit das Abfragelimit
// der Wiener Linien (Code 316) nicht erreicht wird.
async function fetchMonitorResponse() {
    const query = STOP_IDS.map((stopId) => `stopId=${stopId}`).join('&');
    const url = `${MONITOR_URL}?${query}`;
    const started = Date.now();
    const response = await fetch(`${MONITOR_URL}?${query}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    });

    // Debug-Ausgabe, falls DEBUG_HTTP gesetzt ist; Starten mit DEBUG_HTTP=1 node --env-file=../.env src/index.js
    if (process.env.DEBUG_HTTP) {
        console.log(`[WL] GET ${url} -> ${response.status} (${Date.now() - started} ms)`);
    }
    
    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        const bodyStart = (await response.text()).replace(/\s+/g, ' ').slice(0, 200);
        throw new Error(`Status ${response.status}, Retry-After: ${retryAfter ?? 'nicht angegeben'}, Antwort: ${bodyStart}`);
    }
    return response.json();
}

// Die Antwort enthält einen Monitor pro Linie und Haltepunkt.
// Hier werden die Monitore nach RBL zusammengefasst.
function groupMonitorsByRbl(monitors) {
    const monitorsByRbl = new Map();
    for (const monitor of monitors) {
        const rbl = monitor.locationStop.properties.attributes.rbl;
        if (!monitorsByRbl.has(rbl)) {
            monitorsByRbl.set(rbl, []);
        }
        monitorsByRbl.get(rbl).push(monitor);
    }
    return monitorsByRbl;
}

function limitDepartures(message) {
    for (const monitor of message.data.monitors) {
        for (const line of monitor.lines) {
            if (line.departures?.departure) {
                line.departures.departure = line.departures.departure.slice(0, MAXIMUM_DEPARTURES_PER_LINE);
            }
        }
    }
    return message;
}

async function getMessages() {
    const monitorResponse = await fetchMonitorResponse();
    const monitorsByRbl = groupMonitorsByRbl(monitorResponse.data?.monitors ?? []);

    for (const stopId of STOP_IDS) {
        if (!monitorsByRbl.has(stopId)) {
            console.error(`Keine Monitordaten für Haltestelle ${stopId}`);
        }
    }

    const messages = [];
    for (const monitors of monitorsByRbl.values()) {
        messages.push(limitDepartures({ data: { monitors }, message: monitorResponse.message }));
    }
    return messages;
}

/** @type {import('./data-source.js').DataSource} */
export const wienerLinienDataSource = { getMessages };