import { useEffect, useState } from 'react'
import { openDepartureSocket } from './api/departure-socket.js'
import { loadStopList } from './api/stop-list.js'
import DepartureBoard from './components/DepartureBoard.jsx'
import StopSelector from './components/StopSelector.jsx'
import { readStopIds } from './utils/read-stop-ids.js'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'


function DepartureView({ stopIds }) {
    const [monitorDataByStopId, setMonitorDataByStopId] = useState({})
    const [errorMessage, setErrorMessage] = useState('')

    const stopIdsKey = stopIds.join(',')

    useEffect(() => {
        if (stopIdsKey === '') {
            return
        }

        let isActive = true

        const sockets = stopIdsKey.split(',').map((stopId) =>
            openDepartureSocket(
                stopId,
                (loadedMonitorData) => {
                    if (isActive) {
                        setMonitorDataByStopId((previousMonitorDataByStopId) => ({
                            ...previousMonitorDataByStopId,
                            [stopId]: loadedMonitorData,
                        }))
                        setErrorMessage('')
                    }
                },
                (problemMessage) => {
                    if (isActive) {
                        setErrorMessage(problemMessage)
                    }
                },
            ),
        )

        return () => {
            isActive = false
            sockets.forEach((socket) => socket.close())
        }
    }, [stopIdsKey])

    if (stopIds.length === 0) {
        return null
    }

    if (errorMessage) {
        return <Alert variant="danger">Fehler: {errorMessage}</Alert>
    }

    const loadedStopIds = stopIds.filter((stopId) => monitorDataByStopId[stopId] !== undefined)

    if (loadedStopIds.length === 0) {
        return (
            <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" role="status" />
                <span>Warte auf Daten ...</span>
            </div>
        )
    }

    const visibleMonitorDataByStopId = Object.fromEntries(
        loadedStopIds.map((stopId) => [stopId, monitorDataByStopId[stopId]]),
    )

    return <DepartureBoard monitorDataByStopId={visibleMonitorDataByStopId} />
}

function App() {
    const requestedStopIds = readStopIds(window.location.search)
    const [stops, setStops] = useState([])
    const [isStopListLoaded, setIsStopListLoaded] = useState(false)
    const [stopListErrorMessage, setStopListErrorMessage] = useState('')

    useEffect(() => {
        loadStopList()
            .then((loadedStops) => {
                setStops(loadedStops)
                setIsStopListLoaded(true)
            })
            .catch((error) => setStopListErrorMessage(error.message))
    }, [])

    const knownStopIds = new Set(stops.map((stop) => String(stop.rbl)))

    const unknownStopIds = isStopListLoaded
        ? requestedStopIds.filter((stopId) => !knownStopIds.has(stopId))
        : []

    let visibleStopIds = []
    if (isStopListLoaded) {
        visibleStopIds = requestedStopIds.length === 0
            ? stops.map((stop) => String(stop.rbl))
            : requestedStopIds.filter((stopId) => knownStopIds.has(stopId))
    }

    const selectedStopId = requestedStopIds.length === 1 ? requestedStopIds[0] : null
    const isUnknownStop = requestedStopIds.length === 1 && unknownStopIds.length === 1

    return (
        <>
            <div className="mb-3">
                <StopSelector stops={stops} selectedStopId={selectedStopId} isUnknownStop={isUnknownStop} />
            </div>
            {stopListErrorMessage && <Alert variant="danger">Fehler: {stopListErrorMessage}</Alert>}
            {unknownStopIds.length > 0 && !isUnknownStop && (
                <Alert variant="warning">
                    Diese Haltestellen gibt es nicht und werden nicht angezeigt: {unknownStopIds.join(', ')}
                </Alert>
            )}
            <DepartureView stopIds={visibleStopIds} />
        </>
    )
}

export default App