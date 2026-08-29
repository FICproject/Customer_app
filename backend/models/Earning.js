const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  delivery_partner_id: { type: String, required: true, index: true },
  order_id: { type: String, required: true },
  per_delivery_earning: { type: Number, default: 60 },
  incentive: { type: Number, default: 10 },
  bonus: { type: Number, default: 5 },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

module.exports = mongoose.model('Earning', earningSchema);
