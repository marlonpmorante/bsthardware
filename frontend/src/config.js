// Centralized frontend configuration for API endpoints
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || `${window.location.origin}/api`;

// The origin that serves the backend (used for non-/api paths like uploads and websockets)
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
