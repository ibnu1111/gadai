require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make prisma available in all routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
const gadaiRoutes = require('./routes/gadaiRoutes');
const publicGadaiRoutes = require('./routes/publicGadaiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/gadai', gadaiRoutes);
app.use('/api/public/gadai', publicGadaiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gadai Service running on port ${PORT}`);
});

module.exports = app;
