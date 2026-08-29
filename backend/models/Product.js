const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  label: { type: String, required: true },
  val: { type: String, required: true },
}, { _id: false });

const variantOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  priceDiff: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
}, { _id: false });

const variantSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  options: [variantOptionSchema],
}, { _id: false });

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: String, default: '4.8' },
  verified: { type: Boolean, default: true },
  location: { type: String, default: 'Bangalore' },
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  brand: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, default: '' },
  image: { type: String, required: true },
  gallery: [{ type: String }],
  description: { type: String, default: '' },
  specifications: [specificationSchema],
  variants: [variantSchema],
  price: { type: Number, required: true },
  mrp: { type: Number },
  rating: { type: Number, default: 4.5 },
  ratingCount: { type: String, default: '1.2k' },
  assured: { type: Boolean, default: false },
  isAssured: { type: Boolean, default: false },
  availability: { type: String, default: 'In Stock' },
  deliveryInfo: { type: String, default: 'Free Express Delivery in 24 Hours' },
  seller: sellerSchema,
  warranty: { type: String, default: '1 Year Brand Warranty' },
  highlights: [{ type: String }],
  actionType: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
