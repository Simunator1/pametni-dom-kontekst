import React, { useState, useRef, useEffect } from 'react';
import '../styles/Header.css';
import HamburgerMenu from './hamburgerMenu';
import AddMenu from './addMenu';
import DeveloperMenu from './developerMenu';

const Header = ({ title }) => (
    <nav className="header">
        <h1 className="naslov">{title}</h1>
        <ul className="ikone">
            <NavItem className="ikona bi bi-gear"><DeveloperMenu className="developer-menu" /> </NavItem>
            <NavItem className="ikona bi bi-plus-square"><AddMenu className="add-menu" /></NavItem>
            <NavItem className="ikona bi bi-list"><HamburgerMenu className="hamburger-menu" /></NavItem>
        </ul>
    </nav>
);

function NavItem(props) {
    const [active, setActive] = useState(false);
    const navItemRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (navItemRef.current && !navItemRef.current.contains(event.target)) {
                setActive(false);
            }
        }

        if (active) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [active]);

    return (
        <li className="nav-item" ref={navItemRef}>
            <a href="#" className={`icon-button ${props.className}`} onClick={() => setActive(!active)}></a>
            {active && props.children}
        </li>
    )
};

export default Header;