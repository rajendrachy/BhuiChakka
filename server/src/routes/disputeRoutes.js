const express = require('express');
const router = express.Router();
const {
  createDispute,
  getDisputes,
  getDispute,
  updateDispute,
  addEvidence,
  scheduleMediation,
  scheduleSurvey,
  updateResolutionPath,
  getDisputeTimeline
} = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, createDispute)
  .get(protect, getDisputes);

router.route('/:id')
  .get(protect, getDispute)
  .put(protect, updateDispute);

router.route('/:id/evidence')
  .post(protect, upload.array('evidence', 10), addEvidence);

router.route('/:id/mediation')
  .post(protect, authorize('mediator', 'admin'), scheduleMediation);

router.route('/:id/survey')
  .post(protect, authorize('surveyor', 'admin'), scheduleSurvey);

router.route('/:id/resolution-path')
  .put(protect, updateResolutionPath);

router.route('/:id/timeline')
  .get(protect, getDisputeTimeline);

module.exports = router;
