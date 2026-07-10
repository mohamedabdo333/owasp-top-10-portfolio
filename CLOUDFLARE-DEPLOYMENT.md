# Cloudflare deployment

Connect this repository from **Workers & Pages** and use:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Production branch: `main`

The project includes `wrangler.jsonc`, and the Vite build generates the deployment configuration consumed by Wrangler.

Do not upload `node_modules`, `.next`, `dist`, or `.wrangler` to GitHub.
