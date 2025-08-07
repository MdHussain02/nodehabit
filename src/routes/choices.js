const express = require('express');
const { getProfileChoices } = require('../controllers/choiceController');

const router = express.Router();

// Public routes
router.get('/', getProfileChoices);

module.exports = router;
