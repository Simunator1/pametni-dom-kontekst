import { useState, useEffect } from 'react';
import '../styles/roomDetails.css';
import { toggleRoom } from '../services/apiService';
import Device from '../components/device';
import '../styles/device.css'

const RoomDetails = ({ room, onRoomToggle, handleDeviceChange, handleDeviceSelect }) => {
    const hasDevices = room.devices && room.numDevices > 0;
    const hasPreferences = false;
    const hasRoutines = false;

    const handleRoomToggle = async () => {
        try {
            const response = await toggleRoom(room.id);
            if (onRoomToggle) onRoomToggle(response.room);
        } catch (error) {
            console.error('Error toggling room:', error);
        }
    }

    return (
        <div className="device-details-container">
            <div className="deviceNameContainer">
                <span className="deviceName">{room.name}</span>
            </div>

            <div className="room-control background">
                <span>Turn ON/OFF</span>
                <div className="botunDiv form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={room.isOn}
                        onChange={handleRoomToggle}
                    />
                </div>
            </div>
            <div className="scrollable-container">
                {hasDevices &&
                    <div className="room-devices-container">
                        <span className="room-text">Devices</span>
                        {room.devices.map(device => (
                            <Device
                                key={device.id}
                                device={device}
                                onStateChange={handleDeviceChange}
                                onDeviceSelect={handleDeviceSelect}
                            />
                        ))}
                    </div>}
                {hasPreferences &&
                    <div className="room-devices-container">
                        <span className="room-text">Preferences</span>
                    </div>}
                {hasRoutines &&
                    <div className="room-devices-container">
                        <span className="room-text">Routines</span>
                    </div>}
            </div>
        </div>
    );
};

export default RoomDetails;