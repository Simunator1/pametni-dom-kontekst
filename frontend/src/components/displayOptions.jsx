import React from 'react';
import '../styles/displayOptions.css';

const displayOptions = ({ currentView, onViewChange }) => (
    <div className="display-options btn-group" role="group" aria-label="Basic radio toggle button group">
        <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio1"
            autoComplete="off"
            checked={currentView === 'rooms'}
            onChange={() => onViewChange('rooms')} />
        <label className="display-btn btn btn-outline-primary" htmlFor="btnradio1">Rooms</label>

        <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio2"
            autoComplete="off"
            checked={currentView === 'devices'}
            onChange={() => onViewChange('devices')} />
        <label className="display-btn btn btn-outline-primary" htmlFor="btnradio2">Devices</label>

        <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio3"
            autoComplete="off"
            checked={currentView === 'routines'}
            onChange={() => onViewChange('routines')} />
        <label className="display-btn btn btn-outline-primary" htmlFor="btnradio3">Routines</label>
    </div>
);

export default displayOptions;