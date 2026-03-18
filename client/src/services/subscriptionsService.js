import api from "../api/client";

export const fetchSubscriptions = async (filters = {}) => {
  try {
    const res = await api.get("/subscriptions", { params: filters });
    return res.data.subscriptions;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const fetchSubscriptionById = async (id) => {
  try {
    const res = await api.get(`/subscriptions/${id}`);
    return res.data.subscription;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const createSubscription = async (payload) => {
  try {
    const res = await api.post("/subscriptions", payload);
    return res.data.subscription;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const updateSubscription = async (id, payload) => {
  try {
    const res = await api.put(`/subscriptions/${id}`, payload);
    return res.data.subscription;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};

export const deleteSubscription = async (id) => {
  try {
    const res = await api.delete(`/subscriptions/${id}`);
    return res.data.subscription;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
};
