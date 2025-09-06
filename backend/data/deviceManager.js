const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const DEVICE_TYPES = ['LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'SMART_BLIND', 'AIR_CONDITIONER', 'SENSOR'];

const TIMES_OF_DAY = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

const TRIGGER_TYPES = ['TIME_OF_DAY_CHANGE', 'USER_PRESENCE_CHANGE'];

const LOGICAL_OPERATORS = ['AND', 'OR'];

const ICONS = [
    'bi bi-sunrise',
    'bi bi-moon-stars',
    'bi bi-house-door',
    'bi bi-gear',
    'bi bi-lightbulb',
    'bi bi-thermometer',
    'bi bi-plug',
    'bi bi-check-circle',
    'bi bi-x-circle',
    'bi bi-exclamation-triangle',
    'bi bi-info-circle',
    'bi bi-question-circle',
    'bi bi-film',
    'bi bi-fire',
    'bi bi-bell-slash',
    'bi bi-brightness-high',
    'bi bi-cake',
    'bi bi-fork-knife',
    'bi bi-wind',
    'bi bi-droplet-fill',
    'bi bi-camera-video',
    'bi bi-lock',
    'bi bi-unlock',
    'bi bi-volume-up',
    'bi bi-tv',
    'bi bi-router',
    'bi bi-shield-lock',
    'bi bi-calendar-event',
    'bi bi-clock-history',
    'bi bi-power',
    'bi bi-snow2'
];

const CONDITION_TYPES = {
    'USER_PRESENCE': {
        modes: [true, false]
    },
    'OUTSIDE_TEMPERATURE': {
        operators: ['<', '>'],
        valueRange: [-15, 45],
    },
    'TIME_OF_DAY': {
        modes: TIMES_OF_DAY
    }
};

const availableActions = {
    'LIGHT': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'Toggle ON/OFF',
            payloads: ['ON', 'OFF']
        },
        {
            actionType: 'SET_BRIGHTNESS',
            label: 'Set Brightness',
            payloads: [
                {
                    name: 'brightness',
                    label: 'Brightness (%)',
                    type: 'number',
                    min: 0,
                    max: 100
                }
            ]
        }
    ],
    'THERMOSTAT': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'ON/OFF',
            payloads: ['ON', 'OFF']
        },
        {
            actionType: 'SET_TEMPERATURE',
            label: 'Set temperature',
            payloads: [
                {
                    name: 'targetTemp',
                    label: 'Target Temperature (°C)',
                    type: 'number',
                    min: 10,
                    max: 30
                }
            ]
        },
        {
            actionType: 'SET_MODE',
            label: 'Set mode',
            payloads: [
                {
                    name: 'mode',
                    label: 'Work mode',
                    type: 'select',
                    options: ['HEAT', 'COOL', 'OFF']
                }
            ]
        }
    ],
    'AIR_CONDITIONER': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'ON/OFF',
            payloads: ['ON', 'OFF']
        },
        {
            actionType: 'SET_TEMPERATURE',
            label: 'Set temperature',
            payloads: [
                {
                    name: 'targetTemp',
                    label: 'Target temperature (°C)',
                    type: 'number',
                    min: 16,
                    max: 30
                }
            ]
        },
        {
            actionType: 'SET_MODE',
            label: 'Set mode',
            payloads: [
                {
                    name: 'mode',
                    label: 'Work mode',
                    type: 'select',
                    options: ['HEAT', 'COOL', 'OFF']
                }
            ]
        }
    ],
    'SMART_OUTLET': [
        {
            actionType: 'TOGGLE_ON_OFF',
            label: 'Toggle ON/OFF',
            payloads: ['ON', 'OFF']
        }
    ],
    'SMART_BLIND': [
        {
            actionType: 'SET_POSITION',
            label: 'Set position',
            payloads: [
                {
                    name: 'position',
                    label: 'Position (%)',
                    type: 'number',
                    min: 0,
                    max: 100
                }
            ]
        },
        {
            actionType: 'OPEN',
            label: 'Fully open',
            payloads: []
        },
        {
            actionType: 'CLOSE',
            label: 'Fully close',
            payloads: []
        }
    ]
};

const ROUTINE_FORM_TEMPLATE = {
    DEVICE_TYPES,
    TIMES_OF_DAY,
    TRIGGER_TYPES,
    LOGICAL_OPERATORS,
    CONDITION_TYPES,
    ICONS,
    availableActions
}

let currentTimeOfDay = TIMES_OF_DAY[0];

let userPresence = true;

let outsideTemperature = 28;

let simulationIntervalId = null;

let simulationIntervalDuration = 5000;

// Funkcija za provjeru i primjenu preferencija
async function checkPreferences(device) {
    const roomPreferences = await getPreferencesByRoom(device.room_id);
    if (roomPreferences.length === 0) {
        return null;
    }

    let finalPreferredState = null;

    for (const pref of roomPreferences) {
        const evaluateCondition = (cond) => {
            switch (cond.type) {
                case 'TIME_OF_DAY':
                    return currentTimeOfDay === cond.value;
                case 'USER_PRESENCE':
                    return userPresence === cond.value;
                case 'OUTSIDE_TEMPERATURE':
                    if (cond.operator === '<') return outsideTemperature < cond.value;
                    if (cond.operator === '>') return outsideTemperature > cond.value;
                    return false;
                default:
                    return false;
            }
        };

        let conditionsMet = false;
        const conditions = pref.conditions;

        if (!conditions || !conditions.list || conditions.list.length === 0) {
            conditionsMet = true;
        } else if (conditions.logicalOperator === 'AND') {
            conditionsMet = conditions.list.every(evaluateCondition);
        } else if (conditions.logicalOperator === 'OR') {
            conditionsMet = conditions.list.some(evaluateCondition);
        }

        if (conditionsMet) {
            const actionForDevice = pref.actions.find(act => act.deviceType === device.type);
            if (actionForDevice) {
                finalPreferredState = actionForDevice.state;
                console.log(`Pronađena aktivna preferencija: "${pref.name}"`);
                break;
            }
        }
    }
    return finalPreferredState;
}

// Funkcije za upravljanje rutinama
async function routineManager(trigger) {
    console.log(`Motor za rutine pokrenut, okidač: ${trigger.type}, vrijednost: ${trigger.value}`);

    const checkConditions = (conditions) => {
        if (!conditions || !conditions.list || conditions.list.length === 0) return true;
        const evaluate = (condition) => {
            if (condition.type === 'USER_PRESENCE') return userPresence === condition.value;
            if (condition.type === 'OUTSIDE_TEMPERATURE') {
                if (condition.operator === '<') return outsideTemperature < condition.value;
                if (condition.operator === '>') return outsideTemperature > condition.value;
            }
            if (condition.type === 'TIME_OF_DAY') return currentTimeOfDay === condition.value;
            return false;
        };
        if (conditions.logicalOperator === 'AND') return conditions.list.every(evaluate);
        if (conditions.logicalOperator === 'OR') return conditions.list.some(evaluate);
        return false;
    };

    const checkTriggers = (routineTriggers) => {
        if (!routineTriggers || !routineTriggers.list) return false;
        return routineTriggers.list.some(t => t.type === trigger.type && String(t.value) === String(trigger.value));
    };


    try {
        const routinesResult = await pool.query('SELECT * FROM routines WHERE is_enabled = TRUE');
        const activeRoutines = routinesResult.rows;

        const actionPromises = [];

        for (const routine of activeRoutines) {
            if (checkTriggers(routine.triggers) && checkConditions(routine.conditions)) {
                console.log(`Rutina "${routine.name}" aktivirana. Izvršavam akcije.`);

                routine.actions.forEach(action => {
                    if (action.type === 'DEVICE_ACTION') {
                        actionPromises.push(
                            executeDeviceAction(action.deviceId, action.actionType, action.payload)
                        );
                    }
                });
            }
        }

        const updatedDevices = await Promise.all(actionPromises);

        return updatedDevices.filter(d => d !== null);

    } catch (error) {
        console.error("Greška u routineManageru:", error);
        return [];
    }
}

// Funkcija za dodavanje rutine
async function addRoutine({ name, description, icon, triggers, conditions, actions }) {
    if (!name || !triggers || !actions) {
        throw new Error('Naziv, okidači i akcije su obavezni.');
    }

    const includedDevices = [];
    const includedRoomsSet = new Set();

    const allDbDevices = await getAllDevices();

    actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION' && !includedDevices.includes(action.deviceId)) {
            includedDevices.push(action.deviceId);
        }
    });

    includedDevices.forEach(deviceId => {
        const device = allDbDevices.find(d => d.id === deviceId);
        if (device) {
            includedRoomsSet.add(device.room_id);
        }
    });

    const includedRooms = [...includedRoomsSet];

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const counterResult = await client.query('SELECT routine_id_counter FROM counters WHERE id = 1 FOR UPDATE');
        const currentCounter = counterResult.rows[0].routine_id_counter;
        const newCounter = currentCounter + 1;
        const newRoutineId = `routine-${String(newCounter).padStart(3, '0')}`;
        await client.query('UPDATE counters SET routine_id_counter = $1 WHERE id = 1', [newCounter]);

        const insertQuery = `
            INSERT INTO routines (id, name, description, icon, is_enabled, included_devices, included_rooms, triggers, conditions, actions) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`;
        const values = [
            newRoutineId,
            name,
            description,
            icon || 'bi bi-gear',
            true,
            includedDevices,
            includedRooms,
            triggers,
            conditions,
            actions
        ];

        const result = await client.query(insertQuery, values);
        const newRoutine = result.rows[0];

        await client.query('COMMIT');

        console.log(`Rutina "${name}" dodana u bazu.`);
        return newRoutine;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Greška kod dodavanja rutine u bazu:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za uređivanje rutine
async function editRoutine({ routineId, name, description, icon, triggers, conditions, actions }) {
    const includedDevices = [];
    const includedRoomsSet = new Set();

    const allDbDevices = await getAllDevices();

    actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION' && !includedDevices.includes(action.deviceId)) {
            includedDevices.push(action.deviceId);
        }
    });

    includedDevices.forEach(deviceId => {
        const device = allDbDevices.find(d => d.id === deviceId);
        if (device) {
            includedRoomsSet.add(device.room_id);
        }
    });

    const includedRooms = [...includedRoomsSet];

    const updateQuery = `
        UPDATE routines 
        SET 
            name = $1, 
            description = $2, 
            icon = $3, 
            included_devices = $4, 
            included_rooms = $5, 
            triggers = $6, 
            conditions = $7, 
            actions = $8
        WHERE id = $9
        RETURNING *`;

    const values = [
        name,
        description,
        icon || 'bi bi-gear',
        includedDevices,
        includedRooms,
        triggers,
        conditions,
        actions,
        routineId
    ];

    try {
        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            console.error(`Rutina s ID-om '${routineId}' nije pronađena za uređivanje.`);
            return null;
        }

        console.log(`Rutina "${name}" uređena u bazi.`);
        return result.rows[0];

    } catch (error) {
        console.error("Greška kod uređivanja rutine:", error);
        throw error;
    }
}

// Funkcija za dodavanje quick action
async function addQuickAction({ name, description, icon, actions }) {
    if (!name || !actions) {
        throw new Error('Naziv i akcije su obavezni.');
    }

    const includedDevices = [];
    const includedRoomsSet = new Set();

    const allDbDevices = await getAllDevices();

    actions.forEach(action => {
        if (action.type === 'DEVICE_ACTION' && !includedDevices.includes(action.deviceId)) {
            includedDevices.push(action.deviceId);
        }
    });

    includedDevices.forEach(deviceId => {
        const device = allDbDevices.find(d => d.id === deviceId);
        if (device) {
            includedRoomsSet.add(device.room_id);
        }
    });

    const includedRooms = [...includedRoomsSet];

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const counterResult = await client.query('SELECT quick_action_id_counter FROM counters WHERE id = 1 FOR UPDATE');
        const currentCounter = counterResult.rows[0].quick_action_id_counter;
        const newCounter = currentCounter + 1;
        const newQuickActionId = `quickaction-${String(newCounter).padStart(3, '0')}`;
        await client.query('UPDATE counters SET quick_action_id_counter = $1 WHERE id = 1', [newCounter]);

        const insertQuery = `
            INSERT INTO quick_actions (id, name, description, included_devices, included_rooms, icon, actions) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`;
        const values = [
            newQuickActionId,
            name,
            description,
            includedDevices,
            includedRooms,
            icon || 'bi bi-gear',
            actions
        ];

        const result = await client.query(insertQuery, values);
        const newQuickAction = result.rows[0];

        await client.query('COMMIT');

        console.log(`Quick Action "${name}" dodana u bazu.`);
        return newQuickAction;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Greška kod dodavanja brze akcije u bazu:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za brisanje quick action
async function removeQuickAction(quickActionId) {
    const query = 'DELETE FROM quick_actions WHERE id = $1 RETURNING *';
    try {
        const result = await pool.query(query, [quickActionId]);

        if (result.rows.length > 0) {
            const removedQuickAction = result.rows[0];
            console.log(`Quick Action "${removedQuickAction.name}" uklonjena.`);
            return removedQuickAction;
        }

        return false;

    } catch (error) {
        console.error(`Greška kod brisanja brze akcije s ID-om ${quickActionId}:`, error);
        throw error;
    }
}

// Funkcija za uklanjanje rutine
async function removeRoutine(routineId) {
    const query = 'DELETE FROM routines WHERE id = $1 RETURNING *';
    try {
        const result = await pool.query(query, [routineId]);

        if (result.rows.length > 0) {
            const removedRoutine = result.rows[0];
            console.log(`Rutina "${removedRoutine.name}" uklonjena.`);
            return removedRoutine;
        }

        return false;

    } catch (error) {
        console.error(`Greška kod brisanja rutine s ID-om ${routineId}:`, error);
        throw error;
    }
}

// Funkcija za dohvat svih rutina
async function getAllRoutines() {
    try {
        const result = await pool.query('SELECT * FROM routines ORDER BY id');
        return result.rows;
    } catch (error) {
        console.error("Greška kod dohvaćanja svih rutina:", error);
        throw error;
    }
}

// Funkcija za dohvat rutine po ID-u
async function getRoutineById(routineId) {
    const query = 'SELECT * FROM routines WHERE id = $1';
    try {
        const result = await pool.query(query, [routineId]);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error(`Greška kod dohvaćanja rutine s ID-om ${routineId}:`, error);
        throw error;
    }
}

// Funkcija za pokretanje simulacije promjene temperature
function startSimulation(newDuration) {
    if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
    }

    simulationIntervalDuration = newDuration;
    simulationIntervalId = setInterval(simulateTemperatureChanges, simulationIntervalDuration);
    console.log(`Simulacija je pokrenuta s intervalom od ${simulationIntervalDuration / 1000}s.`);
}

// Funkcija za dohvat trajanja simulacijskog intervala
function getSimulationInterval() {
    return simulationIntervalDuration;
}

// Inicijalizacija simulacije
startSimulation(simulationIntervalDuration);

// Ažurirajanje vanjske temperature
function setOutsideTemperature(newTemp) {
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

// Funkcija za simulaciju promjene temperature
async function simulateTemperatureChanges() {
    const INERTIA_FACTOR = 0.1;
    const client = await pool.connect();

    try {
        const devicesResult = await client.query("SELECT * FROM devices WHERE type IN ('THERMOSTAT', 'AIR_CONDITIONER', 'SENSOR')");
        let allDevices = devicesResult.rows;

        const updatePromises = []; // Za spremanje svih update queryja

        allDevices.forEach(device => {
            let newState = { ...device.state };
            let currentDeviceTemp = newState.temperature;
            let targetDeviceSimTemp = currentDeviceTemp;

            if (device.type === 'SENSOR') {
                const tempDeviceInRoom = allDevices.find(d =>
                    (d.type === 'THERMOSTAT' || d.type === 'AIR_CONDITIONER') && d.room_id === device.room_id
                );

                if (tempDeviceInRoom) {
                    newState.temperature = tempDeviceInRoom.state.temperature;
                } else {
                    newState.temperature = outsideTemperature;
                }
                let currentHumidity = newState.humidity;
                let randomChange = (Math.random() - 0.5) * 2;
                newState.humidity = Math.max(0, Math.min(100, parseFloat((currentHumidity + randomChange).toFixed(0))));

            } else { // THERMOSTAT ili AIR_CONDITIONER
                const mode = newState.mode;
                const targetUserTemp = newState.targetTemp;

                if (mode === 'OFF') {
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

                let change = (targetDeviceSimTemp - currentDeviceTemp) * INERTIA_FACTOR;
                if (Math.abs(change) < 0.1) {
                    change = targetDeviceSimTemp > currentDeviceTemp ? 0.1 : -0.1;
                }
                let newTemp = currentDeviceTemp + change;
                newState.temperature = parseFloat(newTemp.toFixed(1));
            }

            const updateQuery = 'UPDATE devices SET state = $1 WHERE id = $2';
            updatePromises.push(client.query(updateQuery, [newState, device.id]));
        });

        await Promise.all(updatePromises);
        // console.log('Simulirane temperature ažurirane u bazi.');
    } catch (error) {
        console.error("Greška u simulaciji promjene temperature:", error);
    } finally {
        client.release();
    }
}

// Funkcija za dohvat svih uređaja
async function getAllDevices() {
    try {
        const result = await pool.query('SELECT * FROM devices ORDER BY id;');
        return result.rows;
    } catch (error) {
        console.error("Greška kod dohvaćanja svih uređaja:", error);
        throw error;
    }
}

//Funkcija za dohvat uređaja po ID-u
async function getDeviceById(deviceId) {
    const query = 'SELECT * FROM devices WHERE id = $1';
    try {
        const result = await pool.query(query, [deviceId]);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error(`Greška kod dohvaćanja uređaja s ID-om ${deviceId}:`, error);
        throw error;
    }
}

// Funkcija za izvršavanje akcije na uređaju
async function executeDeviceAction(deviceId, actionType, payload) {
    const device = await getDeviceById(deviceId);
    if (!device) {
        console.error(`Uređaj s ID-om '${deviceId} nije pronađen.`);
        return null;
    }

    let newState = { ...device.state };

    async function adjustTempConditioner() {
        if (actionType === 'TOGGLE_ON_OFF' && (payload?.isOn === true || !newState.isOn)) {
            const preferredState = await checkPreferences(device);
            if (preferredState) {
                newState = { ...newState, ...preferredState, isOn: true };
                newState.roomState = 'ON';
                if (preferredState.mode) newState.prevMode = preferredState.mode;
                return;
            }
        }

        if (actionType === 'SET_TEMPERATURE') {
            if (payload && typeof payload.targetTemp === 'number') {
                newState.targetTemp = Math.max(10, Math.min(30, payload.targetTemp));
            } else return null;
        } else if (actionType === 'TOGGLE_ON_OFF') {
            let turnOn = (payload && typeof payload.isOn === 'boolean') ? payload.isOn : !newState.isOn;
            newState.isOn = turnOn;
            newState.roomState = turnOn ? 'ON' : 'OFF';
            newState.mode = turnOn ? newState.prevMode : 'OFF';
        } else if (actionType === 'SET_MODE') {
            if (payload && ['HEAT', 'COOL'].includes(payload.mode)) {
                newState.mode = newState.prevMode = payload.mode;
                newState.isOn = true;
                newState.roomState = 'ON';
            } else if (payload && payload.mode === 'OFF') {
                newState.mode = payload.mode;
                newState.isOn = false;
                newState.roomState = 'OFF';
            } else return null;
        } else if (actionType === 'READ_TEMPERATURE') {
            return newState.temperature;
        } else return null;
    }

    switch (device.type) {
        case 'LIGHT':
            if (actionType === 'TOGGLE_ON_OFF') {
                let turnOn = (payload && typeof payload.isOn === 'boolean') ? payload.isOn : !newState.isOn;
                if (turnOn) {
                    const preferredState = await checkPreferences(device);
                    if (preferredState) {
                        newState = { ...newState, ...preferredState, isOn: true };
                        newState.roomState = 'ON';
                        break;
                    }
                }
                newState.isOn = turnOn;
                newState.roomState = turnOn ? 'ON' : 'OFF';
            } else if (actionType === 'SET_BRIGHTNESS') {
                if (payload && typeof payload.brightness === 'number') {
                    newState.brightness = Math.max(0, Math.min(100, payload.brightness));
                    newState.isOn = true;
                    newState.roomState = 'ON';
                } else return null;
            } else return null;
            break;
        case 'THERMOSTAT':
        case 'AIR_CONDITIONER':
            await adjustTempConditioner();
            break;
        case 'SMART_OUTLET':
            if (actionType === 'TOGGLE_ON_OFF') {
                newState.isOn = (payload && typeof payload.isOn === 'boolean') ? payload.isOn : !newState.isOn;
                newState.roomState = newState.isOn ? 'ON' : 'OFF';
            } else if (actionType === 'READ_POWER_USAGE') {
                newState.powerUsage = parseFloat((Math.random() * 100).toFixed(1));
                const updateQuery = 'UPDATE devices SET state = $1 WHERE id = $2';
                await pool.query(updateQuery, [newState, deviceId]);
                return newState.powerUsage;
            } else return null;
            break;
        case 'SMART_BLIND':
            if (actionType === 'SET_POSITION') {
                if (payload && typeof payload.position === 'number') {
                    newState.position = Math.max(0, Math.min(100, payload.position));
                } else return null;
            } else if (actionType === 'OPEN') {
                newState.position = 0;
            } else if (actionType === 'CLOSE') {
                newState.position = 100;
            } else return null;
            break;
        case 'SENSOR':
            if (actionType === 'READ') {
                return newState;
            } else return null;
            break;
        default:
            return null;
    }

    const updateQuery = 'UPDATE devices SET state = $1 WHERE id = $2 RETURNING *';
    try {
        const result = await pool.query(updateQuery, [newState, deviceId]);
        console.log(`Novo stanje uređaja ${device.name}:`, result.rows[0].state);
        return result.rows[0];
    } catch (error) {
        console.error(`Greška kod ažuriranja stanja uređaja ${deviceId}:`, error);
        throw error;
    }
}

// Funkcija za dohvat svih uređaja u sobi
async function getAllDevicesByRoom(roomId) {
    const query = 'SELECT * FROM devices WHERE room_id = $1 ORDER BY id;';
    try {
        const result = await pool.query(query, [roomId]);
        return result.rows;
    } catch (error) {
        console.error(`Greška kod dohvaćanja uređaja za sobu ${roomId}:`, error);
        throw error;
    }
}

// Funkcija za dohvat svih soba s uređajima
async function getRoomsWithDevices() {
    try {
        const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY id;');
        const devicesResult = await pool.query('SELECT * FROM devices ORDER BY id;');

        const Rooms = roomsResult.rows;
        const devices = devicesResult.rows;

        return Rooms.map(room => {
            const devicesInRoom = devices.filter(device => device.room_id === room.id);
            return {
                id: room.id,
                name: room.name,
                isOn: room.is_on,
                devices: devicesInRoom,
                numDevices: devicesInRoom.length
            };
        });
    } catch (error) {
        console.error("Greška kod dohvaćanja soba s uređajima:", error);
        throw error;
    }
}

// Funkcija za dohvat tipova uređaja
function fetchDeviceTypes() {
    return DEVICE_TYPES;
}

// Funkcija za dodavanje nove sobe
async function addRoom(roomName) {
    if (!roomName) {
        console.error('Dodavanje sobe nije uspjelo. Naziv sobe je obavezan.');
        return null;
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const checkQuery = 'SELECT id FROM rooms WHERE LOWER(name) = LOWER($1)';
        const checkResult = await client.query(checkQuery, [roomName]);

        if (checkResult.rows.length > 0) {
            console.error(`Soba s imenom '${roomName}' već postoji.`);
            await client.query('ROLLBACK');
            return null;
        }

        const counterResult = await client.query('SELECT room_id_counter FROM counters WHERE id = 1 FOR UPDATE');
        let currentCounter = counterResult.rows[0].room_id_counter;
        const newCounter = currentCounter + 1;
        const newRoomId = `room-${String(newCounter).padStart(3, '0')}`;

        await client.query('UPDATE counters SET room_id_counter = $1 WHERE id = 1', [newCounter]);

        const insertQuery = 'INSERT INTO rooms (id, name, is_on) VALUES ($1, $2, $3) RETURNING *';
        const newRoomData = [newRoomId, roomName, false];
        const insertResult = await client.query(insertQuery, newRoomData);

        const newRoom = {
            id: insertResult.rows[0].id,
            name: insertResult.rows[0].name,
            isOn: insertResult.rows[0].is_on,
        };

        await client.query('COMMIT');

        console.log(`Soba ${newRoom.name} dodana u bazu.`);
        return newRoom;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Greška kod dodavanja sobe u bazu:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za dodavanje novog uređaja
async function addDevice({ name, type, roomId }) {
    if (!name || !type || !roomId) {
        return { error: 'Nedostaju podaci (ime, tip, ili soba).' };
    }
    if (!DEVICE_TYPES.includes(type)) {
        return { error: `Nepostojeći tip uređaja: ${type}` };
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const counterResult = await client.query('SELECT device_id_counter FROM counters WHERE id = 1 FOR UPDATE');
        const currentCounter = counterResult.rows[0].device_id_counter;
        const newCounter = currentCounter + 1;
        const newDeviceId = `device-${String(newCounter).padStart(3, '0')}`;
        await client.query('UPDATE counters SET device_id_counter = $1 WHERE id = 1', [newCounter]);

        let state = {};
        let supportedActions = [];
        switch (type) {
            case 'LIGHT':
                state = { roomState: 'OFF', isOn: false, brightness: 0 };
                supportedActions = ['TOGGLE_ON_OFF', 'SET_BRIGHTNESS'];
                break;
            case 'THERMOSTAT':
                state = { roomState: 'OFF', isOn: false, temperature: outsideTemperature, targetTemp: 22, mode: 'OFF', prevMode: 'HEAT' };
                supportedActions = ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE'];
                break;
            case 'SMART_OUTLET':
                state = { roomState: 'OFF', isOn: false, powerUsage: 0 };
                supportedActions = ['TOGGLE_ON_OFF', 'READ_POWER_USAGE'];
                break;
            case 'SMART_BLIND':
                state = { position: 0 };
                supportedActions = ['SET_POSITION', 'OPEN', 'CLOSE'];
                break;
            case 'AIR_CONDITIONER':
                state = { roomState: 'OFF', isOn: false, temperature: outsideTemperature, targetTemp: 24, mode: 'OFF', prevMode: 'COOL' };
                supportedActions = ['TOGGLE_ON_OFF', 'SET_TEMPERATURE', 'SET_MODE'];
                break;
            case 'SENSOR':
                state = { temperature: outsideTemperature, humidity: 50 };
                supportedActions = ['READ'];
                break;
            default:
                state = { status: 'unconfigured' };
                break;
        }

        const insertQuery = 'INSERT INTO devices (id, name, type, room_id, state, supported_actions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [newDeviceId, name, type, roomId, state, supportedActions];
        const result = await client.query(insertQuery, values);
        const newDevice = result.rows[0];

        await client.query('COMMIT');

        console.log(`Uređaj ${newDevice.name} dodan u sobu ${roomId}.`);
        return { device: newDevice };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Greška kod dodavanja uređaja u bazu:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za uključivanje/isključivanje sobe
async function roomToggle(roomId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
        if (roomResult.rows.length === 0) {
            console.error("Soba s tim ID-om ne postoji.");
            await client.query('ROLLBACK');
            return null;
        }
        const room = roomResult.rows[0];
        const newIsOn = !room.is_on;

        await client.query('UPDATE rooms SET is_on = $1 WHERE id = $2', [newIsOn, roomId]);

        const devicesResult = await client.query(
            "SELECT * FROM devices WHERE room_id = $1 AND type IN ('LIGHT', 'THERMOSTAT', 'SMART_OUTLET', 'AIR_CONDITIONER')",
            [roomId]
        );
        const devicesToUpdate = devicesResult.rows;

        for (const device of devicesToUpdate) {
            let newDeviceState = { ...device.state };

            if (newIsOn) {
                if (newDeviceState.roomState === 'ON') {
                    newDeviceState.isOn = true;
                    if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER') {
                        newDeviceState.mode = newDeviceState.prevMode;
                    }
                }
            } else {
                newDeviceState.isOn = false;
                if (device.type === 'THERMOSTAT' || device.type === 'AIR_CONDITIONER') {
                    newDeviceState.mode = 'OFF';
                }
            }

            await client.query('UPDATE devices SET state = $1 WHERE id = $2', [newDeviceState, device.id]);
        }

        const allDevicesInRoomResult = await client.query('SELECT * FROM devices WHERE room_id = $1 ORDER BY id', [roomId]);

        await client.query('COMMIT');

        const updatedRoomWithDevices = {
            id: room.id,
            name: room.name,
            isOn: newIsOn,
            devices: allDevicesInRoomResult.rows,
            numDevices: allDevicesInRoomResult.rows.length
        };

        console.log(`Soba ${room.name} je sada ${newIsOn ? 'uključena' : 'isključena'}.`);
        return { room: updatedRoomWithDevices };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Greška kod paljenja/gašenja sobe:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za brisanje uređaja
async function removeDevice(deviceId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const deleteDeviceResult = await client.query('DELETE FROM devices WHERE id = $1 RETURNING *', [deviceId]);

        if (deleteDeviceResult.rows.length === 0) {
            console.error(`Uređaj s ID-om '${deviceId}' nije pronađen za brisanje.`);
            await client.query('ROLLBACK');
            return null;
        }
        const removedDevice = deleteDeviceResult.rows[0];

        const routinesResult = await client.query('SELECT * FROM routines');
        const quickActionsResult = await client.query('SELECT * FROM quick_actions');

        let updatedRoutines = [];
        let updatedQuickActions = [];

        for (const routine of routinesResult.rows) {
            if (routine.included_devices.includes(deviceId)) {
                const newActions = routine.actions.filter(action => action.deviceId !== deviceId);
                const newIncludedDevices = routine.included_devices.filter(d_id => d_id !== deviceId);

                if (newActions.length === 0) {
                    await client.query('DELETE FROM routines WHERE id = $1', [routine.id]);
                    updatedRoutines.push({ ...routine, _deleted: true });
                    continue;
                }

                const allDbDevices = (await pool.query('SELECT * FROM devices ORDER BY id')).rows;
                const newIncludedRoomsSet = new Set();
                newIncludedDevices.forEach(d_id => {
                    const device = allDbDevices.find(d => d.id === d_id);
                    if (device) newIncludedRoomsSet.add(device.room_id);
                });
                const newIncludedRooms = [...newIncludedRoomsSet];

                const updateQuery = 'UPDATE routines SET actions = $1, included_devices = $2, included_rooms = $3 WHERE id = $4 RETURNING *';
                const updatedResult = await client.query(updateQuery, [JSON.stringify(newActions), newIncludedDevices, newIncludedRooms, routine.id]);
                updatedRoutines.push(updatedResult.rows[0]);
            }
        }

        for (const qa of quickActionsResult.rows) {
            if (qa.included_devices.includes(deviceId)) {
                const newActions = qa.actions.filter(action => action.deviceId !== deviceId);
                const newIncludedDevices = qa.included_devices.filter(d_id => d_id !== deviceId);

                if (newActions.length === 0) {
                    await client.query('DELETE FROM quick_actions WHERE id = $1', [qa.id]);
                    updatedQuickActions.push({ ...qa, _deleted: true });
                    continue;
                }

                const allDbDevices = (await pool.query('SELECT * FROM devices ORDER BY id')).rows;
                const newIncludedRoomsSet = new Set();
                newIncludedDevices.forEach(d_id => {
                    const device = allDbDevices.find(d => d.id === d_id);
                    if (device) newIncludedRoomsSet.add(device.room_id);
                });
                const newIncludedRooms = [...newIncludedRoomsSet];

                const updateQuery = 'UPDATE quick_actions SET actions = $1, included_devices = $2, included_rooms = $3 WHERE id = $4 RETURNING *';
                const updatedResult = await client.query(updateQuery, [JSON.stringify(newActions), newIncludedDevices, newIncludedRooms, qa.id]);
                updatedQuickActions.push(updatedResult.rows[0]);
            }
        }


        await client.query('COMMIT');
        console.log(`Uređaj ${removedDevice.name} i povezane stavke su uspješno obrađeni.`);
        return { removedDevice, updatedRoutines, updatedQuickActions };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Greška kod brisanja uređaja s ID-om ${deviceId}:`, error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za brisanje sobe
async function removeRoom(roomId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
        if (roomResult.rows.length === 0) {
            console.error(`Soba s ID-om '${roomId}' nije pronađena za brisanje.`);
            await client.query('ROLLBACK');
            return null;
        }
        const removedRoom = roomResult.rows[0];

        const devicesResult = await client.query('SELECT id FROM devices WHERE room_id = $1', [roomId]);
        const deviceIdsToRemove = devicesResult.rows.map(d => d.id);

        let updatedRoutines = [];
        let updatedQuickActions = [];

        if (deviceIdsToRemove.length > 0) {
            const routinesResult = await client.query('SELECT * FROM routines');
            const quickActionsResult = await client.query('SELECT * FROM quick_actions');

            for (const routine of routinesResult.rows) {
                const devicesInRoutine = routine.included_devices.filter(d_id => deviceIdsToRemove.includes(d_id));
                if (devicesInRoutine.length > 0) {
                    const newActions = routine.actions.filter(action => !deviceIdsToRemove.includes(action.deviceId));
                    const newIncludedDevices = routine.included_devices.filter(d_id => !deviceIdsToRemove.includes(d_id));

                    if (newActions.length === 0) {
                        await client.query('DELETE FROM routines WHERE id = $1', [routine.id]);
                        updatedRoutines.push({ ...routine, _deleted: true });
                        continue;
                    }

                    const allDbDevices = (await client.query('SELECT * FROM devices WHERE id <> ALL($1::text[]) ORDER BY id', [deviceIdsToRemove])).rows;
                    const newIncludedRoomsSet = new Set();
                    newIncludedDevices.forEach(d_id => {
                        const device = allDbDevices.find(d => d.id === d_id);
                        if (device) newIncludedRoomsSet.add(device.room_id);
                    });
                    const newIncludedRooms = [...newIncludedRoomsSet];

                    const updateQuery = 'UPDATE routines SET actions = $1, included_devices = $2, included_rooms = $3 WHERE id = $4 RETURNING *';
                    const updatedResult = await client.query(updateQuery, [JSON.stringify(newActions), newIncludedDevices, newIncludedRooms, routine.id]);
                    updatedRoutines.push(updatedResult.rows[0]);
                }
            }

            for (const qa of quickActionsResult.rows) {
                const devicesInAction = qa.included_devices.filter(d_id => deviceIdsToRemove.includes(d_id));
                if (devicesInAction.length > 0) {
                    const newActions = qa.actions.filter(action => !deviceIdsToRemove.includes(action.deviceId));
                    const newIncludedDevices = qa.included_devices.filter(d_id => !deviceIdsToRemove.includes(d_id));

                    if (newActions.length === 0) {
                        await client.query('DELETE FROM quick_actions WHERE id = $1', [qa.id]);
                        updatedQuickActions.push({ ...qa, _deleted: true });
                        continue;
                    }

                    const allDbDevices = (await client.query('SELECT * FROM devices WHERE id <> ALL($1::text[]) ORDER BY id', [deviceIdsToRemove])).rows;
                    const newIncludedRoomsSet = new Set();
                    newIncludedDevices.forEach(d_id => {
                        const device = allDbDevices.find(d => d.id === d_id);
                        if (device) newIncludedRoomsSet.add(device.room_id);
                    });
                    const newIncludedRooms = [...newIncludedRoomsSet];

                    const updateQuery = 'UPDATE quick_actions SET actions = $1, included_devices = $2, included_rooms = $3 WHERE id = $4 RETURNING *';
                    const updatedResult = await client.query(updateQuery, [JSON.stringify(newActions), newIncludedDevices, newIncludedRooms, qa.id]);
                    updatedQuickActions.push(updatedResult.rows[0]);
                }
            }
        }

        await client.query('DELETE FROM rooms WHERE id = $1', [roomId]);

        await client.query('COMMIT');

        console.log(`Soba ${removedRoom.name} i svi njeni uređaji su obrisani.`);
        return { removedRoom, updatedRoutines, updatedQuickActions };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Greška kod brisanja sobe s ID-om ${roomId}:`, error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za uređivanje sobe
async function editRoom({ roomId, newRoomName }) {
    const query = 'UPDATE rooms SET name = $1 WHERE id = $2 RETURNING *';
    const values = [newRoomName, roomId];

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            console.error(`Soba s ID-om '${roomId}' nije pronađena za uređivanje.`);
            return null;
        }

        const updatedRoom = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            isOn: result.rows[0].is_on,
        };

        console.log(`Soba ${roomId} preimenovana u ${newRoomName}.`);
        return updatedRoom;

    } catch (error) {
        console.error("Greška kod uređivanja sobe:", error);
        throw error;
    }
}

// Funkcija za uređivanje uređaja
async function editDevice({ deviceId, newDeviceName, newRoomId }) {
    const query = 'UPDATE devices SET name = $1, room_id = $2 WHERE id = $3 RETURNING *';
    const values = [newDeviceName, newRoomId, deviceId];

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            console.error(`Uređaj s ID-om '${deviceId}' nije pronađen za uređivanje.`);
            return null;
        }

        console.log(`Uređaj ${deviceId} preimenovan u ${newDeviceName} i premješten u sobu ${newRoomId}.`);
        return result.rows[0];

    } catch (error) {
        console.error("Greška kod uređivanja uređaja:", error);
        throw error;
    }
}

// Funkcija za dohvat svih tipova doba dana
function fetchTimesOfDay() {
    return TIMES_OF_DAY;
}

// Funkcija za dohvat trenutnog doba dana
function getCurrentTimeOfDay() {
    return currentTimeOfDay;
}

// Funkcija za postavljanje trenutnog doba dana
async function setCurrentTimeOfDay(newTimeOfDay) {
    if (TIMES_OF_DAY.includes(newTimeOfDay)) {
        currentTimeOfDay = newTimeOfDay;
        console.log(`Trenutno doba dana postavljeno na: ${currentTimeOfDay}`);
    } else {
        console.warn(`Nepoznata vrijednost doba dana: ${newTimeOfDay}`);
    }
    const updatedDevices = await routineManager({ type: 'TIME_OF_DAY_CHANGE', value: currentTimeOfDay });
    return { newTimeOfDay: currentTimeOfDay, updatedDevices: updatedDevices };
}

// Funkcija za dohvat prisutnosti korisnika
function getUserPresence() {
    return userPresence;
}

// Funkcija za postavljanje prisutnosti korisnika
async function setUserPresence(isPresent) {
    if (typeof isPresent === 'boolean') {
        userPresence = isPresent;
        console.log(`Trenutna prisutnost korisnika postavljena na: ${userPresence ? 'prisutni' : 'odsutni'}`);
    } else {
        console.warn('Pogrešan tip vrijednosti za prisutnost korisnika. Očekuje se boolean.');
    }
    const updatedDevices = await routineManager({ type: 'USER_PRESENCE_CHANGE', value: userPresence });
    return { newUserPresence: userPresence, updatedDevices: updatedDevices };
}

// Funkcija za dohvat predloška forme za rutine
function getRoutineFormTemplate() {
    return {
        ROUTINE_FORM_TEMPLATE
    };
}

// Funkcija za uključivanje/isključivanje rutine
async function toggleRoutine(routineId, isEnabled) {
    const query = 'UPDATE routines SET is_enabled = $1 WHERE id = $2 RETURNING *';
    const values = [isEnabled, routineId];

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            console.error(`Rutina s ID-om '${routineId}' nije pronađena.`);
            return null;
        }

        const updatedRoutine = result.rows[0];
        console.log(`Rutina "${updatedRoutine.name}" je sada ${updatedRoutine.is_enabled ? 'aktivirana' : 'deaktivirana'}.`);
        return updatedRoutine;

    } catch (error) {
        console.error("Greška kod paljenja/gašenja rutine:", error);
        throw error;
    }
}

// Funkcija za dohvat svih quick action
async function getQuickActions() {
    try {
        const result = await pool.query('SELECT * FROM quick_actions ORDER BY id');
        return result.rows;
    } catch (error) {
        console.error("Greška kod dohvaćanja svih brzih akcija:", error);
        throw error;
    }
}

// Funkcija za izvršavanje quick action

async function executeQuickAction(quickActionId) {
    const query = 'SELECT * FROM quick_actions WHERE id = $1';
    const result = await pool.query(query, [quickActionId]);

    if (result.rows.length === 0) {
        console.error(`Quick Action s ID-om '${quickActionId}' nije pronađena.`);
        return null;
    }

    const quickAction = result.rows[0];
    console.log(`Izvršavanje Quick Action "${quickAction.name}".`);

    try {
        const actionPromises = quickAction.actions.map(action => {
            if (action.type === 'DEVICE_ACTION') {
                return executeDeviceAction(action.deviceId, action.actionType, action.payload);
            }
            return Promise.resolve(null);
        });

        const updatedDevices = await Promise.all(actionPromises);

        return updatedDevices.filter(d => d !== null);

    } catch (error) {
        console.error(`Greška pri izvršavanju brze akcije ${quickActionId}:`, error);
        throw error;
    }
}

// Funkcija za dodavanje nove preferencije
async function addPreference({ name, description, icon, roomId, conditions, actions }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const counterResult = await client.query('SELECT preference_id_counter FROM counters WHERE id = 1 FOR UPDATE');
        const currentCounter = counterResult.rows[0].preference_id_counter;
        const newCounter = currentCounter + 1;
        const newPreferenceId = `pref-${String(newCounter).padStart(3, '0')}`;
        await client.query('UPDATE counters SET preference_id_counter = $1 WHERE id = 1', [newCounter]);

        const insertQuery = `
            INSERT INTO preferences (id, name, description, icon, room_id, conditions, actions) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`;
        const values = [
            newPreferenceId,
            name,
            description,
            icon,
            roomId,
            conditions,
            actions
        ];

        const result = await client.query(insertQuery, values);
        const newPreference = result.rows[0];

        await client.query('COMMIT');

        console.log(`Nova preferencija dodana: "${name}"`);
        return newPreference;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Greška kod dodavanja preferencije u bazu:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Funkcija za uklanjanje preferencije
async function removePreference(prefId) {
    const query = 'DELETE FROM preferences WHERE id = $1 RETURNING *';
    try {
        const result = await pool.query(query, [prefId]);

        if (result.rows.length > 0) {
            const removedPref = result.rows[0];
            console.log(`Preferencija "${removedPref.name}" uklonjena.`);
            return removedPref;
        }

        return false;

    } catch (error) {
        console.error(`Greška kod brisanja preferencije s ID-om ${prefId}:`, error);
        throw error;
    }
}

// Funkcija za dohvat preferencija po sobi
async function getPreferencesByRoom(roomId) {
    const query = 'SELECT * FROM preferences WHERE room_id = $1 ORDER BY id';
    try {
        const result = await pool.query(query, [roomId]);
        return result.rows;
    } catch (error) {
        console.error(`Greška kod dohvaćanja preferencija za sobu ${roomId}:`, error);
        throw error;
    }
}

// Funkcija za uređivanje preferencije
async function editPreference(prefId, { name, description, icon, roomId, conditions, actions }) {
    const updateQuery = `
        UPDATE preferences 
        SET 
            name = $1, 
            description = $2, 
            icon = $3, 
            room_id = $4, 
            conditions = $5, 
            actions = $6
        WHERE id = $7
        RETURNING *`;

    const values = [
        name,
        description,
        icon,
        roomId,
        conditions,
        actions,
        prefId
    ];

    try {
        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            console.error(`Preferencija s ID-om '${prefId}' nije pronađena za uređivanje.`);
            return null;
        }

        console.log(`Preferencija "${name}" uređena u bazi.`);
        return result.rows[0];

    } catch (error) {
        console.error("Greška kod uređivanja preferencije:", error);
        throw error;
    }
}

module.exports = {
    getAllDevices,
    getDeviceById,
    executeDeviceAction,
    setOutsideTemperature,
    getOutsideTemperature,
    getAllDevicesByRoom,
    getRoomsWithDevices,
    addRoom,
    addDevice,
    fetchDeviceTypes,
    roomToggle,
    removeDevice,
    removeRoom,
    editRoom,
    editDevice,
    startSimulation,
    getSimulationInterval,
    getCurrentTimeOfDay,
    setCurrentTimeOfDay,
    getUserPresence,
    setUserPresence,
    fetchTimesOfDay,
    addRoutine,
    removeRoutine,
    getAllRoutines,
    getRoutineById,
    getRoutineFormTemplate,
    toggleRoutine,
    addQuickAction,
    removeQuickAction,
    getQuickActions,
    executeQuickAction,
    editRoutine,
    addPreference,
    removePreference,
    getPreferencesByRoom,
    editPreference
};