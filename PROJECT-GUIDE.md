# OWASP Portfolio — Code Guide

This guide explains the project structure and the safest places to edit it.

## How the site works

```text
Browser
  └── app/layout.tsx        Global HTML wrapper, fonts, and page metadata
       └── app/page.tsx     Content, state, interactions, and page structure
            └── app/globals.css  Colors, layout, responsive design, and animation
```

The site is data-driven. OWASP content lives in the `categories` array near the
top of `app/page.tsx`. The same data automatically creates:

- the progress totals;
- the highlighted field-note cards;
- the complete searchable index;
- the side panel containing the explanation, checklist, cheat sheet, and labs.

This means you normally add content without rebuilding the visual layout.

## Files you will edit most

### `app/page.tsx`

This is the main application file. It contains:

1. `Lab` and `Category` types — the required shape of the content.
2. `categories` — all ten OWASP records.
3. React state — search, filters, open panel, and copied feedback.
4. JSX sections — header, hero, field notes, index, labs, footer, and details panel.

### `app/globals.css`

This controls the appearance. Start with the variables at the top:

```css
:root {
  --ink: #070b14;
  --paper: #f4f0e6;
  --lime: #c8ff3d;
  --cyan: #58e1ff;
}
```

Changing those variables updates the main color system across the site.

The media queries at the bottom control tablet and mobile layouts.

### `app/layout.tsx`

This contains global fonts and metadata. Change the `title` and `description`
here when you want different text in the browser tab or link previews.

## Add a new lab link

Find the correct category in `app/page.tsx`, then add an object inside `labs`:

```ts
labs: [
  {
    name: "My SSRF lab write-up",
    source: "Hack The Box",
    href: "https://github.com/your-name/your-write-up",
  },
],
```

Do not use a placeholder URL for a recruiter-facing project. Link to your real
write-up or leave the category as `Planned`.

## Mark a category as documented

After completing the practical notes and evidence, change:

```ts
status: "Planned",
```

to:

```ts
status: "Documented",
```

The progress card and filters will update automatically.

## Update a cheat sheet

Every category contains a template string:

```ts
cheatSheet: `command one
command two`,
```

Keep it concise. Store longer methodologies in the linked GitHub write-up.

## Run the project locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then open the local address printed in the terminal.

## Build and deploy

The repository is designed for Cloudflare Workers:

```bash
npm run build
npx wrangler deploy
```

In Cloudflare's Git build settings, use the same two commands as the build and
deploy commands. Every push to the production branch can then publish a new
version automatically.
