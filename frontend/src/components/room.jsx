import React from 'react';
import '../styles/room.css';
import { useState } from 'react';
import { toggleRoom } from '../services/apiService';

const Room = ({ room, handleRoomToggle }) => {
    const [isOn, setIsOn] = useState(room.isOn);

    const handleSwitch = async () => {
        const previousState = isOn;
        setIsOn(!previousState);

        try {
            const response = await toggleRoom(room.id);
            const devices = response.room.devices || [];
            handleRoomToggle(devices);
        } catch (error) {
            console.error("Greška u prebacivanju sobe:", error);
            setIsOn(previousState);
        }
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