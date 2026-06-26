const express = require('express');
const router = express.Router();
const publicGadaiController = require('../controllers/publicGadaiController');

// Public routes (no auth required)

// Create public gadai submission
router.post('/', publicGadaiController.createPublicGadai);

// Track gadai by phone
router.get('/track', publicGadaiController.trackGadai);

// Get single gadai detail (public)
router.get('/:id', publicGadaiController.getPublicGadaiDetail);

module.exports = router;
