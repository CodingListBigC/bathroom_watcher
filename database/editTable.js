const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './pass_manager.db');
console.log(dbPath);
const listTables = [
    'users_input',
    'students',
    'teachers',
    'classroom_table',
    'bathroomUse',
    'pass_history'
];
function readTable(tableString) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
    });

    let query;
    query = `SELECT * FROM ` + tableString;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return;
        }
        console.log(`Table ${tableString} data:`);
        rows.forEach(row => console.log(row));
    });

    db.close();
}

function showHelp() {
    console.log(`
Options:
    --table=<num>       \tSpecify the table number to read
    --moreDetails       \tShow more details about the table
    --help              \tShow this help message
    --delete=1          \tDelete the table
Look Up Options:
    --lookUp            \tLook up a value in the table 
                        \t(requires --lookUpLocation and --value)
        --lookUpLocation=\tSpecify the location to look up
        --value=        \tSpecify the value to look up
How To Use:
        node editTable.js --table=0
        node editTable.js --moreDetails
        node editTable.js --delete=1 --table=0
        node editTable.js --lookUp --lookUpLocation=classroom --value=1 --table=0
`);
}


function viewAndDelteTable() { 
    const deleteTrue = process.argv.find(arg => arg.startsWith('--delete='))?.split('=')[1];
    table_string = listTables[tableNumber];

    if (deleteTrue == '1') {
        deleteTable(table_string);
    }else if(tableNumber != null){
        readTable(table_string);
    }
    else {
        showHelp();
    }
}
function deleteTable(tableString) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
    });

    let query;
    query = `DELETE FROM ` + tableString;

    db.run(query, (err) => {
        if (err) {
            console.error('Error deleting data:', err.message);
            return;
        }
        console.log(`Table ${tableString} deleted`);
    });

    db.close();
}

function searchTable(tableString, lookup, value) {
    console.log("Searching for value:", value);

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
    });

    const query = `SELECT * FROM ${tableString} WHERE ${lookup} = ?`;

    db.all(query, [value], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return;
        }

        console.log(`Table ${tableString} data:`);
        if (rows.length > 0) {
            rows.forEach(row => console.log(row));
        } else {
            console.log("No results found.");
        }

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });
    });
}

// Handle command-line arguments
const command = process.argv[2];
const tableArg = process.argv.find(arg => arg.startsWith('--table='));
const tableNumber = tableArg ? parseInt(tableArg.split('=')[1], 10) : null;
let table_string;
if (command === '--help') {
    showHelp();
    return;
}else if (command === '--moreDetails') {
    console.log('Tables:');
    for (let i = 0; i < listTables.length; i++) {
        const tableName = listTables[i];
        console.log(`   Table ${i}: ${tableName}`);
    }
}else if (command == '--lookUp') {
    const cataogory = process.argv.find(arg => arg.startsWith('--lookUpLocation=')).split('=')[1];
    const lookupValue = process.argv.find(arg => arg.startsWith('--value=')).split('=')[1];
    
    table_string = listTables[tableNumber];
    searchTable(table_string,cataogory, lookupValue);
}
else {
    viewAndDelteTable();
}

