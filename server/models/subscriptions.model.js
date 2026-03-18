const supabase = require("../config/db_connection");

// Find All Subscriptions (with optional filters)
const findAllSubscriptions = async (filters = {}) => {
  let query = supabase.from("EFA_Subscription").select("*, user:EFA_Users(name, email)");

  if (filters.user_id) {
    query = query.eq("user_id", filters.user_id);
  }

  if (filters.event_id) {
    query = query.eq("event_id", filters.event_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("DATABASE_FIND_ALL_SUBSCRIPTIONS_ERROR");
  }
  return data;
};

// Find Subscription by ID
const findSubscriptionById = async (id) => {
  const { data, error } = await supabase
    .from("EFA_Subscription")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("DATABASE_FIND_SUBSCRIPTION_ERROR");
  }

  return data;
};

// Create Subscription
const createSubscription = async (user_id, event_id) => {
  const { data, error } = await supabase
    .from("EFA_Subscription")
    .insert([
      {
        user_id,
        event_id,
        checkinDone: false
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("DATABASE_CREATE_SUBSCRIPTION_ERROR:", error);
    throw new Error("DATABASE_CREATE_SUBSCRIPTION_ERROR");
  }

  return data;
};

// Update Subscription by ID
const updateSubscriptionById = async (id, subscriptionData) => {
  const { data, error } = await supabase
    .from("EFA_Subscription")
    .update(subscriptionData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("DATABASE_UPDATE_SUBSCRIPTION_ERROR");
  }
  return data;
};

// Delete Subscription by ID
const deleteSubscriptionById = async (id) => {
  const { data, error } = await supabase
    .from("EFA_Subscription")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("DATABASE_DELETE_SUBSCRIPTION_ERROR");
  }

  return data;
};

module.exports = {
  findAllSubscriptions,
  findSubscriptionById,
  createSubscription,
  updateSubscriptionById,
  deleteSubscriptionById,
};
