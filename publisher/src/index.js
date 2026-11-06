import mqtt from 'mqtt';

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

client.on('connect', () => {
    console.log('Mit MQTT broker verbunden');
});

client.on('error', (err) => {
    console.error('Fehler beim Verbinden mit MQTT broker:', err.message);
});