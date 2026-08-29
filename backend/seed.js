const mongoose = require('mongoose');
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

const SEED_USERS = [
  {
    id: 'cust_uma',
    name: 'Uma',
    email: 'uma@connectapp.com',
    phone: '+91 98765 43210',
    role: 'customer',
    membership: 'gold',
    dob: '1995-08-15',
    gender: 'Female',
    avatar: '',
    emailVerified: true,
    phoneVerified: true,
    address: {
      address: '25, 11th Cross, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
    }
  },
  {
    id: 'v1',
    name: 'ABC Electronics Flagship',
    email: 'vendor@abcelectronics.com',
    phone: '+91 98989 89898',
    role: 'vendor',
    membership: 'diamond',
    address: {
      address: '100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    }
  },
  {
    id: 'dp1',
    name: 'Ravi Kumar',
    email: 'ravi.delivery@connectapp.com',
    phone: '+91 98989 89898',
    role: 'delivery',
    status: 'Available',
    availability: true,
    address: {
      address: 'Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
    }
  }
];

const SEED_ADDRESSES = [
  {
    id: 'addr_1',
    userId: 'cust_uma',
    label: 'Home',
    name: 'Uma',
    phone: '+91 98765 43210',
    house: '25',
    street: '11th Cross, 4th Block, Koramangala',
    landmark: 'Near Sony World Signal',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    isDefault: true,
  },
  {
    id: 'addr_2',
    userId: 'cust_uma',
    label: 'Work',
    name: 'Uma',
    phone: '+91 98765 43210',
    house: '91',
    street: 'Outer Ring Road, Bellandur',
    landmark: 'EcoSpace Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    isDefault: false,
  }
];

const SEED_BANNERS = [
  {
    id: 'b1',
    categoryTag: 'FOOD & DINING',
    iconName: 'Utensils',
    badgeText: '★ VERIFIED VENDORS',
    title: 'Food & Dining',
    subtitle: 'Explore local food & dining options',
    points: ['Direct Vendor Pricing', '100% Verified Quality'],
    buttonText: 'EXPLORE NOW',
    targetCategory: 'Food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    bgColor: '#0D0F17',
    vendorId: 'v1',
    vendorName: 'Gourmet Food Court',
  },
  {
    id: 'b2',
    categoryTag: 'ELECTRONICS & TECH',
    iconName: 'Smartphone',
    badgeText: '★ OFFICIAL STORES',
    title: 'Gadgets & Tech',
    subtitle: 'Smartphones, laptops & audio gear',
    points: ['Brand Authorized', 'Express Doorstep Delivery'],
    buttonText: 'EXPLORE NOW',
    targetCategory: 'Products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    bgColor: '#0F172A',
    vendorId: 'v2',
    vendorName: 'ABC Electronics',
  },
  {
    id: 'b3',
    categoryTag: 'LUXURY STAYS & TRAVEL',
    iconName: 'Bed',
    badgeText: '★ GOLD MEMBER PERKS',
    title: 'Hotels & Resorts',
    subtitle: 'Book 5-star rooms & vacation stays',
    points: ['Exclusive Discounted Rates', 'Instant Booking Confirmation'],
    buttonText: 'BOOK NOW',
    targetCategory: 'Stay',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
    bgColor: '#180E29',
    vendorId: 'v3',
    vendorName: 'Le Meridian Stay',
  },
  {
    id: 'b4',
    categoryTag: 'DAILY ESSENTIALS',
    iconName: 'Milk',
    badgeText: '★ FRESH GROCERIES',
    title: 'Daily Needs',
    subtitle: 'Fresh organic milk, rice & staples',
    points: ['Direct Farm Sourced', 'Fast Morning Slot Delivery'],
    buttonText: 'SHOP NOW',
    targetCategory: 'Daily Needs',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    bgColor: '#0A1C16',
    vendorId: 'v4',
    vendorName: 'Organic Daily Needs',
  },
];

const SEED_VENDORS = [
  {
    id: 'v_abc',
    name: 'ABC Electronics',
    category: 'Products',
    desc: 'Authorized retailer for smartphones, laptops, and home appliances.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    distance: '1.2 km',
    location: 'Indiranagar, Bengaluru',
    verified: true,
  },
  {
    id: 'v_lemeridian',
    name: 'Le Meridian Stay',
    category: 'Stay',
    desc: '5-star luxury stay with gold-tier membership pricing benefits.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
    rating: '4.9',
    distance: '0.8 km',
    location: 'Sankey Road, Bengaluru',
    verified: true,
  },
  {
    id: 'v_apollo',
    name: 'City Apollo Hospital',
    category: 'Services',
    desc: 'Priority consultation, express health checkups, and cardiologists.',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
    rating: '4.7',
    distance: '2.5 km',
    location: 'Bannerghatta Road, Bengaluru',
    verified: true,
  },
  {
    id: 'v_indigo',
    name: 'IndiGo Travel Desk',
    category: 'Travel',
    desc: 'Discounted flight bookings, express lounge pass, and cab services.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format&fit=crop&q=80',
    rating: '4.6',
    distance: '4.0 km',
    location: 'Kempegowda Airport, Bengaluru',
    verified: true,
  },
  {
    id: 'v_gourmet',
    name: 'Gourmet Food Court',
    category: 'Food',
    desc: 'Handcrafted truffle burgers, woodfired pizzas, and Italian combos.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    distance: '1.5 km',
    location: 'Koramangala, Bengaluru',
    verified: true,
  },
  {
    id: 'v_urban',
    name: 'Urban Repair Hub',
    category: 'Services',
    desc: 'Verified expert plumbers, electricians, and home maintenance partners.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80',
    rating: '4.7',
    distance: '0.5 km',
    location: 'HSR Layout, Bengaluru',
    verified: true,
  },
  {
    id: 'v_organic',
    name: 'Organic Daily Needs',
    category: 'Daily Needs',
    desc: 'Premium long-grain basmati rice, fresh farm milk, bread, and organic eggs.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
    rating: '4.9',
    distance: '1.0 km',
    location: 'Whitefield, Bengaluru',
    verified: true,
  },
  {
    id: 'v_fitness',
    name: 'Elite Fitness Center',
    category: 'Services',
    desc: 'Premium gym facility, certified coaches, and customized diet plans.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    distance: '3.1 km',
    location: 'Koramangala, Bengaluru',
    verified: true,
  }
];

const SEED_OFFERS = [
  {
    id: 'off-1',
    title: 'Flat 20% Off Luxury Stays',
    vendor: 'Le Meridian & Taj Resorts',
    validity: 'Valid till 30 Sep',
    code: 'CONNECTSTAY20',
    discount: '20% OFF',
    category: 'Stay',
    memberOnly: true,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
    price: '₹12,000',
    memberPrice: '₹9,600',
  },
  {
    id: 'off-2',
    title: 'Free Gourmet Dessert Course',
    vendor: 'Partner 5-Star Restaurants',
    validity: 'On bookings > ₹1,500',
    code: 'CONNECTFOOD',
    discount: 'FREE DESSERT',
    category: 'Food',
    memberOnly: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    price: '₹450',
    memberPrice: '₹0 (Free)',
  },
  {
    id: 'off-3',
    title: 'Complimentary Airport Cab Pickup',
    vendor: 'Connect Express Cabs',
    validity: '1 ride / month',
    code: 'CONNECTAIRPORT',
    discount: '100% OFF',
    category: 'Travel',
    memberOnly: true,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format&fit=crop&q=80',
    price: '₹1,200',
    memberPrice: '₹0 (Free)',
  },
  {
    id: 'off-4',
    title: 'MacBook Pro M3 Max Member Deal',
    vendor: 'ABC Electronics',
    validity: 'Limited Stock',
    code: 'CONNECTMAC20',
    discount: '₹20,000 OFF',
    category: 'Products',
    memberOnly: true,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80',
    price: '₹2,49,990',
    memberPrice: '₹2,29,990',
  },
  {
    id: 'off-5',
    title: 'Sony WH-1000XM5 Special Offer',
    vendor: 'Sony Official',
    validity: 'Valid this week',
    code: 'SONYVIP5K',
    discount: '₹5,000 OFF',
    category: 'Products',
    memberOnly: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    price: '₹29,990',
    memberPrice: '₹24,990',
  },
  {
    id: 'off-6',
    title: 'Senior Cardiologist Visit VIP Pass',
    vendor: 'City Apollo Hospital',
    validity: 'Valid throughout the month',
    code: 'APOLLOCARE',
    discount: '20% OFF',
    category: 'Services',
    memberOnly: true,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
    price: '₹1,000',
    memberPrice: '₹800',
  }
];

const SEED_PARTNERS = [
  {
    id: 'dp1',
    name: 'Ravi Kumar',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    mobile: '+91 98989 89898',
    emergency_contact: '+91 91919 19191',
    address: 'Koramangala, Bangalore',
    vehicle_type: 'Electric Bike',
    vehicle_number: 'KA-01-EF-5678',
    driving_license: 'KA1234567890',
    aadhaar: '1234 5678 9012',
    status: 'Available',
    availability: true,
    current_latitude: 12.9348,
    current_longitude: 77.6189,
    speed: 0,
    battery_level: 92,
    joining_date: '2026-01-10',
    vendor_id: 'v1'
  },
  {
    id: 'dp2',
    name: 'Rajesh Kumar',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mobile: '+91 97777 77777',
    emergency_contact: '+91 95555 55555',
    address: 'Indiranagar, Bangalore',
    vehicle_type: 'Scooter',
    vehicle_number: 'KA-03-EF-1234',
    driving_license: 'KA0987654321',
    aadhaar: '9876 5432 1098',
    status: 'Offline',
    availability: false,
    current_latitude: 12.9698,
    current_longitude: 77.6439,
    speed: 0,
    battery_level: 45,
    joining_date: '2026-03-15',
    vendor_id: 'v1'
  }
];

const SEED_ORDERS = [
  {
    id: 'ORD-DN-2210',
    order_number: 'ORD-DN-2210',
    vendor_id: 'v1',
    vendor_name: 'Connect Daily Mart (Indiranagar)',
    category: 'Daily Needs',
    order_type: 'order',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Amul Taaza Milk (2L), Farm Brown Eggs (12 pcs), Organic Bread',
    brand_or_seller: 'Connect Daily Mart',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    items: [
      { name: 'Amul Taaza Homogenised Toned Milk (1L)', quantity: 2, price: 144 },
      { name: 'Country Fresh Brown Eggs (Pack of 12)', quantity: 1, price: 135 },
      { name: 'Artisanal Organic Whole Wheat Bread (400g)', quantity: 1, price: 65 }
    ],
    item_count: 4,
    amount: 344,
    status: 'Out For Delivery',
    expected_delivery: 'Today by 06:30 PM',
    payment_method: 'Paid via UPI (Google Pay)',
    payment_status: 'Paid',
    delivery_fee: 0,
    discount: 40,
    tax: 18,
  },
  {
    id: 'ORD-FD-8921',
    order_number: 'ORD-FD-8921',
    vendor_id: 'v2',
    vendor_name: 'Truffles Burger Bistro',
    category: 'Food',
    order_type: 'order',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'All American Cheese Burger (x2), Peri Peri Fries (x1), Belgian Shake (x1)',
    brand_or_seller: 'Truffles Brigade Road',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    items: [
      { name: 'All American Cheese Burger', quantity: 2, price: 540 },
      { name: 'Peri Peri Crispy Fries', quantity: 1, price: 160 },
      { name: 'Belgian Chocolate Shake', quantity: 1, price: 149 }
    ],
    item_count: 4,
    amount: 849,
    status: 'Delivered',
    delivered_at: 'Today, 01:25 PM',
    payment_method: 'Paid via Connect Wallet',
    payment_status: 'Paid',
    delivery_fee: 0,
    discount: 100,
    tax: 42,
    rating: 5,
    review_note: 'Amazing crispy burgers, arrived hot and fresh!',
  },
  {
    id: 'ORD-PR-5412',
    order_number: 'ORD-PR-5412',
    vendor_id: 'v3',
    vendor_name: 'Sony Authorized Flagship',
    category: 'Products',
    order_type: 'order',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Silver)',
    brand_or_seller: 'Sony Authorized Flagship Store',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Sony WH-1000XM5 Wireless Headphones', quantity: 1, price: 26990, variant: 'Silver' }],
    item_count: 1,
    amount: 26990,
    status: 'Out For Delivery',
    expected_delivery: 'Today by 07:15 PM',
    payment_method: 'Paid via Credit Card (HDFC ****4102)',
    payment_status: 'Paid',
    delivery_fee: 0,
    discount: 3000,
    tax: 2429,
  },
  {
    id: 'BKG-SV-1049',
    order_number: 'BKG-SV-1049',
    vendor_id: 'v4',
    vendor_name: 'Urban Expert Home Repairs',
    category: 'Services',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Deep Home AC Servicing & Gas Top-up (2 Split Units)',
    provider_name: 'Suresh K. (Urban Expert Certified)',
    appointment_slot: 'Tomorrow, 10:30 AM - 12:00 PM',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Deep Home AC Servicing & Gas Top-up', quantity: 2, price: 1499 }],
    item_count: 1,
    amount: 1499,
    status: 'Confirmed',
    payment_method: 'Pay After Service (UPI / Cash)',
    payment_status: 'Pending',
    delivery_fee: 0,
    discount: 200,
    tax: 75,
  },
  {
    id: 'BKG-ST-3301',
    order_number: 'BKG-ST-3301',
    vendor_id: 'v_lemeridian',
    vendor_name: 'Le Meridian Luxury Stay & Resorts',
    hotel_name: 'Le Meridian Luxury Stay',
    category: 'Stay',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Deluxe Executive Suite (2 Nights + Gourmet Breakfast)',
    brand_or_seller: 'Le Meridian Luxury Stay & Resorts',
    check_in: 'Fri, 25 Sep 2026, 02:00 PM',
    check_out: 'Sun, 27 Sep 2026, 11:00 AM',
    guests_count: '2 Adults, 1 Child',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Executive Suite - 2 Nights Stay', quantity: 1, price: 9600 }],
    item_count: 1,
    amount: 9600,
    status: 'Confirmed',
    payment_method: 'Paid via Credit Card (HDFC ****4102)',
    payment_status: 'Paid',
    delivery_fee: 0,
    discount: 2400,
    tax: 1728,
  },
  {
    id: 'BKG-TR-4402',
    order_number: 'BKG-TR-4402',
    vendor_id: 'v_indigo',
    vendor_name: 'IndiGo Airlines Travel Desk',
    operator_name: 'IndiGo Airlines',
    category: 'Travel',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Flight 6E-512 (Bengaluru BLR ➔ New Delhi DEL)',
    route: 'BLR ➔ DEL (Non-Stop)',
    travel_date: 'Mon, 28 Sep 2026, 06:15 AM',
    passenger_count: 1,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Flight 6E-512 Economy Class', quantity: 1, price: 5850 }],
    item_count: 1,
    amount: 5850,
    status: 'Confirmed',
    payment_method: 'Paid via UPI (Google Pay)',
    payment_status: 'Paid',
    delivery_fee: 0,
    discount: 650,
    tax: 420,
  },
  {
    id: 'JOB-AP-7703',
    order_number: 'JOB-AP-7703',
    vendor_id: 'v_techforge',
    vendor_name: 'TechForge Solutions India',
    category: 'Jobs',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Prestige Tower, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Senior Full Stack React Native Developer - Application Submitted',
    brand_or_seller: 'TechForge HR Solutions',
    appointment_slot: 'Technical Round 1: Tomorrow at 03:00 PM',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Job Application Screening & Tech Interview', quantity: 1, price: 0 }],
    item_count: 1,
    amount: 0,
    status: 'Confirmed',
    payment_method: 'Free Job Application',
    payment_status: 'Paid',
    delivery_fee: 0,
    discount: 0,
    tax: 0,
  }
];

const SEED_PRODUCTS = [
  // 1. ELECTRONICS
  {
    id: 'prod_boseqc45',
    name: 'Bose QuietComfort 45',
    brand: 'Bose',
    category: 'Electronics',
    subcategory: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
    ],
    description: 'Iconic quietness, comfort, and sound. The Bose QuietComfort 45 headphones feature world-class noise cancelling, lightweight materials for premium comfort, and proprietary acoustic technology for deep, clear audio.',
    price: 22990,
    mrp: 26990,
    rating: 4.5,
    ratingCount: '1.2k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Free express delivery in 2-3 business days',
    warranty: '1 Year Bose India Manufacturer Warranty',
    seller: {
      name: 'Bose Official Store (ABC Electronics)',
      rating: '4.9',
      verified: true,
      location: 'Bangalore',
    },
    variants: [
      {
        id: 'var_color',
        type: 'color',
        label: 'Select Color',
        options: [
          { id: 'c_black', name: 'Triple Black', priceDiff: 0, inStock: true },
          { id: 'c_white', name: 'White Smoke', priceDiff: 0, inStock: true },
        ],
      },
    ],
    highlights: [
      'Active Noise Cancelling with Quiet and Aware modes',
      'High-fidelity audio with proprietary TriPort acoustic architecture',
      'Up to 24 hours battery life from a single USB-C charge',
      'Lightweight around-ear fit with smooth plush synthetic leather',
    ],
    specifications: [
      { label: 'Brand', val: 'Bose' },
      { label: 'Model Name', val: 'QuietComfort 45' },
    ],
  },
  {
    id: 'prod_iphone14',
    name: 'Apple iPhone 14 (128GB)',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80',
    ],
    description: 'iPhone 14 features a vibrant 6.1-inch Super Retina XDR display, advanced dual-camera system for stunning photos in low light, Crash Detection, and all-day battery life.',
    price: 59900,
    mrp: 74900,
    rating: 4.6,
    ratingCount: '2.4k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Free delivery by tomorrow, 11 AM',
    warranty: '1 Year Apple Brand Warranty',
    seller: {
      name: 'Imagine Apple Premium Reseller',
      rating: '4.9',
      verified: true,
      location: 'Bangalore',
    },
    variants: [
      {
        id: 'var_storage',
        type: 'storage',
        label: 'Select Storage',
        options: [
          { id: 'st_128', name: '128GB', priceDiff: 0, inStock: true },
          { id: 'st_256', name: '256GB', priceDiff: 10000, inStock: true },
        ],
      },
    ],
    highlights: [
      '6.1-inch Super Retina XDR OLED display',
      'Advanced camera system for better photos in any light',
      'Vital safety features — Crash Detection',
    ],
    specifications: [
      { label: 'Brand', val: 'Apple' },
      { label: 'Model', val: 'iPhone 14' },
    ],
  },
  {
    id: 'prod_macbookm3',
    name: 'MacBook Pro M3 Max (16-inch, 36GB, 1TB)',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    description: 'The 16-inch MacBook Pro blasts forward with M3 Max, an extraordinarily advanced chip that brings massive performance and capabilities for the most extreme workflows.',
    price: 249990,
    mrp: 279990,
    rating: 4.9,
    ratingCount: '620',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Express Delivery by Tonight',
    warranty: '1 Year Apple Official Warranty',
    seller: {
      name: 'ABC Electronics Flagship',
      rating: '4.9',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      '16-core CPU and 40-core GPU with Hardware-accelerated Ray Tracing',
      'Liquid Retina XDR display with 1600 nits peak brightness',
      'Up to 22 hours of battery life on a single charge',
    ],
    specifications: [
      { label: 'Chip', val: 'Apple M3 Max' },
      { label: 'Memory', val: '36GB Unified Memory' },
    ],
  },
  {
    id: 'prod_galaxywatch6',
    name: 'Samsung Galaxy Watch 6 (Bluetooth 44mm)',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Smart Watches',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
    description: 'Track your health and wellness goals with Galaxy Watch 6. Featuring an enlarged Sapphire Crystal AMOLED display, advanced sleep tracking, and personalized HR zones.',
    price: 17999,
    mrp: 19999,
    rating: 4.4,
    ratingCount: '856',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Free delivery in 1-2 business days',
    warranty: '1 Year Samsung India Warranty',
    seller: {
      name: 'ABC Electronics',
      rating: '4.8',
      verified: true,
      location: 'Bangalore',
    },
    highlights: [
      '20% larger Sapphire Crystal display',
      'Advanced sleep monitoring with Sleep Coaching',
      '5ATM + IP68 water and dust resistance',
    ],
    specifications: [
      { label: 'Brand', val: 'Samsung' },
      { label: 'Model', val: 'Galaxy Watch 6' },
    ],
  },

  // 2. FOOTWEAR
  {
    id: 'prod_nikepeg39',
    name: 'Nike Air Zoom Pegasus 39',
    brand: 'Nike',
    category: 'Footwear',
    subcategory: 'Running Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    description: 'Running is your daily ritual, with every step taking you closer to your personal goal. Let the Nike Air Zoom Pegasus 39 help you ascend to new heights with its intuitive design.',
    price: 6995,
    mrp: 10495,
    rating: 4.6,
    ratingCount: '1.8k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Free delivery in 2 days',
    seller: {
      name: 'Nike India Official Store',
      rating: '4.8',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      'Engineered mesh across the upper for lightweight breathability',
      'Nike React technology delivers a smooth, responsive ride',
    ],
    specifications: [
      { label: 'Brand', val: 'Nike' },
      { label: 'Type', val: 'Running Shoes' },
    ],
  },

  // 3. CLOTHING
  {
    id: 'prod_levis511',
    name: "Levi's 511 Slim Fit Stretch Denim",
    brand: "Levi's",
    category: 'Clothing',
    subcategory: 'Jeans',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80',
    description: 'A modern slim with room to move, the 511 Slim Fit Jeans are a classic since right now. These jeans sit below the waist with a slim leg from hip to ankle.',
    price: 2499,
    mrp: 3999,
    rating: 4.3,
    ratingCount: '920',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Free 2-Day Delivery',
    seller: {
      name: "Levi's Brand Hub",
      rating: '4.7',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      'Premium stretch denim construction for all-day comfort',
      'Iconic Two Horse Pull leather patch on back waistband',
    ],
    specifications: [
      { label: 'Brand', val: "Levi's" },
      { label: 'Fit', val: 'Slim Fit' },
    ],
  },

  // 4. DAILY NEEDS
  {
    id: 'prod_amulmilk',
    name: 'Amul Taaza Homogenised Toned Milk (1L)',
    brand: 'Amul',
    category: 'Daily Needs',
    subcategory: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Amul Taaza toned milk is fresh, wholesome, and processed using ultra-high temperature (UHT) technology to ensure zero contamination.',
    price: 72,
    mrp: 75,
    rating: 4.8,
    ratingCount: '15k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Delivered in 10-15 mins',
    seller: {
      name: 'Connect Daily Mart',
      rating: '4.9',
      verified: true,
      location: 'Koramangala, Bangalore',
    },
    highlights: [
      '100% pure pasteurized toned milk with 3% fat',
      'No added preservatives, safe and healthy for all ages',
    ],
    specifications: [
      { label: 'Brand', val: 'Amul' },
      { label: 'Type', val: 'Toned Milk' },
    ],
  },
  {
    id: 'prod_basmatirice',
    name: 'Daawat Rozana Super Basmati Rice (5kg)',
    brand: 'Daawat',
    category: 'Daily Needs',
    subcategory: 'Staples & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Aged long-grain aromatic Basmati rice, perfectly curated for biryani, pulao, and everyday gourmet dining.',
    price: 499,
    mrp: 650,
    rating: 4.7,
    ratingCount: '3.4k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Delivered in 15-20 mins',
    seller: {
      name: 'Organic Daily Needs',
      rating: '4.9',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      'Naturally aged extra-long Basmati grains',
      'Rich aroma and fluffy texture upon cooking',
    ],
    specifications: [
      { label: 'Weight', val: '5 Kilograms' },
      { label: 'Grain Type', val: 'Aged Long Grain Basmati' },
    ],
  },

  // 5. FOOD
  {
    id: 'prod_trufflesburger',
    name: 'All American Cheese Burger',
    brand: 'Truffles',
    category: 'Food',
    subcategory: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Double juicy grilled patty with melted cheddar cheese, caramelized onions, crisp lettuce, and signature truffle burger sauce.',
    price: 270,
    mrp: 300,
    rating: 4.9,
    ratingCount: '4.2k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Delivered Hot in 25-30 mins',
    seller: {
      name: 'Truffles Brigade Bistro',
      rating: '4.9',
      verified: true,
      location: 'Brigade Road, Bangalore',
    },
    highlights: [
      '100% fresh gourmet buns baked in-house daily',
      'Served with a portion of crispy golden French fries',
    ],
    specifications: [
      { label: 'Cuisine', val: 'American Gourmet' },
    ],
  },
  {
    id: 'prod_woodfiredpizza',
    name: 'Classic Margherita Woodfired Pizza (12 inch)',
    brand: 'Gourmet Kitchen',
    category: 'Food',
    subcategory: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    description: 'Artisanal sourdough crust topped with San Marzano tomato sauce, fresh mozzarella di bufala, basil, and extra virgin olive oil.',
    price: 450,
    mrp: 520,
    rating: 4.8,
    ratingCount: '2.8k',
    assured: true,
    availability: 'In Stock',
    deliveryInfo: 'Delivered Hot in 30 mins',
    seller: {
      name: 'Gourmet Food Court',
      rating: '4.8',
      verified: true,
      location: 'Koramangala, Bengaluru',
    },
    highlights: [
      'Baked in traditional 450°C Italian woodfired oven',
      'Fresh bocconcini mozzarella and fragrant sweet basil',
    ],
    specifications: [
      { label: 'Size', val: '12 Inches (6 Slices)' },
    ],
  },

  // 6. SERVICES
  {
    id: 'prod_acservice',
    name: 'Deep Home AC Servicing & Gas Top-up',
    brand: 'Urban Repair Hub',
    category: 'Services',
    subcategory: 'Home Repairs',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    description: 'Complete high-pressure power jet AC servicing, filter sanitization, cooling coil deep cleaning, and gas leak checkup.',
    price: 1499,
    mrp: 1999,
    rating: 4.8,
    ratingCount: '3.1k',
    assured: true,
    availability: 'Available',
    deliveryInfo: 'Certified technician at your doorstep in 60 mins',
    seller: {
      name: 'Urban Repair Hub',
      rating: '4.8',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      'Includes 30-day post-service warranty',
      'Certified, background-verified technicians',
    ],
    specifications: [
      { label: 'Service Duration', val: '45-60 minutes' },
    ],
  },
  {
    id: 'prod_cardiologist',
    name: 'Senior Cardiologist Priority Consultation',
    brand: 'Apollo Hospitals',
    category: 'Services',
    subcategory: 'Hospitals & Clinics',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=80',
    description: 'Consult top cardiologists with zero waiting time, comprehensive heart health assessment, ECG review, and digital prescription.',
    price: 800,
    mrp: 1000,
    rating: 4.9,
    ratingCount: '1.5k',
    assured: true,
    availability: 'Available',
    deliveryInfo: 'Direct Slot Booking with Priority Token',
    seller: {
      name: 'City Apollo Hospital',
      rating: '4.9',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      'Zero waiting time with VIP express token',
      'Follow-up digital chat consultation included for 7 days',
    ],
    specifications: [
      { label: 'Specialty', val: 'Cardiology & Internal Medicine' },
    ],
  },

  // 7. STAY
  {
    id: 'prod_lemeridianstay',
    name: 'Deluxe Executive Suite (2 Nights + Breakfast)',
    brand: 'Le Meridian',
    category: 'Stay',
    subcategory: 'Hotels & Resorts',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
    description: '5-star luxury stay featuring panoramic city skyline views, king-size feather bed, access to executive lounge, infinity pool, and gourmet buffet breakfast.',
    price: 9600,
    mrp: 12000,
    rating: 4.9,
    ratingCount: '890',
    assured: true,
    availability: 'Available',
    deliveryInfo: 'Instant Booking Confirmation with Connect VIP Pass',
    seller: {
      name: 'Le Meridian Luxury Stay',
      rating: '4.9',
      verified: true,
      location: 'Sankey Road, Bengaluru',
    },
    highlights: [
      'Complimentary airport pickup for Diamond tier members',
      'Free late check-out till 4:00 PM',
      'Full access to luxury Spa & Heated Infinity Pool',
    ],
    specifications: [
      { label: 'Room Type', val: 'Executive Deluxe Suite (65 sq.m)' },
      { label: 'Occupancy', val: '2 Adults, 1 Child' },
    ],
  },

  // 8. TRAVEL
  {
    id: 'prod_indigoflight',
    name: 'Flight 6E-512 (Bengaluru BLR ➔ New Delhi DEL)',
    brand: 'IndiGo Airlines',
    category: 'Travel',
    subcategory: 'Flights',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80',
    description: 'Non-stop morning flight from Kempegowda International Airport (BLR) to Indira Gandhi International Airport (DEL) with priority check-in.',
    price: 5850,
    mrp: 6500,
    rating: 4.7,
    ratingCount: '5.6k',
    assured: true,
    availability: 'Available',
    deliveryInfo: 'Instant e-Ticket & Mobile Boarding Pass',
    seller: {
      name: 'IndiGo Airlines Travel Desk',
      rating: '4.7',
      verified: true,
      location: 'Bengaluru',
    },
    highlights: [
      'Includes 15kg check-in luggage and 7kg cabin baggage',
      'Complimentary seat selection for Gold & Diamond members',
    ],
    specifications: [
      { label: 'Flight Duration', val: '2 hrs 40 mins (Non-Stop)' },
      { label: 'Aircraft', val: 'Airbus A321neo' },
    ],
  }
];

async function seedDatabase() {
  await connectDB();
  console.log('[Seed] Connected to MongoDB Atlas. Seeding full production records...');

  try {
    // 1. Users
    await User.deleteMany({});
    await User.insertMany(SEED_USERS);
    console.log(`[Seed] Inserted ${SEED_USERS.length} Users.`);

    // 2. Addresses
    await Address.deleteMany({});
    await Address.insertMany(SEED_ADDRESSES);
    console.log(`[Seed] Inserted ${SEED_ADDRESSES.length} Addresses.`);

    // 3. Banners
    await Banner.deleteMany({});
    await Banner.insertMany(SEED_BANNERS);
    console.log(`[Seed] Inserted ${SEED_BANNERS.length} Banners.`);

    // 4. Vendors
    await Vendor.deleteMany({});
    await Vendor.insertMany(SEED_VENDORS);
    console.log(`[Seed] Inserted ${SEED_VENDORS.length} Vendors.`);

    // 5. Offers
    await Offer.deleteMany({});
    await Offer.insertMany(SEED_OFFERS);
    console.log(`[Seed] Inserted ${SEED_OFFERS.length} Offers.`);

    // 6. Delivery Partners
    await DeliveryPartner.deleteMany({});
    await DeliveryPartner.insertMany(SEED_PARTNERS);
    console.log(`[Seed] Inserted ${SEED_PARTNERS.length} Delivery Partners.`);

    // 7. Orders
    await Order.deleteMany({});
    await Order.insertMany(SEED_ORDERS);
    console.log(`[Seed] Inserted ${SEED_ORDERS.length} Orders.`);

    // 8. Products
    await Product.deleteMany({});
    await Product.insertMany(SEED_PRODUCTS);
    console.log(`[Seed] Inserted ${SEED_PRODUCTS.length} Products.`);

    console.log('[Seed] MongoDB Atlas Database Seed Completed Successfully! 🎉');
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB Atlas.');
  }
}

seedDatabase();
