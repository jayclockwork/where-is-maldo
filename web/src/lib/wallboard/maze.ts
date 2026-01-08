import { createPrngFromString } from "@/lib/random/prng";

export type Maze = {
  cols: number;
  rows: number;
  // openEdge[y][x] indicates whether you can move from cell (x,y) to neighbor in that direction.
  openRight: boolean[][]; // to (x+1,y)
  openDown: boolean[][]; // to (x,y+1)
};

export type Cell = { x: number; y: number };

export function generateMaze({
  seed,
  cols,
  rows,
  extraLoopChance = 0.08,
}: {
  seed: string;
  cols: number;
  rows: number;
  extraLoopChance?: number;
}): Maze {
  const prng = createPrngFromString(seed);
  const openRight = makeBoolGrid(rows, cols, false);
  const openDown = makeBoolGrid(rows, cols, false);
  const visited = makeBoolGrid(rows, cols, false);

  // Randomized DFS spanning tree (perfect maze)…
  const stack: Cell[] = [{ x: prng.nextInt(cols), y: prng.nextInt(rows) }];
  visited[stack[0]!.y]![stack[0]!.x] = true;

  while (stack.length) {
    const cur = stack[stack.length - 1]!;
    const neighbors = unvisitedNeighbors(cur, visited, cols, rows);
    if (!neighbors.length) {
      stack.pop();
      continue;
    }
    const next = neighbors[prng.nextInt(neighbors.length)]!;
    carve(cur, next, openRight, openDown);
    visited[next.y]![next.x] = true;
    stack.push(next);
  }

  // …then add a few extra connections for Pac‑Man-like loops.
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (prng.nextFloat01() > extraLoopChance) continue;
      const options: Cell[] = [];
      if (x + 1 < cols && !openRight[y]![x]!) options.push({ x: x + 1, y });
      if (y + 1 < rows && !openDown[y]![x]!) options.push({ x, y: y + 1 });
      if (!options.length) continue;
      carve({ x, y }, options[prng.nextInt(options.length)]!, openRight, openDown);
    }
  }

  return { cols, rows, openRight, openDown };
}

export function mazeHasEdge(maze: Maze, a: Cell, b: Cell): boolean {
  if (a.x === b.x && a.y === b.y) return true;
  if (a.x === b.x && a.y + 1 === b.y) return !!maze.openDown[a.y]?.[a.x];
  if (a.x === b.x && a.y - 1 === b.y) return !!maze.openDown[b.y]?.[b.x];
  if (a.y === b.y && a.x + 1 === b.x) return !!maze.openRight[a.y]?.[a.x];
  if (a.y === b.y && a.x - 1 === b.x) return !!maze.openRight[b.y]?.[b.x];
  return false;
}

export function bfsPath(maze: Maze, start: Cell, goal: Cell): Cell[] {
  const key = (c: Cell) => `${c.x},${c.y}`;
  const q: Cell[] = [start];
  const prev = new Map<string, Cell | null>();
  prev.set(key(start), null);

  while (q.length) {
    const cur = q.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) break;
    for (const n of neighbors(cur, maze)) {
      const k = key(n);
      if (prev.has(k)) continue;
      prev.set(k, cur);
      q.push(n);
    }
  }

  if (!prev.has(key(goal))) return [start];

  const out: Cell[] = [];
  let cur: Cell | null = goal;
  while (cur) {
    out.push(cur);
    cur = prev.get(key(cur)) ?? null;
  }
  out.reverse();
  return out;
}

export function buildMazeSvgPaths({
  maze,
  width,
  height,
  padding = 10,
}: {
  maze: Maze;
  width: number;
  height: number;
  padding?: number;
}): { wallsPath: string } {
  const cellW = (width - padding * 2) / maze.cols;
  const cellH = (height - padding * 2) / maze.rows;
  const x0 = padding;
  const y0 = padding;

  // Draw walls as line segments: outer border + missing internal edges.
  const segs: string[] = [];

  // Outer border
  segs.push(`M ${x0} ${y0} H ${x0 + maze.cols * cellW}`);
  segs.push(`M ${x0} ${y0} V ${y0 + maze.rows * cellH}`);
  segs.push(`M ${x0 + maze.cols * cellW} ${y0} V ${y0 + maze.rows * cellH}`);
  segs.push(`M ${x0} ${y0 + maze.rows * cellH} H ${x0 + maze.cols * cellW}`);

  // Internal vertical walls between (x,y) and (x+1,y) if not openRight
  for (let y = 0; y < maze.rows; y++) {
    for (let x = 0; x < maze.cols - 1; x++) {
      if (maze.openRight[y]![x]!) continue;
      const xLine = x0 + (x + 1) * cellW;
      const yTop = y0 + y * cellH;
      const yBot = y0 + (y + 1) * cellH;
      segs.push(`M ${xLine} ${yTop} V ${yBot}`);
    }
  }

  // Internal horizontal walls between (x,y) and (x,y+1) if not openDown
  for (let y = 0; y < maze.rows - 1; y++) {
    for (let x = 0; x < maze.cols; x++) {
      if (maze.openDown[y]![x]!) continue;
      const yLine = y0 + (y + 1) * cellH;
      const xLeft = x0 + x * cellW;
      const xRight = x0 + (x + 1) * cellW;
      segs.push(`M ${xLeft} ${yLine} H ${xRight}`);
    }
  }

  return { wallsPath: segs.join(" ") };
}

export function cellCenter({
  maze,
  cell,
  width,
  height,
  padding = 10,
}: {
  maze: Maze;
  cell: Cell;
  width: number;
  height: number;
  padding?: number;
}): { x: number; y: number } {
  const cellW = (width - padding * 2) / maze.cols;
  const cellH = (height - padding * 2) / maze.rows;
  return {
    x: padding + (cell.x + 0.5) * cellW,
    y: padding + (cell.y + 0.5) * cellH,
  };
}

export function buildGhostLoopPath({
  maze,
  seed,
  width,
  height,
  padding = 10,
  steps = 26,
}: {
  maze: Maze;
  seed: string;
  width: number;
  height: number;
  padding?: number;
  steps?: number;
}): string {
  const prng = createPrngFromString(seed);
  const start: Cell = { x: prng.nextInt(maze.cols), y: prng.nextInt(maze.rows) };

  const walk: Cell[] = [start];
  let prev: Cell | null = null;
  let cur = start;

  for (let i = 0; i < steps; i++) {
    const opts = neighbors(cur, maze);
    // avoid immediate backtrack if possible (Pac‑Man-ish feel)
    const filtered = prev ? opts.filter((n) => !(n.x === prev!.x && n.y === prev!.y)) : opts;
    const pickFrom = filtered.length ? filtered : opts;
    const next = pickFrom[prng.nextInt(pickFrom.length)]!;
    prev = cur;
    cur = next;
    walk.push(cur);
  }

  // Close the loop by shortest path back to start.
  const back = bfsPath(maze, cur, start);
  for (let i = 1; i < back.length; i++) walk.push(back[i]!);

  // Convert cell centers to SVG path.
  const pts = walk.map((c) => cellCenter({ maze, cell: c, width, height, padding }));
  if (!pts.length) return `M ${padding} ${padding}`;
  const parts: string[] = [`M ${pts[0]!.x} ${pts[0]!.y}`];
  for (let i = 1; i < pts.length; i++) parts.push(`L ${pts[i]!.x} ${pts[i]!.y}`);
  return parts.join(" ");
}

function makeBoolGrid(rows: number, cols: number, val: boolean): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => val));
}

function unvisitedNeighbors(c: Cell, visited: boolean[][], cols: number, rows: number): Cell[] {
  const out: Cell[] = [];
  if (c.x > 0 && !visited[c.y]![c.x - 1]!) out.push({ x: c.x - 1, y: c.y });
  if (c.x + 1 < cols && !visited[c.y]![c.x + 1]!) out.push({ x: c.x + 1, y: c.y });
  if (c.y > 0 && !visited[c.y - 1]![c.x]!) out.push({ x: c.x, y: c.y - 1 });
  if (c.y + 1 < rows && !visited[c.y + 1]![c.x]!) out.push({ x: c.x, y: c.y + 1 });
  return out;
}

function carve(a: Cell, b: Cell, openRight: boolean[][], openDown: boolean[][]) {
  if (a.x + 1 === b.x && a.y === b.y) openRight[a.y]![a.x] = true;
  else if (a.x - 1 === b.x && a.y === b.y) openRight[b.y]![b.x] = true;
  else if (a.y + 1 === b.y && a.x === b.x) openDown[a.y]![a.x] = true;
  else if (a.y - 1 === b.y && a.x === b.x) openDown[b.y]![b.x] = true;
}

function neighbors(c: Cell, maze: Maze): Cell[] {
  const out: Cell[] = [];
  // left
  if (c.x > 0 && maze.openRight[c.y]?.[c.x - 1]) out.push({ x: c.x - 1, y: c.y });
  // right
  if (c.x + 1 < maze.cols && maze.openRight[c.y]?.[c.x]) out.push({ x: c.x + 1, y: c.y });
  // up
  if (c.y > 0 && maze.openDown[c.y - 1]?.[c.x]) out.push({ x: c.x, y: c.y - 1 });
  // down
  if (c.y + 1 < maze.rows && maze.openDown[c.y]?.[c.x]) out.push({ x: c.x, y: c.y + 1 });
  return out;
}

