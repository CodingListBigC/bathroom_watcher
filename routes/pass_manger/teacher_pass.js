const express = require("express");
const router = express.Router();
const path = require("path");
const middleware = require("../../security/middleware");
const session = require("express-session");
const db = require("../../database/database");
const { render } = require("ejs");



module.exports = router;
