// src/api/fleetApi.js
import api from "../utils/api";

export const getMyFleets      = ()         => api("/api/vendors/my/fleets");
export const getFleetById     = (id)       => api(`/api/vendors/fleet/${id}`);
export const createFleet      = (body)     => api("/api/vendors/create-fleet",      { method: "POST",   body });
export const updateFleet      = (id, body) => api(`/api/vendors/update-fleet/${id}`, { method: "PUT",    body });
export const toggleFleet      = (id)       => api(`/api/vendors/toggle-fleet/${id}`, { method: "PATCH" });
export const deleteFleet      = (id)       => api(`/api/vendors/delete-fleet/${id}`, { method: "DELETE" });
