# Graph Report - first script  (2026-10-13)

## Corpus Check
- 26 files · ~62,491 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 26 nodes · 26 edges · 6 communities (3 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Dapper Kinetic Orchestration
- Local Runtime Server
- Scenery Parallax Engine
- Curtain Preloader
- Research Content Grid

## God Nodes (most connected - your core abstractions)
1. `activateDapper()` - 4 edges
2. `updateDapperKinetic()` - 3 edges
3. `render()` - 3 edges
4. `#hero (18-Layer Scenery)` - 3 edges
5. `updateDapperSlide()` - 2 edges
6. `hero-cloud[1-8].png` - 2 edges
7. `hero-[01-10].png` - 2 edges
8. `http` - 1 edges
9. `fs` - 1 edges
10. `path` - 1 edges

## Surprising Connections (you probably didn't know these)
- `render()` --animates_drift--> `hero-cloud[1-8].png`  [INFERRED]
  script.js → assets/hero-cloud1.png
- `render()` --animates_parallax--> `hero-[01-10].png`  [INFERRED]
  script.js → assets/hero-01.png
- `activateDapper()` --activates_overlay--> `#dapper-fullscreen`  [EXTRACTED]
  combined.js → index.html
- `updateDapperKinetic()` --translates_kinetic_rail--> `#dapper-snap-container (4 Slides)`  [EXTRACTED]
  combined.js → index.html
- `#hero (18-Layer Scenery)` --renders_layers--> `hero-cloud[1-8].png`  [EXTRACTED]
  index.html → assets/hero-cloud1.png

## Import Cycles
- None detected.

## Communities (6 total, 2 thin omitted)

### Community 0 - "Dapper Kinetic Orchestration"
Cohesion: 0.32
Nodes (6): activateDapper(), updateDapperKinetic(), updateDapperSlide(), #dapper-fullscreen, #dapper-trigger-sentinel, #dapper-snap-container (4 Slides)

### Community 2 - "Local Runtime Server"
Cohesion: 0.33
Nodes (5): fs, http, MIME_TYPES, path, server

### Community 3 - "Scenery Parallax Engine"
Cohesion: 0.67
Nodes (4): hero-cloud[1-8].png, hero-[01-10].png, #hero (18-Layer Scenery), render()

## Knowledge Gaps
- **10 isolated node(s):** `http`, `fs`, `path`, `MIME_TYPES`, `server` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 15 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `#hero (18-Layer Scenery)` connect `Scenery Parallax Engine` to `Application Shell & Styles`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `render()` (e.g. with `hero-cloud[1-8].png` and `hero-[01-10].png`) actually correct?**
  _`render()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `http`, `fs`, `path` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._