import { promises as fs } from "node:fs";
import { statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SOURCE_ROOTS = [
  "app",
  "components",
  "features",
  "shared",
  "store",
  "hooks",
  "lib",
  "config",
];

const normalize = (value) => value.replace(/\\/g, "/");

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(absolute);
      }
      return [absolute];
    }),
  );

  return files.flat();
};

const readText = async (filePath) => fs.readFile(filePath, "utf8");

const isSourceFile = (filePath) => {
  const normalized = normalize(filePath);
  return (
    (normalized.endsWith(".ts") || normalized.endsWith(".tsx")) &&
    !normalized.endsWith(".d.ts")
  );
};

const resolveAliasedImport = (importPath) => {
  if (!importPath.startsWith("@/")) {
    return null;
  }

  const absolute = path.join(ROOT, importPath.slice(2));
  const candidates = [
    `${absolute}.ts`,
    `${absolute}.tsx`,
    `${absolute}/index.ts`,
    `${absolute}/index.tsx`,
  ];

  for (const candidate of candidates) {
    try {
      const stats = statSync(candidate);
      if (stats.isFile()) {
        return candidate;
      }
    } catch {
      // noop
    }
  }
  return null;
};

const resolveRelativeImport = (fromFile, importPath) => {
  if (!importPath.startsWith(".")) {
    return null;
  }

  const absolute = path.resolve(path.dirname(fromFile), importPath);
  const candidates = [
    `${absolute}.ts`,
    `${absolute}.tsx`,
    `${absolute}/index.ts`,
    `${absolute}/index.tsx`,
  ];

  for (const candidate of candidates) {
    try {
      const stats = statSync(candidate);
      if (stats.isFile()) {
        return candidate;
      }
    } catch {
      // noop
    }
  }
  return null;
};

const buildGraph = async (files) => {
  const graph = new Map();
  const importRegex =
    /(?:import\s+[^"']*from\s+|import\s*\(\s*|export\s+[^"']*from\s+)["']([^"']+)["']/g;

  for (const file of files) {
    const text = await readText(file);
    const edges = new Set();
    for (const match of text.matchAll(importRegex)) {
      const importPath = match[1];
      const resolved =
        resolveRelativeImport(file, importPath) ??
        resolveAliasedImport(importPath);
      if (resolved) {
        edges.add(normalize(resolved));
      }
    }
    graph.set(normalize(file), [...edges]);
  }

  return graph;
};

const findCycles = (graph) => {
  const cycles = [];
  const state = new Map();
  const stack = [];

  const dfs = (node) => {
    state.set(node, 1);
    stack.push(node);

    for (const next of graph.get(node) ?? []) {
      const nextState = state.get(next) ?? 0;
      if (nextState === 0) {
        dfs(next);
      } else if (nextState === 1) {
        const start = stack.indexOf(next);
        if (start >= 0) {
          cycles.push([...stack.slice(start), next]);
        }
      }
    }

    stack.pop();
    state.set(node, 2);
  };

  for (const node of graph.keys()) {
    if ((state.get(node) ?? 0) === 0) {
      dfs(node);
    }
  }

  const unique = new Set();
  return cycles.filter((cycle) => {
    const key = cycle.join("->");
    if (unique.has(key)) {
      return false;
    }
    unique.add(key);
    return true;
  });
};

const fail = (title, items) => {
  console.error(`\n❌ ${title}`);
  for (const item of items) {
    console.error(`  - ${item}`);
  }
  process.exitCode = 1;
};

const main = async () => {
  const roots = SOURCE_ROOTS.map((value) => path.join(ROOT, value));
  const existingRoots = [];
  for (const root of roots) {
    try {
      const stats = statSync(root);
      if (stats.isDirectory()) {
        existingRoots.push(root);
      }
    } catch {
      // noop
    }
  }

  const files = (
    await Promise.all(existingRoots.map((root) => walk(root)))
  ).flat().filter(isSourceFile);

  const graph = await buildGraph(files);
  const cycles = findCycles(graph);
  if (cycles.length > 0) {
    fail(
      "Circular dependencies detected",
      cycles.map((cycle) => cycle.map((item) => path.relative(ROOT, item)).join(" -> ")),
    );
  }

  const forbiddenAxiosImports = [];
  for (const file of files) {
    const relative = normalize(path.relative(ROOT, file));
    const allowed =
      relative === "shared/api/client.ts" || relative === "lib/axios.ts" || relative === "shared/api/mockApi.ts" || relative === "shared/api/response.ts";
    const text = await readText(file);
    if (!allowed && /from\s+["']axios["']/.test(text)) {
      forbiddenAxiosImports.push(relative);
    }
  }
  if (forbiddenAxiosImports.length > 0) {
    fail("Direct axios imports found outside shared API client", forbiddenAxiosImports);
  }

  const hardcodedApiUrls = [];
  for (const file of files) {
    const relative = normalize(path.relative(ROOT, file));
    if (relative === "config/app.ts" || relative === "shared/api/client.ts") {
      continue;
    }
    const text = await readText(file);
    if (/https?:\/\/localhost:8080|NEXT_PUBLIC_API_URL/.test(text)) {
      hardcodedApiUrls.push(relative);
    }
  }
  if (hardcodedApiUrls.length > 0) {
    fail("Hardcoded API URL logic found outside config", hardcodedApiUrls);
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log("✅ Architecture checks passed (frontend)");
};

main().catch((error) => {
  console.error("Architecture check failed unexpectedly:", error);
  process.exit(1);
});
