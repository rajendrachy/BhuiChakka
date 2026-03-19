const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    unique: true,
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  complainant: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'buyer', 'other'] },
    statement: String
  },
  respondent: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'neighbor', 'other'] },
    statement: String
  },
  disputeType: {
    type: String,
    enum: ['boundary', 'encroachment', 'inheritance', 'ownership', 'easement', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: { type: String, enum: ['document', 'photo', 'video', 'witness'] },
    title: String,
    fileUrl: String,
    description: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  witnesses: [{
    name: String,
    phone: String,
    address: String,
    statement: String,
    recordedAt: Date
  }],
  resolutionPath: {
    type: String,
    enum: ['negotiation', 'mediation', 'administrative', 'judicial_committee', 'court'],
    default: 'negotiation'
  },
  currentPhase: {
    type: String,
    enum: ['filing', 'evidence', 'negotiation', 'mediation', 'survey', 'hearing', 'decision', 'appeal'],
    default: 'filing'
  },
  timeline: [{
    phase: String,
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    documents: [String],
    date: { type: Date, default: Date.now }
  }],
  mediation: {
    mediator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessions: [{
      date: Date,
      duration: Number,
      notes: String,
      outcome: String,
      nextSession: Date
    }],
    agreement: String,
    status: { type: String, enum: ['pending', 'ongoing', 'success', 'failed'] }
  },
  survey: {
    surveyor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestDate: Date,
    scheduledDate: Date,
    completedDate: Date,
    report: String,
    findings: String,
    mapUrl: String,
    status: { type: String, enum: ['requested', 'scheduled', 'completed', 'disputed'] }
  },
  judicialCommittee: {
    caseNumber: String,
    filedDate: Date,
    hearings: [{
      date: Date,
      notes: String,
      outcome: String
    }],
    decision: String,
    decisionDate: Date,
    orderUrl: String
  },
  court: {
    caseNumber: String,
    courtName: String,
    judge: String,
    filedDate: Date,
    hearings: [{
      date: Date,
      notes: String,
      outcome: String
    }],
    judgment: String,
    judgmentDate: Date,
    orderUrl: String,
    appealDeadline: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'dismissed', 'appealed'],
    default: 'active'
  },
  resolution: {
    type: { type: String, enum: ['agreement', 'mediation', 'survey', 'judgment'] },
    details: String,
    documentUrl: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  deadline: Date,
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Generate case number before saving
disputeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Dispute').countDocuments();
    this.caseNumber = `BHC/${year}/${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);

