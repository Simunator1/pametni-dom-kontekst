require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001; // Razlikuj od frontend porta

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

app.listen(PORT, () => {
    console.log(`Backend server pokrenut na http://localhost:${PORT}`);
});