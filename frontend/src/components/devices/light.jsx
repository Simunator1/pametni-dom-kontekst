import { React } from 'react';
import '../../styles/light.css';
import '../../styles/deviceDetails.css';
import { sendDeviceAction } from '../../services/apiService';

const Light = ({ device, onStateChange }) => {
    const handleToggle = async () => {
        try {
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'TOGGLE_ON_OFF' });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri paljenju/gašenju svjetla ${device.id}:`, error);
        }
    };

    const handleBrightnessChange = async (e) => {
        const brightness = parseInt(e.target.value, 10);
        try {
            const payload = {
                brightness: brightness,
            };
            const updatedDevice = await sendDeviceAction(device.id, {
                actionType: 'SET_BRIGHTNESS',
                payload: payload
            });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri promjeni svjetline za ${device.id}:`, error);
        }
    };

    return (
        <div className="device-details-container lights">
            <span className="deviceName">{device.name}</span>

            <div className="light-control">
                <span>Turn ON/OFF</span>
                <div className="botunDiv form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={device.state.isOn}
                        onChange={handleToggle}
                    />
                </div>
            </div>

            <div className="brightness">
                <span>Brightness</span>
                <div className="brightness-control">
                    <i className="bi bi-brightness-low"></i>
                    <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        step="1"
                        value={device.state.brightness || 0}
                        onChange={handleBrightnessChange}
                        disabled={!device.state.isOn}
                    />
                    <i className="bi bi-brightness-high-fill"></i>
                </div>
                <span className="postotak">{device.state.brightness}%</span>
            </div>

        </div>
    );
};

export default Light;