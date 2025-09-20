require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// In-memory users database (for demo)
let users = [];

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { id: Date.now(), name, email, password: hashedPassword, role };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully", user: { name, email, role } });
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token, role: user.role });
});

// ---------------- MIDDLEWARE: ROLE AUTH ----------------
function authorize(allowedRoles) {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

// ---------------- PROTECTED ROUTES ----------------
app.get("/admin-dashboard", authorize(["Admin"]), (req, res) => {
  res.json({ message: "Welcome Admin! You have full access." });
});

app.get("/doctor-dashboard", authorize(["Doctor"]), (req, res) => {
  res.json({ message: "Welcome Doctor! You can view and update patient records." });
});

app.get("/nurse-dashboard", authorize(["Nurse"]), (req, res) => {
  res.json({ message: "Welcome Nurse! You can view and update vitals." });
});

app.get("/patient-dashboard", authorize(["Patient"]), (req, res) => {
  res.json({ message: "Welcome Patient! You can view your records and appointments." });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
