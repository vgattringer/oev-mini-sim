import { readFileSync } from 'node:fs';
import path from 'node:path';

// Quelle der Daten: Wiener Linien, Open Government Data (Lizenz CC BY),
// Datei wienerlinien-ogd-haltepunkte.csv
const STOPS_FILE_PATH = path.join(import.meta.dirname, '..', '..', 'data', 'haltepunkte.csv');

const SUPPORTED_STOP_IDS_FILE_PATH = path.join(import.meta.dirname, '..', '..', 'data', 'echtzeit-haltepunkte.json');

export function loadStopList() {
    const fileContent = readFileSync(STOPS_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/).slice(1);

    const supportedStopIds = new Set(JSON.parse(readFileSync(SUPPORTED_STOP_IDS_FILE_PATH, 'utf-8')).rbls);

    const stops = [];
    for (const line of lines) {
        if (line.trim() === '') {
            continue;
        }
        const columns = line.split(';');
        const title = columns[2].trim();
        if (title === '') {
            continue;
        }
        const rbl = Number(columns[0]);
        if (!supportedStopIds.has(rbl)) {
            continue;
        }
        stops.push({ rbl, title });
    }

    stops.sort((first, second) => first.title.localeCompare(second.title, 'de') || first.rbl - second.rbl);
    return stops;
}