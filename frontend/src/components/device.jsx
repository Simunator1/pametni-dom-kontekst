import React, { useRef, useEffect, useState } from 'react';
import '../styles/device.css';
import { sendDeviceAction } from '../services/apiService';

const iconMap = {
    LIGHT: 'bi-lightbulb',
    THERMOSTAT: 'bi-thermometer-half',
    SMART_OUTLET: 'bi-plug',
    SMART_BLIND: 'bi-arrows-expand',
    AIR_CONDITIONER: 'bi-wind',
    SENSOR: 'bi-moisture'
};


const Device = ({ device, onStateChange }) => {
    const nameRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    const handleToggle = async () => {
        if (typeof device.state.isOn !== 'boolean') return;
        try {
            const updatedDevice = await sendDeviceAction(device.id, { actionType: 'TOGGLE_ON_OFF' });
            onStateChange(updatedDevice);
        } catch (error) {
            console.error(`Nije uspjelo prebacivanje uređaja ${device.id}:`, error);
        }
    };

    useEffect(() => {
        const el = nameRef.current;
        if (el && el.scrollWidth > el.clientWidth) {
            setShouldScroll(true);
        } else {
            setShouldScroll(false);
        }
    }, [device.name]);

    const iconClass = iconMap[device.type] || 'bi-question-circle';
    const isToggleable = device.state.hasOwnProperty('isOn');
    const isDeviceOn = isToggleable ? device.state.isOn : true;

    return (
        <div className={`device${!isDeviceOn ? ' gray' : ''}`}>
            <i className={`device-ikona ${!isDeviceOn ? ' gray ' : ''}bi ${iconClass}${isToggleable ? '' : ' no-switch'}`}></i>
            <div className={`${isToggleable ? 'device-name-wrapper' : 'device-name-wrapper-no-switch'}`}>
                <p
                    className={`device-name${shouldScroll ? ' scroll' : ''}`}
                    ref={nameRef}
                    title={device.name}
                >
                    {device.name}
                </p>
            </div>
            {isToggleable && (
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`switch-${device.id}`}
                        checked={isDeviceOn}
                        onChange={handleToggle}
                    />
                </div>
            )}
        </div>
    );
};

export default Device;