import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'

function StopSelector({ stops, selectedStopId, isUnknownStop }) {
    function handleChange(event) {
        window.location.search = `?stopId=${event.target.value}`
    }

    return (
        <>
            <Form.Select value={selectedStopId ?? ''} onChange={handleChange} aria-label="Haltestelle auswählen">
                <option value="">Haltestelle wählen ...</option>
                {stops.map((stop) => (
                    <option key={stop.rbl} value={stop.rbl}>
                        {stop.title} ({stop.rbl})
                    </option>
                ))}
            </Form.Select>
            {isUnknownStop && (
                <Alert variant="warning" className="mt-2">
                    Diese Haltestelle gibt es nicht.
                </Alert>
            )}
        </>
    )
}

export default StopSelector