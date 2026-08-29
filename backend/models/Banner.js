const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  categoryTag: { type: String, required: true },
  iconName: { type: String, default: 'Sparkles' },
  badgeText: { type: String, default: '★ POPULAR' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  points: [{ type: String }],
  buttonText: { type: String, default: 'EXPLORE NOW' },
  targetCategory: { type: String, required: true },
  image: { type: String, required: true },
  bgColor: { type: String, default: '#0F172A' },
  vendorId: { type: String, default: 'v1' },
  vendorName: { type: String, default: 'Connect Partner' },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
