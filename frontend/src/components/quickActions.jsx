import React from 'react';
import '../styles/quickActions.css';

const quickActions = ({ routines, quickActions, preferences }) => (
    <div className="quick-actions">
        <div className="quick-header">
            <div></div>
            <p>Quick actions</p>
            <i className="quick-ikona bi bi-gear"></i>
        </div>
        <div className="actions">
            {routines.map(routine => (
                <div className="action" key={routine.id}>
                    <i className={`quick-ikona ${routine.icon}`}></i>
                    <p>{routine.name}</p>
                </div>
            ))}
        </div>
    </div>
);

export default quickActions;