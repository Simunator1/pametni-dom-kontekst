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
        const result = await client.query('SELECT NOW() as now');
        res.json({ success: true, time: result.rows[0].now });
        client.release();
    } catch (err) {
        console.error('Greška pri spajanju na bazu:', err.stack);
        res.status(500).json({ success: false, error: 'Greška pri spajanju na bazu', details: err.message });
    }
});

app.get('/api', (req, res) => {
    res.send('Backend server radi!');
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
    const newTemp = deviceManager.updateOutsideTemperature(temperature);
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

    const result = deviceManager.addDevice({ name, type, roomId });

    if (result.error) {
        return res.status(400).json({ message: result.error });
    }

    res.status(201).json(result.device);
});

app.post('/api/roomToggle', (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
        return res.status(400).json({ message: 'ID sobe je obavezan.' });
    }
    const result = deviceManager.roomToggle(roomId);
    if (result && result.error) {
        return res.status(400).json({ message: result.error });
    }
    if (result === null) {
        return res.status(404).json({ message: `Soba s ID-om ${roomId} nije pronađena.` });
    }
    res.status(200).json({ success: true, room: result.room });
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

app.listen(PORT, () => {
    console.log(`Backend server pokrenut na http://localhost:${PORT}`);
});