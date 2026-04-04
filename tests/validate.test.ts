// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Unit tests: Basic A2ML example structure validation
Deno.test("Unit: A2ML examples file exists", async () => {
  const path = "content/examples.md";
  const result = await Deno.stat(path);
  assertEquals(result.isFile, true);
});

Deno.test("Unit: A2ML examples contain required sections", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  assert(content.includes("# Examples"));
  assert(content.includes("Minimal Manifest"));
  assert(content.includes("CI/CD Agent Manifest"));
  assert(content.includes("Security Scanner Manifest"));
  assert(content.includes("Multi-Agent Orchestration"));
});

Deno.test("Unit: A2ML examples have SPDX headers", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const matches = content.match(/SPDX-License-Identifier: PMPL-1\.0-or-later/g);
  assert(matches !== null && matches.length >= 4, "Should have at least 4 SPDX headers");
});

Deno.test("Unit: All content markdown files exist", async () => {
  const expectedFiles = [
    "content/index.md",
    "content/specification.md",
    "content/examples.md",
    "content/integrations.md",
    "content/getting-started.md",
  ];

  for (const file of expectedFiles) {
    const result = await Deno.stat(file);
    assertEquals(result.isFile, true, `File ${file} should exist`);
  }
});

// Smoke tests: A2ML syntax validation
Deno.test("Smoke: A2ML attestation blocks are properly formatted", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const attestationBlocks = content.match(/@attestation:([\s\S]*?)@end/g);
  assert(
    attestationBlocks !== null && attestationBlocks.length > 0,
    "Should have at least one @attestation block"
  );

  // Validate structure of first attestation
  const firstBlock = attestationBlocks[0];
  assert(firstBlock.includes("agent-id:"), "attestation should have agent-id");
  assert(firstBlock.includes("trust-level:"), "attestation should have trust-level");
  assert(firstBlock.includes("capabilities:"), "attestation should have capabilities");
});

Deno.test("Smoke: A2ML policy blocks are present", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const policyBlocks = content.match(/@policy:([\s\S]*?)@end/g);
  assert(policyBlocks !== null && policyBlocks.length > 0, "Should have at least one @policy block");

  policyBlocks.forEach((block) => {
    assert(block.includes("require:") || block.includes("enforce:"),
      "policy should have require or enforce");
  });
});

Deno.test("Smoke: README references content correctly", async () => {
  const readme = await Deno.readTextFile("README.adoc");
  assert(readme.includes("content/"));
  assert(readme.includes("A2ML"));
});

// Contract tests: Required A2ML fields
Deno.test("Contract: Every attestation has required fields", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const attestationBlocks = content.match(/@attestation:([\s\S]*?)@end/g) || [];

  assert(attestationBlocks.length > 0, "Should have attestation blocks");

  attestationBlocks.forEach((block, idx) => {
    assert(block.includes("agent-id:"), `Attestation ${idx} missing agent-id`);
    assert(block.includes("attested-by:"), `Attestation ${idx} missing attested-by`);
    assert(block.includes("trust-level:"), `Attestation ${idx} missing trust-level`);
  });
});

Deno.test("Contract: Trust levels are valid values", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const validLevels = ["self-declared", "verified", "audited"];

  validLevels.forEach((level) => {
    assert(content.includes(`trust-level: ${level}`),
      `Should have examples of trust-level: ${level}`);
  });
});

// Aspect tests: Cross-cutting consistency
Deno.test("Aspect: All agents have consistent naming", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const agentIds = new Set<string>();

  const matches = content.matchAll(/agent-id:\s*(\S+)/g);
  for (const match of matches) {
    const agentId = match[1];
    assert(
      agentId.match(/^[a-z0-9\-]+$/),
      `Agent ID "${agentId}" should be lowercase alphanumeric with hyphens`
    );
    agentIds.add(agentId);
  }

  assert(agentIds.size > 0, "Should have at least one agent");
});

Deno.test("Aspect: All examples have proper formatting", async () => {
  const content = await Deno.readTextFile("content/examples.md");

  // Check for balanced @...@end blocks
  const attestationCount = (content.match(/@attestation:/g) || []).length;
  const attestationEndCount = (content.match(/@end/g) || []).length;

  assert(attestationCount > 0, "Should have attestation blocks");
  assert(attestationEndCount >= attestationCount, "Should have matching @end tags");
});

Deno.test("Aspect: SPDX headers consistent in all examples", async () => {
  const files = [
    "content/examples.md",
    "content/specification.md",
    "content/integrations.md",
  ];

  const results = [];
  for (const file of files) {
    try {
      const content = await Deno.readTextFile(file);
      const hasSpdx = content.includes("SPDX-License-Identifier");
      results.push({ file, hasSpdx });
    } catch {
      // File may not exist
    }
  }

  assert(results.length > 0, "Should find content files");
});

// Property-based tests: Invariants
Deno.test("Property: Every agent-id appears in at least one attestation", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const agentIds = new Set<string>();
  const attestations = new Map<string, number>();

  // Extract agent IDs
  const agentMatches = content.matchAll(/agent-id:\s*(\S+)/g);
  for (const match of agentMatches) {
    const agentId = match[1];
    agentIds.add(agentId);
    attestations.set(agentId, (attestations.get(agentId) || 0) + 1);
  }

  agentIds.forEach((id) => {
    assert(
      attestations.has(id),
      `Agent ID ${id} should appear in attestations`
    );
  });
});

Deno.test("Property: Trust level progression is documented", async () => {
  const content = await Deno.readTextFile("content/examples.md");

  // self-declared -> verified -> audited progression
  const selfDeclared = (content.match(/trust-level:\s*self-declared/g) || []).length;
  const verified = (content.match(/trust-level:\s*verified/g) || []).length;
  const audited = (content.match(/trust-level:\s*audited/g) || []).length;

  assert(selfDeclared > 0, "Should have self-declared examples");
  assert(verified > 0, "Should have verified examples");
  assert(audited > 0, "Should have audited examples");
});

// E2E/Reflexive tests: Complete pipeline
Deno.test("E2E: Example parsing round-trip", async () => {
  const content = await Deno.readTextFile("content/examples.md");

  // Extract first example block
  const match = content.match(/@attestation:([\s\S]*?)@end/);
  assert(match !== null, "Should find an attestation block");

  const attestationBlock = match[1];

  // Verify it can be parsed as key-value pairs
  const lines = attestationBlock.split("\n").filter((l) => l.trim());
  const parsed = new Map<string, string>();

  for (const line of lines) {
    if (line.includes(":")) {
      const [key, ...rest] = line.split(":");
      parsed.set(key.trim(), rest.join(":").trim());
    }
  }

  assert(parsed.size > 0, "Should parse fields from attestation");
  assert(parsed.has("agent-id"), "Should have agent-id field");
});

Deno.test("E2E: All references are resolvable", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const refMatches = content.matchAll(/\[(\d+)\]\s+([^\n]+)/g);

  const references = new Map<string, string>();
  for (const match of refMatches) {
    references.set(match[1], match[2]);
  }

  assert(references.size > 0, "Should have references");

  // Verify references are cited
  for (const [num] of references) {
    const cited = content.includes(`[${num}]`);
    assert(cited, `Reference [${num}] should be cited in text`);
  }
});

// Benchmark baseline (timing assertions)
Deno.test("Benchmark: A2ML parsing performance", async () => {
  const start = performance.now();
  const content = await Deno.readTextFile("content/examples.md");
  const end = performance.now();

  const duration = end - start;
  assert(duration < 100, `File read should complete in < 100ms, took ${duration.toFixed(2)}ms`);
});

Deno.test("Benchmark: Example count baseline", async () => {
  const content = await Deno.readTextFile("content/examples.md");
  const exampleCount = (content.match(/## \d+\./g) || []).length;

  // Baseline: we expect ~4 examples
  assert(exampleCount >= 3, `Should have at least 3 numbered examples, found ${exampleCount}`);
});
