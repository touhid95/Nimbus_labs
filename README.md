# AI Labs by Nimbus

> **Frontier Artificial Intelligence & Autonomous Systems**  
> Hyper-scalable deep learning systems, multi-agent coordination architectures, and responsive kinetic web experiences.

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Graphify](https://img.shields.io/badge/Graphify-Context%20Graph-blueviolet?style=flat)](https://github.com/)

---

## 🚀 Quick Start with Docker (Recommended)

Run the entire application in a lightweight, production-hardened Alpine container:

```bash
# Clone the repository
git clone https://github.com/<your-username>/ai-labs-nimbus.git
cd ai-labs-nimbus

# Build and run with Docker Compose
docker-compose up -d
```

Access the application in your browser at:
👉 **`http://localhost:3000/`**

### Alternative: Direct Docker CLI

```bash
# Build image
docker build -t ai-labs-nimbus .

# Run container
docker run -d -p 3000:3000 --name ai-labs-nimbus ai-labs-nimbus
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
