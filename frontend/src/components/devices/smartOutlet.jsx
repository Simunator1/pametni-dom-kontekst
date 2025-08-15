import { React, useState, useEffect } from 'react';
import '../../styles/smartOutlet.css';
import '../../styles/deviceDetails.css';
import { sendDeviceAction } from '../../services/apiService';

const Light = ({ device }) => {
    const [powerUsage, setPowerUsage] = useState(0);

    useEffect(() => {
        const fetchPowerUsage = async () => {
            console.log(`Fetching power usage for device ${device.id}...`);
            try {
                const powerUsage = await sendDeviceAction(device.id, { actionType: 'READ_POWER_USAGE' });
                setPowerUsage(powerUsage);
            } catch (error) {
                console.error(`Greška pri dohvaćanju potrošnje energije za uređaj ${device.id}:`, error);
            }
        };

        fetchPowerUsage();
        const intervalId = setInterval(fetchPowerUsage, 3000);

        return () => clearInterval(intervalId);
    }, [device.id, onStateChange]);

    const handleToggle = async () => {
        try {
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'TOGGLE_ON_OFF' });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri paljenju/gašenju svjetla ${device.id}:`, error);
        }
    };

    return (
        <div className="device-details-container">
            <span className="deviceName">{device.name}</span>

            <div className="outlet-ONOFF-control">
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

            <div className="power-usage-container">
                <span>Power Usage: </span>
                <div>
                    <i className="bi bi-lightning-charge" />
                    <span className="power-usage">{(device.state.isOn && powerUsage) || 0} W</span>
                </div>
            </div>
        </div>
    );
};

export default Light;