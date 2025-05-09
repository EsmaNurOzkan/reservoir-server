const User = require('../models/User');
const Note = require('../models/Note');

const addNote = async (req, res) => {
  const { userId  } = req.params;
  const { content } = req.body;

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "You cannot perform actions on this username." });
  }

  if (!userId || !content) {
    return res.status(400).json({ message: "User ID and content are required." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newNote = new Note({ content }); 

    user.notes.push(newNote);
    await user.save();

    res.status(201).json({ message: "Note added successfully.", note: newNote });
  } catch (error) {
    console.error("Error while adding note:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getNotes = async (req, res) => {
  const { userId } = req.params;
  
  if (req.user.id !== userId) {
    return res.status(403).json({ message: "You cannot perform actions on this username." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ notes: user.notes });
  } catch (error) {
    console.error("Error while fetching notes:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getARandomNote = async (req, res) => {
  const { userId } = req.params;
  if (req.user.id !== userId) {
    return res.status(403).json({ message: "You cannot perform actions on this username." });
  }

  try {
    const user = await User.findById(userId);

    if (!user || user.notes.length === 0) {
      return res.status(404).json({ message: "User not found or no notes available." });
    }

    const randomIndex = Math.floor(Math.random() * user.notes.length);
    const randomNote = user.notes[randomIndex];

    res.status(200).json({ note: randomNote });
  } catch (error) {
    console.error("Error while fetching random note:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  addNote,
  getNotes,
  getARandomNote
};
