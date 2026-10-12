/* =====================================================
   LOGIN & REGISTER — Enggii Tea
   Email/Password + Google OAuth
   ===================================================== */


/* ---------- Supabase ---------- */

const SUPABASE_URL = "https://oeczqbbdjifhyobhhcys.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7Mt2qUoOUlgNnHwWN6OUDw__Q9i1DrJ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* ---------- Password visibility toggles ---------- */

function bindPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);

  if (!input || !toggle) return;

  toggle.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      toggle.textContent = "🙈";
    } else {
      input.type = "password";
      toggle.textContent = "👁";
    }
  });
}

bindPasswordToggle("password", "togglePassword");
bindPasswordToggle("regPassword", "toggleRegPassword");


/* ---------- Elements ---------- */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const submitBtn = loginForm
  ? loginForm.querySelector(".login-btn")
  : null;

const registerBtn = document.getElementById("registerBtn");

const authHeading = document.getElementById("authHeading");
const authSubheading = document.getElementById("authSubheading");

const loginDivider = document.getElementById("loginDivider");
const googleLogin = document.getElementById("googleLogin");

const signupText = document.getElementById("signupText");
const signupLink = document.getElementById("signupLink");


/* ---------- Button loading ---------- */

function setBusy(button, busy, busyLabel) {
  if (!button) return;

  if (busy) {
    button.dataset.label = button.innerHTML;
    button.disabled = true;
    button.innerHTML = busyLabel;
  } else {
    button.disabled = false;
    button.innerHTML =
      button.dataset.label || button.innerHTML;

    delete button.dataset.label;
  }
}


/* ---------- Login / Register mode ---------- */

function showRegisterMode() {
  if (!registerForm || !loginForm) return;

  loginForm.style.display = "none";
  registerForm.style.display = "block";

  if (loginDivider) {
    loginDivider.style.display = "none";
  }

  if (googleLogin) {
    googleLogin.style.display = "none";
  }

  if (authHeading) {
    authHeading.textContent = "Create your account";
  }

  if (authSubheading) {
    authSubheading.textContent =
      "Sign up to start your learning journey";
  }

  if (signupText) {
    signupText.textContent = "Already have an account?";
  }

  if (signupLink) {
    signupLink.textContent = "Login";
  }
}


function showLoginMode() {
  if (!loginForm || !registerForm) return;

  loginForm.style.display = "block";
  registerForm.style.display = "none";

  if (loginDivider) {
    loginDivider.style.display = "";
  }

  if (googleLogin) {
    googleLogin.style.display = "";
  }

  if (authHeading) {
    authHeading.textContent = "Welcome To Enggi Tea!";
  }

  if (authSubheading) {
    authSubheading.textContent =
      "Login to continue your learning journey";
  }

  if (signupText) {
    signupText.textContent = "Don't have an account?";
  }

  if (signupLink) {
    signupLink.textContent = "Create Account";
  }
}


if (signupLink) {
  signupLink.addEventListener("click", (event) => {
    event.preventDefault();

    if (
      registerForm &&
      registerForm.style.display === "none"
    ) {
      showRegisterMode();
    } else {
      showLoginMode();
    }
  });
}


/* ---------- Redirect after normal login/register ---------- */

function redirectAfterAuth() {
  const next =
    new URLSearchParams(window.location.search).get("next");

  if (next) {
    try {
      const target = new URL(
        next,
        window.location.origin
      );

      if (target.origin === window.location.origin) {
        window.location.href = target.href;
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  window.location.href = "../index.html";
}


/* =====================================================
   EMAIL LOGIN
   ===================================================== */

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setBusy(
      submitBtn,
      true,
      "Logging in..."
    );

    try {
      const body = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          body: {
            email,
            password
          }
        }
      );

      const data = body.data || {};

      saveSession(
        data.session,
        data.user
      );

      redirectAfterAuth();

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      alert(
        err.message ||
        "Unable to sign in. Please try again."
      );

      setBusy(
        submitBtn,
        false
      );
    }
  });
}


/* =====================================================
   REGISTER
   ===================================================== */

if (registerForm) {
  registerForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const name =
        document.getElementById("regName").value.trim();

      const email =
        document.getElementById("regEmail").value.trim();

      const password =
        document.getElementById("regPassword").value;

      if (!name || !email || !password) {
        alert(
          "Please fill in your name, email and password."
        );
        return;
      }

      if (password.length < 6) {
        alert(
          "Password must be at least 6 characters long."
        );
        return;
      }

      setBusy(
        registerBtn,
        true,
        "Creating account..."
      );

      try {
        const body = await apiFetch(
          "/api/auth/register",
          {
            method: "POST",
            body: {
              name,
              email,
              password
            }
          }
        );

        const data = body.data || {};

        if (
          data.session &&
          data.session.access_token
        ) {
          saveSession(
            data.session,
            data.user
          );

          redirectAfterAuth();
          return;
        }

        alert(
          "Account created successfully! Please log in."
        );

        registerForm.reset();
        showLoginMode();

      } catch (err) {
        console.error(
          "Register error:",
          err
        );

        alert(
          err.message ||
          "Unable to create your account. Please try again."
        );

      } finally {
        setBusy(
          registerBtn,
          false
        );
      }
    }
  );
}


/* =====================================================
   FORGOT PASSWORD
   ===================================================== */

const forgotPasswordLink =
  document.getElementById("forgotPassword");

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      alert(
        "Password reset is not available yet. Please contact your administrator."
      );
    }
  );
}


/* =====================================================
   GOOGLE OAUTH
   ===================================================== */

if (googleLogin) {

  googleLogin.addEventListener(
    "click",
    async () => {

      try {

        setBusy(
          googleLogin,
          true,
          "Connecting to Google..."
        );

        /*
          This automatically creates:

          /Frontend/login/login.html
                  ↓
          Google Login
                  ↓
          /Frontend/index.html (home, already signed in)
        */

        const redirectUrl =
          new URL(
            "../index.html",
            window.location.href
          ).href;

        console.log(
          "Google redirect URL:",
          redirectUrl
        );

        const { error } =
          await supabaseClient.auth.signInWithOAuth({
            provider: "google",

            options: {
              redirectTo: redirectUrl
            }
          });

        if (error) {
          throw error;
        }

      } catch (error) {

        console.error(
          "Google OAuth Error:",
          error
        );

        alert(
          "Google login failed: " +
          (error.message || "Please try again.")
        );

        setBusy(
          googleLogin,
          false
        );
      }
    }
  );
}