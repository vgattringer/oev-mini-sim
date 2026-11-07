import { useEffect, useState } from 'react'
import { openDepartureSocket } from './api/departure-socket.js'
import DepartureBoard from './components/DepartureBoard.jsx'
import { readStopId } from './utils/read-stop-id.js'

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
        return <p>Bitte eine Haltestelle angeben, zum Beispiel ?stopId=252</p>
    }

    if (errorMessage) {
        return <p>Fehler: {errorMessage}</p>
    }

    if (monitorData === null) {
        return <p>Lade Abfahrten ...</p>
    }

    return <DepartureBoard monitorData={monitorData} />
}

export default App