import React from 'react';
import { useEffect } from 'react';
import '../../styles/tempConditioner.css';
import '../../styles/deviceDetails.css';
import { sendDeviceAction, getDeviceById } from '../../services/apiService';

const temperatureConditioner = ({ device, onStateChange, outsideTemp }) => {

    useEffect(() => {
        const pollDeviceState = async () => {
            console.log(`Polling for device ${device.id} state...`);
            try {
                const latestDeviceState = await getDeviceById(device.id);
                onStateChange(latestDeviceState);
            } catch (error) {
                console.error(`Greška pri dohvaćanju stanja uređaja ${device.id}:`, error);
            }
        };

        const intervalId = setInterval(pollDeviceState, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, [device.id, onStateChange]);

    const handleToggle = async () => {
        try {
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'TOGGLE_ON_OFF' });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri paljenju/gašenju termostata ${device.id}:`, error);
        }
    };

    const handleModeToggle = async () => {
        try {
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'SET_MODE', payload: { mode: device.state.mode === 'HEAT' ? 'COOL' : 'HEAT' } });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri mijenjanju moda termostata ${device.id}:`, error);
        }

    }

    const handleTemperatureChange = async (change) => {
        try {
            const newTargetTemp = device.state.targetTemp + change;
            if (newTargetTemp < 10 || newTargetTemp > 30) {
                console.warn(`Neispravna temperatura: ${newTargetTemp}. Mora biti između 10 i 30 stupnjeva.`);
                return;
            }
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'SET_TEMPERATURE', payload: { targetTemp: newTargetTemp } });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri mijenjanju temperature termostata ${device.id}:`, error);
        }
    }

    return (
        <div className="device-details-container temp">
            <span className="deviceName">{device.name}</span>

            <div className="ONOFF-control">
                <span>Turn ON/OFF</span>
                <div className="botunDiv form-check form-switch">
                    <input
                        className="botun form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={device.state.isOn}
                        onChange={handleToggle}
                    />
                </div>
            </div>

            <div className={`tempControl ${device.state.isOn ? '' : 'disabled'}`}>
                <span>Target Temperature:</span>
                <i onClick={() => handleTemperatureChange(-1)} className="bi bi-dash-circle" />
                <span className='stupnjevi'>{device.state.targetTemp}°C</span>
                <i onClick={() => handleTemperatureChange(+1)} className="bi bi-plus-circle" />
            </div>

            <div className="modeControl">
                <div className="text-icon-container cool">
                    <span>Cool</span>
                    <i className="bi bi-thermometer-snow" />
                </div>
                <div className="form-check form-switch">
                    <input
                        className="mode form-check-input"
                        type="checkbox"
                        role="switch"
                        disabled={!device.state.isOn}
                        checked={device.state.prevMode === 'HEAT'}
                        onChange={handleModeToggle}
                    />
                </div>
                <div className="text-icon-container heat">
                    <span>Heat</span>
                    <i className='bi bi-thermometer-sun' />
                </div>
            </div>
            <div className="temps">
                <span>Current Temp: {device.state.temperature}°C</span>
                <span>Outside Temp: {outsideTemp}°C</span>
            </div>
        </div >
    );
};

export default temperatureConditioner;