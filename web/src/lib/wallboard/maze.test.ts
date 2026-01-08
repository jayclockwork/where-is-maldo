import { describe, expect, it } from "vitest";

import { buildGhostLoopPath, generateMaze } from "@/lib/wallboard/maze";

describe("maze", () => {
  it("is deterministic for a given seed", () => {
    const a = generateMaze({ seed: "sess1:phase1", cols: 9, rows: 7 });
    const b = generateMaze({ seed: "sess1:phase1", cols: 9, rows: 7 });
    expect(a).toEqual(b);
  });

  it("builds a non-empty loop path deterministically", () => {
    const maze = generateMaze({ seed: "sess1:phase1", cols: 9, rows: 7 });
    const p1 = buildGhostLoopPath({ maze, seed: "p1:0", width: 300, height: 220 });
    const p2 = buildGhostLoopPath({ maze, seed: "p1:0", width: 300, height: 220 });
    expect(p1).toBe(p2);
    expect(p1.startsWith("M ")).toBe(true);
    expect(p1.includes("L ")).toBe(true);
  });
});

