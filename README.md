# ScopeDeals — Static Site

This repository contains a simple static site for ScopeDeals. Use these instructions to preview changes locally or deploy the site to Vercel.

## Preview Locally

There are multiple ways to preview the project locally. From within the project root directory, use one of these approaches.

Option A — Python (no additional install required on macOS if Python3 is present):

```bash
# From the repository root
python3 -m http.server 3000
# Open http://localhost:3000 in your browser
```

Option B — Node + npx http-server (recommended when Node is available):

```bash
# From the repository root
npm install
npm start
# Open http://localhost:3000
```

Option C — Node + live-server (auto reloads on file changes):

```bash
# From the repository root
npm install
npm run live
# Open http://localhost:3000
```

## Deploy to Vercel

This repository already contains `vercel.json`. To deploy to Vercel:

1. Install Vercel CLI (optional, global):

```bash
npm i -g vercel
# or
npm install --save-dev vercel
```

2. Deploy using the CLI:

```bash
# One-time login
vercel login
# Deploy
vercel
```

3. Or connect the repository through vercel.com and choose the `main` branch for automatic preview/deploys.

## Notes

- This is a static site and doesn't require a build step. `npm install` will install `http-server` and `live-server` as dev deps for local preview if you use `npm start` or `npm run live`.

- If you want continuous development or modern tooling (ES modules, bundling, HMR), consider adding a small toolchain using Vite, Parcel, or a similar bundler.

## Troubleshooting

- If you see a blank page when serving from a local static server, check that the server root is the repository root and `index.html` is present.
- If assets (images or videos) don't load, ensure `assets/` directory exists and files are accessible.

---

Happy developing! If you'd like I can add a Vite dev setup (ESNext, hot reload, dev server) or a GitHub Action for previews.