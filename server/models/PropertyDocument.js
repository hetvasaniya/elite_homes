const mongoose = require('mongoose');

const propertyDocumentSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: {
      type: String,
      enum: ['sale_deed', 'ownership_cert', 'govt_id', 'other'],
      default: 'other',
    },
    fileUrl: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PropertyDocument', propertyDocumentSchema);
