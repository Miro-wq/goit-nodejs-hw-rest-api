const Contact = require("../models/contacts");

const updateStatusContact = async (contactId, body) => {
  const { favorite } = body;

  if (favorite === undefined) {
    throw new Error("missing field favorite");
  }

  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    { favorite },
    { new: true }
  );

  if (!updatedContact) {
    throw new Error("Not found");
  }

  return updatedContact;
};

module.exports = {
  updateStatusContact,
};
