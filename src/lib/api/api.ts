import axios from "axios";

// FRONTEND-ONLY MODE:
// Always call an external backend server.
// You MUST set NEXT_PUBLIC_API_BASE_URL in .env.local, e.g.
// NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  // Fail fast in dev if env is missing so you remember to configure the backend URL.
  // eslint-disable-next-line no-console
  console.error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Please set it in .env.local, e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api"
  );
}

export const api = axios.create({
  baseURL: baseURL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach bearer token (from localStorage) to every request so
// calls like POST /vendors get Authorization and avoid 401.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("authToken");
    if (token) {
      (config.headers ||= {}).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize backend errors so UI can always show a clear message.
// For responses like:
// { code: "UNAUTHORIZED", message: "Invalid email or password", details: null }
// or { success:false, error:{ code, message, details } }
// we turn that into an Error("...message...").
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backend = error?.response?.data;
    const nestedErrorMessage =
      backend?.error && typeof backend.error === "object"
        ? backend.error.message
        : undefined;
    const message =
      nestedErrorMessage ||
      backend?.message ||
      backend?.error ||
      (typeof backend === "string" ? backend : null) ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

