import React from 'react';
import Light from './devices/light';
import TempConditioner from './devices/tempConditioner';
import SmartBlind from './devices/smartBlind';
import SmartOutlet from './devices/smartOutlet';
import Sensor from './devices/sensor';

const deviceComponentMap = {
    LIGHT: Light,
    THERMOSTAT: TempConditioner,
    AIR_CONDITIONER: TempConditioner,
    SMART_BLIND: SmartBlind,
    SMART_OUTLET: SmartOutlet,
    SENSOR: Sensor,
};

const DeviceDetails = ({ device, onStateChange, outsideTemp, pollingInterval }) => {
    const SpecificDeviceComponent = deviceComponentMap[device.type];

    if (!SpecificDeviceComponent) {
        return (
            <div className="device-details-container">
                <h4>{device.name}</h4>
                <p>Detaljan prikaz za ovaj tip uređaja još nije implementiran.</p>
            </div>
        );
    }

    return <SpecificDeviceComponent
        device={device}
        onStateChange={onStateChange}
        outsideTemp={outsideTemp}
        pollingInterval={pollingInterval}
    />;
};

export default DeviceDetails;