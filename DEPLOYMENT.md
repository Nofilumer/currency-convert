Deployment notes for Vercel

1) Overview
- The repository contains an Angular client at `client/converter-app` and lightweight serverless proxies under `server/vercel/api`.
- The Vercel configuration at the repository root builds the Angular app and routes `/api/*` to server functions.

2) Environment variables
- Set `FREECURRENCY_API_KEY` in the Vercel project settings (Environment Variables). This key is used by the serverless proxy functions to call freecurrencyapi.

3) How Vercel builds
- Vercel will use the top-level `vercel.json` to:
  - Build the Angular app using the `client/converter-app/package.json` build script.
  - Serve the client static files from the `dist/converter-app` folder.
  - Map `/api/currencies` -> `server/be-app/vercel/api/currencies.js`
  - Map `/api/currencies/latest` -> `server/be-app/vercel/api/latest.js`

4) Quick deploy steps
- Commit and push your branch to GitHub.
- In Vercel, import the repository and choose the `main` branch.
- Add the `FREECURRENCY_API_KEY` environment variable.
- Deploy.

5) Local testing
- You can test the serverless functions locally with `vercel dev` (requires Vercel CLI) from the repository root.
- Alternatively run the Angular dev server:
  cd client/converter-app
  npm start

6) Notes
- The server folder contains a NestJS server for local development (`server/be-app`), but for Vercel we use the lightweight `server/vercel/api` functions to avoid bundling a full Nest app as serverless (simpler and faster cold starts).
- If you prefer deploying the Nest app as a separate service (e.g., on Vercel Server, Render, or Heroku), update the client API base URLs to point at that service.
