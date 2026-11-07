import { useEffect, useState } from 'react'
import { fetchDepartures } from './api/departures.js'
import DepartureBoard from './components/DepartureBoard.jsx'
import { readStopId } from './utils/read-stop-id.js'

const POLLING_INTERVAL_IN_MILLISECONDS = 5000

function App() {
    const stopId = readStopId(window.location.search)
    const [monitorData, setMonitorData] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (stopId === null) {
            return
        }

        let isActive = true

        async function loadDepartures() {
            try {
                const loadedMonitorData = await fetchDepartures(stopId)

                if (isActive) {
                    setMonitorData(loadedMonitorData)
                    setErrorMessage('')
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(error.message)
                }
            }
        }

        loadDepartures()
        const intervalId = setInterval(loadDepartures, POLLING_INTERVAL_IN_MILLISECONDS)

        return () => {
            isActive = false
            clearInterval(intervalId)
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