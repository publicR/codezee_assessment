const express = require("express");

const app = express();

app.use(express.json());

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
  const user = users.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
