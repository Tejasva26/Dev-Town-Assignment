// Simple Hash Authentication (Q1)

const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");

const app = express();
app.use(express.json());

let users = []; // store in memory for now

// Load users from file (if exists)
if (fs.existsSync("users.json")) {
  users = JSON.parse(fs.readFileSync("users.json"));
}

// Save users back to file
function saveUsers() {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ msg: "all fields required" });
  }

  let exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ msg: "user already exists" });
  }

  let hashed = await bcrypt.hash(password, 10);

  let newUser = { id: Date.now(), name, email, password: hashed };
  users.push(newUser);
  saveUsers();

  res.json({ msg: "user registered" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = users.find(u => u.email === email);
  if (!user) {
    return res.json({ msg: "invalid credentials" });
  }

  let match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.json({ msg: "invalid credentials" });
  }

  res.json({ msg: "login success" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
