import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import logo from '../assets/logo.png';

const Header = () => {

    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header>
            <nav>
                <div className="logo">
                    <NavLink to="/" className="logo-link">
                        <img src={logo} alt="Logotyp bee" />
                    </NavLink>
                </div>

                <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Meny">{menuOpen ? '✖' : '☰'}</button>
                {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

                <ul className={`nav-list ${menuOpen ? 'open' : ''}`}>
                    <li className="menu-link">
                        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            Startsida
                        </NavLink>
                    </li>
                    <li className="menu-link">
                        <NavLink to="/news" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            Nyheter
                        </NavLink>
                    </li>
                    <li className="menu-link login-link">
                        <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            Logga in
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>

    );
};

export default Header;