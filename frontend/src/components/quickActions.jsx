import React from 'react';
import '../styles/quickActions.css';

const quickActions = () => (
    <div className="quick-actions">
        <div className="quick-header">
            <div></div>
            <p>Quick actions</p>
            <i className="quick-ikona bi bi-gear"></i>
        </div>
        <div className="actions">
            <div className="action">
                <i className="quick-ikona bi bi-film"></i>
                <p>Movie</p>
            </div>
            <div className="action">
                <i className="quick-ikona bi bi-fire"></i>
                <p>Cozy</p>
            </div>
            <div className="action">
                <i className="quick-ikona bi bi-bell-slash"></i>
                <p>Sleeping</p>
            </div>
            <div className="action">
                <i className="quick-ikona bi bi-brightness-high"></i>
                <p>Morning</p>
            </div>
            <div className="action">
                <i className="quick-ikona bi bi-cake"></i>
                <p>Party</p>
            </div>
            <div className="action">
                <i className="quick-ikona bi bi-flask"></i>
                <p>Working</p>
            </div>
            <div className="action">
                <i className="quick-ikona bi bi-fork-knife"></i>
                <p>Eating</p>
            </div>
        </div>
    </div>
);

export default quickActions;