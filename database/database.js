const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/bathroom_manager.db', (err) => {
    if (err) {
        console.error('Database opening error:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Table creation logic
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users_input (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT,
                    name TEXT NULL,
                    email TEXT NULL,
                    classroom TEXT NULL,
                    sex_type INTEGER DEFAULT 0,
                    teacherStudent INTEGER DEFAULT 0,
                    ip_address TEXT,
                    user_number INTEGER,
                    teacher_real INTEGER DEFAULT 0
                );
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT,
                    name TEXT NULL,
                    email TEXT NULL,
                    classroom TEXT NULL,
                    sex_type INTEGER DEFAULT 0,
                    ip_address TEXT,
                    user_number INTEGER,
                    bathroom_used_today INTEGER DEFAULT 0,
                    bathroom_used_schoolYear INTEGER DEFAULT 0
                );
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS teachers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT,
                    name TEXT NULL,
                    email TEXT NULL,
                    classroom TEXT NULL,
                    ip_address TEXT,
                    user_number INTEGER
                );
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS bathroom (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE,
                    people_inBathroom_men TEXT,
                    people_inBathroom_women TEXT,
                    people_goingToBathroom_men TEXT,
                    people_goingToBathroom_women TEXT,
                    people_leavingBathroom_men TEXT,
                    people_leavingBathroom_women TEXT
                );
            `, (err) => {
                if (err) {
                    console.error('Error creating tables:', err.message);
                } else {
                    console.log('All tables are created or verified to exist.');
                }
            });
        });
    }
});

module.exports = db;
