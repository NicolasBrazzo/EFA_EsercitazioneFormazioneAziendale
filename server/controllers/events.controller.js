const express = require("express");

const {
  findAllEvents,
  findEventById,
  createEvent,
  updateEventById,
  deleteEventById,
} = require("../models/events.model");
const protect = require("../middleware/auth");

const router = express.Router();

// Middleware: only organizers can write
const requireOrganizer = (req, res, next) => {
  if (!req.user?.isOrganizer) {
    return res.status(403).json({ ok: false, error: "Accesso riservato agli organizzatori" });
  }
  next();
};

// Get All Events
router.get("/", protect, async (req, res) => {
  try {
    const events = await findAllEvents();
    return res.status(200).json({ ok: true, events });
  } catch (err) {
    console.error("GET ALL EVENTS ERROR:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Errore interno del server" });
  }
});

// Get single event by id
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await findEventById(id);
    if (!event) {
      return res.status(404).json({ ok: false, error: "Evento non trovato" });
    }
    return res.status(200).json({ ok: true, event });
  } catch (err) {
    console.error("GET SINGLE EVENT BY ID ERROR:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Errore interno del server" });
  }
});

// Create Event
router.post("/", protect, requireOrganizer, async (req, res) => {
  try {
    const { title, date, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        ok: false,
        error: "Campi obbligatori mancanti: titolo e data",
      });
    }

    const event = await createEvent(title, date, description);
    return res.status(201).json({ ok: true, event });
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Errore interno del server" });
  }
});

// Update Event by ID
router.put("/:id", protect, requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description } = req.body;

    const event = await updateEventById(id, { title, date, description });
    return res.status(200).json({ ok: true, event });
  } catch (err) {
    console.error("UPDATE EVENT BY ID ERROR:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Errore interno del server" });
  }
});

// Delete Event by ID
router.delete("/:id", protect, requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await deleteEventById(id);
    return res.status(200).json({ ok: true, event });
  } catch (err) {
    console.error("DELETE EVENT BY ID ERROR:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Errore interno del server" });
  }
});

module.exports = router;
