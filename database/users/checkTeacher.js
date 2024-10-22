const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const db = new sqlite3.Database('./database/bathroom_manager.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');

    db.all('SELECT * FROM users_input', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err.message);
            db.close();
            process.exit(1);
        }

        console.log('Users table contents:');

        const processRow = (index) => {
            if (index >= rows.length) {
                rl.close();
                db.close((err) => {
                    if (err) console.error('Error closing database:', err.message);
                    else console.log('Closed the database connection.');
                });
                return;
            }

            const currentRow = rows[index];

            console.log(`teacherStudent value for ${currentRow.username}: ${currentRow.teacherStudent}`);

            if (currentRow.teacherStudent === 1) {
                console.log(`${currentRow.username}: ${currentRow.name}`);

                rl.question('Is this user a teacher? (1 for yes, 0 for no): ', (answer) => {
                    if (answer === '1' || answer === '0') {
                        if (answer === '1') {
                            db.run(
                                `INSERT INTO teachers (username, password, name, email, classroom, ip_address, user_number) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [currentRow.username, currentRow.password, currentRow.name, currentRow.email, currentRow.classroom, currentRow.ip_address, currentRow.user_number],
                                (err) => {
                                    if (err) {
                                        console.error('Error inserting teacher record:', err.message);
                                    } else {
                                        db.run(`DELETE FROM users_input WHERE id = ?`, [currentRow.id], (err) => {
                                            if (err) {
                                                console.error('Error deleting user record:', err.message);
                                            } else {
                                                console.log(`Moved ${currentRow.username} to the teachers table.`);
                                            }
                                            processRow(index + 1);
                                        });
                                    }
                                }
                            );
                        } else {
                            processRow(index + 1);
                        }
                    } else {
                        console.log('Invalid input. Please enter 1 for yes or 0 for no.');
                        processRow(index);
                    }
                });
            } else {
                db.run(
                    `INSERT INTO students (username, password, name, email, classroom, ip_address, user_number) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [currentRow.username, currentRow.password, currentRow.name, currentRow.email, currentRow.classroom, currentRow.ip_address, currentRow.user_number],
                    (err) => {
                        if (err) {
                            console.error('Error inserting teacher record:', err.message);
                        } else {
                            db.run(`DELETE FROM users_input WHERE id = ?`, [currentRow.id], (err) => {
                                if (err) {
                                    console.error('Error deleting user record:', err.message);
                                } else {
                                    console.log(`Moved ${currentRow.username} to the teachers table.`);
                                }
                                processRow(index + 1);
                            });
                        }
                    }
                );
            }
        };

        processRow(0);
    });
});