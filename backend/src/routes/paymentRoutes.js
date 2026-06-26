const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(authMiddleware);

// Process payment
router.post('/', paymentController.processPayment);

// Extend gadai
router.post('/extend', paymentController.extendGadai);

// Get payment history
router.get('/history/:gadaiId', paymentController.getPaymentHistory);

module.exports = router;
