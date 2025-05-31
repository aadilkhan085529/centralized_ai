const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const db = new sqlite3.Database('./users.db');

app.use(cors());
app.use(bodyParser.json());

// Create users table if not exists
// id, name, email, passwordHash

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    passwordHash TEXT
  )`);
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (user) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)', [name, email, passwordHash], function(err) {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ success: true, user: { id: this.lastID, name, email } });
    });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  });
});

const GEMINI_API_KEY = "AIzaSyBcje5c5qk-x__6V-AfOxKMkExw-frU0H0";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
    });
    res.json({ text: response.text });
  } catch (err) {
    res.status(500).json({ error: 'Gemini API error' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
