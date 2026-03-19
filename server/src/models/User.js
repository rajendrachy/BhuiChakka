const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^9[0-9]{9}$/, 'Please provide a valid Nepali phone number']
  },
  citizenshipNumber: {
    type: String,
    required: [true, 'Citizenship number is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['owner', 'surveyor', 'lawyer', 'mediator', 'official', 'admin'],
    default: 'owner'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: String,
  address: {
    province: String,
    district: String,
    municipality: String,
    ward: Number,
    tole: String
  },
  professionalDetails: {
    licenseNumber: String,
    licenseDocument: String,
    experience: Number,
    specialization: [String],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  },
  savedProfessionals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{
    type: { type: String },
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


