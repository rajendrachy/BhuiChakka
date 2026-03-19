const Dispute = require('../models/Dispute');
const Property = require('../models/Property');
const User = require('../models/User');
const sendSMS = require('../utils/sendSMS');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new dispute
// @route   POST /api/disputes
const createDispute = async (req, res) => {
  try {
    const { propertyId, respondentId, disputeType, description } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if dispute already exists for this property
    const existingDispute = await Dispute.findOne({
      property: propertyId,
      status: 'active'
    });

    if (existingDispute) {
      return res.status(400).json({
        success: false,
        message: 'An active dispute already exists for this property'
      });
    }

    // Create dispute
    const dispute = await Dispute.create({
      property: propertyId,
      complainant: {
        user: req.user.id,
        role: 'owner',
        statement: description
      },
      respondent: {
        user: respondentId,
        role: 'neighbor'
      },
      disputeType,
      description,
      timeline: [{
        phase: 'filing',
        action: 'Dispute filed',
        performedBy: req.user.id,
        notes: description
      }]
    });

    // Update property status
    property.status = 'disputed';
    property.disputeHistory.push({
      disputeId: dispute._id,
      resolved: false
    });
    await property.save();

    // Notify respondent
    const respondent = await User.findById(respondentId);
    if (respondent) {
      await sendSMS({
        to: respondent.phone,
        message: `A dispute has been filed against your property. Login to Bhuichakka to view details. Case #: ${dispute.caseNumber}`
      });

      await sendEmail({
        email: respondent.email,
        subject: 'Dispute Filed - Bhuichakka',
        message: `A dispute has been filed against your property. Case Number: ${dispute.caseNumber}`
      });
    }

    // Emit socket event
    req.app.get('io').emit(`dispute-${dispute._id}`, {
      type: 'DISPUTE_CREATED',
      message: 'New dispute filed',
      data: dispute
    });

    res.status(201).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all disputes for user
// @route   GET /api/disputes
const getDisputes = async (req, res) => {
  try {
    const query = {};

    // Filter based on user role
    if (req.user.role === 'owner') {
      query.$or = [
        { 'complainant.user': req.user.id },
        { 'respondent.user': req.user.id }
      ];
    } else if (req.user.role === 'mediator') {
      query['mediation.mediator'] = req.user.id;
    } else if (req.user.role === 'surveyor') {
      query['survey.surveyor'] = req.user.id;
    }

    // Add query filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.disputeType) {
      query.disputeType = req.query.disputeType;
    }
    if (req.query.resolutionPath) {
      query.resolutionPath = req.query.resolutionPath;
    }

    const disputes = await Dispute.find(query)
      .populate('complainant.user', 'name phone')
      .populate('respondent.user', 'name phone')
      .populate('property', 'plotNumber location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single dispute
// @route   GET /api/disputes/:id
const getDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('complainant.user', 'name email phone address')
      .populate('respondent.user', 'name email phone address')
      .populate('property')
      .populate('mediation.mediator', 'name phone')
      .populate('survey.surveyor', 'name phone')
      .populate('timeline.performedBy', 'name role');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    res.status(200).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createDispute,
  getDisputes,
  getDispute
};