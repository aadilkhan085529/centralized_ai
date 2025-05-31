from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Setup Gemini API
GEMINI_API_KEY = "AIzaSyBcje5c5qk-x__6V-AfOxKMkExw-frU0H0"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-8b')

# Database setup
def init_db():
    try:
        with sqlite3.connect('users.db') as conn:
            cursor = conn.cursor()
            # Only create table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash BLOB NOT NULL
            )
            ''')
            conn.commit()
            print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Initialize database on startup
init_db()

# Configure SQLite to return Row objects for better column access
def get_db():
    db = sqlite3.connect('users.db')
    db.row_factory = sqlite3.Row
    return db

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "All fields are required."}), 400

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            # Check if email exists
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                return jsonify({"error": "Email already exists."}), 409

            # Hash password and save user
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                (name, email, password_hash)
            )
            conn.commit()
            
            user_id = cursor.lastrowid
            return jsonify({
                "success": True,
                "user": {"id": user_id, "name": name, "email": email}
            })
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database error."}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "All fields are required."}), 400

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"error": "Invalid credentials."}), 401

            stored_hash = user['password_hash']
            if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                return jsonify({"error": "Invalid credentials."}), 401

            return jsonify({
                "success": True,
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email']
                }
            })
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database error."}), 500

@app.route('/api/gemini', methods=['POST'])
def gemini_chat():
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "Prompt required"}), 400
        
    try:
        print(f"Processing prompt: {prompt}")
        response = model.generate_content(prompt)
        
        if not response:
            print("No response received from Gemini")
            return jsonify({"error": "No response from API"}), 500
            
        response_text = response.text
        print(f"Gemini response: {response_text}")
        return jsonify({"text": response_text})
    except Exception as e:
        print(f"Gemini API error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=4000, debug=True)
