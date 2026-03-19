const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/codes', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, title: 'Muluki Civil Code 2074', sections: 276 }
    ] 
  });
});

router.get('/codes/:id', protect, (req, res) => {
  res.json({ 
    success: true, 
    data: { id: req.params.id, title: 'Muluki Civil Code', content: 'Section 276...' }
  });
});

module.exports = router;
