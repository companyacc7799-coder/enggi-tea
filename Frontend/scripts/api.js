
/* =====================================================
   GOOGLE OAUTH RETURN HANDLER
   ===================================================== */

(function handleOAuthHash() {
  if (!window.location.hash) return;

  const params = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );

  const accessToken = params.get("access_token");
  const oauthError = params.get("error_description") || params.get("error");

  if (accessToken) {
    try {
      localStorage.setItem("enggii_auth_token", accessToken);

      const refreshToken = params.get("refresh_token");
      if (refreshToken) {
        localStorage.setItem("enggii_auth_refresh", refreshToken);
      }
    } catch (err) {
      console.error("Unable to persist Google session:", err);
    }
  }

  if (oauthError) {
    console.error("Google OAuth error:", oauthError);
  }

  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );

  if (
    accessToken &&
    window.location.pathname.toLowerCase().endsWith("login.html")
  ) {
    window.location.replace("../index.html");
  }
})();

/* =====================================================
   API CONFIGURATION
   ===================================================== */

function resolveApiBaseUrl() {
  if (window.API_BASE_URL) return window.API_BASE_URL;

  const { protocol, hostname, port, origin } = window.location;

  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]";

  // Local dev (Live Server, file://, etc.) can't serve /api,
  // so talk to the backend directly.
  if (protocol === "file:" || (isLocalHost && port !== "5000")) {
    return "http://localhost:5000";
  }

  // Served by the backend (or deployed): same origin.
  return origin;
}

const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = "enggii_auth_token";
const USER_KEY = "enggii_auth_user";
const REFRESH_KEY = "enggii_auth_refresh";

const SUPABASE_AUTH_URL =
  "https://oeczqbbdjifhyobhhcys.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_7Mt2qUoOUlgNnHwWN6OUDw__Q9i1DrJ";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status || 0;
  }
}

function defaultStatusMessage(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Your session has expired or your credentials are wrong. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested item could not be found.";
    case 0:
      return "Unable to connect to the server. Please make sure the backend is running and try again.";
    default:
      return "Something went wrong on the server. Please try again.";
  }
}

/* ---------- Session ---------- */

function saveSession(session, user) {
  try {
    if (session && session.access_token) {
      localStorage.setItem(TOKEN_KEY, session.access_token);
    }

    if (session && session.refresh_token) {
      localStorage.setItem(REFRESH_KEY, session.refresh_token);
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error("Unable to persist session:", err);
  }
}

function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Storage unavailable
  }
}

/* ---------- Silent token refresh ---------- */

let refreshInFlight = null;

function refreshAccessToken() {
  let refreshToken = null;

  try {
    refreshToken = localStorage.getItem(REFRESH_KEY);
  } catch {
    // Storage unavailable
  }

  if (!refreshToken) return Promise.resolve(false);

  if (!refreshInFlight) {
    refreshInFlight = fetch(
      SUPABASE_AUTH_URL + "/auth/v1/token?grant_type=refresh_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    )
      .then(async (res) => {
        if (!res.ok) return false;

        const data = await res.json().catch(() => null);

        if (!data || !data.access_token) return false;

        try {
          localStorage.setItem(TOKEN_KEY, data.access_token);

          if (data.refresh_token) {
            localStorage.setItem(REFRESH_KEY, data.refresh_token);
          }
        } catch {
          // Storage unavailable
        }

        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

/* ---------- Shared fetch wrapper ---------- */

async function apiFetch(path, options = {}) {
  const token = getAccessToken();

  const headers = Object.assign({}, options.headers || {});

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let requestOptions = Object.assign({}, options, { headers });

  if (options.body && typeof options.body !== "string") {
    headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;

  try {
    response = await fetch(API_BASE_URL + path, requestOptions);
  } catch {
    throw new ApiError(defaultStatusMessage(0), 0);
  }

  let body = null;

  try {
    body = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    if (response.status === 401 && token && !options._authRetried) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return apiFetch(
          path,
          Object.assign({}, options, { _authRetried: true })
        );
      }

      clearSession();
    }

    throw new ApiError(
      (body && body.message) || defaultStatusMessage(response.status),
      response.status
    );
  }

  return body;
}

/* ---------- Error message ---------- */

function apiErrorMessage(err) {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      return defaultStatusMessage(500);
    }

    return err.message || defaultStatusMessage(err.status);
  }

  return "Something went wrong. Please try again.";
}

/* ---------- Current user ---------- */

async function fetchCurrentUser() {
  if (!getAccessToken()) return null;

  try {
    const body = await apiFetch("/api/auth/me");
    return (body && body.data && body.data.user) || null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
    }

    return null;
  }
}

/* ---------- Protected page guard ---------- */

async function requireAuth() {
  const user = await fetchCurrentUser();

  if (!user) {
    clearSession();

    const inPages = window.location.pathname.includes("/pages/");

    const loginUrl =
      (inPages ? "../login/login.html" : "login/login.html") +
      "?next=" +
      encodeURIComponent(window.location.href);

    window.location.href = loginUrl;
    return null;
  }

  return user;
}