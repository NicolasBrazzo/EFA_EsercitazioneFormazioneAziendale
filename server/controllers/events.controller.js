const express = require("express");

const {
  findAllEvents,
  findEventById,
  createEvent,
  updateEventById,
  deleteEventById,
  findPastEvents,
} = require("../models/events.model");
const protect = require("../middleware/auth");
const supabase = require("../config/db_connection");

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

// GET /events/statistics — solo organizzatori
router.get("/statistics", protect, requireOrganizer, async (req, res) => {
  try {
    const { from, to } = req.query;
    const events = await findPastEvents(from, to);
    if (events.length === 0) return res.json({ ok: true, statistics: [] });

    const eventIds = events.map((e) => e.id);

    const { data: subs, error } = await supabase
      .from("EFA_Subscription")
      .select("event_id, checkinDone")
      .in("event_id", eventIds);
    if (error) throw new Error("DATABASE_STATS_ERROR");

    const statistics = events.map((ev) => {
      const eventSubs = subs.filter((s) => s.event_id === ev.id);
      const iscritti = eventSubs.length;
      const checkins = eventSubs.filter((s) => s.checkinDone).length;
      const percentuale = iscritti > 0 ? Math.round((checkins / iscritti) * 100) : 0;
      return { id: ev.id, title: ev.title, date: ev.date, iscritti, checkins, percentuale };
    });

    return res.json({ ok: true, statistics });
  } catch (err) {
    console.error("GET STATISTICS ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
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

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return res.status(400).json({
        ok: false,
        error: "La data dell'evento non può essere nel passato",
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

    if (date) {
      const today = new Date().toISOString().split("T")[0];
      if (date < today) {
        return res.status(400).json({
          ok: false,
          error: "La data dell'evento non può essere nel passato",
        });
      }
    }

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
