const Property = require('../models/Property');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Create new property
// @route   POST /api/properties
const createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user.id
    };

    // Calculate area in different units
    if (propertyData.area.sqMeters) {
      // Convert to Nepali units
      const sqMeters = propertyData.area.sqMeters;
      propertyData.area.ropani = sqMeters * 0.001987; // Approx conversion
      propertyData.area.bigha = sqMeters * 0.000747; // Approx conversion
    }

    const property = await Property.create(propertyData);

    // Send notification to user
    req.app.get('io').emit(`user-${req.user.id}`, {
      type: 'PROPERTY_CREATED',
      message: 'Property registered successfully',
      propertyId: property._id
    });

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all properties for user
// @route   GET /api/properties
const getProperties = async (req, res) => {
  try {
    const query = {};

    // Filter by role
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
    } else if (req.user.role === 'official') {
      // Officials can see properties in their district
      query['location.district'] = req.user.address.district;
    }

    // Add search filters
    if (req.query.plotNumber) {
      query.plotNumber = new RegExp(req.query.plotNumber, 'i');
    }

    if (req.query.district) {
      query['location.district'] = req.query.district;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('neighbors.propertyId', 'plotNumber location');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check authorization
    if (property.owner.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this property'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty
};