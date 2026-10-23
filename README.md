# AI Labs by Nimbus

> **Frontier Artificial Intelligence & Autonomous Systems**  
> Hyper-scalable deep learning systems, multi-agent coordination architectures, and responsive kinetic web experiences.

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Graphify](https://img.shields.io/badge/Graphify-Context%20Graph-blueviolet?style=flat)](https://github.com/)

---

## 🐳 Running with Docker

The image runs as the non-root `node` user, installs production dependencies with
`npm ci --omit=dev`, and listens on `0.0.0.0:3000`.

```powershell
# 1. Create your environment file (never commit it)
Copy-Item .env.example .env

# 2. Fill in ADMIN_PASSWORD, SESSION_SECRET, and any Cloudinary values
notepad .env

# 3. Build and start
docker compose up -d --build

# 4. Follow the logs
docker compose logs -f
```

Open **`http://localhost:3000/`**. The CMS lives at `http://localhost:3000/login`
and redirects to `/cms` after authentication.

- `data/` is bind-mounted to `/app/data`, so `site-content.json`, drafts, and
  backups survive `docker compose restart` / `down`.
- `assets/explore/explore-data.js` is regenerated from the CMS content every time
  the container starts; it does not need to be committed or copied in.
- The session cookie is only marked `Secure` when the request is HTTPS (directly
  or via `X-Forwarded-Proto`), so login still works on `http://localhost`.
- Stop the stack with `docker compose down` (add `-v` only if you intentionally
  want to drop named volumes; the bind-mounted `data/` folder is untouched).

> On a Linux host the bind-mounted `data/` directory must be writable by UID
> 1000 (`sudo chown -R 1000:1000 data`). Docker Desktop on Windows/macOS handles
> this automatically.

### Alternative: Direct Docker CLI

```bash
docker build -t ai-labs-nimbus .
docker run -d -p 3000:3000 --env-file .env -v "%cd%/data:/app/data" --name ai-labs-nimbus ai-labs-nimbus
```

---

## 💻 Local Development (Node.js)

The application uses zero external runtime dependencies:

```bash
# Start local server
npm start
# or: node server.js
```

---

## 🧠 Codebase Architecture & Graphify Knowledge Graph

This repository is integrated with **Graphify** for persistent architectural intelligence and rapid comprehension.

All contextual graphs, community clusters, and god nodes are persisted in `graphify-out/`:

- **`graphify-out/GRAPH_REPORT.md`**: Human-readable architecture report detailing core abstractions and dependency cycles.
- **`graphify-out/graph.json`**: GraphRAG-ready node and edge graph.
- **`graphify-out/graph.html`**: Interactive 2D/3D visual graph explorer.

### Using the Graphify Context Navigator Skill

An Antigravity pair-programming skill is included under `.agents/skills/graphify-context-navigator/`:

```bash
# Trace execution or query architecture using Graphify BFS
graphify query "How does user scroll trigger chapter transitions?"

# Update graph incrementally when code changes
python -m graphify --update
```

---

## 📦 Container Specifications

- **Base Image**: `node:20-alpine` (minimal attack surface, ~50MB)
- **User**: Runs as non-root `node` user
- **Health Check**: Automated periodic `wget` spider check on `http://localhost:3000/`
- **Environment**: Supports dynamic `PORT` via `process.env.PORT`

---

## 📄 License

MIT © AI Labs by Nimbus

## Environment variables

- `ADMIN_PASSWORD` — required for CMS login. Use a long random string.
- `SESSION_SECRET` — required to sign session cookies. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET` — required for direct Cloudinary uploads in the CMS Media tab.
- `PORT`, `NODE_ENV`, `SITE_ORIGIN` — optional (see `.env.example`).
