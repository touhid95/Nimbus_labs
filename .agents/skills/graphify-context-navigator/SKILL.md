---
name: graphify-context-navigator
description: "Use for reading, understanding, and navigating codebases using persistent Graphify context (knowledge graphs, god nodes, community detection, and architectural relationships). Enables fast, clear code comprehension by querying the pre-computed graph in graphify-out/ rather than parsing raw files blindly."
---

# Graphify Context Navigator

A structured skill for rapid codebase comprehension, architectural navigation, and contextual code reading powered by **Graphify**.

Instead of manually grepping through unfamiliar files or reading thousands of raw lines, this skill treats the persistent knowledge graph in `graphify-out/` as the primary ground-truth index. It surfaces god nodes (core abstractions), community clusters (subsystems), and inferred data flows so you can comprehend any codebase in minutes.

---

## 1. When to Use This Skill

Activate this workflow whenever:
- You need to understand how a component, function, or system operates.
- You need to trace how data or events flow between different files.
- You are debugging a cross-cutting bug across multiple layers.
- You are onboarding into a new or modified repository.
- `graphify-out/` exists in the workspace.

---

## 2. Core Principles: Context-First Code Reading

1. **Never read raw code blind**: Always consult `graphify-out/GRAPH_REPORT.md` first to understand the high-level architecture, god nodes, and community boundaries.
2. **Prioritize God Nodes**: The 5-10 nodes with the highest degree centrality represent the foundational pillars of the project. Understand these before touching leaf files.
3. **Trace Communities**: Communities group related files and functions into logical domains (e.g. Parallax Engine, Sticky Kinetic Rail, PWA Service Worker). Keep changes scoped within their natural community boundaries.
4. **Leverage the Honest Audit Trail**: Graphify marks relationships as `EXTRACTED` (syntax-proven) or `INFERRED` (semantic deduction). Always verify `INFERRED` links in the source code before making refactoring decisions.

---

## 3. Standard Workflows

### Workflow 1: Instant Architecture Scan (Under 60 Seconds)

Before modifying any file, perform this 3-step scan:

```bash
# 1. Read the high-level summary, god nodes, and communities
view_file "graphify-out/GRAPH_REPORT.md"
```

Look for:
- **God Nodes**: What are the top 5 most connected abstractions?
- **Communities**: What are the distinct functional subsystems?
- **Knowledge Gaps**: Are there isolated nodes that might be missing edges?

---

### Workflow 2: Targeted Querying & Path Finding

When answering specific questions about the codebase:

```bash
# Breadth-first traversal for broad contextual overview
graphify query "How does user scroll trigger chapter transitions?"

# Depth-first traversal to trace a specific execution chain
graphify query "Trace how parallax layers animate" --dfs

# Find the shortest architectural connection between two modules
graphify path "hero-wrapper" "dapper-section"

# Plain-language explanation of a complex node or abstraction
graphify explain "updateDapperSticky"
```

---

### Workflow 3: Keeping the Context Graph Updated

When code changes are made, keep the persistent Graphify context fresh:

```powershell
# Incremental update: extracts only modified/new files and updates graph.json
python -m graphify --update

# Re-run community clustering after significant additions
python -m graphify --cluster-only

# Generate interactive visualization
python -m graphify --no-viz   # or omit --no-viz to update graph.html
```

---

## 4. Key Graph Artifacts Reference

All contextual memory is saved in `graphify-out/`:

| Artifact | Purpose | How to Use |
| :--- | :--- | :--- |
| `graphify-out/GRAPH_REPORT.md` | Human-readable architectural report | Read first for quick mental models, god nodes, and community clusters. |
| `graphify-out/graph.json` | GraphRAG-ready node and edge data | Parse or query for programmatic symbol dependency analysis. |
| `graphify-out/graph.html` | Interactive 2D/3D visual canvas | Open in browser to visually explore the codebase topology. |
| `graphify-out/manifest.json` | File hashes and extraction cache | Used by `--update` for instant incremental graph builds. |
| `graphify-out/obsidian/` | Markdown knowledge vault | Interlinked wiki notes for Obsidian or agent-crawlable knowledge bases. |

---

## 5. Repository Subsystem Reference (AI Labs by Nimbus)

For this specific codebase, Graphify clusters the architecture into 4 primary communities:

1. **Scenery Parallax Engine**:
   - `index.html` (`#hero`, 18 scenery layers `hero-01` through `hero-10`, `hero-cloud[1-8]`).
   - `script.js` (`render()`, `mountainLayers`, `cloudLayers`, normalized scroll progress).
   - `style.css` (Rule of Thirds mobile anchoring, Golden Ratio typography scale).
2. **Dapper Kinetic Snap-Scroll Engine**:
   - `index.html` (`#dapper`, `#dapper-header-rail`, `#dapper-caption-wrapper`).
   - `dapper.css` (Exclusion blend mode, difference background layers, JetBrains Mono HUD caption).
   - `script.js` (`updateDapperSticky()`, chapter caption transitions, video autoplay).
3. **PWA & Local Server Runtime**:
   - `sw.js` (Cache-first/Network-first PWA caching strategy with versioned cache names).
   - `manifest.webmanifest` (Standalone PWA manifest, theme colors, maskable icons).
   - `server.js` (Zero-dependency Node.js HTTP server supporting `process.env.PORT`).
4. **Containerization & CI**:
   - `Dockerfile` (Production alpine container with non-root security and health checks).
   - `docker-compose.yml` (Single-command deployment: `docker-compose up -d`).
