const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  desc: { type: String, default: '' },
  image: { type: String, required: true },
  rating: { type: String, default: '4.8' },
  distance: { type: String, default: '1.2 km' },
  location: { type: String, default: 'Bengaluru' },
  verified: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
