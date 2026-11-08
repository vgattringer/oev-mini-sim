import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import { formatClockTime } from '../utils/format-clock-time.js'
import VehicleTypeIcon from './VehicleTypeIcon.jsx'

function DepartureBoard({ monitorDataByStopId }) {
    const cards = Object.entries(monitorDataByStopId).flatMap(([stopId, monitorData]) =>
        monitorData.data.monitors.flatMap((monitor) =>
            monitor.lines.map((line) => ({
                stopId,
                stopTitle: monitor.locationStop.properties.title,
                line,
            })),
        ),
    )

    cards.sort(
        (first, second) =>
            first.line.name.localeCompare(second.line.name, 'de', { numeric: true }) ||
            first.line.towards.localeCompare(second.line.towards, 'de') ||
            Number(first.stopId) - Number(second.stopId),
    )

    return (
        <section>
            <h2 className="h4 mb-4">Abfahrten</h2>
            {cards.map(({ stopId, stopTitle, line }) => (
                <Card key={`${stopId}-${line.lineId}-${line.towards}`} className="mb-3">
                    <Card.Header className="d-flex align-items-center gap-2">
                        <VehicleTypeIcon type={line.type} />
                        <div>
                            <div>
                                Linie {line.name} - Richtung: {line.towards}
                            </div>
                            <small className="text-muted">
                                {stopTitle} (RBL {stopId})
                            </small>
                        </div>
                    </Card.Header>
                    <ListGroup variant="flush">
                        {line.departures.departure.map(({ departureTime }) => (
                            <ListGroup.Item
                                key={departureTime.timePlanned}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <span>kommt in {departureTime.countdown} Min.</span>
                                <span>
                                    {formatClockTime(departureTime.timeReal ?? departureTime.timePlanned)}
                                    {departureTime.timeReal && (
                                        <Badge bg="success" className="ms-2">
                                            Echtzeit
                                        </Badge>
                                    )}
                                </span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            ))}
        </section>
    )
}

export default DepartureBoard