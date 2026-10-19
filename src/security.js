const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const MAX_USERS = 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    xFrameOptions: { action: "deny" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  });
}

function createRateLimiter(limit) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    handler(req, res) {
      res.status(429).json({
        message: "Too many requests, please try again later",
      });
    },
  });
}

const apiLimiter = createRateLimiter(100);
const createUserLimiter = createRateLimiter(10);

function verifyJsonBody(req, res, buffer) {
  const text = buffer.toString("utf8").trim();

  if (text.length === 0) {
    return;
  }

  let dangerous = false;

  try {
    JSON.parse(text, (key, value) => {
      if (DANGEROUS_KEYS.has(key)) {
        dangerous = true;
        return undefined;
      }

      return value;
    });
  } catch {
    return;
  }

  if (!dangerous) {
    return;
  }

  const error = new Error("Invalid input");
  error.status = 400;
  error.statusCode = 400;
  error.expose = true;
  error.type = "dangerous.key";
  throw error;
}

function applyServerTimeouts(server) {
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
}

module.exports = {
  MAX_USERS,
  apiLimiter,
  applyServerTimeouts,
  createUserLimiter,
  securityHeaders,
  verifyJsonBody,
};
