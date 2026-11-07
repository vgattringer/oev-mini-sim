const RECONNECT_DELAY_IN_MILLISECONDS = 3000

export function openDepartureSocket(stopId, onMonitorData, onProblem) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const address = `${protocol}//${window.location.host}/ws?stopId=${encodeURIComponent(stopId)}`

    let socket = null
    let reconnectTimeoutId = null
    let isClosedByCaller = false

    function connect() {
        socket = new WebSocket(address)

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

        socket.onclose = (event) => {
            if (isClosedByCaller) {
                return
            }

            if (event.code === 1008) {
                onProblem('Ungültige Haltestelle')
                return
            }

            onProblem('Verbindung getrennt, neuer Versuch ...')
            reconnectTimeoutId = setTimeout(connect, RECONNECT_DELAY_IN_MILLISECONDS)
        }
    }

    connect()

    return {
        close() {
            isClosedByCaller = true
            clearTimeout(reconnectTimeoutId)
            socket.close()
        },
    }
}