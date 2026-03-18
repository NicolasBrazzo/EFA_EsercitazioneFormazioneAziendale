import api from "../api/client";

export const fetchEvents = async () => {
  try {
    const res = await api.get("/events");
    return res.data.events;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchEventById = async (id) => {
  try {
    const res = await api.get(`/events/${id}`);
    return res.data.event;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const createEvent = async (payload) => {
  try {
    const res = await api.post("/events", payload);
    return res.data.event;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const updateEvent = async (id, payload) => {
  try {
    const res = await api.put(`/events/${id}`, payload);
    return res.data.event;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const deleteEvent = async (id) => {
  try {
    const res = await api.delete(`/events/${id}`);
    return res.data.event;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const fetchEventStatistics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.from) query.append("from", params.from);
  if (params.to)   query.append("to", params.to);
  return api.get(`/events/statistics?${query}`).then((r) => r.data.statistics);
};
