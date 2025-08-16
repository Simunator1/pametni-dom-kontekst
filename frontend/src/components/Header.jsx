import React, { useState, useRef, useEffect } from 'react';
import '../styles/Header.css';
import HamburgerMenu from './menus/hamburgerMenu';
import AddMenu from './menus/addMenu';
import DeveloperMenu from './menus/developerMenu';
import EditDeviceMenu from './menus/editDeviceMenu';

const Header = ({ device, title, onBack,
    onRoomAdded, onDeviceAdded,
    onDeviceEdited, onDeviceRemoved,
    onIntervalChange, currentInterval,
    onTempChange, OutsideTemp,
    onTimeChange, TimeOfDay,
    onPresenceChange, UserPresence }) => (
    <nav className="header">
        {onBack && (
            <div className="alternate-header">
                <i className="ikona bi bi-arrow-left back-button" onClick={onBack}></i>
                <h1 className="naslov">{title}</h1>
                <NavItem className="ikona bi bi-three-dots">
                    <EditDeviceMenu
                        className="edit-device-menu"
                        device={device}
                        onDeviceEdited={onDeviceEdited}
                        onDeviceRemoved={onDeviceRemoved} />
                </NavItem>
            </div>
        )}

        {!onBack && (
            <>
                <h1 className="naslov">{title}</h1>
                <ul className="ikone">
                    <NavItem className="ikona bi bi-gear">
                        <DeveloperMenu
                            className="developer-menu"
                            onIntervalChange={onIntervalChange}
                            currentInterval={currentInterval}
                            onTempChange={onTempChange}
                            OutsideTemp={OutsideTemp}
                            onTimeChange={onTimeChange}
                            TimeOfDay={TimeOfDay}
                            onPresenceChange={onPresenceChange}
                            UserPresence={UserPresence}
                        />
                    </NavItem>
                    <NavItem className="ikona bi bi-plus-square">
                        {onRoomAdded && onDeviceAdded &&
                            <AddMenu
                                className="add-menu"
                                onRoomAdded={onRoomAdded}
                                onDeviceAdded={onDeviceAdded}
                            />
                        }
                    </NavItem>
                    <NavItem className="ikona bi bi-list"><HamburgerMenu className="hamburger-menu" /></NavItem>
                </ul>
            </>
        )}
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