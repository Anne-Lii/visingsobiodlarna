import { NavLink } from 'react-router-dom';
import './Header.scss';
import logo from '../assets/logo.png';

const Header = () => {
    return (
        <header>
            <nav>
                <div className="logo">
                    <NavLink to="/" className="logo-link">
                        <img src={logo} alt="Logotyp bee" />
                    </NavLink>
                </div>
                <ul className="nav-list">
                    <li className="menu-link">
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                            Startsida
                        </NavLink>
                    </li>
                    <li className="menu-link">
                        <NavLink to="/news" className={({ isActive }) => isActive ? 'active' : ''}>
                            Nyheter
                        </NavLink>
                    </li>
                    <li className="menu-link login-link">
                        <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                            Logga in
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>

    );
};

export default Header;