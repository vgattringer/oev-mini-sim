import Container from 'react-bootstrap/Container'

function PageLayout({ children }) {
    return <Container className="py-4">{children}</Container>
}

export default PageLayout