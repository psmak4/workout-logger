import { Outlet } from 'react-router'
import Footer from './footer'
import Header from './header'

const Layout = () => {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default Layout
