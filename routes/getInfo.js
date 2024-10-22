// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const middleware = require("../security/middleware")
const session = require('express-session');

// Current user route
router.get('/current-user-name', middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        res.send(req.session.user.name); // Send the name as plain text
    } else {
        res.send('Not logged in'); // Send a message if no user is logged in
    }
});
router.get('/current-user-email', middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        res.send(req.session.user.email); // Send the name as plain text
    } else {
        res.send('Not logged in'); // Send a message if no user is logged in
    }
});
router.get('/current-user-classroom', middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        res.send(req.session.user.classroom); // Send the name as plain text
    } else {
        res.send('Not logged in'); // Send a message if no user is logged in
    }
});
router.get('/current-user-teacher', middleware.isLoggedIn, (req, res) => {
    if (req.session.userr) {
        res.send(req.session.user.teacher); // Send the name as plain text
    } else {
        res.send('Not logged in'); // Send a message if no user is logged in
    }
});

router.post('/update-classroom', middleware.isLoggedIn, (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authorized');
    }

    const { newclassroom_input } = req.body;
    const username = req.session.user.username;
    if (req.session.user.teacher == 1) {
        db.run(
            `UPDATE teachers SET classroom = ? WHERE username = ?`,
            [newclassroom_input, username],
            function (err) {
                if (err) {
                    console.error('Error updating classroom:', err.message);
                } else {
                    console.log(newclassroom_input, ", ", username)
                    req.session.user.classroom = newclassroom_input
                    res.redirect('/account');
                }
            }
        );
    } else {
        db.run(
            `UPDATE student SET classroom = ? WHERE username = ?`,
            [newclassroom_input, username],
            function (err) {
                if (err) {
                    console.error('Error updating classroom:', err.message);
                } else {
                    console.log(newclassroom_input, ", ", username)
                    req.session.user.classroom = newclassroom_input
                    res.redirect('/account');
                }
            }
        );
    }
});
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error while logging out.');
        }
        res.redirect('/'); // Redirect to home or login page
    });
});
module.exports = router;
