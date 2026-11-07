export async function fetchDepartures(stopId) {
    const response = await fetch(`/api/departures/${encodeURIComponent(stopId)}`)

    if (response.status === 404) {
        return null
    }

    if (!response.ok) {
        throw new Error(`Abfahrten konnten nicht geladen werden (Status ${response.status})`)
    }

    // wandelt Text in ein JavaScript-Objekt um (parsen):
    return response.json()
}