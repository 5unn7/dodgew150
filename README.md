# W150 Atlas — 1989 Dodge W150 4×4 Digital Garage

An interactive browser-based restoration and restomod manual for the owner's **1989 Dodge W150 regular-cab, 8-foot long-bed pickup**.

## Open the interactive viewer

Once GitHub Pages is enabled: **https://5unn7.github.io/dodgew150/**

The interactive site works on phones and desktops using modern browsers with WebGL. With touch controls, drag to orbit, pinch to zoom and tap a component to inspect it.

## Current build: prototype 0.3

- Three.js interactive model generated in the browser (does not require downloading a separate GLB).
- 8-foot long bed selected by default; optional short-bed comparison.
- Individual component selection, isolation by category, X-ray and exploded assembly views.
- Roadmap and editable notes saved in **your own browser**.
- Import/export the build log as JSON; export a screenshot of the viewport.
- Factory-manual section map and clear separation of **reference vs as-built vs proposed**.

**Important:** The model is a rough reference drawing, **not** a 3D scan or dimensionally accurate engineering CAD model. The 131-inch wheelbase is a nominal reference until measured against the actual truck. No repair, mounting or fabrication should rely on this geometry without validation.

## Mobile

Open the GitHub Pages link in Safari or Chrome. Touch: one finger = orbit, two fingers = zoom/pan, tap = select part.

## GitHub Pages deployment

A workflow at .github/workflows/pages.yml deploys this static site on pushes to main. If Pages is not configured, visit **Settings → Pages → Build and deployment → Source: GitHub Actions** and let the workflow run. The Actions tab displays deployment status.

## Build data & privacy

Your checklist and notes are stored locally on your device/browser. This repository does **not** collect or sync them. Export to JSON regularly and keep backups. Please do not put VINs, private addresses or the full copyrighted service manual in the public repository.

## Next technical milestones

1. Record verified VIN-derived build spec privately, wheelbase and bed measurements.
2. Photograph all visible components and underbody; confirm engine/transmission/axle IDs.
3. Replace provisional procedural meshes with Blender-authored, tagged GLB parts.
4. Add service references, proper hardpoints, part number ledger and procedural maintenance steps.
5. Create custom luxury/technology/ruggedness modification alternatives.

## Repository layout

- index.html — website structure
- style.css — responsive viewer and project interface
- app.js — Three.js model, components, interaction and local work log
- .github/workflows/pages.yml — automatic static publishing

The earlier W150 Atlas v0.2 download package also includes Blender scripts, exported GLB models and preview renders. Those binaries have not yet been migrated into this GitHub repository; the published web prototype currently creates its model procedurally.
