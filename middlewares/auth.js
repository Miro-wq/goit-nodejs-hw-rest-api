const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const { SECRET_KEY } = process.env;

const auth = async (req, res, next) => {
  const { authorization = "" } = req.headers; // extrage antetul Authorization
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // decodifica token
    const { id } = jwt.verify(token, SECRET_KEY);

    // gaseste utilizatorul in baza de date
    const user = await User.findById(id);
    if (!user || !user.token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // adauga utilizatorul în req pentru a fi utilizat în rutele protejate
    req.user = user;
    next(); // Permite accesul la ruta
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = auth;
