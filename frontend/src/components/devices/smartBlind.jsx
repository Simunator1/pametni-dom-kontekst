import { React, useEffect, useRef } from 'react';
import '../../styles/smartBlind.css';
import '../../styles/deviceDetails.css';
import { sendDeviceAction } from '../../services/apiService';

const SmartBlind = ({ device, onStateChange }) => {
    const position = device.state.position;
    const sliderRef = useRef(null);

    useEffect(() => {
        if (sliderRef.current) {
            const fillPercent = `${100 - position}%`;
            sliderRef.current.style.setProperty('--fill-percent', fillPercent);
        }
    }, [position]);

    const handleAction = async (action) => {
        try {
            const updatedDevice = await sendDeviceAction(device.id, { actionType: action })
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri izvršavanju akcije ${action} na roleti ${device.id}:`, error);
        };
    }

    const handleSliderChange = async (e) => {
        try {
            const newPosition = 100 - parseInt(e.target.value, 10);
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'SET_POSITION', payload: { position: newPosition } });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Greška pri mijenjanju položaja rolete ${device.id}:`, error);
        }
    }


    return (
        <div className="device-details-container">
            <span className="deviceName">{device.name}</span>

            <div className="smartBlindButtons">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => handleAction('CLOSE')}>CLOSE</button>
                <button type="button" className="btn btn-success btn-lg" onClick={() => handleAction('OPEN')}>OPEN</button>
            </div>

            <div className="smart-blind-control">
                <div className="slider-container">
                    <input
                        ref={sliderRef}
                        type="range"
                        min="0"
                        max="100"
                        value={100 - position}
                        onChange={handleSliderChange}
                        className="blind-slider"
                    />
                </div>
                <span className="deviceState">{position}%</span>
            </div>
        </div>
    );
};

export default SmartBlind;