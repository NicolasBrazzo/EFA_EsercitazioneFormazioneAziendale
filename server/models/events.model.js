const supabase = require("../config/db_connection");

// Find All Events
const findAllEvents = async () => {
  const { data, error } = await supabase.from("EFA_Events").select("*");

  if (error) {
    throw new Error("DATABASE_FIND_ALL_EVENTS_ERROR");
  }
  return data;
};

// Find Client by ID
const findEventById = async (id) => {
  const { data, error } = await supabase
    .from("EFA_Events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("DATABASE_FIND_EVENT_ERROR");
  }

  return data;
};

// Create Event
const createEvent = async (title, date, description) => {
  const { data, error } = await supabase
    .from("EFA_Events")
    .insert([
      {
        title,
        date,
        description,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error("DATABASE_CREATE_EVENT_ERROR");
  }

  return data;
};

// Update Event by ID
const updateEventById = async (id, eventData) => {
  const { data, error } = await supabase
    .from("EFA_Events")
    .update(eventData)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error("DATABASE_UPDATE_EVENT_ERROR");
  }
  return data;
};

// Delete Event by ID
const deleteEventById = async (id) => {
  const { data, error } = await supabase
    .from("EFA_Events")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("DATABASE_DELETE_EVENT_ERROR");
  }

  return data;
};

// Find Past Events (date < today), with optional date range filter
const findPastEvents = async (fromDate, toDate) => {
  const today = new Date().toISOString().split("T")[0];
  let query = supabase.from("EFA_Events").select("*").lt("date", today).order("date", { ascending: false });
  if (fromDate) query = query.gte("date", fromDate);
  if (toDate)   query = query.lte("date", toDate);
  const { data, error } = await query;
  if (error) throw new Error("DATABASE_FIND_PAST_EVENTS_ERROR");
  return data;
};

module.exports = {
  findAllEvents,
  findEventById,
  createEvent,
  updateEventById,
  deleteEventById,
  findPastEvents,
};
