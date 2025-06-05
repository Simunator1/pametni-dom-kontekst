import React from 'react';
import '../styles/room.css';
import { useState } from 'react';

const Room = ({ room }) => {
    const [isOn, setIsOn] = useState(true);

    const handleSwitch = (e) => {
        setIsOn(e.target.checked);
    };

    return (
        <div className="room" id={room.id}>
            <div className="img-icon-wrapper">
                <img src={`/images/${room.id}.jpg`} alt={room.id} className="room-image" />
                <i className="dots3 bi bi-three-dots-vertical"></i>
            </div>
            <p className="room-name">{room.name}</p>
            <p className="number-of-devices">{room.numDevices} {room.numDevices === 1 ? "device" : "devices"}</p>
            <div className="status-wrapper">
                <p className="status-string">{isOn ? "ON" : "OFF"}</p>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="switchCheckDefault"
                        checked={isOn}
                        onChange={handleSwitch} />
                </div>
            </div>
        </div>
    );
};

export default Room;