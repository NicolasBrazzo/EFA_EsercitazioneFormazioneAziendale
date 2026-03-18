const express = require("express");

const {
  findAllSubscriptions,
  findSubscriptionById,
  createSubscription,
  updateSubscriptionById,
  deleteSubscriptionById,
} = require("../models/subscriptions.model");
const { findEventById } = require("../models/events.model");
const protect = require("../middleware/auth");

const router = express.Router();

// Returns true if today is before the event date (i.e. deadline not passed)
const isBeforeEventDay = (eventDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  return today < event;
};

// Get All Subscriptions (with filters)
router.get("/", protect, async (req, res) => {
  try {
    let { user_id, event_id } = req.query;

    // Se non è organizzatore, ignora il user_id passato come param e usa il proprio
    if (!req.user.isOrganizer) {
      user_id = req.user.sub;
    }

    const subscriptions = await findAllSubscriptions({ user_id, event_id });

    return res.status(200).json({ ok: true, subscriptions });
  } catch (err) {
    console.error("GET ALL SUBSCRIPTIONS ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Get single subscription by id
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await findSubscriptionById(id);
    if (!subscription) {
      return res.status(404).json({ ok: false, error: "Iscrizione non trovata" });
    }
    return res.status(200).json({ ok: true, subscription });
  } catch (err) {
    console.error("GET SINGLE SUBSCRIPTION BY ID ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Create Subscription
router.post("/", protect, async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({
        ok: false,
        error: "Campi obbligatori mancanti: user_id, event_id",
      });
    }

    // Employees: can only subscribe until the day before the event
    if (!req.user.isOrganizer) {
      const event = await findEventById(event_id);
      if (!event) {
        return res.status(404).json({ ok: false, error: "Evento non trovato" });
      }
      if (!isBeforeEventDay(event.date)) {
        return res.status(400).json({
          ok: false,
          error: "Non è più possibile iscriversi: il termine è il giorno prima dell'evento",
        });
      }
    }
    const subscription = await createSubscription(user_id, event_id);
    return res.status(201).json({ ok: true, subscription });
  } catch (err) {
    console.error("CREATE SUBSCRIPTION ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Update Subscription by ID
router.put("/:id", protect, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ ok: false, error: "Solo gli organizzatori possono effettuare il check-in" });
    }

    const { id } = req.params;
    const { checkinDone, checkinTime } = req.body;

    if (checkinDone === undefined && checkinTime === undefined) {
      return res.status(400).json({
        ok: false,
        error: "Nessun campo da aggiornare: fornire checkinDone e/o checkinTime",
      });
    }

    const existing = await findSubscriptionById(id);
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Iscrizione non trovata" });
    }

    const subscription = await updateSubscriptionById(id, { checkinDone, checkinTime });
    return res.status(200).json({ ok: true, subscription });
  } catch (err) {
    console.error("UPDATE SUBSCRIPTION BY ID ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

// Delete Subscription by ID
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await findSubscriptionById(id);
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Iscrizione non trovata" });
    }

    // Employees: can only cancel their own subscription and only until the day before the event
    if (!req.user.isOrganizer) {
      if (existing.user_id !== req.user.sub) {
        return res.status(403).json({
          ok: false,
          error: "Non puoi annullare l'iscrizione di un altro utente",
        });
      }

      const event = await findEventById(existing.event_id);
      if (!isBeforeEventDay(event.date)) {
        return res.status(400).json({
          ok: false,
          error: "Non è più possibile annullare l'iscrizione: il termine è il giorno prima dell'evento",
        });
      }
    }

    const subscription = await deleteSubscriptionById(id);
    return res.status(200).json({ ok: true, subscription });
  } catch (err) {
    console.error("DELETE SUBSCRIPTION BY ID ERROR:", err);
    return res.status(500).json({ ok: false, error: "Errore interno del server" });
  }
});

module.exports = router;
