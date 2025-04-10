const db = require("./database");

async function getClassroom(classroom) {
    return new Promise((resolve, reject) => {
        console.log(classroom);
        db.get(
            "SELECT * FROM classroom_table WHERE classroom = ?",
            [classroom],
            (err, row) => {
                if (err) {
                    console.error(
                        "Database error during retrieval:",
                        err.message
                    );
                    return reject("Error checking database");
                }

                if (row) {
                    const boyList = row.boyList || "";
                    const girlList = row.girlList || "";

                    const classroomList = {
                        roomNumber: classroom,
                        boyIn: row.boyIn || "",
                        boyList: boyList.replace(/,/g, "<br>"),
                        girlIn: row.girlIn || "",
                        girlList: girlList.replace(/,/g, "<br>"),
                        waitTime: row.waitTime || 0,
                    };
                    resolve(classroomList);
                } else {
                    db.run(
                        `INSERT INTO classroom_table (classroom) VALUES (?)`,
                        [classroom],
                        function (err) {
                            if (err) {
                                console.error(
                                    "Registration error:",
                                    err.message
                                );
                                res.send(
                                    "Error: Username already exists or registration failed."
                                );
                            }
                        }
                    );
                    // Default values if no data is found
                    resolve({
                        boyIn: "",
                        boyList: "",
                        girlIn: "",
                        girlList: "",
                        waitTime: 0,
                    });
                }
            }
        );
    });
}

async function updateClassroom() {
    try {
        // Reset the classroom table
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM classroom_table", (err) => {
                if (err) {
                    console.error("Error resetting classroom table:", err.message);
                    return reject(err);
                }
                resolve();
            });
        });

        // Fetch all active bathroom uses
        const rows = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM bathroomUse WHERE done = 0", (err, rows) => {
                if (err) {
                    console.error("Error fetching bathroom use data:", err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });

        // Insert each active bathroom use into the classroom table
        for (const row of rows) {
            const column = row.sex_type === 0 ? 'boyIn' : 'girlIn';
            const listColumn = row.sex_type === 0 ? 'boyList' : 'girlList';
            await new Promise((resolve, reject) => {
                db.get(
                    `SELECT ${column}, ${listColumn} FROM classroom_table WHERE classroom = ?`,
                    [row.classroom],
                    (err, classroomRow) => {
                        if (err) {
                            console.error("Error retrieving classroom data:", err.message);
                            return reject(err);
                        }
                        const currentList = classroomRow ? classroomRow[listColumn] : "";
                        const updatedList = currentList ? `${currentList}-${row.id}` : row.id;
                        const inList = classroomRow ? classroomRow[column] : "";
                        // Add this line to set boyIn or girlIn to 0 if it is blank
                        const updatedInList = inList === "" ? row.id : inList;
                        db.run(
                            `INSERT OR REPLACE INTO classroom_table (classroom, ${column}, ${listColumn}) VALUES (?, ?, ?)`,
                            [row.classroom, updatedInList, updatedList],
                            (err) => {
                                if (err) {
                                    console.error("Error inserting into classroom table:", err.message);
                                    return reject(err);
                                }
                                resolve();
                            }
                        );
                    }
                );
            });
        }

        console.log("Classroom table updated successfully.");
    } catch (err) {
        console.error("Error updating classroom table:", err.message);
    }
}


// Function to check if a student has an active pass
async function hasActivePass(username) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM bathroomUse WHERE username = ? AND done = 0",
            [username],
            (err, row) => {
                if (err) {
                    console.error("Error checking active pass:", err.message);
                    return reject(err);
                }
                if (row) {
                    const pass = {
                        active: true,
                        restroom: true,
                        passId: row.id,
                        start_time: row.pass_started,
                        end_time: row.pass_ended,
                    };
                    console.log(pass); // Log the pass object
                    resolve(pass);
                } else {
                    console.log(null); // Log null if no active pass found
                    resolve(null);
                }
            }
        );
    });
}

async function getPass(passId) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM bathroomUse WHERE id = ?",
            [passId],
            (err, row) => {
                if (err) {
                    console.error("Error checking active pass:", err.message);
                    return reject(err);
                }
                if (row) {
                    const pass = {
                        active: true,
                        restroom: true,
                        passId: row.id,
                        start_time: row.pass_started,
                        left_time: row.pass_lefted,
                        end_time: row.pass_ended,
                    };
                    console.log(pass); // Log the pass object
                    resolve(pass);
                } else {
                    console.log(null); // Log null if no active pass found
                    resolve(null);
                }
            }
        );
    });
}

// Run updateClassroom every 5 seconds
setInterval(updateClassroom, 5000);

module.exports = {
    getClassroom,
    updateClassroom,
    hasActivePass,
    getPass,
};
