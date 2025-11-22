const express = require('express');
const router = express.Router();
const { submitLostItem, submitFoundItem } = require('../controllers/itemController');

// POST http://localhost:5000/api/items/lost
router.post('/lost', submitLostItem);

// POST http://localhost:5000/api/items/found
router.post('/found', submitFoundItem);

module.exports = router;