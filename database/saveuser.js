const fs = require('fs');
const { promises: fsPromises } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'pass_manager.db');
const backupNumber = process.argv.find(arg => arg.startsWith('--backup='))?.split('=')[1];
const backupPath = path.resolve(__dirname, `backup/backup_pass_manger_${backupNumber}.db`);
async function backupAll() {
    try {
        // Ensure the backup directory exists
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Copy the database file
        await fsPromises.copyFile(dbPath, backupPath);
        console.log('Database backed up successfully.');
    } catch (err) {
        console.error('Error backing up database:', err.message);
    }
}

function listUsers() {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
    });

    db.serialize(() => {
        const query = `
            SELECT username, name, email, classroom, sex_type, ip_address, user_number, bathroom_used_today, bathroom_used_schoolYear 
            FROM students 
            UNION 
            SELECT username, name, email, classroom, NULL AS sex_type, ip_address, user_number, NULL AS bathroom_used_today, NULL AS bathroom_used_schoolYear 
            FROM teachers
        `;

        db.all(query, (err, rows) => {
            if (err) {
                console.error('Error fetching users:', err.message);
                return;
            }
            console.log("Users:");
            rows.forEach(row => console.log(row));
        });
    });

    db.close();
}

async function addAll() {
    try {
        const db = new sqlite3.Database(dbPath);
        const backupDb = new sqlite3.Database(backupPath);

        // Add students
        await new Promise((resolve, reject) => {
            backupDb.serialize(() => {
                backupDb.each("SELECT * FROM students", (err, row) => {
                    if (err) return reject(err);

                    db.run(`
                        INSERT INTO students (username, password, name, email, classroom, sex_type, ip_address, user_number, bathroom_used_today, bathroom_used_schoolYear)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [row.username, row.password, row.name, row.email, row.classroom, row.sex_type, row.ip_address, row.user_number, row.bathroom_used_today, row.bathroom_used_schoolYear], (err) => {
                        if (err) console.error('Error inserting student:', err.message);
                    });
                }, resolve);
            });
        });

        // Add teachers
        await new Promise((resolve, reject) => {
            backupDb.serialize(() => {
                backupDb.each("SELECT * FROM teachers", (err, row) => {
                    if (err) return reject(err);

                    db.run(`
                        INSERT INTO teachers (username, password, name, email, classroom, ip_address, user_number)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [row.username, row.password, row.name, row.email, row.classroom, row.ip_address, row.user_number], (err) => {
                        if (err) console.error('Error inserting teacher:', err.message);
                    });
                }, resolve);
            });
        });

        backupDb.close();
        db.close();
        console.log('Users added from backup successfully.');
    } catch (err) {
        console.error('Error adding users from backup:', err.message);
    }
}

async function addOneUser() {
    try {
        const db = new sqlite3.Database(dbPath);
        const backupDb = new sqlite3.Database(backupPath);

        // Add one student
        await new Promise((resolve, reject) => {
            backupDb.serialize(() => {
                backupDb.get("SELECT * FROM students LIMIT 1", (err, row) => {
                    if (err) return reject(err);

                    db.run(`
                        INSERT INTO students (username, password, name, email, classroom, sex_type, ip_address, user_number, bathroom_used_today, bathroom_used_schoolYear)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [row.username, row.password, row.name, row.email, row.classroom, row.sex_type, row.ip_address, row.user_number, row.bathroom_used_today, row.bathroom_used_schoolYear], (err) => {
                        if (err) console.error('Error inserting student:', err.message);
                    });
                }, resolve);
            });
        });

        backupDb.close();
        db.close();
        console.log('One user added from backup successfully.');
    } catch (err) {
        console.error('Error adding user from backup:', err.message);
    }
}

async function deleteUser(username) {
    try {
        const db = new sqlite3.Database(dbPath);

        db.run(`DELETE FROM students WHERE username = ?`, [username], function (err) {
            if (err) {
                console.error('Error deleting user:', err.message);
            } else {
                console.log(`User ${username} deleted successfully.`);
            }
        });

        db.close();
    } catch (err) {
        console.error('Error deleting user:', err.message);
    }
}

function showHelp() {
    console.log(`
Usage: node saveuser.js [command]

Commands:
    --backupAll           Back up the database
    --addAll              Add users from backup to the database
    --addOneUser          Add one user from backup to the database
    --deleteUser          Delete a user from the database
    --listUsers           List all users in the database
    --help                Show this help message
    --backupnumber=<num>  Specify the backup number
`);
}

// Handle command-line arguments
const command = process.argv[2];
const username = process.argv.find(arg => arg.startsWith('--username='))?.split('=')[1];
const password = process.argv.find(arg => arg.startsWith('--password='))?.split('=')[1];
if (backupNumber === undefined) {
    console.error('\nPlease provide a backup number to delete using --backup=<num>\n\n');
    showHelp();
}

else {

switch (command) {
    case '--backupAll':
        backupAll();
        break;
    case '--addAll':
        addAll();
        break;
    case '--addOneUser':
        addOneUser();
        break;
    case '--deleteUser':
        if (username) {
            deleteUser(username);
        } else {
            console.error('Please provide a username to delete using --username=<username>');
        }
        break;
    case '--listUsers':
        listUsers();
        break;
    case '--help':
    default:
        showHelp();
        break;
}
}
