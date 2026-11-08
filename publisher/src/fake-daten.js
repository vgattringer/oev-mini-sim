/**
 * @fileoverview Fake-Datenquelle im Originalformat der Wiener-Linien-Monitor-Antwort.
 *
 * Sie erfüllt wie wienerlinien.js den Vertrag DataSource (siehe data-source.js)
 * und dient zum Testen ohne Internet und ohne das Abfragelimit der Wiener Linien.
 *
 * RBL 252 "Rathaus U" und Linie 2 sind echt (Werte aus einer echten Antwort).
 * RBL 9001 "Teststation" und Linie D sind erfunden, ohne Echtzeitdaten.
 *
 * Verwendung: In index.js statt wienerLinienDataSource die fakeDataSource aus
 * dieser Datei verwenden.
 *
 * Hinweis: 252 und 9001 stehen nicht in data/echtzeit-haltepunkte.json. Das Frontend
 * zeigt sie deshalb nicht an. Zum Ansehen der Daten dient GET /api/departures/<RBL>
 * (nur Fehlersuche).
 *
 * @see data-source.js
 */

const DEPARTURES_PER_LINE = 2; // das Original liefert zehn
const MINUTES_UNTIL_FIRST_DEPARTURE = 1;
const MINUTES_BETWEEN_DEPARTURES = 7;

const monitors = [
    {
        locationStop: {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [16.3547909, 48.2091755] },
            properties: {
                name: '60201072',
                title: 'Rathaus U',
                municipality: 'Wien',
                municipalityId: 49000001,
                type: 'stop',
                coordName: 'WGS84',
                attributes: { rbl: 252 },
            },
        },
        lines: [
            {
                name: '2',
                towards: 'Friedrich-Engels-Platz',
                direction: 'H',
                platform: '1',
                richtungsId: '1',
                barrierFree: true,
                realtimeSupported: true,
                trafficjam: false,
                type: 'ptTram',
                lineId: 102,
            },
        ],
        attributes: {},
    },
    {
        locationStop: {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [16.37, 48.21] },
            properties: {
                name: '99999999',
                title: 'Teststation',
                municipality: 'Wien',
                municipalityId: 49000001,
                type: 'stop',
                coordName: 'WGS84',
                attributes: { rbl: 9001 },
            },
        },
        lines: [
            {
                name: 'D',
                towards: 'Nußdorf',
                direction: 'R',
                platform: '2',
                richtungsId: '2',
                barrierFree: false,
                realtimeSupported: false,
                trafficjam: false,
                type: 'ptTram',
                lineId: 9004,
            },
        ],
        attributes: {},
    },
];

function buildDeparture(line, currentTimeInMilliseconds, departureIndex) {
    const minutesUntilDeparture =
        MINUTES_UNTIL_FIRST_DEPARTURE + departureIndex * MINUTES_BETWEEN_DEPARTURES;
    const plannedTimeInMilliseconds =
        currentTimeInMilliseconds + minutesUntilDeparture * 60_000;
    const departureTime = { timePlanned: new Date(plannedTimeInMilliseconds).toISOString() };

    let effectiveTimeInMilliseconds = plannedTimeInMilliseconds;
    if (line.realtimeSupported) {
        const delayInSeconds = Math.floor(Math.random() * 200) - 20; // -20 bis +179
        effectiveTimeInMilliseconds = plannedTimeInMilliseconds + delayInSeconds * 1000;
        departureTime.timeReal = new Date(effectiveTimeInMilliseconds).toISOString();
    }
    departureTime.countdown = Math.max(
        0,
        Math.round((effectiveTimeInMilliseconds - currentTimeInMilliseconds) / 60_000),
    );

    return {
        departureTime,
        vehicle: {
            name: line.name,
            towards: line.towards,
            direction: line.direction,
            platform: line.platform,
            richtungsId: line.richtungsId,
            barrierFree: line.barrierFree,
            cooling: true,
            realtimeSupported: line.realtimeSupported,
            trafficjam: line.trafficjam,
            type: line.type,
            attributes: {},
            linienId: line.lineId,
        },
    };
}

function buildMessage(monitor) {
    const currentTimeInMilliseconds = Date.now();
    return {
        data: {
            monitors: [
                {
                    locationStop: monitor.locationStop,
                    lines: monitor.lines.map((line) => ({
                        name: line.name,
                        towards: line.towards,
                        direction: line.direction,
                        platform: line.platform,
                        richtungsId: line.richtungsId,
                        barrierFree: line.barrierFree,
                        realtimeSupported: line.realtimeSupported,
                        trafficjam: line.trafficjam,
                        departures: {
                            departure: [...Array(DEPARTURES_PER_LINE).keys()].map(
                                (departureIndex) =>
                                    buildDeparture(line, currentTimeInMilliseconds, departureIndex),
                            ),
                        },
                        type: line.type,
                        lineId: line.lineId,
                    })),
                    attributes: monitor.attributes,
                },
            ],
        },
        message: {
            value: 'OK',
            messageCode: 1,
            serverTime: new Date(currentTimeInMilliseconds).toISOString(),
        },
    };
}

/** @type {import('./data-source.js').DataSource} */
export const fakeDataSource = {
    async getMessages() {
        return monitors.map((monitor) => buildMessage(monitor));
    },
};