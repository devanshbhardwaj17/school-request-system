const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUsers } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const users = getUsers();
  const user = users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }

  const payload = { id: user.id, username: user.username, role: user.role, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

  res.json({ token, user: payload });
});

// Handy for the frontend to verify a stored token on refresh
router.get("/me", require("../middleware/auth").authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
