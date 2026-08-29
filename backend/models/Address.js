const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  label: { type: String, default: 'Home' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  house: { type: String, default: '' },
  street: { type: String, default: '' },
  landmark: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
