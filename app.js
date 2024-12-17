const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");
const auth = require("./middlewares/auth"); // middleware pt autentificare

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

// middlewareuri globale
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// rute publice (fara autentificare)
app.use("/api/users", usersRouter);

// rute protejate (autentificare necesara)
app.use("/api/contacts", auth, contactsRouter); // adauga autentificarea pt rutele de contacte

// ruta pentru erori 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// middleware global pentru gestionarea erorilor
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
