import React, { useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

function AddMenu(props) {

    const [activeMenu, setActiveMenu] = useState('main');

    const nodeRefMain = useRef(null);
    const nodeRefAddRoom = useRef(null);
    const settingsRefAddDevice = useRef(null);

    function DropdownItem(props) {
        return (
            <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
                <span className={`icon-left ${props.leftIcon || ''}`}></span>
                {props.children}
                <span className={`icon-right ${props.rightIcon || ''}`}></span>
            </a>
        )
    }

    return (
        <div className={`dropdown ${props.className || ''}`}>
            <CSSTransition
                nodeRef={nodeRefMain}
                in={activeMenu === 'main'}
                unmountOnExit
                timeout={500}
                classNames="menu-primary"
            >
                <div ref={nodeRefMain} className="menu">
                    <DropdownItem
                        goToMenu="addroom"
                        leftIcon="bi bi-house-add"
                    >Add Room</DropdownItem>
                    <DropdownItem
                        leftIcon="bi bi-house-gear"
                        goToMenu="adddevice"
                    >Add Device</DropdownItem>
                </div>
            </CSSTransition>

            <CSSTransition
                nodeRef={nodeRefAddRoom}
                in={activeMenu === 'addroom'}
                unmountOnExit
                timeout={500}
                classNames="menu-secondary"
            >
                <div ref={nodeRefAddRoom} className="menu">
                    <DropdownItem
                        goToMenu="main"
                        leftIcon="bi bi-arrow-left">Return</DropdownItem>

                </div>
            </CSSTransition>

            <CSSTransition
                nodeRef={settingsRefAddDevice}
                in={activeMenu === 'adddevice'}
                timeout={500}
                classNames="menu-secondary"
                unmountOnExit
            >
                <div className="menu" ref={settingsRefAddDevice}>
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <DropdownItem leftIcon="bi bi-palette">Appearance</DropdownItem>
                    <DropdownItem leftIcon="bi bi-bell">Notifications</DropdownItem>
                    <DropdownItem leftIcon="bi bi-shield-lock">Security</DropdownItem>
                </div>
            </CSSTransition>

        </div>
    )

}

export default AddMenu;