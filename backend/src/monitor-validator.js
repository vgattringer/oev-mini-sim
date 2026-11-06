const MAXIMUM_PAYLOAD_SIZE_IN_BYTES = 256 * 1024;
const TOPIC_PATTERN = /^oev\/wien\/haltestelle\/(\d+)\/abfahrten$/;

function parseMonitorMessage(topic, payloadBuffer) {
    if (payloadBuffer.length === 0) {
        throw new Error('Leere Nachricht');
    }
    if (payloadBuffer.length > MAXIMUM_PAYLOAD_SIZE_IN_BYTES) {
        throw new Error(`Nachricht zu groß: ${payloadBuffer.length} Bytes`);
    }

    const topicMatch = TOPIC_PATTERN.exec(topic);
    if (topicMatch === null) {
        throw new Error(`Unerwartetes Topic: ${topic}`);
    }
    const rblFromTopic = Number(topicMatch[1]);

    let payload;
    try {
        payload = JSON.parse(payloadBuffer.toString('utf8'));
    } catch (error) {
        throw new Error(`Kein gültiges JSON: ${error.message}`);
    }

    const properties = payload?.data?.monitors?.[0]?.locationStop?.properties;
    const rblFromPayload = properties?.attributes?.rbl;

    if (!Number.isInteger(rblFromPayload)) {
        throw new Error('rbl fehlt oder ist keine ganze Zahl');
    }
    if (rblFromPayload !== rblFromTopic) {
        throw new Error(`rbl passt nicht zum Topic: ${rblFromPayload} statt ${rblFromTopic}`);
    }
    if (typeof properties.title !== 'string' || properties.title.trim() === '') {
        throw new Error('title fehlt oder ist leer');
    }

    return { rbl: rblFromPayload, title: properties.title, payload };
}

export { parseMonitorMessage };