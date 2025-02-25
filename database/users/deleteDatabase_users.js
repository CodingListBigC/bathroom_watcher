const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pass_manager.db', (err) => {
    if (err) {
        console.error('Database opening error:', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.run('DELETE FROM students', [], function (err) {
    if (err) {
        console.error('Error deleting users:', err.message);
        
    } else {
        console.log(`Deleted ${this.changes} users.`);
        
    }
});