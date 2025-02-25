const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database/database"); // Adjust path if necessary
const ip = require("ip");
const session = require("express-session");
const middleware = require("./security/middleware");
const getInfo = require("./routes/getInfo");
const Teacher_routes = require("./routes/teacherRoutes");
const Student_routes = require("./routes/studentRoutes");
const Student_pass_routes = require("./routes/pass_manger/student_pass");
const Teacher_pass_routes = require("./routes/pass_manger/teacher_pass");
const Bathrom = require("./database/bathroom");
const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set("view engine", "ejs");
// Set the views directory to the main project root
app.set("views", __dirname); // This should be the base folder where both public and private folders are located

// Middleware to parse request body and set up sessions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files

// Session configuration
app.use(
    session({
        secret: "38848373-91847846847378743991-93844984938984",
        resave: false,
        saveUninitialized: true,
    })
);

// Function to get the local IP address
function getLocalIpAddress() {
    return ip.address();
}

// Use the getInfo routes
app.use("/", getInfo); // Mount the user routes
// Use the Teachers routes
app.use("/", Teacher_routes);
// Use the Student routes
app.use("/", Student_routes);

// Registration route
app.get("/register", (req, res) => {
    res.render("public/register"); // Render register.ejs
});

// Registration POST route
app.post("/register", (req, res) => {
    const {
        username,
        password,
        name,
        email,
        classroom,
        teacherStudent,
        sex_type,
    } = req.body;

    const localIpAddress = getLocalIpAddress(); // Get the local IP address
    const userNumber = Math.floor(Math.random() * 100000);

    db.run(
        `INSERT INTO users_input (username, password, name, email, classroom, sex_type, teacherStudent, ip_address, user_number) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)`,
        [
            username,
            password,
            name,
            email,
            classroom,
            sex_type ? 1 : 0,
            teacherStudent ? 1 : 0,
            localIpAddress,
            userNumber,
        ],
        function (err) {
            if (err) {
                console.error("Registration error:", err.message);
                res.send(
                    "Error: Username already exists or registration failed."
                );
            } else {
                res.redirect("/login");
            }
        }
    );
});

// Login page route
app.get("/login", (req, res) => {
    res.render("public/login"); // Render login.ejs
});

// Login POST route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM students WHERE username = ? AND password = ?",
        [username, password],
        (err, row) => {
            if (err) {
                console.error("Database error during login:", err.message);
                res.send("Error checking database");
            } else if (row) {
                db.get(
                    "SELECT * FROM regularPass WHERE username = ?",
                    [username],
                    (err, passRow) => {
                        if (err) {
                            console.error("Database error during pass check:", err.message);
                            res.send("Error checking database");
                        } else if (passRow) {
                            req.session.user = {
                                username: row.username,
                                name: row.name,
                                email: row.email,
                                classroom: row.classroom,
                                sex_type: row.sex_type,
                                teacher: false,
                                pass: {
                                    active: true,
                                    restroom: false,
                                    passId: passRow.passId,
                                    start_time: passRow.start_time,
                                    end_time: passRow.end_time,
                                }
                            };
                            
                            req.session.user.pass = Bathrom.hasActivePass(username);
                            console.log(req.session.user.pass);
                            res.redirect("/dashboard");
                        } else {
                            db.get(
                                "SELECT * FROM bathroomUse WHERE username = ?",
                                [username],
                                (err, bathroomRow) => {
                                    if (err) {
                                        console.error("Database error during bathroom pass check:", err.message);
                                        res.send("Error checking database");
                                    } else if (bathroomRow) {
                                        req.session.user = {
                                            username: row.username,
                                            name: row.name,
                                            email: row.email,
                                            classroom: row.classroom,
                                            teacher: false,
                                            pass: {
                                                active: true,
                                                restroom: true,
                                                passId: bathroomRow.passId,
                                                start_time: bathroomRow.start_time,
                                                end_time: bathroomRow.end_time,
                                            }
                                        };
                                        Bathrom.hasActivePass(username).then(activePass => {
                                            req.session.user.pass = activePass;
                                            console.log(activePass);
                                            console.log(req.session.user.pass.active);
                                            res.redirect("/dashboard");
                                        }).catch(err => {
                                            console.error("Error checking active pass:", err.message);
                                            res.send("Error checking active pass");
                                        });
                                    } else {
                                        console.log("No active pass found");
                                        req.session.user = {
                                            username: row.username,
                                            name: row.name,
                                            email: row.email,
                                            classroom: row.classroom,
                                            teacher: false,
                                            pass: {
                                                active: false,
                                                restroom: false,
                                                passId: -1,
                                                start_time: -1,
                                                end_time: -1,
                                            }
                                        };
                                        res.redirect("/dashboard");
                                    }
                                }
                            );
                        }
                    }
                );
            } else {
                db.get(
                    "SELECT * FROM teachers WHERE username = ? AND password = ?",
                    [username, password],
                    (err, teacherRow) => {
                        if (err) {
                            console.error("Database error during teacher login:", err.message);
                            res.send("Error checking database");
                        } else if (teacherRow) {
                            req.session.user = {
                                username: teacherRow.username,
                                name: teacherRow.name,
                                email: teacherRow.email,
                                classroom: teacherRow.classroom,
                                teacher: true,
                                pass: null
                            };
                            res.redirect("/dashboard");
                        } else {
                            res.render("public/login", { error: "Invalid username or password" });
                        }
                    }
                );
            }
        }
    );
});

// Middleware-protected dashboard route
app.get("/dashboard", middleware.isLoggedIn, (req, res) => {
    res.render("private/dashboard", { user: req.session.user }); // Render private/dashboard.ejs
});

// Account route
app.get("/account", middleware.isLoggedIn, (req, res) => {
    res.render("private/account", { user: req.session.user }); // Render private/account.ejs
});

// Home route redirects to login page
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://${getLocalIpAddress()}:${PORT}`);
});
