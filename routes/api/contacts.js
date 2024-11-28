const express = require("express");
const router = express.Router();
const Contact = require("../../models/contacts");
const { updateStatusContact } = require("../../helpers/contactsService");

// GET /api/contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find(); // pt toate contatele
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});


// GET /api/contacts/:contactId
router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId); // contact după ID
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});


// POST /api/contacts
router.post("/", async (req, res, next) => {
  try {
    const newContact = await Contact.create(req.body); // creează contact nou
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});


// DELETE /api/contacts/:contactId
router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await Contact.findByIdAndDelete(contactId); // sterge contactul dupa ID
    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});


// PUT /api/contacts/:contactId
router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true }); // actualizează contactul
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/contacts/:contactId/favorite
router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const updatedContact = await updateStatusContact(contactId, req.body);
    res.status(200).json(updatedContact);
  } catch (error) {
    if (error.message === "missing field favorite") {
      res.status(400).json({ message: error.message });
    } else if (error.message === "Not found") {
      res.status(404).json({ message: error.message });
    } else {
      next(error);
    }
  }
});

module.exports = router;