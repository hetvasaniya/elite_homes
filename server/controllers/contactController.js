const ContactForm = require('../models/ContactForm');

// POST /api/contact
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'Name, email, and message are required.' });

    const entry = await ContactForm.create({ name, email, subject, message });
    res.status(201).json({ message: 'Your message has been sent successfully!', entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
