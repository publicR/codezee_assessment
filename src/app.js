const express = require("express");
const { errorHandler, methodNotAllowed, notFoundHandler } = require("./errorHandler");
const { validateCreateUser, validateUserId } = require("./validation");

const app = express();

app.use(express.json({ limit: "10kb" }));

const users = [
  { id: 1, name: "Rahul", email: "rahul@example.com" },
];

app.get("/", (req, res) => {
  res.json({ message: "Codzee Assessment API" });
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const parsedId = validateUserId(req.params.id);

  if (!parsedId.valid) {
    return res.status(400).json({
      message: "Invalid input",
      errors: [{ field: "id", message: parsedId.message }],
    });
  }

  const user = users.find((item) => item.id === parsedId.value);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

app.post("/users", (req, res) => {
  const result = validateCreateUser(req.body);

  if (!result.valid) {
    return res.status(400).json({
      message: "Invalid input",
      errors: result.errors,
    });
  }

  const emailTaken = users.some((item) => item.email === result.value.email);

  if (emailTaken) {
    return res.status(409).json({
      message: "Invalid input",
      errors: [{ field: "email", message: "Email is already in use" }],
    });
  }

  const nextId = users.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const user = { id: nextId, name: result.value.name, email: result.value.email };

  users.push(user);
  res.status(201).json(user);
});

app.all("/", methodNotAllowed("GET"));
app.all("/users", methodNotAllowed("GET, POST"));
app.all("/users/:id", methodNotAllowed("GET"));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
