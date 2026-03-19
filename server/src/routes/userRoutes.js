const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Simple placeholder routes
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', protect, (req, res) => {
  res.json({ success: true, message: 'Profile updated' });
});

router.get('/professionals', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'Surveyor 1', type: 'surveyor' },
      { id: 2, name: 'Lawyer 1', type: 'lawyer' }
    ] 
  });
});

module.exports = router;
