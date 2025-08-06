#!/usr/bin/env bun

import { describe, it, expect } from "bun:test";

// Test runner for the authentication system
console.log("🧪 Running Authentication System Tests...\n");

// Import and run service tests
console.log("📋 Running UserService Tests...");
await import("./src/application/user.service.test.ts");

// Import and run controller tests
console.log("🎮 Running UserController Tests...");
await import("./src/interfaces/user.controller.test.ts");

// Import and run domain tests
console.log("🏗️  Running Domain Tests...");
await import("./src/domain/user.test.ts");

console.log("\n✅ All tests completed!");
