import { useEffect, useState } from 'react'
import { openDepartureSocket } from './api/departure-socket.js'
import DepartureBoard from './components/DepartureBoard.jsx'
import { readStopId } from './utils/read-stop-id.js'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'

function App() {
    const stopId = readStopId(window.location.search)
    const [monitorData, setMonitorData] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (stopId === null) {
            return
        }

        let isActive = true

        const socket = openDepartureSocket(
            stopId,
            (loadedMonitorData) => {
                if (isActive) {
                    setMonitorData(loadedMonitorData)
                    setErrorMessage('')
                }
            },
            (problemMessage) => {
                if (isActive) {
                    setErrorMessage(problemMessage)
                }
            },
        )

        return () => {
            isActive = false
            socket.close()
        }
    }, [stopId])

    if (stopId === null) {
        return <Alert variant="info">Bitte eine Haltestelle angeben, zum Beispiel ?stopId=252</Alert>
    }

    if (errorMessage) {
        return <Alert variant="danger">Fehler: {errorMessage}</Alert>
    }

    if (monitorData === null) {
        return (
            <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" role="status" />
                <span>Warte auf Daten für Haltestelle {stopId} ...</span>
            </div>
        )
    }

    return <DepartureBoard monitorData={monitorData} />
}

export default App