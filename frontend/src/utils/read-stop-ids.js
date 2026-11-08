export function readStopIds(searchText) {
    const stopIds = new URLSearchParams(searchText).getAll('stopId')
    const validStopIds = stopIds.filter((stopId) => /^\d+$/.test(stopId))

    return [...new Set(validStopIds)]
}
