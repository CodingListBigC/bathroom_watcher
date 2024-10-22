// listDatabase.js
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('./database/bathroom_manager.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Query to list all records in the users table
        db.all('SELECT * FROM students', [], (err, rows) => {
            if (err) {
                console.error('Error retrieving data:', err.message);
            } else {
                // Display each row in the users table
                console.log('Users table contents:');
                console.log(rows)
                rows.forEach((row) => {
                    console.log(row);
                });
            }

            // Close the database connection after the query is complete
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Closed the database connection.');
                }
            });
        });
    }
});
