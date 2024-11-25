const express = require("express");
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const Joi = require("joi");

const router = express.Router();

// path pt contacts.json
const contactsPath = path.join(__dirname, "../../models/contacts.json");

// pt citirea contacts.json
const readContacts = async () => {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
};

// pt scriere în contacts.json
const writeContacts = async (contacts) => {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
};

// joi pt validarea contactului
const contactSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]+$/).required(),
});

// GET /api/contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await readContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:contactId
router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await readContacts();
    const contact = contacts.find((c) => c.id === contactId);
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
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, phone } = req.body;
  try {
    const contacts = await readContacts();
    const newContact = { id: uuidv4(), name, email, phone };
    contacts.push(newContact);
    await writeContacts(contacts);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:contactId
router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await readContacts();
    const index = contacts.findIndex((c) => c.id === contactId);
    if (index === -1) {
      return res.status(404).json({ message: "Not found" });
    }
    contacts.splice(index, 1);
    await writeContacts(contacts);
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:contactId
router.put("/:contactId", async (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { contactId } = req.params;
  const { name, email, phone } = req.body;
  try {
    const contacts = await readContacts();
    const contactIndex = contacts.findIndex((c) => c.id === contactId);
    if (contactIndex === -1) {
      return res.status(404).json({ message: "Not found" });
    }
    const updatedContact = { ...contacts[contactIndex], name, email, phone };
    contacts[contactIndex] = updatedContact;
    await writeContacts(contacts);
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
