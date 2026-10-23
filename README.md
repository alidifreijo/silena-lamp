# Silena

Concept product site for Silena, a wall and table lamp based on IKEA VARMBLIXT. Portfolio project.

```bash
npm install
npm run dev     # local preview at http://localhost:5173
npm run build   # production build in dist/
```

Deployed on Vercel: every push to `main` publishes the site; every other branch gets its own preview URL.

## Structure

- `src/App.jsx` — the page, in order: hero, 01 Feel, 02 The place to be, 03 Light Rituals, 04 Make it yours.
- `src/index.css` — page colours (day/night as CSS variables), nav, hero and phone layout.
- `src/components/` — one file per section, plus:
  - `SilenaLamp3D.tsx` — the lamp in 3D (three.js), shared by the shop, Light Rituals and the bag.
  - `SilenaRoomCore.tsx` — the isometric room's drawing and behaviour.
  - `SilenaThemeSwitch.jsx`, `useSilenaMode.js` — day/night.
  - `Letters.jsx` — the SILENA wordmark.
- `src/framer.js` — the sections were first built in Framer; this small shim lets them run unchanged.
- `public/images/` — hero photos (day/night) and the 01 Feel images.
