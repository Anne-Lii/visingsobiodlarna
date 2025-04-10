import { NavLink } from 'react-router-dom';
import './Header.scss';

const Header = () => {
    return (
        <header>
            <nav>
                <ul>
                    <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Startsida</NavLink>
                    </li>
                    <li>
                    <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Logga in</NavLink>   
                    </li>
                </ul>
            </nav>
            
                     
        </header>
    );

}

export default Header;