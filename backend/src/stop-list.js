import { readFileSync } from 'node:fs';
import path from 'node:path';

// Quelle der Daten: Wiener Linien, Open Government Data (Lizenz CC BY),
// Datei wienerlinien-ogd-haltepunkte.csv
const STOPS_FILE_PATH = path.join(import.meta.dirname, '..', '..', 'data', 'haltepunkte.csv');

export function loadStopList() {
    const fileContent = readFileSync(STOPS_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/).slice(1);

    const stops = [];
    for (const line of lines) {
        if (line.trim() === '') {
            continue;
        }
        const columns = line.split(';');
        stops.push({ rbl: Number(columns[0]), title: columns[2] });
    }

    stops.sort((first, second) => first.title.localeCompare(second.title, 'de') || first.rbl - second.rbl);
    return stops;
}