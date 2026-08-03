import * as fs from "fs";

export default async function globalSetup() {
  fs.mkdirSync("playwright/results", { recursive: true });
  fs.writeFileSync("playwright/results/rounding-drift.jsonl", "");
}
