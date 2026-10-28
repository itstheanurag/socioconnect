#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_PORTS = [3000, 8000, 8010, 3002];
const ports = process.argv.slice(2).map(Number).filter(Number.isFinite);
const targetPorts = ports.length > 0 ? ports : DEFAULT_PORTS;

function listenerPids(port: number): number[] {
  try {
    if (process.platform === "linux") {
      const output = execFileSync("ss", ["-ltnp"], { encoding: "utf8" });
      return output
        .split("\n")
        .filter((line) => line.includes(`:${port} `))
        .flatMap((line) => [...line.matchAll(/pid=(\d+)/g)].map((match) => Number(match[1])));
    }

    if (process.platform === "darwin") {
      const output = execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" });
      return output
        .split("\n")
        .map(Number)
        .filter((pid) => Number.isFinite(pid) && pid > 0);
    }
  } catch {
    // No listener, or the platform tool is unavailable.
  }

  return [];
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const pids = new Set<number>();
for (const port of targetPorts) {
  for (const pid of listenerPids(port)) {
    if (pid !== process.pid) pids.add(pid);
  }
}

if (pids.size === 0) {
  console.log(`No listeners on ports ${targetPorts.join(", ")}.`);
} else {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
      console.log(`Stopped pid ${pid} on a dev port.`);
    } catch (err) {
      console.warn(`Could not stop pid ${pid}:`, err instanceof Error ? err.message : err);
    }
  }

  await sleep(500);

  for (const pid of pids) {
    if (!isAlive(pid)) continue;
    try {
      process.kill(pid, "SIGKILL");
      console.log(`Force-killed pid ${pid}.`);
    } catch {
      // Already exited.
    }
  }
}

const turboBin = join(process.cwd(), "node_modules", ".bin", "turbo");
if (existsSync(turboBin)) {
  try {
    execFileSync(turboBin, ["daemon", "stop"], { stdio: "ignore" });
    console.log("Stopped the Turbo daemon.");
  } catch {
    // Daemon was not running.
  }
}
