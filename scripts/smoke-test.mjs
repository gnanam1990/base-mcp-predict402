import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../lib/project-data.json", import.meta.url), "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(data.name === "Predict402", "project name should match");
assert(data.metrics.length === 3, "dashboard should expose three metrics");
assert(data.workflow.length === 4, "agent flow should expose four steps");
assert(data.tools.length >= 4, "MCP tool list should be present");
assert(data.records.length >= 3, "record table should include sample rows");

console.log(`${data.name} smoke checks passed`);
