const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  shareDocument,
  extractDocumentData,
  searchDocuments
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, upload.single('document'), uploadDocument)
  .get(protect, getDocuments);

router.route('/search')
  .get(protect, searchDocuments);

router.route('/:id')
  .get(protect, getDocument)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

router.route('/:id/verify')
  .put(protect, authorize('official', 'admin'), verifyDocument);

router.route('/:id/share')
  .post(protect, shareDocument);

router.route('/:id/extract')
  .post(protect, authorize('official', 'admin'), extractDocumentData);

module.exports = router;
