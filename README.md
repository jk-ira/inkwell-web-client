# Inkwell client (React + Vite + Tailwind)

```bash
npm install
cp .env.example .env     # VITE_API_URL must point at the API (default http://localhost:4000/api)
npm run dev              # http://localhost:3000
```
Start the API first (`npm run dev` in social-publisher-server). Its `.env` needs `CORS_ORIGINS=*` (or `http://localhost:3000`) and `PUBLIC_APP_URL=http://localhost:3000`. Production build: `npm run build` (serve `dist/` with SPA fallback to index.html).
