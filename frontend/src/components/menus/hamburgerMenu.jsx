import React, { useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

function HamburgerMenu(props) {

    const [activeMenu, setActiveMenu] = useState('main');

    const nodeRefMain = useRef(null);
    const nodeRefAccount = useRef(null);
    const settingsRef = useRef(null);

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
                    {/* <DropdownItem
                        goToMenu="account"
                        leftIcon="bi bi-person"
                    >Account</DropdownItem> */}
                    <DropdownItem
                        leftIcon="bi bi-gear"
                        goToMenu="settings"
                    >Settings</DropdownItem>
                    {/* <DropdownItem
                        leftIcon="bi bi-box-arrow-left"
                    >Logout</DropdownItem> */}
                </div>
            </CSSTransition>

            {/* <CSSTransition
                nodeRef={nodeRefAccount}
                in={activeMenu === 'account'}
                unmountOnExit
                timeout={500}
                classNames="menu-secondary"
            >
                <div ref={nodeRefAccount} className="menu">
                    <DropdownItem
                        goToMenu="main"
                        leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <DropdownItem
                        leftIcon="bi bi-person-circle"
                    >Edit account</DropdownItem>
                    <DropdownItem
                        leftIcon="bi bi-key"
                    >Change password</DropdownItem>
                    <DropdownItem
                        leftIcon="bi bi-clock-history"
                    >Activity Log</DropdownItem>
                </div>
            </CSSTransition> */}

            <CSSTransition
                nodeRef={settingsRef}
                in={activeMenu === 'settings'}
                timeout={500}
                classNames="menu-secondary"
                unmountOnExit
            >
                <div className="menu" ref={settingsRef}>
                    <DropdownItem goToMenu="main" leftIcon="bi bi-arrow-left">Return</DropdownItem>
                    <a href="#" className="menu-item" onClick={props.onToggleTheme}>
                        <span className="icon-left bi bi-palette"></span>
                        Appearance
                    </a>
                    {/* <DropdownItem leftIcon="bi bi-bell">Notifications</DropdownItem> */}
                    {/* <DropdownItem leftIcon="bi bi-shield-lock">Security</DropdownItem> */}
                </div>
            </CSSTransition>

        </div>
    )

}

export default HamburgerMenu;