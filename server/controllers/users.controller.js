const express = require("express");
const bcrypt = require("bcrypt");
const {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createNewUser,
  updateUserById,
  deleteUserById,
} = require("../models/user.model");
const protect = require("../middleware/auth");
const { validateEmail } = require("../utils/validateEmail");
const { validatePassword } = require("../utils/validatePassword");

const router = express.Router();

// middleware to check if user is organizer
const isOrganizer = (req, res, next) => {
  if (!req.user.isOrganizer) {
    return res.status(403).json({ ok: false, error: "Accesso non autorizzato" });
  }
  next();
};

// Get All Users
router.get("/", protect, isOrganizer, async (req, res) => {
  try {
    const users = await findAllUsers();
    return res.status(200).json({ ok: true, users });
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Get single user by id
router.get("/:id", protect, isOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "Utente non trovato" });
    }
    return res.status(200).json({ ok: true, user });
  } catch (err) {
    console.error("GET SINGLE USER BY ID ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Create User
router.post("/", protect, isOrganizer, async (req, res) => {
  try {
    const { name, surname, email, password, isOrganizer: isOrganizerField } = req.body;

    // Validazione base dei campi
    if (!name || !surname || !email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Campi obbligatori mancanti: nome, cognome, email, password",
      });
    }

    // Validazione email
    if (!validateEmail(email)) {
      return res.status(400).json({
        ok: false,
        error: "Formato email non valido: deve essere nel formato testo@dominio.tld",
      });
    }

    // Validazione password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        error: passwordErrors,
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        error: "Email già in uso",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createNewUser(name, surname, email, hashedPassword, isOrganizerField ?? false);
    return res.status(201).json({ ok: true, user });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Update User by ID
router.put("/:id", protect, isOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email, password, isOrganizer: isOrganizerField } = req.body;

    // Validazione base dei campi
    if (!name || !surname || !email) {
      return res.status(400).json({
        ok: false,
        error: "Campi obbligatori mancanti: nome, cognome, email",
      });
    }

    let updateData = { name, surname, email, isOrganizer: isOrganizerField ?? false };

    if (password) {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          ok: false,
          error: passwordErrors,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await updateUserById(id, updateData);
    return res.status(200).json({ ok: true, user });
  } catch (err) {
    console.error("UPDATE USER BY ID ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Delete User by ID
router.delete("/:id", protect, isOrganizer, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await deleteUserById(id);
    return res.status(200).json({ ok: true, user });
  } catch (err) {
    console.error("DELETE USER BY ID ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

module.exports = router;
