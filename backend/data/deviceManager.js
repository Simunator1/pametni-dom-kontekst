let devices = [
    {
        id: 'device-001',
        name: 'Svjetlo Dnevnik Boravak',
        type: 'LIGHT',
        roomId: 'room-001',
        state: {
            isOn: false,
            brightness: 0 // 0 - 100
        },
        supportedActions: ['TOGGLE_ON_OFF', 'SET_BRIGHTNESS']
    },
    {
        id: 'device-002',
        name: 'Termostat Kuhinja',
        type: 'THERMOSTAT',
        roomId: 'room-002',
        state: {
            temperature: 22,
            targetTemp: 25,
            mode: 'OFF' // 'OFF', 'HEAT', 'COOL'
        },
        supportedActions: ['SET_TEMPERATURE', 'SET_MODE', 'READ_TEMPERATURE']
    },
    {
        id: 'device-003',
        name: 'Utičnica Aparat za Kavu',
        type: 'SMART_OUTLET',
        roomId: 'room-002',
        state: {
            isOn: false,
            powerUsage: 0
        },
        supportedActions: ['TOGGLE_ON_OFF', 'READ_POWER_USAGE']
    },
    {
        id: 'device-004',
        name: 'Roleta Spavaća Soba',
        type: 'SMART_BLIND',
        roomId: 'room-003',
        state: {
            position: 0 // 0% - 100%
        },
        supportedActions: ['SET_POSITION', 'OPEN', 'CLOSE']
    },
    {
        id: 'device-005',
        name: 'Klima Uređaj Spavaća Soba',
        type: 'AIR_CONDITIONER',
        roomId: 'room-003',
        state: {
            temperature: 24,
            targetTemp: 22,
            mode: 'COOL' // 'OFF', 'HEAT', 'COOL'
        },
        supportedActions: ['SET_TEMPERATURE', 'SET_MODE', 'TOGGLE_ON_OFF']
    },
    {
        deviceId: 'device-006',
        name: 'Senzor Temperature i Vlage Dnevni Boravak',
        type: 'SENSOR',
        roomId: 'room-001',
        state: {
            temperature: 21,
            humidity: 45
        },
        supportedActions: ['READ_TEMPERATURE', 'READ_HUMIDITY']
    }
];

// Funkcija za dohvat svih uređaja
function getAllDevices() {
    return devices;
}

//Funkcija za dohvat uređaja po ID-u
function getDeviceById(deviceId) {
    return devices.find(device => device.id === deviceId);
}

// Funkcija za izvršavanje akcije na uređaju
function executeDeviceAction(deviceId, actionType, payload) {
    const device = getDeviceById(deviceId);
    if (!device) {
        console.error(`Uređaj s ID-om '${deviceId} nije pronađen.`);
    }

    switch (device.type) {
        case 'LIGHT':
            if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
            } else if (actionType === 'SET_BRIGHTNESS') {
                if (payload && payload.brightness === 'number') {
                    device.state.brightness = Math.max(0, Math.min(100, payload.brightness));
                } else {
                    console.warn('SET_BRIGHTNESS pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else {
                console.warn(`Nepoznata akcija za LIGHT uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'THERMOSTAT':
            if (actionType === 'Set_TEMPERATURE') {
                if (payload && payload.targetTemp === 'number') {
                    device.state.targetTemp = Math.max(10, Math.min(30, payload.targetTemp));
                    device.state.temperature = device.state.targetTemp; // Simulacija promjene temperature
                } else {
                    console.warn('SET_TEMPERATURE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'SET_MODE') {
                if (payload && ['OFF', 'HEAT', 'COOL'].includes(payload.mode)) {
                    device.state.mode = payload.mode;
                } else {
                    console.warn('SET_MODE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'READ_TEMPERATURE') {
                return device.state.temperature;
            } else {
                console.warn(`Nepoznata akcija za THERMOSTAT uređaj: ${actionType}`);
                return null;
            }
        case 'SMART_OUTLET':
            if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
            } else if (actionType === 'READ_POWER_USAGE') {
                device.state.powerUsage = Math.random() * 100; // Simulacija potrošnje
                return device.state.powerUsage; // Simulacija vraćanja potrošnje
            } else {
                console.warn(`Nepoznata akcija za SMART_OUTLET uređaj: ${actionType}`);
                return null;
            }
        case 'SMART_BLIND':
            if (actionType === 'SET_POSITION') {
                if (payload && payload.position === 'number') {
                    device.state.position = Math.max(0, Math.min(100, payload.position));
                } else {
                    console.warn('SET_POSITION pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'OPEN') {
                device.state.position = 100; // Otvori roletu
            } else if (actionType === 'CLOSE') {
                device.state.position = 0; // Zatvori roletu
            } else {
                console.warn(`Nepoznata akcija za SMART_BLIND uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'AIR_CONDITIONER':
            if (actionType === 'SET_TEMPERATURE') {
                if (payload && payload.targetTemp === 'number') {
                    device.state.targetTemp = Math.max(16, Math.min(30, payload.targetTemp));
                    device.state.temperature = device.state.targetTemp; // Simulacija promjene temperature
                } else {
                    console.warn('SET_TEMPERATURE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'SET_MODE') {
                if (payload && ['OFF', 'HEAT', 'COOL'].includes(payload.mode)) {
                    device.state.mode = payload.mode;
                } else {
                    console.warn('SET_MODE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
            } else {
                console.warn(`Nepoznata akcija za AIR_CONDITIONER uređaj: ${actionType}`);
                return null;
            }
            break;
        default:
            console.warn(`Nepoznat tip uređaja: ${device.type}`);
            return null;
    }

    console.log(`Novo stanje uređaja ${device.name}:`, device.state);
    return device;
}

module.exports = {
    getAllDevices,
    getDeviceById,
    executeDeviceAction
};