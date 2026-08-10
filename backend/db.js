const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ---- Seed default users on first run ----
function seedUsers() {
  if (fs.existsSync(USERS_FILE)) return;

  const defaultUsers = [
    {
      id: "u-teacher-1",
      username: "teacher1",
      password: bcrypt.hashSync("teacher123", 10),
      role: "teacher",
      name: "Mrs. Anjali Sharma",
    },
    {
      id: "u-director-1",
      username: "director1",
      password: bcrypt.hashSync("director123", 10),
      role: "director",
      name: "Mr. Rakesh Verma",
    },
    {
      id: "u-store-1",
      username: "store1",
      password: bcrypt.hashSync("store123", 10),
      role: "store_manager",
      name: "Mr. Imran Khan",
    },
  ];

  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

function seedRequests() {
  if (fs.existsSync(REQUESTS_FILE)) return;
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
}

seedUsers();
seedRequests();

// ---- Basic read/write helpers (synchronous, fine for small demo apps) ----
function readJSON(file) {
  const raw = fs.readFileSync(file, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  getUsers: () => readJSON(USERS_FILE),
  getRequests: () => readJSON(REQUESTS_FILE),
  saveRequests: (data) => writeJSON(REQUESTS_FILE, data),
};
