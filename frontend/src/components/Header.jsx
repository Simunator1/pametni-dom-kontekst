import React, { useState, useRef, useEffect } from 'react';
import '../styles/Header.css';
import HamburgerMenu from './menus/hamburgerMenu';
import AddMenu from './menus/addMenu';
import DeveloperMenu from './menus/developerMenu';
import EditDeviceMenu from './menus/editDeviceMenu';
import EditRoomMenu from './menus/editRoomMenu';

const MainHeaderIcons = (props) => (
    <ul className="ikone">
        <NavItem className="ikona bi bi-gear">
            <DeveloperMenu
                className="developer-menu"
                onIntervalChange={props.onIntervalChange}
                currentInterval={props.currentInterval}
                onTempChange={props.onTempChange}
                OutsideTemp={props.OutsideTemp}
                onTimeChange={props.onTimeChange}
                TimeOfDay={props.TimeOfDay}
                onPresenceChange={props.onPresenceChange}
                UserPresence={props.UserPresence}
            />
        </NavItem>
        <NavItem className="ikona bi bi-plus-square">
            <AddMenu
                className="add-menu"
                onRoomAdded={props.onRoomAdded}
                onDeviceAdded={props.onDeviceAdded}
                onGoToRoutineAdd={props.onGoToRoutineAdd}
            />
        </NavItem>
        <NavItem className="ikona bi bi-list">
            <HamburgerMenu className="hamburger-menu" onToggleTheme={props.onToggleTheme} />
        </NavItem>
    </ul>
);

const DeviceDetailsHeader = (props) => (
    <div className="alternate-header">
        <i className="ikona bi bi-arrow-left back-button" onClick={props.onBack}></i>
        <h1 className="naslov">{props.title}</h1>
        <NavItem className="ikona bi bi-three-dots">
            <EditDeviceMenu
                className="edit-device-menu"
                device={props.device}
                onDeviceEdited={props.onDeviceEdited}
                onDeviceRemoved={props.onDeviceRemoved}
            />
        </NavItem>
    </div>
);

const RoomDetailsHeader = (props) => (
    <div className="alternate-header">
        <i className="ikona bi bi-arrow-left back-button" onClick={props.onBack}></i>
        <h1 className="naslov">{props.title}</h1>
        <NavItem className="ikona bi bi-three-dots">
            <EditRoomMenu
                className="edit-room-menu"
                room={props.room}
                onRoomEdited={props.onRoomEdited}
                onRoomRemoved={props.onRoomRemoved}
                onDeviceAdded={props.onDeviceAdded}
                onGoToAddPreference={props.onGoToAddPreference}
            />
        </NavItem>
    </div>
);

const RoutineAddHeader = (props) => (
    <div className="alternate-header">
        <i className="ikona bi bi-arrow-left back-button" onClick={props.onBack}></i>
        <h1 className="naslov">{props.title}</h1>
    </div>
);



const Header = (props) => {
    const renderContent = () => {
        switch (props.view) {
            case 'roomDetails':
                return <RoomDetailsHeader {...props} />;
            case 'deviceDetails':
                return <DeviceDetailsHeader {...props} />;
            case 'routineAdd':
                return <RoutineAddHeader {...props} />;
            case 'main':
            default:
                return (
                    <>
                        <h1 className="naslov">{props.title}</h1>
                        <MainHeaderIcons {...props} />
                    </>
                );
        }
    };

    return <nav className="header">{renderContent()}</nav>;
};

function NavItem(props) {
    const [active, setActive] = useState(false);
    const navItemRef = useRef(null);

    const closeMenu = () => setActive(false);

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
            {active && React.cloneElement(props.children, { closeMenu })}
        </li>
    );
};

export default Header;