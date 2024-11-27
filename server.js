const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consumerId TEXT,
        name TEXT,
        phone TEXT,
        address TEXT,
        cylinderType TEXT,
        quantity INTEGER
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Bookings table is ready.');
      }
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to handle booking
app.post('/book', (req, res) => {
  const { consumerId, name, phone, address, cylinderType, quantity } = req.body;

  if (!consumerId || !name || !phone || !address || !cylinderType || !quantity) {
    console.log('Incomplete booking details submitted.');
    res.status(400).send('All fields are required.');
    return;
  }

  const query = `
    INSERT INTO bookings (consumerId, name, phone, address, cylinderType, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [consumerId, name, phone, address, cylinderType, quantity];

  db.run(query, params, function (err) {
    if (err) {
      console.error('Error inserting booking:', err.message);
      res.status(500).send('Failed to book LPG.');
    } else {
      console.log('New booking added:');
      console.log({
        id: this.lastID,
        consumerId,
        name,
        phone,
        address,
        cylinderType,
        quantity,
      });
      res.status(200).send('Booking successful! Check the terminal for details.');
    }
  });
});

// View All Bookings (Optional, for debugging)
app.get('/bookings', (req, res) => {
  db.all('SELECT * FROM bookings', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving bookings:', err.message);
      res.status(500).send('Failed to retrieve bookings.');
    } else {
      console.log('Bookings in database:');
      console.log(rows);
      res.status(200).json(rows);
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
