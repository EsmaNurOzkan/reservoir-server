const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const AuthenticateToken = require('../middleware/AuthenticateToken');

router.post('/:userId/add', AuthenticateToken, noteController.addNote);

router.get('/:userId', AuthenticateToken, noteController.getNotes);

router.get('/:userId/random', AuthenticateToken, noteController.getARandomNote);

module.exports = router;
