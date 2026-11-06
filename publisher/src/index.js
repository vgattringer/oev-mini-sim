import mqtt from 'mqtt';
import { fakeDataSource as dataSource } from './fake-daten.js';

const url = 'mqtt://127.0.0.1:1883'; // lokale Broker-Adresse
const password = process.env.MQTT_PUBLISHER_PASSWORD;

if (!password) {
    console.error('MQTT_PUBLISHER_PASSWORD fehlt - siehe .env');
    process.exit(1);
}

const client = mqtt.connect(url, {
    username: 'publisher',
    password,
});

async function publishAllMessages() {
    try {
        const messages = await dataSource.getMessages();
        for (const message of messages) {
            const rbl = message.data.monitors[0].locationStop.properties.attributes.rbl;
            const topic = `oev/wien/haltestelle/${rbl}/abfahrten`;
            client.publish(topic, JSON.stringify(message), { qos: 1, retain: true });
            console.log(`Gesendet: ${topic}`);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error.message);
    }
}

client.once('connect', () => {
    console.log('Mit MQTT broker verbunden');
    publishAllMessages();
});

client.on('error', (error) => {
    console.error('Fehler beim Verbinden mit MQTT broker:', error.message);
});

setInterval(() => {
    if (client.connected) publishAllMessages();
}, 10_000);