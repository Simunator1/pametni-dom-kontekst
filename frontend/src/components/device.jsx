import React, { useRef, useEffect, useState } from 'react';
import '../styles/device.css';

const iconMap = {
    LIGHT: 'bi-lightbulb',
    THERMOSTAT: 'bi-thermometer-half',
    SMART_OUTLET: 'bi-plug',
    SMART_BLIND: 'bi-arrows-expand',
    AIR_CONDITIONER: 'bi-wind',
    SENSOR: 'bi-moisture'
};


const Device = ({ device }) => {
    const nameRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const [isChecked, setIsChecked] = useState(true);

    const handleSwitch = (e) => {
        setIsChecked(e.target.checked);
    }

    useEffect(() => {
        const el = nameRef.current;
        if (el && el.scrollWidth > el.clientWidth) {
            setShouldScroll(true);
        } else {
            setShouldScroll(false);
        }
    }, [device.name]);

    const iconClass = iconMap[device.type] || 'bi-question-circle';

    return (
        <div className={`device${!isChecked ? ' gray' : ''}`}>
            <i class={`device-ikona ${!isChecked ? ' gray ' : ''}bi ${iconClass}`}></i>
            <div className="device-name-wrapper">
                <p
                    className={`device-name${shouldScroll ? ' scroll' : ''}`}
                    ref={nameRef}
                    title={device.name}
                >
                    {device.name}
                </p>
            </div>
            <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="switchCheckChecked"
                    checked={isChecked}
                    onChange={handleSwitch}
                />
            </div>
        </div>
    );
};

export default Device;