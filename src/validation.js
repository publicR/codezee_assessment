const NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const USER_ID_PATTERN = /^[1-9]\d*$/;
const ALLOWED_USER_FIELDS = ["name", "email"];

function validateUserId(id) {
  if (typeof id !== "string" || !USER_ID_PATTERN.test(id)) {
    return {
      valid: false,
      message: "User id must be a positive integer",
    };
  }

  const value = Number(id);

  if (!Number.isSafeInteger(value)) {
    return {
      valid: false,
      message: "User id is out of range",
    };
  }

  return { valid: true, value };
}

function validateName(name, errors) {
  if (name === undefined || name === null) {
    errors.push({ field: "name", message: "Name is required" });
    return;
  }

  if (typeof name !== "string") {
    errors.push({ field: "name", message: "Name must be a string" });
    return;
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    errors.push({ field: "name", message: "Name cannot be empty" });
    return;
  }

  if (trimmed.length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters",
    });
    return;
  }

  if (trimmed.length > 50) {
    errors.push({
      field: "name",
      message: "Name must be at most 50 characters",
    });
    return;
  }

  if (!NAME_PATTERN.test(trimmed)) {
    errors.push({
      field: "name",
      message: "Name contains invalid characters",
    });
    return;
  }

  return trimmed;
}

function validateEmail(email, errors) {
  if (email === undefined || email === null) {
    errors.push({ field: "email", message: "Email is required" });
    return;
  }

  if (typeof email !== "string") {
    errors.push({ field: "email", message: "Email must be a string" });
    return;
  }

  const normalized = email.trim().toLowerCase();

  if (normalized.length === 0) {
    errors.push({ field: "email", message: "Email cannot be empty" });
    return;
  }

  if (normalized.length > 254 || normalized.includes("..") || !EMAIL_PATTERN.test(normalized)) {
    errors.push({ field: "email", message: "Email is invalid" });
    return;
  }

  return normalized;
}

function validateCreateUser(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: [{ field: "body", message: "Request body must be a JSON object" }],
    };
  }

  const errors = [];

  for (const field of Object.keys(body)) {
    if (!ALLOWED_USER_FIELDS.includes(field)) {
      errors.push({ field, message: "Unknown field" });
    }
  }

  const name = validateName(body.name, errors);
  const email = validateEmail(body.email, errors);

  if (errors.length > 0 || name === undefined || email === undefined) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: { name, email },
  };
}

module.exports = {
  validateUserId,
  validateCreateUser,
};
