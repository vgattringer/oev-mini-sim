import express from 'express';
import { checkDatabaseConnection } from './database.js';
import { startMqttSubscriber } from './mqtt-subscriber.js';
import { parseMonitorMessage } from './monitor-validator.js';
import { saveMonitor, findMonitorPayloadByRbl  } from './monitor-storage.js';

const PORT = 3000;

async function handleMqttMessage(topic, payloadBuffer) {
    let monitor;
    try {
        monitor = parseMonitorMessage(topic, payloadBuffer);
    } catch (error) {
        console.warn(`Nachricht verworfen (${topic}): ${error.message}`);
        return;
    }

    try {
        await saveMonitor(monitor);
        console.log(`Gespeichert: rbl ${monitor.rbl} (${monitor.title})`);
    } catch (error) {
        console.error(`Speichern fehlgeschlagen (rbl ${monitor.rbl}): ${error.message}`);
    }
}

async function startBackend() {
    await checkDatabaseConnection();

    // Es wird die Funktion handleMqttMessage weitergegeben 
    // (ohne Klammern dahinter, sie wird also nicht aufgerufen). 
    // Der Subscriber ruft sie später bei jeder Nachricht selbst auf. 
    // In C# wäre das ein Delegate oder Action.
    startMqttSubscriber(handleMqttMessage);

    const app = express();

    app.get('/api/health', (request, response) => {
        response.json({ status: 'ok' });
    });

    app.get('/api/departures/:stopId', async (request, response) => {
        const rbl = Number(request.params.stopId);
        if (!Number.isInteger(rbl) || rbl <= 0) {
            response.status(400).json({ message: { value: 'stopId muss eine positive ganze Zahl sein' } });
            return;
        }

        try {
            const payload = await findMonitorPayloadByRbl(rbl);
            if (payload === null) {
                response.status(404).json({ message: { value: 'Haltestelle nicht gefunden' } });
                return;
            }
            response.json(payload);
        } catch (error) {
            console.error(`Abfrage fehlgeschlagen (rbl ${rbl}): ${error.message}`);
            response.status(500).json({ message: { value: 'Interner Fehler' } });
        }
    });    

    app.listen(PORT, () => {
        console.log(`Backend läuft auf http://localhost:${PORT}`);
    });
}

startBackend().catch((error) => {
    console.error('Backend konnte nicht gestartet werden:', error.message);
    process.exit(1);
});