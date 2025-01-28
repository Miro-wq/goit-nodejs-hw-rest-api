const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const auth = require("../../middlewares/auth"); // middleware pt autentificare
const upload = require("../../middlewares/upload"); // middleware pt upload
const fs = require("fs/promises");
const User = require("../../models/user"); // modelul User
require("dotenv").config();
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../../helpers/sendEmail");

const router = express.Router();

const avatarsDir = path.join(__dirname, "../../public/avatars");

const { SECRET_KEY } = process.env; // cheie pt JWT

// validare cu Joi
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// validare cu Joi pt actualizare subscriere
const subscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

// pt validare body
const resendEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});


// GET /users/verify/:verificationToken
router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationToken = undefined ;
    user.verify = true;
    await user.save({validateBeforeSave: false});

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});


// PATCH /users/subscription
router.patch("/", auth, async (req, res, next) => {
  try {
    const { error } = subscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { _id } = req.user; // ID utilizator autentificat
    const { subscription } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true } // return utilizator actualizat
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    next(error);
  }
});


// PATCH /users/avatars
router.patch("/avatars", auth, upload.single("avatar"), async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { path: tempPath, originalname } = req.file;

    // nume unic pentru avatar
    const filename = `${_id}-${Date.now()}-${originalname}`;
    const resultPath = path.join(avatarsDir, filename);

    // jimp
    const image = await Jimp.read(tempPath);
    await image.resize(250, 250).writeAsync(resultPath);
    await fs.unlink(tempPath);

    const avatarURL = `/avatars/${filename}`;
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({ avatarURL });
  } catch (error) {
    next(error);
  }
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

    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4(); // token unic

    // creare utilizator nou
    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken, // token de verificare
    });

    // trimite email de verificare
    const verificationLink = `http://localhost:3000/api/users/verify/${verificationToken}`;
    const emailContent = {
      to: email,
      subject: "Please verify your email",
      html: `<p>Welcome! Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`,
    };

    await sendEmail(emailContent);

    // raspuns de succes
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
});


// POST /users/verify
router.post("/verify", async (req, res, next) => {
  try {
    const { error } = resendEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const { email } = req.body;

    // verifica utilizatorul dupa email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // verifica daca utilizatorul este deja verificat
    if (user.verify) {
      return res.status(400).json({ message: "Verification has already been passed" });
    }

    // trimite email de verificare
    const verificationLink = `http://localhost:3000/api/users/verify/${user.verificationToken}`;
    const emailContent = {
      to: email,
      subject: "Verify your email - Resend",
      html: `<p>We noticed you haven't verified your email yet. Please verify it by clicking <a href="${verificationLink}">here</a>.</p>`,
    };

    // trimite email
    await sendEmail(emailContent);

    res.status(200).json({ message: "Verification email sent" });
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
