const express = require('express');
const router = express.Router();
const path = require('path'); // Import path module
const db = require('../database/database');
const middleware = require("../security/middleware")
const session = require('express-session');

router.get('/bathroom_watch', middleware.isLoggedIn, (req, res) => {
    if (req.session.user && req.session.user.teacher) { // Check if user exists
        res.render("private/teacher/bathroom_watch",{ user: req.session.user })
    } else {
        res.status(403).send('Forbidden'); // Send 403 Forbidden if user is not a teacher
    }
});
router.get('/teacher-',middleware.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../private/teacher/teacher-navbar.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status).end; // Handle error appropriately
        }
    });
});


module.exports = router;
