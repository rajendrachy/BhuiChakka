const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'Ram Surveyor', type: 'surveyor', rating: 4.5 },
      { id: 2, name: 'Shyam Lawyer', type: 'lawyer', rating: 4.8 }
    ] 
  });
});

router.get('/:id', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: { id: req.params.id, name: 'Ram Surveyor', type: 'surveyor' }
  });
});

module.exports = router;