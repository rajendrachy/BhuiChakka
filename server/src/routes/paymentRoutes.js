const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/initiate', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payment initiated',
    paymentUrl: 'https://khalti.com/payment/123'
  });
});

router.post('/verify', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payment verified',
    data: { transactionId: 'TXN' + Date.now() }
  });
});

router.get('/history', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, amount: 1000, status: 'completed' }
    ] 
  });
});

module.exports = router;
