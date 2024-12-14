const express = require("express");
const { isValidObjectId } = require("mongoose"); // pt validare ID
const Contact = require("../../models/contacts"); // model Contact
const auth = require("../../middlewares/auth"); // middleware pt autentificare

const router = express.Router();

// GET /api/contacts - obtine toate contactele utilizatorului curent
router.get("/", auth, async (req, res, next) => {
  try {
    const { _id: owner } = req.user; // ID utilizator autentificat
    const contacts = await Contact.find({ owner }); // filtrează contactele dupa owner
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:contactId - obtine un contact după ID
router.get("/:contactId", auth, async (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID" });
  }

  try {
    const { _id: owner } = req.user;
    const contact = await Contact.findOne({ _id: contactId, owner }); // filtreaza contactul dupa owner
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - creeaza un contact nou
router.post("/", auth, async (req, res, next) => {
  try {
    const { _id: owner } = req.user; // ID utilizator autentificat
    const newContact = await Contact.create({ ...req.body, owner }); // adauga owner la contact
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:contactId - sterge un contact dupa ID
router.delete("/:contactId", auth, async (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID" });
  }

  try {
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndDelete({ _id: contactId, owner }); // filtreaza contactul dupa owner
    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:contactId - actualizeaza un contact după ID
router.put("/:contactId", auth, async (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID" });
  }

  try {
    const { _id: owner } = req.user;
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner }, // filtreaza contactul dupa owner
      req.body,
      { new: true } // return contact actualizat
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
