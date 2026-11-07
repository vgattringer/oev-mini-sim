const clockTimeFormat = new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Vienna',
})

export function formatClockTime(isoText) {
    const date = new Date(isoText)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    return clockTimeFormat.format(date)
}