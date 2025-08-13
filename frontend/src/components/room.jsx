import React from 'react';
import '../styles/room.css';
import { toggleRoom } from '../services/apiService';

const Room = ({ room, onRoomToggle }) => {
    const handleSwitch = async () => {
        try {
            const response = await toggleRoom(room.id);
            if (response && response.room) {
                onRoomToggle(response.room);
            }
        } catch (error) {
            console.error("Greška u prebacivanju sobe:", error);
        }
    };

    const handleImgError = (e) => {
        e.target.onerror = null;
        e.target.src = "/images/Work-In-Progress.png";
    };


    return (
        <div className="room" id={room.id}>
            <div className="img-icon-wrapper">
                <img
                    src={`/images/${room.id}.jpg`}
                    onError={handleImgError}
                    alt={room.id}
                    className="room-image" />
                <i className="dots3 bi bi-three-dots-vertical"></i>
            </div>
            <p className="room-name">{room.name}</p>
            <p className="number-of-devices">{room.numDevices} {room.numDevices === 1 ? "device" : "devices"}</p>
            <div className="status-wrapper">
                <p className="status-string">{room.isOn ? "ON" : "OFF"}</p>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="switchCheckDefault"
                        checked={room.isOn}
                        onChange={handleSwitch} />
                </div>
            </div>
        </div>
    );
};

export default Room;