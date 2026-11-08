import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import { formatClockTime } from '../utils/format-clock-time.js'
import VehicleTypeIcon from './VehicleTypeIcon.jsx'

function DepartureBoard({ monitorData }) {
    const monitors = monitorData.data.monitors
    const stopTitle = monitors[0].locationStop.properties.title
    const lines = monitors.flatMap((monitor) => monitor.lines)

    return (
        <section>
            <h1 className="h3 mb-4">{stopTitle}</h1>
            {lines.map((line) => (
                <Card key={`${line.lineId}-${line.towards}`} className="mb-3">
                    <Card.Header className="d-flex align-items-center gap-2">
                        <VehicleTypeIcon type={line.type} />
                        <span>
                            Linie {line.name} - Richtung: {line.towards}
                        </span>
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