const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const gadaiController = require('../controllers/gadaiController');

// All routes require authentication
router.use(authMiddleware);

// Get all gadai (with pagination and filters)
router.get('/', gadaiController.getAllGadai);

// Get summary statistics
router.get('/summary', gadaiController.getSummary);

// Get single gadai by ID
router.get('/:id', gadaiController.getGadaiById);

// Create new gadai
router.post('/', gadaiController.createGadai);

// Update gadai
router.put('/:id', gadaiController.updateGadai);

// Update gadai status
router.put('/:id/status', gadaiController.updateGadaiStatus);

// Delete gadai
router.delete('/:id', gadaiController.deleteGadai);

module.exports = router;
