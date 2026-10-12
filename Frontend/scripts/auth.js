/* =====================================================
   NAVBAR AUTH AREA
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const authArea = document.getElementById("authArea");

  if (!authArea) return;

  const logoutButtonHTML = `
    <button
      type="button"
      id="navLogoutBtn"
      class="btn btn-outline btn-sm"
    >
      Logout
    </button>
  `;

  const guestHTML = `
    <span
      class="auth-indicator auth-out"
      title="Not signed in"
    >
      <span class="status-dot"></span>Guest
    </span>
    <a href="${relativeLogin()}" class="btn btn-primary btn-sm">Login</a>
  `;

  let user = null;

  try {
    user = await fetchCurrentUser();
  } catch (err) {
    console.error("Auth area error:", err);
  }

  if (user) {
    const name =
      user.name ||
      (user.email || "").split("@")[0] ||
      "Account";

    authArea.innerHTML = `
      <a
        href="${relative("profile.html")}"
        class="auth-indicator auth-in"
        title="Signed in — view profile"
      >
        <span class="status-dot"></span>
        ${escapeHTML(name)}
      </a>

      <a href="${relative("upload.html")}">
        Upload
      </a>

      <a href="${relative("my-resources.html")}">
        My Resources
      </a>

      <button
        type="button"
        id="navLogoutBtn"
        class="btn btn-primary btn-sm"
      >
        Logout
      </button>
    `;
  } else {
    authArea.innerHTML = guestHTML;
  }

  const logoutBtn =
    document.getElementById("navLogoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener(
      "click",
      requestLogout
    );
  }

  const sidebarLogoutBtn =
    document.getElementById("sidebarLogout");

  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener(
      "click",
      requestLogout
    );
  }
});


/* =====================================================
   LOGOUT CONFIRMATION POPUP
   ===================================================== */

function requestLogout() {
  ensureLogoutModal();

  const overlay =
    document.getElementById("logoutModalOverlay");

  if (!overlay) return;

  overlay.classList.add("show");

  document.body.style.overflow = "hidden";
}


function closeLogoutModal() {
  const overlay =
    document.getElementById("logoutModalOverlay");

  if (overlay) {
    overlay.classList.remove("show");
  }

  document.body.style.overflow = "";
}


function ensureLogoutModal() {
  if (
    document.getElementById(
      "logoutModalOverlay"
    )
  ) {
    return;
  }

  const overlay =
    document.createElement("div");

  overlay.id =
    "logoutModalOverlay";

  overlay.setAttribute(
    "role",
    "dialog"
  );

  overlay.setAttribute(
    "aria-modal",
    "true"
  );

  overlay.setAttribute(
    "aria-labelledby",
    "logoutModalTitle"
  );

  overlay.innerHTML = `
    <div class="logout-modal">

      <div class="logout-modal-icon">
        👋
      </div>

      <h3 id="logoutModalTitle">
        Log out of Enggii Tea?
      </h3>

      <p>
        Are you sure you want to log out?
        You can sign back in any time.
      </p>

      <div class="logout-modal-actions">

        <button
          type="button"
          class="btn btn-outline"
          id="logoutCancelBtn"
        >
          Cancel
        </button>

        <button
          type="button"
          class="btn btn-primary"
          id="logoutConfirmBtn"
        >
          Yes, log out
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  const cancelBtn =
    document.getElementById(
      "logoutCancelBtn"
    );

  const confirmBtn =
    document.getElementById(
      "logoutConfirmBtn"
    );

  if (cancelBtn) {
    cancelBtn.addEventListener(
      "click",
      closeLogoutModal
    );
  }

  if (confirmBtn) {
    confirmBtn.addEventListener(
      "click",
      confirmLogout
    );
  }

  overlay.addEventListener(
    "click",
    (event) => {
      if (event.target === overlay) {
        closeLogoutModal();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape"
      ) {
        closeLogoutModal();
      }
    }
  );
}


/* =====================================================
   CONFIRM LOGOUT
   ===================================================== */

function confirmLogout() {
  const confirmBtn =
    document.getElementById(
      "logoutConfirmBtn"
    );

  const cancelBtn =
    document.getElementById(
      "logoutCancelBtn"
    );

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent =
      "Logging out...";
  }

  if (cancelBtn) {
    cancelBtn.disabled = true;
  }

  /*
    Backend uses stateless bearer tokens.
    Clear the locally stored session.
  */

  clearSession();

  /*
    IMPORTANT:
    After logout → go directly to LOGIN PAGE.
  */

  window.location.href =
    getLoginUrl();
}


/* =====================================================
   LOGIN URL
   ===================================================== */

function getLoginUrl() {
  const inPagesFolder =
    window.location.pathname.includes(
      "/pages/"
    );

  if (inPagesFolder) {
    return "../login/login.html";
  }

  return "login/login.html";
}


/* =====================================================
   RELATIVE PATH
   ===================================================== */

function relativeLogin() {
  return window.location.pathname.includes("/pages/")
    ? "../login/login.html"
    : "login/login.html";
}

function relative(filename) {
  const inPagesFolder =
    window.location.pathname.includes(
      "/pages/"
    );

  const isRootFile =
    filename === "index.html";

  if (inPagesFolder) {
    return isRootFile
      ? "../index.html"
      : filename;
  }

  return isRootFile
    ? filename
    : "pages/" + filename;
}


/* =====================================================
   HTML ESCAPE
   ===================================================== */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(
      /'/g,
      "&#039;"
    );
}