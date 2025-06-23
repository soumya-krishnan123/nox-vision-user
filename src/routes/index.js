const express = require('express');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/user', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
