const express = require('express');
const activityController = require('../controllers/activityController');

const router = express.Router();

// Public GET llista de les activitats
router.get('/', activityController.list);

module.exports = router;
