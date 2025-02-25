const express = require("express");
const router = express.Router();
const path = require("path");
const middleware = require("../../security/middleware");
const session = require("express-session");
const db = require("../../database/database");
const { render } = require("ejs");
router.get("/pass_List", middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        // Check if user exists
        if (req.session.user.pass.active) {
            console.log("User pass:");
            console.log(req.session.user.pass);
            if (req.session.user.pass.restroom) {
                res.render("private/student/watch_pass", {
                    user: req.session.user
                });
            } else {
                res.render("private/student/watch_pass", {
                    user: req.session.user
                });
            }
        } else {
            res.render("private/student/pass_list", { user: req.session.user });
        }
    } else {
        res.status(403).send("Forbidden"); // Send 403 Forbidden if user is not a teacher
    }
});
router.get("/pass_restroom", middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        // Check if user exists
        res.render("private/student/pass_bathroom", { user: req.session.user });
    } else {
        res.status(403).send("Forbidden"); // Send 403 Forbidden if user is not a teacher
    }
});
router.get("/pass_regular", middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        // Check if user exists
        res.render("private/student/pass_regular", { user: req.session.user });
    } else {
        res.status(403).send("Forbidden"); // Send 403 Forbidden if user is not a teacher
    }
});

router.post("/bathroomPass", middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        const startTime = new Date().toISOString();
        db.run(
            `INSERT INTO bathroomUse (name,username, classroom, pass_started) VALUES (?, ?, ?, ?)`,
            [req.session.user.name, req.session.user.username, req.session.user.classroom, startTime],
            function (err) {
                if (err) {
                    console.error("Registration error:", err.message);
                    res.send(
                        "Error: Username already exists or registration failed."
                    );
                } else {
                    db.get(
                        "SELECT last_insert_rowid() AS id",
                        [],
                        (err2, row) => {
                            if (err2) {
                                console.error(
                                    "Error retrieving inserted ID:",
                                    err2.message
                                );
                            } else {
                                const insertedId = row.id;
                                req.session.user.pass = {
                                    active: true,
                                    restroom: true,
                                    passId: insertedId,
                                    start_time: startTime
                                };
                                res.render("private/dashboard", {
                                    user: req.session.user,
                                });
                            }
                        }
                    );
                }
            }
        );
    }
});

router.post("/regularPass", middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        const startTime = new Date().toISOString();
        db.run(
            `INSERT INTO regularPass (name, classroom, start_time, sex_type) VALUES (?, ?, ?, ?)`,
            [req.session.user.name, req.session.user.classroom, startTime, req.session.user.sex_type],
            function (err) {
                if (err) {
                    console.error("Registration error:", err.message);
                    res.send(
                        "Error: Username already exists or registration failed."
                    );
                } else {
                    db.get(
                        "SELECT last_insert_rowid() AS id",
                        [],
                        (err2, row) => {
                            if (err2) {
                                console.error(
                                    "Error retrieving inserted ID:",
                                    err2.message
                                );
                            } else {
                                const insertedId = row.id;
                                req.session.user.pass = {
                                    active: true,
                                    restroom: false,
                                    passId: insertedId,
                                    start_time: startTime
                                };
                                res.render("private/dashboard", {
                                    user: req.session.user,
                                });
                            }
                        }
                    );
                }
            }
        );
    }
});
router.get("/student_remove_pass", middleware.isLoggedIn, (req, res) => {
    if (req.session.user) {
        if (req.session.user.pass) {
            const endTime = new Date().toISOString();
            db.run(
                'INSERT INTO pass_history (username, pass_type, time_requested, time_deleted) VALUES (?, ?, ?, ?)',
                [req.session.user.username, req.session.user.pass.restroom ? 'bathroom' : 'regular', req.session.user.pass.start_time, endTime],
                function (err) {
                    if (err) {
                        console.error("Error inserting pass history:", err.message);
                        res.send("Error inserting pass history.");
                    } else {
                        if (req.session.user.pass.restroom) {
                            db.run(
                                `DELETE FROM bathroomUse WHERE username = ?`,
                                [req.session.user.username],
                                function (err) {
                                    if (err) {
                                        console.error("Error deleting pass:", err.message);
                                        res.send("Error deleting pass.");
                                    } else {
                                        req.session.user.pass.active = false;
                                        req.session.user.pass.restroom = false;
                                        req.session.user.pass.passId = null;
                                        res.render("private/dashboard", {
                                            user: req.session.user,
                                        });
                                    }
                                }
                            );
                        } else {
                            db.run(
                                `DELETE FROM regularPass WHERE id = ?`,
                                [req.session.user.pass.passId],
                                function (err) {
                                    if (err) {
                                        console.error("Error deleting pass:", err.message);
                                        res.send("Error deleting pass.");
                                    } else {
                                        req.session.user.pass.active = false;
                                        req.session.user.pass.restroom = false;
                                        req.session.user.pass.passId = -1;
                                        res.render("private/dashboard", {
                                            user: req.session.user,
                                        });
                                    }
                                }
                            );
                        }
                    }
                }
            );
        } else {
            res.render("private/dashboard", { user: req.session.user });
        }
    }
});


module.exports = router;