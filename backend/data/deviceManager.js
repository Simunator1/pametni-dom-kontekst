const DEVICE_TYPES = ['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'SMART_BLIND', 'AIR_CONDITIONER', 'SENSOR'];

let devices = [
    {
        id: 'device-001',
        name: 'Svjetlo Dnevnik Boravak',
        type: 'LIGHT',
        roomId: 'room-001',
        state: {
            roomState: 'OFF',
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
            roomState: 'OFF',
            isOn: false,
            temperature: 22,
            targetTemp: 25,
            mode: 'OFF', // 'OFF', 'HEAT', 'COOL'
            prevMode: 'HEAT' // 'HEAT' ili 'COOL'
        },
        supportedActions: ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE', 'READ_TEMPERATURE']
    },
    {
        id: 'device-003',
        name: 'Utičnica Aparat za Kavu',
        type: 'SMART_OUTLET',
        roomId: 'room-002',
        state: {
            roomState: 'OFF',
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
            roomState: 'ON',
            isOn: true,
            temperature: 24,
            targetTemp: 22,
            mode: 'COOL', // 'OFF', 'HEAT', 'COOL'
            prevMode: 'HEAT' // 'HEAT' ili 'COOL'
        },
        supportedActions: ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE']
    },
    {
        id: 'device-006',
        name: 'Senzor Temp i Vlage Dnevni Boravak',
        type: 'SENSOR',
        roomId: 'room-001',
        state: {
            temperature: 21,
            humidity: 45
        },
        supportedActions: ['READ']
    },
    {
        id: 'device-007',
        name: 'Svjetlo Kupaonica',
        type: 'LIGHT',
        roomId: 'room-004',
        state: {
            roomState: 'OFF',
            isOn: false,
            brightness: 0 // 0 - 100
        },
        supportedActions: ['TOGGLE_ON_OFF', 'SET_BRIGHTNESS']
    },
    {
        id: 'device-008',
        name: 'Roleta Balkon',
        type: 'SMART_BLIND',
        roomId: 'room-005',
        state: {
            position: 0 // 0% - 100%
        },
        supportedActions: ['SET_POSITION', 'OPEN', 'CLOSE']
    },
    {
        id: 'device-009',
        name: 'Senzor Temp i Vlage Kupaonica',
        type: 'SENSOR',
        roomId: 'room-004',
        state: {
            temperature: 21,
            humidity: 45
        },
        supportedActions: ['READ']
    }
];

let Rooms = [
    {
        id: 'room-001',
        name: 'Dnevni Boravak',
        isOn: true
    },
    {
        id: 'room-002',
        name: 'Kuhinja',
        isOn: true
    },
    {
        id: 'room-003',
        name: 'Spavaća Soba',
        isOn: true
    },
    {
        id: 'room-004',
        name: 'Kupaonica',
        isOn: true
    },
    {
        id: 'room-005',
        name: 'Balkon',
        isOn: true
    }
];

// simulacija vanjske temperature
let outsideTemperature = 25;

// Ažurirajanje vanjske temperature
function updateOutsideTemperature(newTemp) {
    if (typeof newTemp === 'number') {
        outsideTemperature = Math.max(-15, Math.min(45, newTemp));
        console.log(`Vanjska temperatura ažurirana na: ${outsideTemperature}°C`);
        return outsideTemperature;
    } else {
        console.warn('Ažuriranje vanjske temperature nije uspjelo. Unesite ispravnu brojčanu vrijednost.');
        return null;
    }
}

// Funkcija za dohvat vanjske temperature
function getOutsideTemperature() {
    return outsideTemperature;
}

function simulateTemperatureChanges() {
    const INERTIA_FACTOR = 0.1;

    devices.forEach(device => {
        if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER' || device.type === 'SENSOR') {
            let currentDeviceTemp = device.state.temperature;
            let targetDeviceSimTemp = currentDeviceTemp; // Temperatura kojoj će simulacija težiti

            if (device.type === 'SENSOR') { // SENZOR
                targetDeviceSimTemp = outsideTemperature;
            } else { // THERMOSTAT ili AIR_CONDITIONER
                const mode = device.state.mode;
                const targetUserTemp = device.state.targetTemp;

                if (mode === 'OFF') {
                    // Ako je uređaj ISKLJUČEN, teži vanjskoj temperaturi
                    targetDeviceSimTemp = outsideTemperature;
                } else if (mode === 'HEAT') {
                    if ((targetUserTemp <= currentDeviceTemp && currentDeviceTemp <= outsideTemperature) ||
                        (currentDeviceTemp <= targetUserTemp && targetUserTemp <= outsideTemperature) ||
                        (targetUserTemp <= outsideTemperature && outsideTemperature <= currentDeviceTemp)
                    ) {
                        targetDeviceSimTemp = outsideTemperature;
                    } else {
                        targetDeviceSimTemp = targetUserTemp;
                    }
                } else if (mode === 'COOL') {
                    if ((targetUserTemp <= currentDeviceTemp && currentDeviceTemp <= outsideTemperature) ||
                        (currentDeviceTemp <= targetUserTemp && targetUserTemp <= outsideTemperature) ||
                        (targetUserTemp <= outsideTemperature && outsideTemperature <= currentDeviceTemp)
                    ) {
                        targetDeviceSimTemp = targetUserTemp;
                    } else {
                        targetDeviceSimTemp = outsideTemperature;
                    }
                }
            }

            let change = (targetDeviceSimTemp - currentDeviceTemp) * INERTIA_FACTOR;
            if (Math.abs(change) < 0.1) {
                change = targetDeviceSimTemp > currentDeviceTemp ? 0.1 : -0.1; // Osiguraj minimalnu promjenu
            }
            let newTemp = currentDeviceTemp + change;
            device.state.temperature = parseFloat(newTemp.toFixed(1));

            if (device.type === 'SENSOR' && device.state.hasOwnProperty('humidity')) {
                let currentHumidity = device.state.humidity;
                let randomChange = (Math.random() - 0.5) * 2; // Nasumična promjena između -1 i 1
                device.state.humidity = Math.max(0, Math.min(100, parseFloat((currentHumidity + randomChange).toFixed(0))));
            }
        }
    });
    // console.log('Simulirane temperature ažurirane.');
}

const simulationInterval = setInterval(simulateTemperatureChanges, 5000); // 5000ms = 5s

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
        return null;
    }

    switch (device.type) {
        case 'LIGHT':
            if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
                device.state.roomState = device.state.isOn ? 'ON' : 'OFF';
            } else if (actionType === 'SET_BRIGHTNESS') {
                if (payload && typeof payload.brightness === 'number') {
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
            if (actionType === 'SET_TEMPERATURE') {
                if (payload && typeof payload.targetTemp === 'number') {
                    device.state.targetTemp = Math.max(10, Math.min(30, payload.targetTemp));
                } else {
                    console.warn('SET_TEMPERATURE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
                device.state.roomState = device.state.isOn ? 'ON' : 'OFF';
                device.state.mode = device.state.isOn ? device.state.prevMode : 'OFF';
            } else if (actionType === 'SET_MODE') {
                if (payload && ['HEAT', 'COOL'].includes(payload.mode)) {
                    device.state.mode = device.state.prevMode = payload.mode;
                    device.state.isOn = true;
                    device.state.roomState = 'ON';
                } else if (payload && payload.mode === 'OFF') {
                    device.state.mode = payload.mode;
                    device.state.isOn = false;
                    device.state.roomState = 'OFF';
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
            break;
        case 'SMART_OUTLET':
            if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
                device.state.roomState = device.state.isOn ? 'ON' : 'OFF';
            } else if (actionType === 'READ_POWER_USAGE') {
                device.state.powerUsage = parseFloat((Math.random() * 100).toFixed(1));
                return device.state.powerUsage;
            } else {
                console.warn(`Nepoznata akcija za SMART_OUTLET uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'SMART_BLIND':
            if (actionType === 'SET_POSITION') {
                if (payload && typeof payload.position === 'number') {
                    device.state.position = Math.max(0, Math.min(100, payload.position));
                } else {
                    console.warn('SET_POSITION pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'OPEN') {
                device.state.position = 0; // Otvori roletu
            } else if (actionType === 'CLOSE') {
                device.state.position = 100; // Zatvori roletu
            } else {
                console.warn(`Nepoznata akcija za SMART_BLIND uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'AIR_CONDITIONER':
            if (actionType === 'SET_TEMPERATURE') {
                if (payload && typeof payload.targetTemp === 'number') {
                    device.state.targetTemp = Math.max(16, Math.min(30, payload.targetTemp));
                } else {
                    console.warn('SET_TEMPERATURE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else if (actionType === 'TOGGLE_ON_OFF') {
                device.state.isOn = !device.state.isOn;
                device.state.roomState = device.state.isOn ? 'ON' : 'OFF';
                device.state.mode = device.state.isOn ? device.state.prevMode : 'OFF';
            } else if (actionType === 'SET_MODE') {
                if (payload && ['HEAT', 'COOL'].includes(payload.mode)) {
                    device.state.mode = device.state.prevMode = payload.mode;
                    device.state.isOn = true;
                    device.state.roomState = 'ON';
                } else if (payload && payload.mode === 'OFF') {
                    device.state.mode = payload.mode;
                    device.state.isOn = false;
                    device.state.roomState = 'OFF';
                } else {
                    console.warn('SET_MODE pozvana bez ispravnog payload-a.');
                    return null;
                }
            } else {
                console.warn(`Nepoznata akcija za AIR_CONDITIONER uređaj: ${actionType}`);
                return null;
            }
            break;
        case 'SENSOR':
            if (actionType === 'READ') {
                return device.state;
            } else {
                console.warn(`Nepoznata akcija za SENSOR uređaj: ${actionType}`);
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

function getAllDevicesByRoom(roomId) {
    return devices.filter(device => device.roomId === roomId);
}

function getRoomsWithDevices() {
    return Rooms.map(room => {
        const devicesInRoom = devices.filter(device => device.roomId === room.id);
        return {
            id: room.id,
            name: room.name,
            isOn: room.isOn,
            devices: devicesInRoom,
            numDevices: devicesInRoom.length
        };
    });
}

function fetchDeviceTypes() {
    return DEVICE_TYPES;
}

function addRoom(roomName) {
    if (!roomName) {
        console.error('Dodavanje sobe nije uspjelo. Naziv sobe je obavezan.');
        return null;
    }

    const existingRoom = Rooms.find(room => room.name.toLowerCase() === roomName.toLowerCase());
    if (existingRoom) {
        console.error(`Soba s imenom '${roomName}' već postoji.`);
        return null;
    }

    const newRoomId = `room-${String(Rooms.length + 1).padStart(3, '0')}`;

    const newRoom = {
        id: newRoomId,
        name: roomName,
        isOn: false
    };

    Rooms.push(newRoom);
    console.log(`Soba ${newRoom.name} dodana.`);
    return newRoom;
}

function addDevice({ name, type, roomId }) {
    if (!name || !type || !roomId) {
        console.error('Nedostaju podaci za kreiranje uređaja.');
        return { error: 'Nedostaju podaci (ime, tip, ili soba).' };
    }

    if (!DEVICE_TYPES.includes(type)) {
        console.error(`Pokušaj kreiranja uređaja s nepostojećim tipom: ${type}`);
        return { error: `Nepostojeći tip uređaja: ${type}` };
    }

    const newDeviceId = `device-${String(devices.length + 1).padStart(3, '0')}`;

    const newDevice = {
        id: newDeviceId,
        name: name,
        type: type,
        roomId: roomId,
        state: {},
        supportedActions: []
    };

    switch (type) {
        case 'LIGHT':
            newDevice.state = { roomState: 'OFF', isOn: false, brightness: 0 };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'SET_BRIGHTNESS'];
            break;
        case 'THERMOSTAT':
            newDevice.state = { roomState: 'OFF', isOn: false, temperature: outsideTemperature, targetTemp: 22, mode: 'OFF', prevMode: 'HEAT' };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE'];
            break;
        case 'SMART_OUTLET':
            newDevice.state = { roomState: 'OFF', isOn: false, powerUsage: 0 };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'READ_POWER_USAGE'];
            break;
        case 'SMART_BLIND':
            newDevice.state = { position: 0 };
            newDevice.supportedActions = ['SET_POSITION', 'OPEN', 'CLOSE'];
            break;
        case 'AIR_CONDITIONER':
            newDevice.state = { roomState: 'OFF', isOn: false, temperature: outsideTemperature, targetTemp: 24, mode: 'OFF', prevMode: 'HEAT' };
            newDevice.supportedActions = ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE'];
            break;
        case 'SENSOR':
            newDevice.state = { temperature: outsideTemperature, humidity: 50 };
            newDevice.supportedActions = ['READ'];
            break;
        default:
            newDevice.state = { status: 'unconfigured' };
            break;
    }

    devices.push(newDevice);
    console.log(`Uređaj ${newDevice.name} dodan u sobu ${roomId}.`);
    return { device: newDevice };
}

function roomToggle(roomId) {
    const room = Rooms.find(r => r.id === roomId);
    if (!room) {
        console.error("Soba s tim ID-om ne postoji.");
        return null;
    }

    const devicesInRoom = getAllDevicesByRoom(roomId);

    if (devicesInRoom.length === 0) {
        console.warn("Soba nema uređaja za uključivanje/isključivanje.");
        room.isOn = false;
        return null;
    }

    if (room.isOn) {
        room.isOn = false;
        devicesInRoom.forEach(device => {
            if (!['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'AIR_CONDITIONER'].includes(device.type)) return;
            device.state.isOn = false;
            if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER') {
                device.state.mode = 'OFF';
            }
        })
    } else {
        room.isOn = true;
        devicesInRoom.forEach(device => {
            if (!['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'AIR_CONDITIONER'].includes(device.type)) return;
            if (device.state.roomState === 'ON') {
                device.state.isOn = true;
                if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER') {
                    device.state.mode = device.state.prevMode;
                }
            }
        });
    }
    return { room };
}

module.exports = {
    getAllDevices,
    getDeviceById,
    executeDeviceAction,
    updateOutsideTemperature,
    getOutsideTemperature,
    getAllDevicesByRoom,
    getRoomsWithDevices,
    simulationInterval,
    addRoom,
    addDevice,
    fetchDeviceTypes,
    roomToggle
};