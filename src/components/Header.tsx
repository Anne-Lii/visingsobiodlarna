import { NavLink } from 'react-router-dom';
import './Header.scss';

const Header = () => {
    return (
        <header>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Startsida</NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Logga in</NavLink>            
        </header>
    );

}

export default Header;