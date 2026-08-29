const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  mobile: { type: String, required: true },
  emergency_contact: { type: String, default: '' },
  address: { type: String, default: '' },
  vehicle_type: { type: String, default: 'Electric Bike' },
  vehicle_number: { type: String, default: '' },
  driving_license: { type: String, default: '' },
  aadhaar: { type: String, default: '' },
  status: { type: String, enum: ['Available', 'Busy', 'On Delivery', 'Offline'], default: 'Available' },
  availability: { type: Boolean, default: true },
  current_latitude: { type: Number, default: 12.9348 },
  current_longitude: { type: Number, default: 77.6189 },
  speed: { type: Number, default: 0 },
  battery_level: { type: Number, default: 90 },
  joining_date: { type: String, default: '2026-01-10' },
  vendor_id: { type: String, default: 'v1' },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
