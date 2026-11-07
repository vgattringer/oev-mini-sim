export function openDepartureSocket(stopId, onMonitorData, onProblem) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const address = `${protocol}//${window.location.host}/ws?stopId=${encodeURIComponent(stopId)}`
    const socket = new WebSocket(address)

    socket.onmessage = (event) => {
        let monitorData

        try {
            monitorData = JSON.parse(event.data)
        } catch {
            onProblem('Nachricht konnte nicht gelesen werden')
            return
        }

        onMonitorData(monitorData)
    }

    socket.onerror = () => {
        onProblem('Verbindung zum Server gestört')
    }

    socket.onclose = (event) => {
        if (event.code === 1008) {
            onProblem('Ungültige Haltestelle')
        } else {
            onProblem('Verbindung getrennt')
        }
    }

    return socket
}