import { useEffect } from 'react';
import '../../styles/sensor.css';
import '../../styles/deviceDetails.css';
import { getDeviceById } from '../../services/apiService';

const Sensor = ({ device, outsideTemp, onStateChange }) => {

    useEffect(() => {
        const pollDeviceState = async () => {
            console.log(`Polling for device ${device.id} state...`);
            try {
                const updatedDevice = await getDeviceById(device.id);
                onStateChange(updatedDevice);
            } catch (error) {
                console.error(`Greška pri dohvaćanju stanja uređaja ${device.id}:`, error);
            }
        };

        pollDeviceState();

        const intervalId = setInterval(pollDeviceState, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, [device.id, onStateChange]);


    return (
        <div className="device-details-container sensor">
            <span className="deviceName">{device.name}</span>
            <div className="sensor-data">
                <div className="sensor-item">
                    <span>Temperature:</span>
                    <span>{device.state.temperature} °C</span>
                </div>
                <div className="sensor-item">
                    <span>Humidity:</span>
                    <span>{device.state.humidity} %</span>
                </div>
                <div className="sensor-item">
                    <span>Outside Temperature:</span>
                    <span>{outsideTemp} °C</span>
                </div>
            </div>
        </div>
    )


};

export default Sensor;