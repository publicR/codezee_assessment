function methodNotAllowed(allowed) {
  return function methodNotAllowedHandler(req, res) {
    res.set("Allow", allowed);
    res.status(405).json({ message: "Method not allowed" });
  };
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function statusCodeFrom(err) {
  const status = Number(err.statusCode || err.status);

  if (Number.isInteger(status) && status >= 400 && status < 600) {
    return status;
  }

  if (err instanceof URIError) {
    return 400;
  }

  return 500;
}

function messageFrom(err, status) {
  if (err.type === "entity.parse.failed") {
    return "Invalid JSON";
  }

  if (err.type === "entity.too.large") {
    return "Request body is too large";
  }

  if (err.type === "charset.unsupported" || err.type === "encoding.unsupported") {
    return "Unsupported character encoding";
  }

  if (err instanceof URIError) {
    return "Invalid request URL";
  }

  if (status >= 500 || err.expose === false) {
    return "Internal server error";
  }

  if (typeof err.message === "string" && err.message.trim().length > 0) {
    return err.message;
  }

  return "Request failed";
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = statusCodeFrom(err);

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message: messageFrom(err, status) });
}

module.exports = {
  errorHandler,
  methodNotAllowed,
  notFoundHandler,
};
