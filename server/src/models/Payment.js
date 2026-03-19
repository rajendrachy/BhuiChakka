const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NPR'
  },
  paymentType: {
    type: String,
    enum: [
      'survey_fee',
      'mediation_fee',
      'consultation_fee',
      'document_verification',
      'subscription',
      'other'
    ],
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  transactionId: String,
  pidx: String, // Khalti payment ID
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: {
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    disputeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  },
  paymentMethod: {
    type: String,
    enum: ['khalti', 'esewa', 'bank', 'cash'],
    default: 'khalti'
  },
  paidAt: Date,
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
