# Enggi Tea — Engineering Mathematics Resource Hub

## Structure
```
index.html            → Home page (site root)
pages/                 → Every other page
styles/style.css       → Full design system (colors, type, components)
scripts/               → api.js, auth.js, main.js, calculators.js, graphs.js
assets/math-pattern.svg → Tileable math-doodle background used on every page
```

## Connect the backend (existing Express API)
The site talks to the existing maths-vault Express backend over plain
HTTP (no React, no Supabase SDK in the browser). Configure the backend
base URL in `scripts/api.js`:

```js
const API_BASE_URL = window.API_BASE_URL || "http://localhost:5000";
```

Start the backend (port 5000 by default — see its `server.js`), then open
`index.html` in a browser (or serve this folder with any static server).

### How auth works
- `login/login.html` posts to `POST /api/auth/login` (and
  `POST /api/auth/register` for new accounts via the "Create Account" link).
- The returned session's `access_token` is stored in `localStorage` and sent
  as `Authorization: Bearer <token>` on every protected call
  (`scripts/api.js` → `apiFetch()`).
- The current user is verified against the backend with `GET /api/auth/me`
  (the backend is the source of truth for identity and the admin role).
- Logout simply clears the stored token (the backend uses stateless
  bearer tokens and has no logout endpoint).

### Resources
- Public: `GET /api/resources`, `GET /api/resources/search`,
  `GET /api/resources/:id`
- Signed-in users: `GET /api/resources/user/my-resources`,
  `POST /api/resources` (JSON body: title, description, semester, unit,
  resourceType, youtube_url, file_url), `DELETE /api/resources/:id`
- Resources created by normal users start as `pending` and are reviewed by
  an admin; the backend decides this (admins publish immediately).

## Pages
- **Home** — hero + semester explorer
- **Topics** (`pages/dashboard.html`) — browse by semester
- **Subject** (`pages/subject.html?semester=1..4`) — semester → units; tap a unit to reveal that unit's resources only
- **Resources** (`pages/search.html`) — keyword search (requires a keyword or filter; never lists all resources)
- **Formula Library** (`pages/formulas.html`) — static reference sheets, tabbed by semester
- **Calculators** (`pages/calculators.html`) — quadratic solver, matrix determinant, mean/variance
- **Graph Visualizer** (`pages/graphs.html`) — canvas-based function plotter
- **Upload / My Resources / Profile** — auth-gated, redirect to `login/login.html` (backend API)
- **About / Contact** — static pages

## Design tokens (see `styles/style.css` `:root`)
- Primary violet `#8A7FDC`, deep violet `#6C5CE7`
- Teal accent `#22C3A6` (logo, links)
- Cream/yellow `#F5E9AA` and lime `#D7E85C` accents
- Background: soft white-to-lavender radial gradient
- Fonts: **Playfair Display** (headings) + **Poppins** (body/UI)

Open `index.html` in a browser (or serve the folder with any static server) to view the site.
