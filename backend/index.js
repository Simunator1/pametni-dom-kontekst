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

app.get('/api/getRoomsWithDevices', (req, res) => {
    const rooms = deviceManager.getRoomsWithDevices();
    res.json(rooms);
});

app.get('/api/getAllDevicesByRoom/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const devices = deviceManager.getAllDevicesByRoom(roomId);
    if (devices) {
        res.json(devices);
    } else {
        res.status(404).json({ error: `Nema uređaja u sobi s ID-om ${roomId}.` });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server pokrenut na http://localhost:${PORT}`);
});