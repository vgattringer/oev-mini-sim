import { useEffect, useState } from 'react'
import { openDepartureSocket } from './api/departure-socket.js'
import { loadStopList } from './api/stop-list.js'
import DepartureBoard from './components/DepartureBoard.jsx'
import StopSelector from './components/StopSelector.jsx'
import { readStopId } from './utils/read-stop-id.js'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'


function DepartureView({ stopId }) {
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

function App() {
    const stopId = readStopId(window.location.search)
    const [stops, setStops] = useState([])
    const [stopListErrorMessage, setStopListErrorMessage] = useState('')

    useEffect(() => {
        loadStopList()
            .then(setStops)
            .catch((error) => setStopListErrorMessage(error.message))
    }, [])

    const isUnknownStop =
        stopId !== null &&
        stops.length > 0 &&
        !stops.some((stop) => String(stop.rbl) === stopId)

    return (
        <>
            <div className="mb-3">
                <StopSelector stops={stops} selectedStopId={stopId} isUnknownStop={isUnknownStop} />
            </div>
            {stopListErrorMessage && <Alert variant="danger">Fehler: {stopListErrorMessage}</Alert>}
            {!isUnknownStop && <DepartureView stopId={stopId} />}
        </>
    )
}

export default App