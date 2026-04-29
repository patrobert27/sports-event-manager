const express = require('express');
const fieldController = require('../controllers/fieldController');

const router = express.Router();

// Public GET llista dels camps
router.get('/', fieldController.list);

module.exports = router;
