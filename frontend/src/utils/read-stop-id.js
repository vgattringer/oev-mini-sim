export function readStopId(searchText) {
    const stopId = new URLSearchParams(searchText).get('stopId')

    if (stopId === null || !/^\d+$/.test(stopId)) {
        return null
    }

    return stopId
}