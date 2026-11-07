import { WebSocketServer, WebSocket } from 'ws';

const socketsByRbl = new Map();

function addSocket(rbl, socket) {
    if (!socketsByRbl.has(rbl)) {
        socketsByRbl.set(rbl, new Set());
    }
    socketsByRbl.get(rbl).add(socket);
}

function removeSocket(rbl, socket) {
    const sockets = socketsByRbl.get(rbl);
    if (sockets === undefined) {
        return;
    }
    sockets.delete(socket);
    if (sockets.size === 0) {
        socketsByRbl.delete(rbl);
    }
}

function attachWebSocketServer(httpServer, loadCurrentPayload) {
    const webSocketServer = new WebSocketServer({ server: httpServer, path: '/ws' });

    webSocketServer.on('connection', async (socket, request) => {
        const url = new URL(request.url, 'http://localhost');
        const rbl = Number(url.searchParams.get('stopId'));

        if (!Number.isInteger(rbl) || rbl <= 0) {
            socket.close(1008, 'stopId muss eine positive ganze Zahl sein');
            return;
        }

        addSocket(rbl, socket);
        console.log(`WebSocket-Client verbunden (rbl ${rbl})`);

        socket.on('close', () => {
            removeSocket(rbl, socket);
            console.log(`WebSocket-Client getrennt (rbl ${rbl})`);
        });

        socket.on('error', (error) => {
            console.error(`WebSocket-Fehler (rbl ${rbl}): ${error.message}`);
        });

        try {
            const currentPayload = await loadCurrentPayload(rbl);
            if (currentPayload !== null && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(currentPayload));
            }
        } catch (error) {
            console.error(`Aktueller Stand konnte nicht gesendet werden (rbl ${rbl}): ${error.message}`);
        }
    });
}

function broadcastMonitor(rbl, payload) {
    const sockets = socketsByRbl.get(rbl);
    if (sockets === undefined) {
        return;
    }

    const message = JSON.stringify(payload);
    for (const socket of sockets) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
    }
}

export { attachWebSocketServer, broadcastMonitor };