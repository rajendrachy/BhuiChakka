const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plotNumber: {
    type: String,
    required: [true, 'Plot number (Kitta) is required'],
    unique: true
  },
  location: {
    province: { type: String, required: true },
    district: { type: String, required: true },
    municipality: { type: String, required: true },
    ward: { type: Number, required: true },
    tole: String,
    landmark: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: String
  },
  area: {
    ropani: Number,
    aana: Number,
    dam: Number,
    bigha: Number,
    katha: Number,
    dhur: Number,
    sqMeters: Number,
    sqFeet: Number
  },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of rings of coordinates
      required: true
    }
  },
  boundaryMarkers: [{
    markerId: String,
    type: { type: String, enum: ['concrete', 'stone', 'iron', 'tree'] },
    coordinates: [Number],
    photo: String,
    description: String,
    installedAt: Date
  }],
  documents: [{
    type: { type: String, enum: ['lalpurja', 'survey', 'tax', 'deed', 'other'] },
    title: String,
    fileUrl: String,
    publicId: String,
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    uploadedAt: { type: Date, default: Date.now }
  }],
  landType: {
    type: String,
    enum: ['aabadi', 'pakho', 'khet', 'bari', 'khoriya', 'other']
  },
  currentUse: String,
  hasBuilding: { type: Boolean, default: false },
  buildingDetails: {
    type: String,
    floors: Number,
    builtYear: Number
  },
  valuation: {
    assessedValue: Number,
    assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessedAt: Date
  },
  neighbors: [{
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    direction: String,
    boundaryLength: Number
  }],
  disputeHistory: [{
    disputeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute' },
    resolved: Boolean,
    resolvedAt: Date
  }],
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'disputed', 'transferred', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create geospatial index
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ 'boundaries': '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);

