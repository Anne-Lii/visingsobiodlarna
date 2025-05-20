import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.scss';
import logo from '../assets/logo.png';
import { useUser } from '../context/UserContext';
import api from '../services/apiService';

const Header = () => {

    const [menuOpen, setMenuOpen] = useState(false);
    const { isLoggedIn, logout, role } = useUser();
    const navigate = useNavigate();

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = async () => {
        await api.post("/auth/logout", {}, { withCredentials: true });
        logout();
        navigate("/");
    };

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

                    {menuOpen && (
                        <li className="close-menu">
                            <button onClick={closeMenu} aria-label="Stäng meny" className="close-btn">✖</button>
                        </li>
                    )}

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
                    <li className="menu-link mobile-only">
                        <NavLink to="/calendar" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            Kalender
                        </NavLink>
                    </li>


                    {/* Meny om användaren är inloggad */}
                    {isLoggedIn && (
                        <>
                            <li className="menu-link">
                                <NavLink to="/mypage" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                                    Mina sidor</NavLink>
                            </li>
                            <li className="menu-link mobile-only">
                                <NavLink to="/dokument" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                                    Dokument
                                </NavLink>
                            </li>

                            {role === 'admin' && (
                                <li className="menu-link">
                                    <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                                        Admin
                                    </NavLink>
                                </li>
                            )}

                            <li className="menu-link login-link">
                                <NavLink to="/login" onClick={handleLogout} className={({ isActive }) => isActive ? 'active' : ''}>
                                    Logga ut
                                </NavLink>

                            </li>
                        </>
                    )}

                    {/* Meny om användaren INTE är inloggad */}
                    {!isLoggedIn && (
                        <li className="menu-link login-link">
                            <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                                Logga in
                            </NavLink>
                        </li>
                    )}

                </ul>
            </nav>
        </header>

    );
};

export default Header;