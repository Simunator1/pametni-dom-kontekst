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
app.get('/api/devices', async (req, res) => {
    try {
        const devices = await deviceManager.getAllDevices();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dohvaćanju uređaja.' });
    }
});

// Dohvati uređaj po ID-u
app.get('/api/devices/:id', async (req, res) => {
    try {
        const deviceId = req.params.id;
        const device = await deviceManager.getDeviceById(deviceId);
        if (device) {
            res.json(device);
        } else {
            res.status(404).json({ error: `Uređaj s ID-om ${deviceId} nije pronađen.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dohvaćanju uređaja.' });
    }
});

// Izvrši akciju na uređaju
app.post('/api/devices/:id/actions', async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: 'Nedostaje tijelo zahtjeva.' });
    }
    const deviceId = req.params.id;
    const { actionType, payload } = req.body;

    if (!actionType) {
        return res.status(400).json({ message: 'Akcija nije specificirana.' });
    }

    try {
        const updatedDevice = await deviceManager.executeDeviceAction(deviceId, actionType, payload);

        if (updatedDevice) {
            res.json(updatedDevice);
        } else {
            res.status(400).json({ message: `Akcija '${actionType}' nije uspjela ili nije podržana za uređaj ${deviceId}.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom izvršavanja akcije.' });
    }
});

// Dohvati sve sobe s uređajima
app.get('/api/getRoomsWithDevices', async (req, res) => {
    try {
        const rooms = await deviceManager.getRoomsWithDevices();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dohvaćanju soba.' });
    }
});

// Dohvati sve uređaje u sobi po ID-u
app.get('/api/getAllDevicesByRoom/:roomId', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const devices = await deviceManager.getAllDevicesByRoom(roomId);
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: `Greška pri dohvaćanju uređaja za sobu.` });
    }
});

// Dodavanje nove sobe
app.post('/api/addRoom', async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Naziv sobe je obavezan.' });
    }

    try {
        const newRoom = await deviceManager.addRoom(name);

        if (newRoom) {
            res.status(201).json(newRoom);
        } else {
            res.status(409).json({ message: `Soba s imenom '${name}' već postoji.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dodavanju sobe.' });
    }
});

// Dohvati sve tipove uređaja
app.get('/api/getAllDeviceTypes', (req, res) => {
    const deviceTypes = deviceManager.fetchDeviceTypes();
    res.json(deviceTypes);
});

// Dodavanje novog uređaja
app.post('/api/addDevice', async (req, res) => {
    const { name, type, room_id } = req.body;

    if (!name || !type || !room_id) {
        return res.status(400).json({ message: 'Potrebno je unijeti ime, tip i sobu za novi uređaj.' });
    }

    try {
        const result = await deviceManager.addDevice({ name, type, roomId: room_id });

        if (result.error) {
            return res.status(400).json({ message: result.error });
        }

        res.status(201).json(result.device);
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom dodavanja uređaja.' });
    }
});

// Uključivanje/isključivanje sobe
app.post('/api/roomToggle', async (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
        return res.status(400).json({ message: 'ID sobe je obavezan.' });
    }

    try {
        const result = await deviceManager.roomToggle(roomId);

        if (result === null) {
            return res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
        }
        res.status(200).json({ success: true, room: result.room });
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom paljenja/gašenja sobe.' });
    }
});

// Uređivanje sobe
app.put('/api/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { newRoomName } = req.body;

    if (!newRoomName || !newRoomName.trim()) {
        return res.status(400).json({ message: 'Novi naziv sobe je obavezan.' });
    }

    try {
        const updatedRoom = await deviceManager.editRoom({ roomId, newRoomName });

        if (updatedRoom) {
            res.status(200).json(updatedRoom);
        } else {
            res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom uređivanja sobe.' });
    }
});

// Uređivanje uređaja
app.put('/api/devices/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const { newDeviceName, newRoomId } = req.body;

    if (!newDeviceName || !newRoomId) {
        return res.status(400).json({ message: 'Novi naziv uređaja i ID sobe su obavezni.' });
    }

    try {
        const updatedDevice = await deviceManager.editDevice({ deviceId, newDeviceName, newRoomId });

        if (updatedDevice) {
            res.status(200).json(updatedDevice);
        } else {
            res.status(404).json({ message: `Uređaj s ID-om ${deviceId} nije pronađen.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom uređivanja uređaja.' });
    }
});

// Brisanje uređaja
app.delete('/api/devices/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    try {
        const result = await deviceManager.removeDevice(deviceId);

        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: `Uređaj s ID-om ${deviceId} nije pronađen.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom brisanja uređaja.' });
    }
});

// Brisanje sobe
app.delete('/api/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const result = await deviceManager.removeRoom(roomId);

        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom brisanja sobe.' });
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
app.post('/api/context/time-of-day', async (req, res) => {
    const { timeOfDay } = req.body;
    if (!timeOfDay) {
        return res.status(400).json({ message: 'Doba dana je obavezno.' });
    }
    try {
        const { newTimeOfDay, updatedDevices } = await deviceManager.setCurrentTimeOfDay(timeOfDay);
        res.json({ success: true, timeOfDay: newTimeOfDay, updatedDevices: updatedDevices });
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom postavljanja doba dana.' });
    }
});

// Dohvati prisutnost korisnika
app.get('/api/context/user-presence', (req, res) => {
    res.json(deviceManager.getUserPresence());
});

// Postavi prisutnost korisnika
app.post('/api/context/user-presence', async (req, res) => {
    const { isPresent } = req.body;
    if (typeof isPresent !== 'boolean') {
        return res.status(400).json({ message: 'Vrijednost prisutnosti mora biti boolean.' });
    }
    try {
        const { newUserPresence, updatedDevices } = await deviceManager.setUserPresence(isPresent);
        res.json({ success: true, userPresence: newUserPresence, updatedDevices: updatedDevices });
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom postavljanja prisutnosti.' });
    }
});

// Dohvati sva doba dana
app.get('/api/context/times-of-day', (req, res) => {
    const timesOfDay = deviceManager.fetchTimesOfDay();
    res.json(timesOfDay);
});

// Dohvati sve rutine
app.get('/api/routines/getAll', async (req, res) => {
    try {
        const routines = await deviceManager.getAllRoutines();
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dohvaćanju rutina.' });
    }
});

// Dohvati rutinu po ID-u
app.get('/api/routines/:routineId', async (req, res) => {
    try {
        const routineId = req.params.routineId;
        const routine = await deviceManager.getRoutineById(routineId);
        if (routine) {
            res.json(routine);
        } else {
            res.status(404).json({ error: `Rutina s ID-om ${routineId} nije pronađena.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dohvaćanju rutine.' });
    }
});

// Dodaj novu rutinu
app.post('/api/routines/add', async (req, res) => {
    const { name, description, icon, triggers, conditions, actions } = req.body;

    if (!name || !triggers || !actions) {
        return res.status(400).json({ message: 'Naziv, okidači i akcije su obavezni.' });
    }

    try {
        const newRoutine = await deviceManager.addRoutine({ name, description, icon, triggers, conditions, actions });
        res.status(201).json(newRoutine);
    } catch (error) {
        console.error('Greška pri dodavanju rutine:', error);
        res.status(500).json({ message: 'Greška pri dodavanju rutine.', details: error.message });
    }
});

// Ukloni rutinu
app.delete('/api/routines/:routineId', async (req, res) => {
    const routineId = req.params.routineId;
    try {
        const removedRoutine = await deviceManager.removeRoutine(routineId);
        if (removedRoutine) {
            res.status(200).json(removedRoutine);
        } else {
            res.status(404).json({ message: `Rutina s ID-om ${routineId} nije pronađena.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom brisanja rutine.' });
    }
});

// Dohvati formu za rutinu
app.get('/api/routines-form-template', (req, res) => {
    const formTemplate = deviceManager.getRoutineFormTemplate();
    res.json(formTemplate);
});

// Paljenje/gašenje rutine
app.post('/api/routines/:routineId/toggle', async (req, res) => {
    const { routineId } = req.params;
    const { isEnabled } = req.body;

    if (typeof isEnabled !== 'boolean') {
        return res.status(400).json({ message: 'Vrijednost "isEnabled" je obavezna i mora biti boolean.' });
    }

    try {
        const newRoutine = await deviceManager.toggleRoutine(routineId, isEnabled);
        if (newRoutine) {
            res.status(200).json(newRoutine);
        } else {
            res.status(404).json({ message: `Rutina s ID-om ${routineId} nije pronađena.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom paljenja/gašenja rutine.' });
    }
});

// Dodaj quick action
app.post('/api/quick-actions/add', async (req, res) => {
    const { name, description, icon, actions } = req.body;

    if (!name || !actions) {
        return res.status(400).json({ message: 'Naziv i akcije su obavezni.' });
    }

    try {
        const newQuickAction = await deviceManager.addQuickAction({ name, description, icon, actions });
        res.status(201).json(newQuickAction);
    } catch (error) {
        console.error('Greška pri dodavanju quick action:', error);
        res.status(500).json({ message: 'Greška pri dodavanju quick action.', details: error.message });
    }
});

// Ukloni quick action
app.delete('/api/quick-actions/:quickActionId', async (req, res) => {
    const quickActionId = req.params.quickActionId;
    try {
        const removedQuickAction = await deviceManager.removeQuickAction(quickActionId);
        if (removedQuickAction) {
            res.status(200).json(removedQuickAction);
        } else {
            res.status(404).json({ message: `Quick action s ID-om ${quickActionId} nije pronađena.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom brisanja brze akcije.' });
    }
});

// Dohvati sve quick actions
app.get('/api/quick-actions', async (req, res) => {
    try {
        const quickActions = await deviceManager.getQuickActions();
        res.json(quickActions);
    } catch (error) {
        res.status(500).json({ error: 'Greška pri dohvaćanju brzih akcija.' });
    }
});

// Izvrši quick action
app.post('/api/quick-actions/:quickActionId/execute', async (req, res) => {
    const { quickActionId } = req.params;
    try {
        const updatedDevices = await deviceManager.executeQuickAction(quickActionId);

        if (updatedDevices === null) {
            return res.status(404).json({ message: `Quick action s ID-om ${quickActionId} nije pronađena.` });
        }

        res.status(200).json({ success: true, updatedDevices });
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom izvršavanja brze akcije.' });
    }
});

// Uređivanje rutine
app.put('/api/routines/:routineId', async (req, res) => {
    const { routineId } = req.params;
    const { name, description, icon, triggers, conditions, actions } = req.body;

    if (!name || !triggers || !actions) {
        return res.status(400).json({ message: 'Naziv, okidači i akcije su obavezni.' });
    }

    try {
        const updatedRoutine = await deviceManager.editRoutine({ routineId, name, description, icon, triggers, conditions, actions });
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

// Dohvati sve preferencije za jednu sobu
app.get('/api/rooms/:roomId/preferences', async (req, res) => {
    const { roomId } = req.params;
    try {
        const roomPreferences = await deviceManager.getPreferencesByRoom(roomId);
        res.json(roomPreferences);
    } catch (error) {
        res.status(500).json({ message: 'Greška pri dohvaćanju preferencija sobe.' });
    }
});

// Dodaj novu preferenciju
app.post('/api/preferences', async (req, res) => {
    try {
        const newPreference = await deviceManager.addPreference(req.body);
        res.status(201).json(newPreference);
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom dodavanja preferencije.' });
    }
});

// Obriši preferenciju
app.delete('/api/preferences/:prefId', async (req, res) => {
    const { prefId } = req.params;
    try {
        const removedPreference = await deviceManager.removePreference(prefId);
        if (removedPreference) {
            res.json({ success: true, removedPreference });
        } else {
            res.status(404).json({ message: 'Preferencija nije pronađena.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom brisanja preferencije.' });
    }
});
// Uredi preferenciju
app.put('/api/preferences/:prefId', async (req, res) => {
    const { prefId } = req.params;
    try {
        const updatedPreference = await deviceManager.editPreference(prefId, req.body);
        if (updatedPreference) {
            res.json(updatedPreference);
        } else {
            res.status(404).json({ message: 'Preferencija nije pronađena ili nije moguće je urediti.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru prilikom uređivanja preferencije.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server pokrenut na http://localhost:${PORT}`);
});