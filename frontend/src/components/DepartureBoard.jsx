function DepartureBoard({ monitorData }) {
    const monitor = monitorData.data.monitors[0]
    const stopTitle = monitor.locationStop.properties.title

    return (
        <section>
            <h1>{stopTitle}</h1>
            {monitor.lines.map((line) => (
                <div key={`${line.lineId}-${line.direction}`}>
                    <h2>
                        Linie {line.name} - Richtung: {line.towards}
                    </h2>
                    <ul>
                        {line.departures.departure.map((departure) => (
                            <li key={departure.departureTime.timePlanned}>
                                kommt in {departure.departureTime.countdown} Min.
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>
    )
}

export default DepartureBoard