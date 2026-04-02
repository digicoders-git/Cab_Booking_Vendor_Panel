// src/utils/api.js
// Centralized fetch — auto attaches Bearer token from localStorage

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "v_token";

const api = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

export default api;
