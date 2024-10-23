const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database/database'); // Adjust path if necessary
const ip = require('ip');
const session = require('express-session');
const middleware = require('./security/middleware');
const getInfo = require("./routes/getInfo");
const Teacher_routes = require("./routes/teacherRoutes")
const Student_routes = require("./routes/studentRoutes")

const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Set the views directory to the main project root
app.set('views', __dirname); // This should be the base folder where both public and private folders are located

// Middleware to parse request body and set up sessions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Session configuration
app.use(session({
    secret: '38848373-91847846847378743991-93844984938984',
    resave: false,
    saveUninitialized: true
}));

// Function to get the local IP address
function getLocalIpAddress() {
    return ip.address();
}

// Use the getInfo routes
app.use('/', getInfo); // Mount the user routes
// Use the Teachers routes
app.use('/', Teacher_routes)
// Use the Student routes
app.use('/', Student_routes)

// Registration route
app.get('/register', (req, res) => {
    res.render('register'); // Render register.ejs
});

// Registration POST route
app.post('/register', (req, res) => {
    const { username, password, name, email, classroom, teacherStudent, sex_type } = req.body;

    const localIpAddress = getLocalIpAddress(); // Get the local IP address
    const userNumber = Math.floor(Math.random() * 100000);

    db.run(
        `INSERT INTO users_input (username, password, name, email, classroom, sex_type, teacherStudent, ip_address, user_number) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)`,
        [username, password, name, email, classroom, sex_type ? 1 : 0, teacherStudent ? 1 : 0, localIpAddress, userNumber],
        function (err) {
            if (err) {
                console.error('Registration error:', err.message);
                res.send('Error: Username already exists or registration failed.');
            } else {
                res.redirect('/login')
            }
        }
    );
});

// Login page route
app.get('/login', (req, res) => {
    console.log("Accessing login page");
    res.render('public/login'); // Render login.ejs
});

// Login POST route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    /*
        req.session.user = {
            email = Student Email Address
            teacher = Teel if teacher or not
            pass_input = Do you have a pass actice right now - Teacher are -1
        }
    */
    db.get(
        'SELECT * FROM students WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                console.error('Database error during login:', err.message);
                res.send('Error checking database');
            } else if (row) {
                console.log("User logged in:", username);
                req.session.user = {
                    username: row.username,
                    name: row.name,
                    email: row.email, 
                    classroom: row.classroom,
                    teacher: false,
                    pass_input: 0 
                };
                res.redirect("/dashboard")
            } else {
                db.get(
                    'SELECT * FROM teachers WHERE username = ? AND password = ?',
                    [username, password],
                    (err, row) => {
                        if (err) {
                            console.error('Database error during login:', err.message);
                            res.send('Error checking database');
                        } else if (row) {
                            console.log("User logged in:", username);
                            req.session.user = {
                                username: row.username,
                                name: row.name,
                                email: row.email,
                                classroom: row.classroom,
                                teacher: true,
                                pass_input: -1
                            };
                            console.log(req.session.user);
                            res.redirect("/dashboard")
                        } else {
                            res.send('Invalid username or password');
                        }
                    }
                );
            }
        }
    );
});

// Middleware-protected dashboard route
app.get('/dashboard', middleware.isLoggedIn, (req, res) => {
    res.render('private/dashboard', { user: req.session.user }); // Render private/dashboard.ejs
});

// Account route
app.get('/account', middleware.isLoggedIn, (req, res) => {
    res.render('private/account', { user: req.session.user }); // Render private/account.ejs
});

// Home route redirects to login page
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://${getLocalIpAddress()}:${PORT}`);
});
