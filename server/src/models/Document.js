const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'lalpurja',
      'survey_map',
      'tax_receipt',
      'citizenship',
      'deed',
      'court_order',
      'agreement',
      'other'
    ],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileSize: Number,
  mimeType: String,
  pages: Number,
  language: {
    type: String,
    enum: ['nepali', 'english', 'both'],
    default: 'nepali'
  },
  description: String,
  tags: [String],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: String,
  
  // OCR Data
  ocrText: String,
  ocrConfidence: Number,
  extractedData: {
    plotNumber: String,
    ownerName: String,
    area: String,
    date: Date,
    registrationNumber: String
  },
  
  // Access Control
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'download'], default: 'view' },
    sharedAt: { type: Date, default: Date.now }
  }],
  
  // Blockchain
  blockchainHash: String,
  blockchainTimestamp: Date,
  
  // Expiry
  expiryDate: Date,
  isExpired: {
    type: Boolean,
    default: false
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, {
  timestamps: true
});

// Index for search
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ 'extractedData.plotNumber': 1 });

module.exports = mongoose.model('Document', documentSchema);

