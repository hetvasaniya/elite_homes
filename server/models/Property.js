const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    // ─── Original Fields (unchanged) ──────────────────────────────
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Sell', 'Rent'], required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 }, // sq ft

    // ─── Approval Workflow Fields (new) ───────────────────────────
    // 'Active' & 'Archived' kept for backward-compat but new flow uses pending/approved/rejected
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'archived'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    rejectionRemark: { type: String, default: '' },

    // ─── Location Coordinates (new) ───────────────────────────────
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    // ─── Ownership Documents (new) ────────────────────────────────
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PropertyDocument' }],
  },
  { timestamps: true }
);

// Text index for search
propertySchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
