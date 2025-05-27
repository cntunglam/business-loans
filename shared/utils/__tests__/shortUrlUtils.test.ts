import assert from "node:assert";
import { describe, it } from "node:test";
import { generateShortCode, isPathAllowed, ShortUrlType, validateApiPath } from "../shortUrlUtils";

describe("shortUrlUtils", () => {
  describe("generateShortCode", () => {
    it("should generate redirect codes with correct length", () => {
      const code = generateShortCode("REDIRECT");
      assert.match(code, /^[A-Za-z0-9]{8}$/);
    });

    it("should generate API access codes with correct length", () => {
      const code = generateShortCode("API_ACCESS");
      assert.match(code, /^[A-Za-z0-9]{32}$/);
    });

    it("should generate unique codes", () => {
      const codes = new Set();
      for (let i = 0; i < 1000; i++) {
        codes.add(generateShortCode("REDIRECT"));
      }
      // All codes should be unique
      assert.strictEqual(codes.size, 1000);
    });

    it("should only use allowed characters", () => {
      const types: ShortUrlType[] = ["REDIRECT", "API_ACCESS"];
      types.forEach((type) => {
        const code = generateShortCode(type);
        assert.match(code, /^[A-Za-z0-9]+$/);
      });
    });
  });

  describe("validateApiPath", () => {
    it("should validate correct API paths", () => {
      const validPaths = ["/api", "/api/v1/loans", "/api/v1/*", "/api/v2/users/profile", "/health"];

      validPaths.forEach((path) => {
        assert.strictEqual(validateApiPath(path), true);
      });
    });

    it("should reject invalid API paths", () => {
      const invalidPaths = [
        "", // empty string
        "api/v1/loans", // missing leading slash
        "/api/v1/loans/", // trailing slash
        "/api//v1", // double slash
        "/api/v1/loans?id=1", // query parameters
        "/api/v1/loans#hash", // hash
        "/api/v1/@special", // special characters
        "../api/v1/loans", // path traversal
      ];

      invalidPaths.forEach((path) => {
        assert.strictEqual(validateApiPath(path), false);
      });
    });
  });

  describe("isPathAllowed", () => {
    const allowedPaths = ["/api/v1/*", "/api/v2/loans", "/health"];

    it("should allow exact matches", () => {
      assert.strictEqual(isPathAllowed("/api/v2/loans", allowedPaths), true);
      assert.strictEqual(isPathAllowed("/health", allowedPaths), true);
    });

    it("should allow wildcard matches", () => {
      assert.strictEqual(isPathAllowed("/api/v1/loans", allowedPaths), true);
      assert.strictEqual(isPathAllowed("/api/v1/users", allowedPaths), true);
      assert.strictEqual(isPathAllowed("/api/v1/anything", allowedPaths), true);
    });

    it("should reject non-matching paths", () => {
      assert.strictEqual(isPathAllowed("/api/v2/users", allowedPaths), false);
      assert.strictEqual(isPathAllowed("/api/v3/loans", allowedPaths), false);
      assert.strictEqual(isPathAllowed("/unknown", allowedPaths), false);
    });

    it("should handle empty allowed paths", () => {
      assert.strictEqual(isPathAllowed("/api/v1/test", []), false);
    });
  });
});
