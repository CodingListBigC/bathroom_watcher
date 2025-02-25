const express = require("express");
const router = express.Router();
const path = require("path"); // Import path module
const middleware = require("../security/middleware");
const Bathroom = require("../database/bathroom");

// Pass watch route
router.get("/pass_watch", middleware.isLoggedIn, (req, res) => {
    if (req.session.user && req.session.user.teacher) {
        // Render teacher's pass watch page
        res.render("private/teacher/pass_watch", {
            user: req.session.user,
        });
    } else {
        res.status(403).send("Forbidden"); // Send 403 Forbidden if user is not a teacher
    }
});

// Classroom management route
router.get("/classroom", middleware.isLoggedIn, async (req, res) => {
    if (req.session.user && req.session.user.teacher) {
        try {
            const classroomData = await Bathroom.getClassroom(
                req.session.user.classroom
            );
            console.log(classroomData);
            res.render("private/teacher/classroom-manage", {
                user: req.session.user,
                classroom: classroomData,
            });
        } catch (error) {
            console.error("Error retrieving classroom data:", error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(403).send("Forbidden"); // Send 403 Forbidden if user is not a teacher
    }
});

// Teacher navbar route
router.get("/teacher-navbar", middleware.isLoggedIn, (req, res) => {
    res.sendFile(
        path.join(__dirname, "../private/teacher/teacher-navbar.html"),
        (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(err.status || 500).end(); // Handle error appropriately
            }
        }
    );
});

module.exports = router;
