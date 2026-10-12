/* =====================================================
   ENGGII TEA — SHARED UI
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".mobile-menu");
  const sidebar = document.querySelector(".dashboard-sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      sidebar.classList.toggle("mobile-open");
    });

    sidebar.querySelectorAll(".dashboard-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("mobile-open");
      });
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 900 &&
          sidebar.classList.contains("mobile-open") &&
          !sidebar.contains(event.target) &&
          !menuBtn.contains(event.target)) {
        sidebar.classList.remove("mobile-open");
      }
    });
  }
});

/* =====================================================
   Lightweight UX helpers (no API calls)
   - mobile drawer backdrop + aria-expanded + Escape to close
   - "/" focuses the first search field
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".dashboard-sidebar");
  const menuBtn = document.querySelector(".mobile-menu");

  if (sidebar && menuBtn) {
    menuBtn.setAttribute("aria-controls", sidebar.id || "dashboardSidebar");
    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "sidebar-backdrop";
    backdrop.setAttribute("aria-label", "Close navigation menu");
    document.body.appendChild(backdrop);

    const sync = () => {
      const open = sidebar.classList.contains("mobile-open");
      backdrop.classList.toggle("show", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    };
    new MutationObserver(sync).observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    backdrop.addEventListener("click", () => sidebar.classList.remove("mobile-open"));
    sync();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar) sidebar.classList.remove("mobile-open");
    const t = e.target;
    const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    if (e.key === "/" && !typing) {
      const s = document.querySelector("#searchQuery, input[type='search']");
      if (s) { e.preventDefault(); s.focus(); }
    }
  });
});
