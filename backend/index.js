require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const deviceManager = require('./data/deviceManager');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Za lokalni razvoj bez SSL-a, ovo je obično dovoljno.
    // Za produkciju s SSL-om (npr. Heroku, Supabase), možda će trebati:
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

// Testna ruta za provjeru konekcije s bazom
app.get('/api/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const updatedDevices = await client.query('SELECT NOW() as now');
        res.json({ success: true, time: updatedDevices.rows[0].now });
        client.release();
    } catch (err) {
        console.error('Greška pri spajanju na bazu:', err.stack);
        res.status(500).json({ success: false, error: 'Greška pri spajanju na bazu', details: err.message });
    }
});

// --- RUTE ZA VANJSKU TEMPERATURU ---
// Dohvati vanjsku temperaturu
app.get('/api/outside-temp', (req, res) => {
    res.json({
        outsideTemp: deviceManager.getOutsideTemperature()
    })
});

// Postavi novu vanjsku temperaturu
app.post('/api/outside-temp', (req, res) => {
    const { temperature } = req.body;
    const newTemp = deviceManager.setOutsideTemperature(temperature);
    if (newTemp === null) {
        return res.status(400).json({ error: 'Neispravna temperatura.' });
    } else
        res.json(newTemp);
});

// --- RUTE ZA UPRAVLJANJE UREĐAJIMA ---

// Dohvati sve uređaje
app.get('/api/devices', (req, res) => {
    const devices = deviceManager.getAllDevices();
    res.json(devices);
});

// Dohvati uređaj po ID-u
app.get('/api/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    const device = deviceManager.getDeviceById(deviceId);
    if (device) {
        res.json(device);
    } else {
        res.status(404).json({ error: `Uređaj s ID-om ${deviceId} nije pronađen.` });
    }
});

// Izvrši akciju na uređaju
app.post('/api/devices/:id/actions', (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: 'Nedostaje tijelo zahtjeva.' });
    }
    const deviceId = req.params.id;
    const { actionType, payload } = req.body;

    if (!actionType) {
        return res.status(400).json({ message: 'Akcija nije specificirana.' });
    }

    const updatedDevice = deviceManager.executeDeviceAction(deviceId, actionType, payload);

    if (updatedDevice) {
        res.json(updatedDevice);
    } else {
        // Funkcija executeDeviceAction vraća null ako akcija nije uspjela ili nije podržana
        const deviceExists = deviceManager.getDeviceById(deviceId);
        if (!deviceExists) {
            res.status(404).json({ message: `Uređaj s ID-om ${deviceId} nije pronađen.` });
        } else {
            res.status(400).json({ message: `Akcija '${actionType}' nije uspjela ili nije podržana za uređaj ${deviceId}.` });
        }
    }
});

// Dohvati sve sobe s uređajima
app.get('/api/getRoomsWithDevices', (req, res) => {
    const rooms = deviceManager.getRoomsWithDevices();
    res.json(rooms);
});

// Dohvati sve uređaje u sobi po ID-u
app.get('/api/getAllDevicesByRoom/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const devices = deviceManager.getAllDevicesByRoom(roomId);
    if (devices) {
        res.json(devices);
    } else {
        res.status(404).json({ error: `Nema uređaja u sobi s ID-om ${roomId}.` });
    }
});

// Dodavanje nove sobe
app.post('/api/addRoom', (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Naziv sobe je obavezan.' });
    }

    const newRoom = deviceManager.addRoom(name);

    if (newRoom) {
        res.status(201).json(newRoom);
    } else {
        res.status(409).json({ message: `Soba s imenom '${name}' već postoji.` });
    }
});

// Dohvati sve tipove uređaja
app.get('/api/getAllDeviceTypes', (req, res) => {
    const deviceTypes = deviceManager.fetchDeviceTypes();
    res.json(deviceTypes);
});

// Dodavanje novog uređaja
app.post('/api/addDevice', (req, res) => {
    const { name, type, roomId } = req.body;

    if (!name || !type || !roomId) {
        return res.status(400).json({ message: 'Potrebno je unijeti ime, tip i sobu za novi uređaj.' });
    }

    const updatedDevices = deviceManager.addDevice({ name, type, roomId });

    if (updatedDevices.error) {
        return res.status(400).json({ message: updatedDevices.error });
    }

    res.status(201).json(updatedDevices.device);
});

// Uključivanje/isključivanje sobe
app.post('/api/roomToggle', (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
        return res.status(400).json({ message: 'ID sobe je obavezan.' });
    }
    const updatedDevices = deviceManager.roomToggle(roomId);
    if (updatedDevices && updatedDevices.error) {
        return res.status(400).json({ message: updatedDevices.error });
    }
    if (updatedDevices === null) {
        return res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
    }
    res.status(200).json({ success: true, room: updatedDevices.room });
});

// Uređivanje sobe
app.put('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { newRoomName } = req.body;

    if (!newRoomName || !newRoomName.trim()) {
        return res.status(400).json({ message: 'Novi naziv sobe je obavezan.' });
    }

    const updatedRoom = deviceManager.editRoom({ roomId, newRoomName });

    if (updatedRoom) {
        res.status(200).json(updatedRoom);
    } else {
        res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
    }
});

// Uređivanje uređaja
app.put('/api/devices/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const { newDeviceName, newRoomId } = req.body;

    if (!newDeviceName || !newRoomId) {
        return res.status(400).json({ message: 'Novi naziv uređaja i ID sobe su obavezni.' });
    }

    const updatedDevice = deviceManager.editDevice({ deviceId, newDeviceName, newRoomId });

    if (updatedDevice) {
        res.status(200).json(updatedDevice);
    } else {
        res.status(404).json({ message: `Uređaj s ID-om ${deviceId} nije pronađen.` });
    }
});

// Brisanje uređaja
app.delete('/api/devices/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const removedDevice = deviceManager.removeDevice(deviceId);

    if (removedDevice) {
        res.status(200).json({ message: `Uređaj '${removedDevice.name}' je uspješno obrisan.` });
    } else {
        res.status(404).json({ message: `Uređaj s ID-om ${deviceId} nije pronađen.` });
    }
});

// Brisanje sobe
app.delete('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const removedRoom = deviceManager.removeRoom(roomId);

    if (removedRoom) {
        res.status(200).json({ message: `Soba '${removedRoom.name}' i svi njezini uređaji su obrisani.` });
    } else {
        res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
    }
});

// Dobivanje trenutnog intervala simulacije
app.get('/api/simulation/interval', (req, res) => {
    res.json({ interval: deviceManager.getSimulationInterval() });
});

// Postavi novi interval simulacije
app.post('/api/simulation/interval', (req, res) => {
    const { newIntervalMs } = req.body;
    if (typeof newIntervalMs !== 'number' || newIntervalMs < 500) {
        return res.status(400).json({ message: 'Interval mora biti broj veći od 500ms.' });
    }
    deviceManager.startSimulation(newIntervalMs);
    res.json({ success: true, newInterval: newIntervalMs });
});

// Dohvati trenutno doba dana
app.get('/api/context/time-of-day', (req, res) => {
    res.json(deviceManager.getCurrentTimeOfDay());
});

// Postavi novo doba dana
app.post('/api/context/time-of-day', (req, res) => {
    const { timeOfDay } = req.body;
    if (!timeOfDay) {
        return res.status(400).json({ message: 'Doba dana je obavezno.' });
    }
    const newTimeOfDay = deviceManager.setCurrentTimeOfDay(timeOfDay);
    res.json({ success: true, timeOfDay: newTimeOfDay });
});

// Dohvati prisutnost korisnika
app.get('/api/context/user-presence', (req, res) => {
    res.json(deviceManager.getUserPresence());
});

// Postavi prisutnost korisnika
app.post('/api/context/user-presence', (req, res) => {
    const { isPresent } = req.body;
    if (typeof isPresent !== 'boolean') {
        return res.status(400).json({ message: 'Vrijednost prisutnosti mora biti boolean.' });
    }
    const newUserPresence = deviceManager.setUserPresence(isPresent);
    res.json({ success: true, userPresence: newUserPresence });
});

// Dohvati sva doba dana
app.get('/api/context/times-of-day', (req, res) => {
    const timesOfDay = deviceManager.fetchTimesOfDay();
    res.json(timesOfDay);
});

// Dohvati sve rutine
app.get('/api/routines/getAll', (req, res) => {
    const routines = deviceManager.getAllRoutines();
    res.json(routines);
});

// Dohvati rutinu po ID-u
app.get('/api/routines/:routineId', (req, res) => {
    const routineId = req.params.routineId;
    const routine = deviceManager.getRoutineById(routineId);
    if (routine) {
        res.json(routine);
    } else {
        res.status(404).json({ error: `Rutina s ID-om ${routineId} nije pronađena.` });
    }
});

// Dodaj novu rutinu
app.post('/api/routines/add', (req, res) => {
    const { name, description, icon, triggers, conditions, actions } = req.body;

    if (!name || !triggers || !actions) {
        return res.status(400).json({ message: 'Naziv, okidači i akcije su obavezni.' });
    }

    try {
        const newRoutine = deviceManager.addRoutine({ name, description, icon, triggers, conditions, actions });
        res.status(201).json(newRoutine);
    } catch (error) {
        console.error('Greška pri dodavanju rutine:', error);
        res.status(500).json({ message: 'Greška pri dodavanju rutine.', details: error.message });
    }
});

// Ukloni rutinu
app.delete('/api/routines/:routineId', (req, res) => {
    const routineId = req.params.routineId;
    const removedRoutine = deviceManager.removeRoutine(routineId);
    if (removedRoutine) {
        res.status(200).json(removedRoutine);
    } else {
        res.status(404).json({ message: `Rutina s ID-om ${routineId} nije pronađena.` });
    }
});

// Dohvati formu za rutinu
app.get('/api/routines-form-template', (req, res) => {
    const formTemplate = deviceManager.getRoutineFormTemplate();
    res.json(formTemplate);
});

// Paljenje/gašenje rutine
app.post('/api/routines/:routineId/toggle', (req, res) => {
    const { routineId } = req.params;
    const { isEnabled } = req.body;

    if (typeof isEnabled !== 'boolean') {
        return res.status(400).json({ message: 'Vrijednost "isEnabled" je obavezna i mora biti boolean.' });
    }

    const newRoutine = deviceManager.toggleRoutine(routineId, isEnabled);
    if (newRoutine) {
        res.status(200).json(newRoutine);
    } else {
        res.status(404).json({ message: `Rutina s ID-om ${routineId} nije pronađena.` });
    }
});

// Dodaj quick action
app.post('/api/quick-actions/add', (req, res) => {
    const { name, description, icon, actions } = req.body;

    if (!name || !actions) {
        return res.status(400).json({ message: 'Naziv i akcije su obavezni.' });
    }

    try {
        const newQuickAction = deviceManager.addQuickAction({ name, description, icon, actions });
        res.status(201).json(newQuickAction);
    } catch (error) {
        console.error('Greška pri dodavanju quick action:', error);
        res.status(500).json({ message: 'Greška pri dodavanju quick action.', details: error.message });
    }
});

// Ukloni quick action
app.delete('/api/quick-actions/:quickActionId', (req, res) => {
    const quickActionId = req.params.quickActionId;
    const removedQuickAction = deviceManager.removeQuickAction(quickActionId);
    if (removedQuickAction) {
        res.status(200).json(removedQuickAction);
    } else {
        res.status(404).json({ message: `Quick action s ID-om ${quickActionId} nije pronađena.` });
    }
});

// Dohvati sve quick actions
app.get('/api/quick-actions', (req, res) => {
    const quickActions = deviceManager.getQuickActions();
    res.json(quickActions);
});

// Izvrši quick action
app.post('/api/quick-actions/:quickActionId/execute', (req, res) => {
    const quickActionId = req.params.quickActionId;
    const updatedDevices = deviceManager.executeQuickAction(quickActionId);
    if (updatedDevices && updatedDevices.error) {
        return res.status(400).json({ message: updatedDevices.error });
    }
    if (updatedDevices === null) {
        return res.status(404).json({ message: `Quick action s ID-om ${quickActionId} nije pronađena.` });
    }
    res.status(200).json({ success: true, updatedDevices });
});

// Uređivanje rutine
app.put('/api/routines/:routineId', (req, res) => {
    const { routineId } = req.params;
    const { name, description, icon, triggers, conditions, actions } = req.body;

    if (!name || !triggers || !actions) {
        return res.status(400).json({ message: 'Naziv, okidači i akcije su obavezni.' });
    }

    try {
        const updatedRoutine = deviceManager.editRoutine({ routineId, name, description, icon, triggers, conditions, actions });
        if (updatedRoutine) {
            res.status(200).json(updatedRoutine);
        } else {
            res.status(404).json({ message: `Rutina s ID-om ${routineId} nije pronađena.` });
        }
    } catch (error) {
        console.error('Greška pri uređivanju rutine:', error);
        res.status(500).json({ message: 'Greška pri uređivanju rutine.', details: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server pokrenut na http://localhost:${PORT}`);
});