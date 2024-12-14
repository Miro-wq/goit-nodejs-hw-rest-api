const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const auth = require("../../middlewares/auth"); // middleware pt autentificare
const User = require("../../models/user"); // modelul User
require("dotenv").config();

const router = express.Router();

const { SECRET_KEY } = process.env; // cheie pt JWT

// validare cu Joi
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// GET /users/current - obtine datele pt utilizatorul curent
router.get("/current", auth, async (req, res, next) => {
  try {
    const { email, subscription } = req.user; // obtine datele pt utilizatorul autentificat
    res.status(200).json({ email, subscription }); // return răspuns de succes
  } catch (error) {
    next(error);
  }
});

// POST /users/signup
router.post("/signup", async (req, res, next) => {
  try {
    // valid body
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // verifică dacă emailul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    // criptare parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // creare utilizator nou
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    // raspuns de succes
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /users/login
router.post("/login", async (req, res, next) => {
  try {
    // validare body
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // gaseste utilizatorul după email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // verifica parola
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // creează tokenul JWT
    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

    // salveaza token in baza de date
    user.token = token;
    await user.save();

    // raspuns de succes
    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /users/logout
router.post("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user; // utilizator autentificat

    // sterge token
    await User.findByIdAndUpdate(_id, { token: null });

    res.status(204).json(); // raspuns logout reușit
  } catch (error) {
    next(error);
  }
});

module.exports = router;
