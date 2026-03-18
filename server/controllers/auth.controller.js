const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { validateEmail } = require("../utils/validateEmail");
const { validatePassword } = require("../utils/validatePassword");

const { findUserByEmail, createNewUser } = require("../models/user.model");
const protect = require("../middleware/auth");

const { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } = require("../config/jwt");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Email e password sono obbligatorie",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Credenziali non valide",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        ok: false,
        error: "Credenziali non valide",
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        isOrganizer: user.isOrganizer,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return res.json({
      ok: true,
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: "Errore interno del server",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log("[REGISTER] body ricevuto:", req.body);
    const { name, surname, email, password, isOrganizer } = req.body;

    if (!name || !surname || !email || !password) {
      console.log("[REGISTER] campi mancanti:", { name, surname, email, password: !!password });
      return res.status(400).json({
        ok: false,
        error: "Nome, cognome, email e password sono obbligatori",
      });
    }

    if (!validateEmail(email)) {
      console.log("[REGISTER] email non valida:", email);
      return res.status(400).json({
        ok: false,
        error: "Inserisci una email corretta",
      });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      console.log("[REGISTER] password non valida:", passwordErrors);
      return res.status(400).json({
        ok: false,
        errors: passwordErrors,
      });
    }

    console.log("[REGISTER] cerco utente esistente con email:", email);
    const existingUser = await findUserByEmail(email);
    console.log("[REGISTER] utente esistente:", existingUser);

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        error: "Email già registrata",
      });
    }

    console.log("[REGISTER] hashing password...");
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    console.log("[REGISTER] creazione utente...");
    const newUser = await createNewUser(
      name,
      surname,
      email,
      hashedPassword,
      isOrganizer || false,
    );
    console.log("[REGISTER] utente creato:", newUser);

    const token = jwt.sign(
      {
        sub: newUser.id,
        email: newUser.email,
        isOrganizer: newUser.isOrganizer,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    console.log("[REGISTER] successo per:", email);
    return res.status(201).json({
      ok: true,
      token,
    });
  } catch (err) {
    console.error("[REGISTER] ERRORE:", err.message, err.stack);

    return res.status(500).json({
      ok: false,
      error: err.message || "Errore interno del server",
    });
  }
});

router.get("/me", protect, (req, res) => {
  return res.json({
    ok: true,
    user: req.user,
  });
});

router.post("/logout", (req, res) => {
  return res.json({ ok: true });
});

module.exports = router;
