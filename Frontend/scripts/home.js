/* =====================================================
   ENGGI TEA
   HOME PAGE JAVASCRIPT
===================================================== */


/* =====================================================
   HOME VIDEOS
===================================================== */

const HOME_VIDEOS = [

  {
    title: "Differential Calculus",
    subtitle: "Functions",
    url: "https://youtu.be/7QAUZyddD2Y?si=3PhAzCZhHwna5uNm",
    image: "assets/video1.jpg"
  },

  {
    title: "Integral Calculus",
    subtitle: "Fundamental theorem of Calculus",
    url: "https://www.youtube.com/live/r6f6LMFyMgs?si=1MMnljfG-tovaBL0",
    image: "assets/video2.jpg"
  },

  {
    title: "Linear Algebra",
    subtitle: "Null space",
    url: "https://youtu.be/YpR3XjBu1gk?si=Vqolsl6nBgR-BCxM",
    image: "assets/video3.jpg"
  },

  {
    title: "Discrete Mathematics",
    subtitle: "Proof by induction",
    url: "https://youtu.be/mvJGl2OTs-E?si=ViGr0LskpwaQa6v2",
    image: "assets/video4.jpg"
  }

];


/* =====================================================
   LOAD HOME VIDEOS
   ===================================================== */

function loadHomeVideos() {

  const grid =
    document.getElementById("videoGrid");

  /*
   * Current homepage does not have a videoGrid.
   * So simply stop here.
   *
   * This keeps the existing video functionality
   * safe for pages that use it elsewhere.
   */

  if (!grid) {
    return;
  }


  grid.innerHTML = HOME_VIDEOS.map(video => `

    <a
      class="video-card"
      href="${video.url}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open ${video.title} on YouTube">

      <div class="video-image-wrap">

        <img
          src="${video.image}"
          alt="${video.title}">

      </div>

      <div class="video-card-body">

        <h3>
          ${video.title}
        </h3>

        <p>
          ${video.subtitle}
        </p>

      </div>

    </a>

  `).join("");

}


/* =====================================================
   MOBILE MENU
===================================================== */

function setupMobileMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const sidebar =
    document.getElementById("dashboardSidebar");


  if (!menu || !sidebar) {
    return;
  }


  menu.addEventListener("click", function () {

    sidebar.classList.toggle("mobile-open");

  });

}


/* =====================================================
   CLOSE MOBILE SIDEBAR AFTER CLICKING LINK
===================================================== */

function setupMobileNavLinks() {

  const sidebar =
    document.getElementById("dashboardSidebar");


  if (!sidebar) {
    return;
  }


  const links =
    sidebar.querySelectorAll(
      ".dashboard-nav-link"
    );


  links.forEach(function (link) {

    link.addEventListener("click", function () {

      sidebar.classList.remove(
        "mobile-open"
      );

    });

  });

}


/* =====================================================
   CLOSE SIDEBAR WHEN CLICKING OUTSIDE
===================================================== */

function setupOutsideClick() {

  const sidebar =
    document.getElementById("dashboardSidebar");

  const menu =
    document.getElementById("mobileMenu");


  if (!sidebar || !menu) {
    return;
  }


  document.addEventListener(
    "click",
    function (event) {

      const isMobile =
        window.innerWidth <= 850;


      if (!isMobile) {
        return;
      }


      const clickedInsideSidebar =
        sidebar.contains(event.target);


      const clickedMenu =
        menu.contains(event.target);


      if (
        !clickedInsideSidebar &&
        !clickedMenu
      ) {

        sidebar.classList.remove(
          "mobile-open"
        );

      }

    }
  );

}


/* =====================================================
   INITIALIZE HOME PAGE
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadHomeVideos();

    /* Mobile sidebar toggle is handled by scripts/main.js. */
    setupMobileNavLinks();

    setupOutsideClick();

  }
);