const express = require('express');
const router = express.Router();
const path = require('path');
const middleware = require("../security/middleware")
const session = require('express-session');


// Route for the student dashboard
router.get('/student-navbar',middleware.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../private/student/student-navbar.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status).end(); // Handle error appropriately
        }
    });
});
router.get('/bathroom_list', middleware.isLoggedIn, (req, res) => {
    if (req.session.user && req.session.user.pass_input) { // Check if user exists
        if (req.session.user.pass_input == 0){
            res.render("private/student/askToGo",{ user: req.session.user })
        }else if (req.session.user.pass_input == 1){
            res.render("private/student/passWait",{ user: req.session.user })
        }
        
    } else {
        res.status(403).send('Forbidden'); // Send 403 Forbidden if user is not a teacher
    }
});
// Route for the teacher dashboard

module.exports = router;
