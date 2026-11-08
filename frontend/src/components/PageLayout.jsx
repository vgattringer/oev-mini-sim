import Container from 'react-bootstrap/Container'

function PageLayout({ children }) {
    return (
        <Container className="py-4">
            {children}
            <footer className="mt-5 pt-3 border-top small text-muted">
                Haltestellendaten:{' '}
                <a href="https://www.wienerlinien.at/open-data" target="_blank" rel="noreferrer">
                    Wiener Linien
                </a>
                , Open Government Data (CC BY). Datenquelle: Stadt Wien – data.wien.gv.at
            </footer>
        </Container>
    )
}

export default PageLayout