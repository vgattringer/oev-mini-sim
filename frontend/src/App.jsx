import { useEffect, useState } from 'react'
import { fetchDepartures } from './api/departures.js'

function App() {
    const [monitorData, setMonitorData] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        fetchDepartures(252)
            .then(setMonitorData)
            .catch((error) => setErrorMessage(error.message))
    }, [])

    if (errorMessage) {
        return <p>Fehler: {errorMessage}</p>
    }

    return <pre>{JSON.stringify(monitorData, null, 4)}</pre>
}

export default App