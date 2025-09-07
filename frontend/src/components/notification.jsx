import React from 'react';
import '../styles/notification.css';

const Notification = ({ message, show }) => {
    return (
        <div className={`notification-banner ${show ? 'show' : ''}`}>
            {message}
        </div>
    );
};

export default Notification;