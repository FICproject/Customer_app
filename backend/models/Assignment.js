const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  order_id: { type: String, required: true, index: true },
  delivery_partner_id: { type: String, required: true, index: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' },
  assigned_at: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
