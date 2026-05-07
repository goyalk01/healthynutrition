import { promises as fs } from "node:fs";
import { statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

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
    normalized.endsWith(".ts") &&
    !normalized.endsWith(".d.ts") &&
    !normalized.endsWith(".test.ts")
  );
};

const resolveImport = (fromFile, importPath) => {
  if (!importPath.startsWith(".")) {
    return null;
  }

  const base = path.resolve(path.dirname(fromFile), importPath);
  const candidates = [
    `${base}.ts`,
    `${base}/index.ts`,
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
      const resolved = resolveImport(file, match[1]);
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
  const state = new Map(); // 0 unvisited, 1 visiting, 2 done
  const stack = [];

  const dfs = (node) => {
    state.set(node, 1);
    stack.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      const neighborState = state.get(neighbor) ?? 0;
      if (neighborState === 0) {
        dfs(neighbor);
      } else if (neighborState === 1) {
        const cycleStart = stack.indexOf(neighbor);
        if (cycleStart >= 0) {
          cycles.push([...stack.slice(cycleStart), neighbor]);
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
  const allFiles = (await walk(SRC_DIR)).filter(isSourceFile);
  const graph = await buildGraph(allFiles);
  const cycles = findCycles(graph);

  if (cycles.length > 0) {
    fail(
      "Circular dependencies detected",
      cycles.map((cycle) =>
        cycle
          .map((value) => path.relative(ROOT, value))
          .join(" -> "),
      ),
    );
  }

  const serviceFiles = allFiles.filter((file) =>
    normalize(file).includes("/modules/") && normalize(file).endsWith(".service.ts"),
  );

  const prismaLeakage = [];
  for (const file of serviceFiles) {
    const text = await readText(file);
    if (text.includes("prisma.")) {
      prismaLeakage.push(path.relative(ROOT, file));
    }
  }
  if (prismaLeakage.length > 0) {
    fail("Prisma leakage found in services", prismaLeakage);
  }

  const hardcodedEnums = [];
  const schemaFiles = allFiles.filter((file) =>
    normalize(file).includes("/modules/") && normalize(file).endsWith(".schema.ts"),
  );
  for (const file of schemaFiles) {
    const text = await readText(file);
    if (/z\.enum\(\[/.test(text)) {
      hardcodedEnums.push(path.relative(ROOT, file));
    }
  }
  if (hardcodedEnums.length > 0) {
    fail("Hardcoded enum values found in schemas", hardcodedEnums);
  }

  const duplicatedJsonParsers = [];
  for (const file of allFiles) {
    if (normalize(file).endsWith("/utils/json.ts")) {
      continue;
    }
    const text = await readText(file);
    if (
      /(?:const|function)\s+parseJsonArray\b/.test(text) ||
      /(?:const|function)\s+parseJsonRecord\b/.test(text)
    ) {
      duplicatedJsonParsers.push(path.relative(ROOT, file));
    }
  }
  if (duplicatedJsonParsers.length > 0) {
    fail("Duplicated JSON parser logic found", duplicatedJsonParsers);
  }

  const hardcodedRateLimits = [];
  const routeFiles = allFiles.filter((file) =>
    normalize(file).includes("/modules/") && normalize(file).endsWith(".routes.ts"),
  );
  for (const file of routeFiles) {
    const text = await readText(file);
    if (/rateLimit\s*:\s*\{[\s\S]*max\s*:\s*\d+/m.test(text)) {
      hardcodedRateLimits.push(path.relative(ROOT, file));
    }
  }
  if (hardcodedRateLimits.length > 0) {
    fail("Hardcoded rate-limit values found in routes", hardcodedRateLimits);
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log("✅ Architecture checks passed (backend)");
};

main().catch((error) => {
  console.error("Architecture check failed unexpectedly:", error);
  process.exit(1);
});
