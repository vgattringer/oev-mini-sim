import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'

const MAXIMUM_VISIBLE_STOPS = 100

function formatStopLabel(stop) {
    return `${stop.title} (StopId: ${stop.rbl})`
}

function normalizeText(text) {
    return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function getMatchRank(normalizedLabel, normalizedSearchText) {
    if (normalizedLabel.startsWith(normalizedSearchText)) {
        return 0
    }
    if (normalizedLabel.includes(` ${normalizedSearchText}`)) {
        return 1
    }
    if (normalizedLabel.includes(normalizedSearchText)) {
        return 2
    }
    return null
}

function StopSelector({ stops, selectedStopId, isUnknownStop }) {
    const [searchText, setSearchText] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)

    const normalizedSearchText = normalizeText(searchText)
    const matchingStops = stops
        .map((stop) => ({ stop, rank: getMatchRank(normalizeText(formatStopLabel(stop)), normalizedSearchText) }))
        .filter((entry) => entry.rank !== null)
        .sort((first, second) => first.rank - second.rank)
        .map((entry) => entry.stop)
    const visibleStops = matchingStops.slice(0, MAXIMUM_VISIBLE_STOPS)
    const lastIndex = Math.max(visibleStops.length - 1, 0)
    const selectedStop = stops.find((stop) => String(stop.rbl) === selectedStopId)

    let displayedText = searchText
    if (!isOpen) {
        displayedText = selectedStop ? formatStopLabel(selectedStop) : ''
    }

    function openList() {
        setSearchText('')
        setActiveIndex(0)
        setIsOpen(true)
    }

    function handleSearchChange(event) {
        setSearchText(event.target.value)
        setActiveIndex(0)
    }

    function selectStop(stop) {
        window.location.search = `?stopId=${stop.rbl}`
    }

    function handleKeyDown(event) {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((currentIndex) => Math.min(currentIndex + 1, lastIndex))
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((currentIndex) => Math.max(currentIndex - 1, 0))
        }
        if (event.key === 'Enter') {
            if (normalizedSearchText === '') {
                window.location.search = ''
            } else if (visibleStops.length > 0) {
                selectStop(visibleStops[activeIndex])
            }
        }
        if (event.key === 'Escape') {
            event.target.blur()
        }
    }

    return (
        <>
            <div className="position-relative">
                <Form.Control
                    type="text"
                    className="border border-3"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Haltestelle suchen ..."
                    aria-label="Haltestelle suchen oder auswählen"
                    autoComplete="off"
                    value={displayedText}
                    onFocus={openList}
                    onBlur={() => setIsOpen(false)}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                />
                <span
                    className="position-absolute top-50 end-0 translate-middle-y pe-3 text-primary"
                    style={{ pointerEvents: 'none' }}
                    aria-hidden="true"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M2 5l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
                {isOpen && (
                    <ListGroup
                        className="position-absolute w-100 shadow"
                        style={{ zIndex: 1000, maxHeight: '20rem', overflowY: 'auto' }}
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        {visibleStops.map((stop, index) => (
                            <ListGroup.Item
                                key={stop.rbl}
                                action
                                active={index === activeIndex}
                                className={String(stop.rbl) === selectedStopId ? 'fw-bold' : ''}
                                onClick={() => selectStop(stop)}
                                ref={(element) => {
                                    if (index === activeIndex && element) {
                                        element.scrollIntoView({ block: 'nearest' })
                                    }
                                }}
                            >
                                {formatStopLabel(stop)}
                            </ListGroup.Item>
                        ))}
                        {matchingStops.length > MAXIMUM_VISIBLE_STOPS && (
                            <ListGroup.Item disabled className="text-muted">
                                Weitere Treffer vorhanden, bitte die Suche eingrenzen.
                            </ListGroup.Item>
                        )}
                        {matchingStops.length === 0 && <ListGroup.Item disabled>Keine Haltestelle gefunden.</ListGroup.Item>}
                    </ListGroup>
                )}
            </div>
            {isUnknownStop && (
                <Alert variant="warning" className="mt-2">
                    Diese Haltestelle gibt es nicht.
                </Alert>
            )}
        </>
    )
}

export default StopSelector