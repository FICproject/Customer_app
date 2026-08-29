const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config({ path: '../.env' });
const connectDB = require('./config/db');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Address = require('./models/Address');
const Banner = require('./models/Banner');
const Vendor = require('./models/Vendor');
const Offer = require('./models/Offer');
const DeliveryPartner = require('./models/DeliveryPartner');
const Assignment = require('./models/Assignment');
const Earning = require('./models/Earning');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateRoute(lat1, lon1, lat2, lon2, steps = 15) {
  const path = [];
  const midLat = lat1 + (lat2 - lat1) * 0.45;
  const midLng = lon1 + (lon2 - lon1) * 0.65;
  const controlPoints = [
    [lat1, lon1],
    [midLat, lon1],
    [midLat, midLng],
    [lat2, midLng],
    [lat2, lon2]
  ];
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    const segSteps = Math.ceil(steps / 4);
    for (let j = 0; j < segSteps; j++) {
      const t = j / segSteps;
      const lt = start[0] + (end[0] - start[0]) * t;
      const ln = start[1] + (end[1] - start[1]) * t;
      path.push([lt + Math.sin(j) * 0.0001, ln + Math.cos(j) * 0.0001]);
    }
  }
  path.push([lat2, lon2]);
  return path;
}

// ==========================================
// 1. HEALTH CHECK & STATUS
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    database: 'MongoDB Atlas',
    message: 'Connect Backend is healthy and running.'
  });
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      let displayName = email.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const userId = role === 'vendor' ? 'v1' : role === 'delivery' ? 'dp1' : `cust_${displayName.toLowerCase()}`;
      user = await User.create({
        id: userId,
        name: role === 'vendor' ? 'ABC Electronics' : role === 'delivery' ? 'Ravi Kumar' : displayName,
        email,
        role: role || 'customer',
        membership: 'gold',
      });
    }
    res.json({ status: 'success', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 3. PROFILE & MEMBERSHIP ROUTES
// ==========================================
app.get(['/api/profile', '/api/customer/profile'], async (req, res) => {
  try {
    const uId = req.query.userId || req.body?.userId || 'cust_uma';
    let user = await User.findOne({ id: uId });
    if (!user) {
      user = await User.findOne({ role: 'customer' }) || {
        id: 'cust_uma',
        name: 'Uma',
        email: 'uma@connectapp.com',
        role: 'customer',
        membership: 'gold',
      };
    }
    res.json({ status: 'success', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.patch(['/api/profile', '/api/customer/profile'], async (req, res) => {
  try {
    const uId = req.body.id || 'cust_uma';
    const updated = await User.findOneAndUpdate(
      { id: uId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/customer/profile/upload-photo', async (req, res) => {
  const { imageUri } = req.body || {};
  res.json({ status: 'success', data: { url: imageUri || '' } });
});

app.post(['/api/profile/send-otp', '/api/customer/profile/send-otp'], (req, res) => {
  res.json({ status: 'success', message: 'Verification OTP has been sent successfully!' });
});

app.post(['/api/profile/verify-otp', '/api/customer/profile/verify-otp'], (req, res) => {
  res.json({ status: 'success', verified: true });
});

// ==========================================
// 4. ADDRESSES ROUTES
// ==========================================
app.get(['/api/customer/addresses', '/api/addresses'], async (req, res) => {
  try {
    const uId = req.query.userId || req.body?.userId || 'cust_uma';
    const addresses = await Address.find({ userId: uId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ status: 'success', data: addresses });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post(['/api/customer/addresses', '/api/addresses'], async (req, res) => {
  try {
    const uId = req.query.userId || req.body?.userId || 'cust_uma';
    const count = await Address.countDocuments({ userId: uId });
    const isDefault = Boolean(req.body.isDefault) || count === 0;

    if (isDefault) {
      await Address.updateMany({ userId: uId }, { $set: { isDefault: false } });
    }

    const newAddr = await Address.create({
      id: `addr_${Date.now()}`,
      userId: uId,
      label: req.body.label || 'Home',
      name: req.body.name || 'Uma',
      phone: req.body.phone || '+91 98765 43210',
      house: req.body.house || '',
      street: req.body.street || '',
      landmark: req.body.landmark || '',
      city: req.body.city || 'Bengaluru',
      state: req.body.state || 'Karnataka',
      pincode: req.body.pincode || '560034',
      isDefault,
    });

    if (isDefault) {
      await User.findOneAndUpdate(
        { id: uId },
        {
          $set: {
            address: {
              address: `${newAddr.house}, ${newAddr.street}`,
              city: newAddr.city,
              state: newAddr.state,
              pincode: newAddr.pincode,
            }
          }
        }
      );
    }

    res.json({ status: 'success', data: newAddr });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.patch(['/api/customer/addresses/:id/default', '/api/addresses/:id/default'], async (req, res) => {
  try {
    const addrId = req.params.id;
    const uId = req.query.userId || req.body?.userId || 'cust_uma';

    await Address.updateMany({ userId: uId }, { $set: { isDefault: false } });
    const target = await Address.findOneAndUpdate(
      { id: addrId, userId: uId },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (target) {
      await User.findOneAndUpdate(
        { id: uId },
        {
          $set: {
            address: {
              address: `${target.house}, ${target.street}`,
              city: target.city,
              state: target.state,
              pincode: target.pincode,
            }
          }
        }
      );
    }

    const all = await Address.find({ userId: uId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ status: 'success', data: all });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.delete(['/api/customer/addresses/:id', '/api/addresses/:id'], async (req, res) => {
  try {
    const addrId = req.params.id;
    const uId = req.query.userId || req.body?.userId || 'cust_uma';
    await Address.deleteOne({ id: addrId, userId: uId });
    res.json({ status: 'success', message: 'Address removed successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 5. PRODUCTS & CATALOG
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, subcategory } = req.query;
    let query = {};
    if (category && category !== 'All') {
      const cat = category === 'Product' ? 'Products' : category;
      query.category = { $regex: new RegExp(`^${cat}$`, 'i') };
    }
    if (subcategory) {
      query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ status: 'success', data: products });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', data: product });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin toggle Assured badge status
app.patch(['/api/admin/products/:id/assured', '/api/products/:id/assured'], async (req, res) => {
  try {
    const isAssured = Boolean(req.body.isAssured || req.body.assured);
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: { assured: isAssured, isAssured: isAssured } },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', data: product });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});


// ==========================================
// 6. BANNERS
// ==========================================
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: banners });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    const banner = await Banner.create({
      id: req.body.id || `banner_${Date.now()}`,
      ...req.body,
    });
    res.json({ status: 'success', data: banner });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    await Banner.deleteOne({ id: req.params.id });
    res.json({ status: 'success', message: 'Banner removed' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 7. VENDORS & HUBS
// ==========================================
app.get('/api/vendors', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    const vendors = await Vendor.find(query).sort({ rating: -1 });
    res.json({ status: 'success', data: vendors });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 8. OFFERS & MEMBERSHIP DEALS
// ==========================================
app.get('/api/offers', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    const offers = await Offer.find(query).sort({ createdAt: -1 });
    res.json({ status: 'success', data: offers });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 9. ORDERS & BOOKINGS
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: orders });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    const assignment = await Assignment.findOne({ order_id: order.id, status: { $ne: 'Rejected' } });
    let partner = null;
    if (assignment) {
      partner = await DeliveryPartner.findOne({ id: assignment.delivery_partner_id });
    }

    const timeline = [
      { status: 'Order Placed', timestamp: order.createdAt || new Date().toISOString(), notes: 'Order confirmed' }
    ];
    if (order.status !== 'Order Received') {
      timeline.push({ status: 'Preparing', timestamp: new Date().toISOString(), notes: 'Processing items' });
    }
    if (['Ready For Pickup', 'Assigned To Delivery Partner', 'Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Delivered'].includes(order.status)) {
      timeline.push({ status: 'Ready For Pickup', timestamp: new Date().toISOString(), notes: 'Waiting for partner' });
    }
    if (order.status === 'Delivered') {
      timeline.push({ status: 'Delivered', timestamp: new Date().toISOString(), notes: 'Order complete' });
    }

    res.json({
      status: 'success',
      data: {
        order,
        timeline,
        assignment,
        partner,
        tracking: partner ? { latitude: partner.current_latitude, longitude: partner.current_longitude } : null
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = await Order.create({
      id: orderId,
      order_number: orderId,
      status: 'Order Received',
      ...req.body
    });

    // Auto-dispatch simulation
    setTimeout(async () => {
      try {
        const available = await DeliveryPartner.findOne({ status: 'Available', availability: true });
        if (available) {
          available.status = 'Busy';
          available.availability = false;
          await available.save();

          await Assignment.create({
            id: `asg_${Date.now()}`,
            order_id: orderId,
            delivery_partner_id: available.id,
            status: 'Pending',
          });

          newOrder.status = 'Assigned To Delivery Partner';
          await newOrder.save();
          io.emit('order_status_updated', { orderId, status: newOrder.status });
        }
      } catch (e) {
        console.error('Dispatch error:', e);
      }
    }, 2000);

    res.json({ status: 'success', data: newOrder });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status: 'Cancelled' } },
      { new: true }
    );
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });
    io.emit('order_status_updated', { orderId: order.id, status: 'Cancelled' });
    res.json({ status: 'success', message: 'Order cancelled successfully', data: order });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/orders/:id/review', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { rating: rating || 5, review_note: review || '' } },
      { new: true }
    );
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });
    res.json({ status: 'success', message: 'Review recorded', data: order });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 10. DELIVERY PARTNERS
// ==========================================
app.get('/api/vendors/delivery-partners', async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: partners });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/delivery-partners/:id/dashboard', async (req, res) => {
  try {
    const partnerId = req.params.id;
    const partner = await DeliveryPartner.findOne({ id: partnerId });
    if (!partner) return res.status(404).json({ status: 'error', message: 'Partner not found' });

    const activeAssignment = await Assignment.findOne({
      delivery_partner_id: partnerId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    let activeOrder = null;
    if (activeAssignment) {
      activeOrder = await Order.findOne({ id: activeAssignment.order_id });
    }

    const earnings = await Earning.find({ delivery_partner_id: partnerId });
    const todayEarnings = earnings.reduce((acc, e) => acc + (e.per_delivery_earning || 0), 0);

    res.json({
      status: 'success',
      data: {
        profile: partner,
        stats: {
          todayCompleted: earnings.length,
          todayEarnings,
          rating: 4.9,
        },
        activeAssignment,
        activeOrder,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.put('/api/delivery-partners/:id/status', async (req, res) => {
  try {
    const { status, availability } = req.body;
    const partner = await DeliveryPartner.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, availability: availability !== undefined ? availability : (status === 'Available') } },
      { new: true }
    );
    res.json({ status: 'success', data: partner });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/maps/route', (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.body;
  const dist = getDistance(startLat, startLng, endLat, endLng);
  const duration = Math.ceil(dist / 0.4) + 2;
  const route = generateRoute(startLat, startLng, endLat, endLng);
  res.json({
    status: 'success',
    data: {
      distance: parseFloat(dist.toFixed(2)),
      duration,
      route,
    }
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Connect Backend] Server running on http://0.0.0.0:${PORT} connected to MongoDB Atlas! 🚀`);
  });
});
