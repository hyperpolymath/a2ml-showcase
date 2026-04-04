# CRG Grade C Test Coverage

**Repository:** a2ml-showcase  
**Grade:** C  
**Last Updated:** 2026-04-04

## Overview

This repository contains A2ML showcase examples and documentation. As a data/showcase repository with no executable code, tests focus on:
- Valid A2ML example structure
- Consistency of formatting
- Completeness of required fields
- Documentation accuracy

## Test Categories

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| Unit Tests | 4 | ✓ PASS | File existence, structure, SPDX headers, content files |
| Smoke Tests | 3 | ✓ PASS | A2ML syntax, attestation blocks, policy blocks |
| Contract Tests | 2 | ✓ PASS | Required A2ML fields, valid trust levels |
| Aspect Tests | 3 | ✓ PASS | Agent naming, formatting consistency, SPDX consistency |
| Property-Based Tests | 2 | ✓ PASS | Agent-id declarations, trust level progression |
| E2E/Reflexive Tests | 2 | ✓ PASS | Attestation parsing, reference resolution |
| Benchmarks | 2 | ✓ PASS | File read performance, example count baseline |

**Total Test Count:** 18  
**All Tests Passing:** Yes

## Running Tests

```bash
deno test tests/validate.test.ts
```

## Test Details

### Unit Tests (4)
- Validates all required example files exist
- Checks for SPDX license headers in examples
- Verifies content structure has expected sections
- Confirms markdown files are readable

### Smoke Tests (3)
- Verifies @attestation blocks are syntactically valid
- Checks @policy blocks are present and formatted
- Validates README cross-references

### Contract Tests (2)
- Every attestation must have: agent-id, attested-by, trust-level
- Trust levels must be one of: self-declared, verified, audited

### Aspect Tests (3)
- Agent IDs follow naming convention (lowercase-alphanumeric-hyphens)
- @attestation/@end blocks are balanced
- SPDX headers are consistent across documentation

### Property-Based Tests (2)
- Every declared agent-id must appear in at least one attestation
- Documentation includes all three trust level progression stages

### E2E/Reflexive Tests (2)
- A2ML attestation blocks can be parsed into key-value pairs
- All numbered references [1], [2], etc. are cited in text

### Benchmarks (2)
- File read operations complete in < 100ms
- Contains expected number of documented examples (≥ 3)

## Dependencies

- Deno 1.40+
- deno_std (assert module)

## Future Enhancements

- [ ] Add schema validation against formal A2ML grammar
- [ ] Validate agent capabilities against registry
- [ ] Check timestamp formats (RFC3339)
- [ ] Verify signature formats
