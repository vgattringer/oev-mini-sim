export async function loadStopList() {
    const response = await fetch('/api/stops')

    if (!response.ok) {
        throw new Error(`Haltestellenliste konnte nicht geladen werden (Status ${response.status})`)
    }

    return response.json()
}