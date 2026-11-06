import mqtt from 'mqtt';

const BROKER_URL = 'mqtt://127.0.0.1:1883';
const TOPIC_FILTER = 'oev/wien/haltestelle/+/abfahrten';

function startMqttSubscriber(onMessageReceived) {
    const client = mqtt.connect(BROKER_URL, {
        username: 'backend',
        password: process.env.MQTT_BACKEND_PASSWORD,
    });

    client.on('connect', () => {
        console.log('MQTT-Verbindung steht');

        // QoS (Quality of Service) = Zustellgarantie von MQTT:
        // 0 = höchstens einmal, 1 = mindestens einmal, 2 = genau einmal.
        // Mit 1 wiederholt der Broker, bis wir den Empfang bestätigen.
        // Doppelte Nachrichten sind möglich, aber unkritisch, weil der Upsert dieselbe Zeile einfach noch einmal überschreibt.
        client.subscribe(TOPIC_FILTER, { qos: 1 }, (error) => {
            if (error) {
                console.error('MQTT-Abo fehlgeschlagen:', error.message);
                return;
            }
            console.log(`MQTT-Abo aktiv: ${TOPIC_FILTER}`);
        });
    });

    client.on('message', (topic, payloadBuffer) => {
        onMessageReceived(topic, payloadBuffer);
    });

    client.on('reconnect', () => {
        console.log('MQTT-Verbindung wird neu aufgebaut');
    });

    client.on('error', (error) => {
        console.error('MQTT-Fehler:', error.message);
    });

    return client;
}

export { startMqttSubscriber };