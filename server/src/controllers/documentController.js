const Document = require('../models/Document');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const Tesseract = require('tesseract.js');
const PDFParser = require('pdf-parse');

// @desc    Upload document
// @route   POST /api/documents
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'bhuichakka/documents',
      resource_type: 'auto',
      tags: ['document', req.body.documentType]
    });

    // Create document record
    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      documentType: req.body.documentType,
      owner: req.user.id,
      property: req.body.propertyId,
      dispute: req.body.disputeId,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileSize: result.bytes,
      mimeType: result.format,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      uploadedBy: req.user.id,
      language: req.body.language || 'nepali'
    });

    // Start OCR processing in background
    if (req.body.extractData === 'true') {
      processOCR(document._id, result.secure_url);
    }

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const query = {};

    // Filter by user
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    // Additional filters
    if (req.query.propertyId) {
      query.property = req.query.propertyId;
    }
    if (req.query.disputeId) {
      query.dispute = req.query.disputeId;
    }
    if (req.query.documentType) {
      query.documentType = req.query.documentType;
    }
    if (req.query.isVerified) {
      query.isVerified = req.query.isVerified === 'true';
    }

    const documents = await Document.find(query)
      .populate('owner', 'name')
      .populate('property', 'plotNumber')
      .populate('dispute', 'caseNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('property', 'plotNumber location')
      .populate('dispute', 'caseNumber')
      .populate('verifiedBy', 'name')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    const hasAccess = 
      document.owner._id.toString() === req.user.id ||
      document.sharedWith.some(s => s.user._id.toString() === req.user.id) ||
      ['admin', 'official'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this document'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify document
// @route   PUT /api/documents/:id/verify
const verifyDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.isVerified = true;
    document.verifiedBy = req.user.id;
    document.verifiedAt = Date.now();
    document.verificationNotes = req.body.notes;

    await document.save();

    // Notify owner
    req.app.get('io').emit(`user-${document.owner}`, {
      type: 'DOCUMENT_VERIFIED',
      message: 'Your document has been verified',
      documentId: document._id
    });

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Background OCR processing
const processOCR = async (documentId, fileUrl) => {
  try {
    const document = await Document.findById(documentId);
    
    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(
      fileUrl,
      'nep+eng', // Nepali + English
      { logger: m => console.log(m) }
    );

    // Extract key information
    const extractedData = {
      plotNumber: extractPlotNumber(text),
      ownerName: extractOwnerName(text),
      area: extractArea(text),
      registrationNumber: extractRegistrationNumber(text)
    };

    document.ocrText = text;
    document.ocrConfidence = 0.85; // Placeholder
    document.extractedData = extractedData;
    
    await document.save();
  } catch (error) {
    console.error('OCR processing error:', error);
  }
};

// Helper extraction functions
const extractPlotNumber = (text) => {
  const match = text.match(/(?:कित्ता नं\.?|kitta no\.?)[:\s]*(\d+)/i);
  return match ? match[1] : null;
};

const extractOwnerName = (text) => {
  const match = text.match(/(?:नाउँ|name)[:\s]*([^\n]+)/i);
  return match ? match[1].trim() : null;
};

const extractArea = (text) => {
  const match = text.match(/(?:क्षेत्रफल|area)[:\s]*([^\n]+)/i);
  return match ? match[1].trim() : null;
};

const extractRegistrationNumber = (text) => {
  const match = text.match(/(?:दर्ता नं\.?|reg\.? no\.?)[:\s]*([^\n]+)/i);
  return match ? match[1].trim() : null;
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  verifyDocument
};

