const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),
  me: (token) => request("/auth/me", { token }),

  createRequest: (token, payload) => request("/requests", { method: "POST", body: payload, token }),
  listRequests: (token) => request("/requests", { token }),
  directorDecision: (token, id, decision, note) =>
    request(`/requests/${id}/decision`, { method: "PATCH", body: { decision, note }, token }),
  storeStatus: (token, id, status, note) =>
    request(`/requests/${id}/store-status`, { method: "PATCH", body: { status, note }, token }),
};
