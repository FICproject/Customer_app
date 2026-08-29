const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  vendor: { type: String, required: true },
  validity: { type: String, default: 'Valid till 30 Sep' },
  code: { type: String, required: true },
  discount: { type: String, default: '20% OFF' },
  category: { type: String, default: 'All' },
  memberOnly: { type: Boolean, default: true },
  image: { type: String, default: '' },
  price: { type: String },
  memberPrice: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
