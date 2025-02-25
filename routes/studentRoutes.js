const express = require('express');
const router = express.Router();
const path = require('path');
const middleware = require("../security/middleware");
const session = require('express-session');
const studentPass = require('./pass_manger/student_pass.js');

router.use("/student/", studentPass);

// Route for the student dashboard
router.get('/student-navbar', middleware.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../private/student/student-navbar.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status).end(); // Handle error appropriately
        }
    });
});

// Route for the teacher dashboard
// Add your teacher dashboard route here

module.exports = router;
