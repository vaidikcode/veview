---
name: ui-skills-root
description: Route UI work through ui-skills CLI. Use before implementing motion, transitions, visual polish, or redesigns.
---

# UI Skills

Run `npx ui-skills start` to load routing context.

## CLI

```bash
npx ui-skills start
npx ui-skills categories
npx ui-skills list --category motion
npx ui-skills get jakubantalik/transitions-dev
```

## Veview conventions

- Modal motion: `styles/transitions.css` + `components/ui/dialog.tsx` (transitions.dev pattern)
- Theme: white editorial minimal — bone surfaces, charcoal text, 1px borders
- Motion: CSS-only; respect `prefers-reduced-motion`
