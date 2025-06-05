import React from 'react';
import '../styles/Header.css';

const Header = ({ title }) => (
    <div className="header">
        <h1 className="naslov">{title}</h1>
        <div className="ikone">
            <i className="ikona bi bi-gear"></i>
            <i className="ikona bi bi-plus-square"></i>
            <i className="ikona bi bi-list"></i>
        </div>
    </div>
);

export default Header;