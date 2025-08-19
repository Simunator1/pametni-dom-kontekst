import { useEffect } from 'react';
import '../../styles/sensor.css';
import '../../styles/deviceDetails.css';
import { getDeviceById } from '../../services/apiService';

const Sensor = ({ device, outsideTemp, onStateChange, pollingInterval }) => {

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

        const intervalId = setInterval(pollDeviceState, pollingInterval);

        return () => {
            clearInterval(intervalId);
        };
    }, [device.id, onStateChange, pollingInterval]);


    return (
        <div className="device-details-container sensor">
            <div className="deviceNameContainer">
                <span className="deviceName">{device.name}</span>
            </div>
            <div className="sensor-data">
                <div className="sensor-item background">
                    <span>Temperature:</span>
                    <span>{device.state.temperature} °C</span>
                </div>
                <div className="sensor-item background">
                    <span>Humidity:</span>
                    <span>{device.state.humidity} %</span>
                </div>
                <div className="sensor-item background">
                    <span>Outside Temperature:</span>
                    <span>{outsideTemp} °C</span>
                </div>
            </div>
        </div>
    )


};

export default Sensor;