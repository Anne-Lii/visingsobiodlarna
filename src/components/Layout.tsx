import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Aside from './Aside';
import './Layout.scss';

const Layout = () => {

    const location = useLocation();
    
    return (
        <div className="layout">
            <Header />
            <div className="content-wrapper">
                <main className="main-content">
                    <Outlet />
                </main>
                <Aside key={location.pathname} />
            </div>
            <Footer />
        </div>
    )

}

export default Layout;