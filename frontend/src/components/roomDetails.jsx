import { useState, useEffect } from 'react';
import '../styles/roomDetails.css';
import { toggleRoom, getAllPreferencesByRoom } from '../services/apiService';
import Device from '../components/device';
import RoutineMini from '../components/routineMini';
import PrefMini from '../components/prefMini';
import '../styles/device.css'

const RoomDetails = ({ room, routines, onRoomToggle, handleDeviceChange, handleDeviceSelect, onRoutineToggle, onSelectedRoutine, onSelectPref }) => {
    const [selectedRoutines, setSelectedRoutines] = useState(null);
    const [roomPreferences, setRoomPreferences] = useState([]);

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const prefs = await getAllPreferencesByRoom(room.id);
                setRoomPreferences(prefs);
            } catch (error) {
                console.error('Error fetching preferences:', error);
            }
        }
        fetchPreferences();
    }, [room.id]);

    useEffect(() => {
        const selectedRoutines = routines.filter(routine => routine.included_rooms.includes(room.id));
        setSelectedRoutines(selectedRoutines);
    }, [routines]);

    const hasDevices = room.devices && room.numDevices > 0;
    const hasPreferences = roomPreferences && roomPreferences.length > 0;

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
                        checked={room.is_on}
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
                        {roomPreferences.map(pref => (
                            <PrefMini
                                key={pref.id}
                                pref={pref}
                                onSelectPref={onSelectPref}
                            />
                        ))}
                    </div>}
                {selectedRoutines &&
                    <div className="room-devices-container">
                        <span className="room-text">Routines</span>
                        {selectedRoutines.map(routine => (
                            <RoutineMini
                                key={routine.id}
                                routine={routine}
                                onRoutineToggle={onRoutineToggle}
                                onSelectRoutine={onSelectedRoutine}
                            />
                        ))}
                    </div>}
            </div>
        </div>
    );
};

export default RoomDetails;