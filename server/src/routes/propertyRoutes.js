const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Simple placeholder routes
router.get('/', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, plotNumber: '123', location: 'Kathmandu' }
    ] 
  });
});

router.post('/', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Property created',
    data: { id: Date.now(), ...req.body }
  });
});

router.get('/:id', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: { id: req.params.id, plotNumber: '123', location: 'Kathmandu' }
  });
});

module.exports = router;