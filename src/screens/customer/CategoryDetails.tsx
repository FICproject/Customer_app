import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
  Alert,
  Modal,
  Animated,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { SIDEBAR_DATA } from './sidebarData';
import { apiFetch } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import CartModal from '../../components/CartModal';
import { useThemeStore } from '../../store/themeStore';
import JobCard, { JobItem } from '../../components/JobCard';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';

export const CURATED_JOBS_CATALOG: JobItem[] = [
  {
    id: 'job_react_native_lead',
    title: 'Senior Full Stack React Native Developer',
    company: 'TechForge Solutions India',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    isVerified: true,
    location: 'Bangalore, KA',
    workMode: 'Hybrid',
    experience: '2–5 yrs',
    salary: '₹12–₹18 LPA',
    employmentType: 'Full-time',
    department: 'IT & Software Engineering',
    skills: ['React Native', 'TypeScript', 'Node.js', 'GraphQL', 'MongoDB'],
    postedDate: '1d ago',
    deadline: '15 Sep 2026',
    itemType: 'JOB',
    openings: 4,
    description: 'Lead mobile app development and cross-platform architecture at TechForge India.',
  },
  {
    id: 'intern_uiux_designer',
    title: 'UI/UX Design Intern',
    company: 'IndieDesigns Studio',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=500&auto=format&fit=crop&q=80',
    isVerified: true,
    location: 'Remote',
    workMode: 'Remote',
    experience: 'Fresher',
    salary: '₹18,000 / mo',
    employmentType: 'Internship',
    department: 'Design',
    skills: ['Figma', 'UI Prototyping', 'User Research', 'Design Systems'],
    postedDate: 'Today',
    deadline: '20 Sep 2026',
    itemType: 'INTERNSHIP',
    duration: '3 Months',
    ppoAvailable: true,
    openings: 2,
    description: 'Design mobile & web experiences for fast-growing Indian startups with PPO opportunity.',
  },
  {
    id: 'job_python_data_analyst',
    title: 'Python Data Analyst & BI Developer',
    company: 'TCS Digital Innovation Labs',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=80',
    isVerified: true,
    location: 'Bangalore, KA',
    workMode: 'On-site',
    experience: '1–3 yrs',
    salary: '₹7.5–₹11 LPA',
    employmentType: 'Full-time',
    department: 'Analytics & Data Science',
    skills: ['Python', 'Pandas', 'SQL', 'Power BI', 'Tableau'],
    postedDate: '2d ago',
    itemType: 'JOB',
    openings: 5,
    description: 'Perform predictive data analytics, automated reporting, and SQL query optimizations.',
  },
  {
    id: 'intern_backend_node',
    title: 'Backend Node.js & Cloud Intern',
    company: 'CloudScale Systems',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80',
    isVerified: true,
    location: 'Hyderabad, TS',
    workMode: 'Hybrid',
    experience: 'Fresher',
    salary: '₹15,000 / mo',
    employmentType: 'Internship',
    department: 'Backend Engineering',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'AWS Lambda'],
    postedDate: '3d ago',
    itemType: 'INTERNSHIP',
    duration: '6 Months',
    ppoAvailable: true,
    openings: 3,
    description: 'Build robust REST APIs and serverless microservices.',
  },
  {
    id: 'job_marketing_executive',
    title: 'Growth Marketing & Social Media Executive',
    company: 'Connect Global Marketplace',
    logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&auto=format&fit=crop&q=80',
    isVerified: true,
    location: 'Mumbai, MH',
    workMode: 'On-site',
    experience: '0–2 yrs',
    salary: '₹5–₹8 LPA',
    employmentType: 'Full-time',
    department: 'Marketing & Growth',
    skills: ['SEO', 'Google Ads', 'Content Strategy', 'Meta Ads'],
    postedDate: '1d ago',
    itemType: 'JOB',
    openings: 2,
    description: 'Execute performance marketing campaigns and brand outreach strategies.',
  },
];

// Curated Service Marketplace Catalog with rich data
const CURATED_SERVICES_CATALOG: Record<string, Array<{
  id: string;
  name: string;
  subcategory: string;
  desc: string;
  rating: string;
  reviews: string;
  price: string;
  originalPrice?: string;
  image: string;
  assured: boolean;
  timeSlot?: string;
  brand?: string;
  deliveryTime?: string;
  location?: string;
  locationCity?: string;
  priceNum?: number;
  discount?: string;
  amenities?: string[];
  starRating?: number;
  propertyType?: string;
  inStock?: boolean;
  discountNum?: number;
  packSize?: string;
  cuisine?: string;
  isVeg?: boolean;
  hasOffer?: boolean;
  serviceType?: string;
  serviceTime?: string;
  bookingMode?: 'instant' | 'scheduled' | 'both';
  availableToday?: boolean;
  departureTime?: string;
  departureSlot?: string;
  busType?: string;
  operator?: string;
  boardingPoints?: string[];
  droppingPoints?: string[];
  seatsAvailable?: number;
  route?: string;
}>> = {
  Products: [
    {
      id: 'prod_1',
      name: 'Wireless ANC Bluetooth Headphones',
      subcategory: 'Electronics',
      brand: 'Sony',
      desc: 'Active Noise Cancellation, 40-hr battery & deep bass audio',
      rating: '4.9',
      reviews: '1,240+',
      price: '₹2,999',
      priceNum: 2999,
      originalPrice: '₹4,999',
      discountNum: 40,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      assured: true,
      inStock: true,
    },
    {
      id: 'prod_2',
      name: 'Smart Fitness Tracker Pro Watch',
      subcategory: 'Electronics',
      brand: 'Fitbit',
      desc: 'AMOLED display, SpO2 monitor, heart rate sensor & GPS tracking',
      rating: '4.8',
      reviews: '890+',
      price: '₹1,999',
      priceNum: 1999,
      originalPrice: '₹3,499',
      discountNum: 42,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      assured: true,
      inStock: true,
    },
    {
      id: 'prod_3',
      name: 'Ergonomic Wireless Mechanical Keyboard',
      subcategory: 'IT & Office',
      brand: 'Logitech',
      desc: 'RGB backlit, hot-swappable switches & multi-device bluetooth',
      rating: '4.9',
      reviews: '420+',
      price: '₹1,499',
      priceNum: 1499,
      originalPrice: '₹2,499',
      discountNum: 40,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
      assured: true,
      inStock: true,
    },
    {
      id: 'prod_4',
      name: 'Stainless Steel Electric Kettle 1.8L',
      subcategory: 'Home Appliances',
      brand: 'Philips',
      desc: 'Auto shut-off, boil-dry protection & 1500W fast heating',
      rating: '4.8',
      reviews: '610+',
      price: '₹899',
      priceNum: 899,
      originalPrice: '₹1,499',
      discountNum: 40,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
      assured: true,
      inStock: true,
    },
    {
      id: 'prod_5',
      name: 'Bose QuietComfort 45 Headphones',
      subcategory: 'Electronics',
      brand: 'Bose',
      desc: 'World-class noise cancelling, high-fidelity audio & plush comfort',
      rating: '4.9',
      reviews: '1,420+',
      price: '₹29,900',
      priceNum: 29900,
      originalPrice: '₹34,900',
      discountNum: 14,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
      assured: true,
      inStock: true,
    },
    {
      id: 'prod_6',
      name: 'Vintage Instant Camera OneStep+',
      subcategory: 'Electronics',
      brand: 'Polaroid',
      desc: 'Classic analogue instant photos with bluetooth app controls',
      rating: '4.8',
      reviews: '350+',
      price: '₹8,990',
      priceNum: 8990,
      originalPrice: '₹11,500',
      discountNum: 21,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80',
      assured: true,
      inStock: true,
    },
  ],
  'Daily Needs': [
    // --- FRUITS & VEGETABLES ---
    {
      id: 'dn_fv_1',
      name: 'Farm Fresh Organic Red Tomatoes 1kg',
      brand: 'Farm Fresh',
      subcategory: 'Fruits & Vegetables',
      desc: 'Naturally ripened, crisp local farm fresh tomatoes delivered in 15 mins',
      rating: '4.9',
      reviews: '3,100+',
      price: '₹38',
      originalPrice: '₹55',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_2',
      name: 'Fresh Hybrid Potatoes 1kg',
      brand: 'Local Farms',
      subcategory: 'Fruits & Vegetables',
      desc: 'Freshly harvested firm potatoes ideal for curries, fries & baking',
      rating: '4.8',
      reviews: '2,400+',
      price: '₹28',
      originalPrice: '₹40',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_3',
      name: 'Fresh Pink Onions 1kg',
      brand: 'Local Farms',
      subcategory: 'Fruits & Vegetables',
      desc: 'Crisp aromatic onions sourced direct from Nashik farms',
      rating: '4.8',
      reviews: '2,900+',
      price: '₹34',
      originalPrice: '₹50',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_4',
      name: 'Robusta Yellow Bananas 1kg',
      brand: 'Fresh Fruit',
      subcategory: 'Fruits & Vegetables',
      desc: 'Naturally ripened sweet bananas rich in potassium & energy',
      rating: '4.9',
      reviews: '1,850+',
      price: '₹45',
      originalPrice: '₹60',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_5',
      name: 'Royal Delicious Red Apples 4pcs',
      brand: 'Shimla Fresh',
      subcategory: 'Fruits & Vegetables',
      desc: 'Crunchy sweet juicy apples harvested fresh from Kinnaur orchards',
      rating: '4.9',
      reviews: '2,150+',
      price: '₹120',
      originalPrice: '₹160',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_6',
      name: 'Fresh Orange Carrots 500g',
      brand: 'Farm Fresh',
      subcategory: 'Fruits & Vegetables',
      desc: 'Sweet & crunchy garden carrots packed with Vitamin A',
      rating: '4.7',
      reviews: '1,420+',
      price: '₹29',
      originalPrice: '₹42',
      image: 'https://images.unsplash.com/photo-1447175008436-08417090ea76?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_7',
      name: 'Crisp Organic Baby Spinach 250g',
      brand: 'Farm Fresh',
      subcategory: 'Fruits & Vegetables',
      desc: 'Hydroponic nutrient-dense fresh spinach leaves delivered iced',
      rating: '4.8',
      reviews: '1,250+',
      price: '₹24',
      originalPrice: '₹35',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_fv_8',
      name: 'Fresh Juicy Lemons 250g',
      brand: 'Farm Fresh',
      subcategory: 'Fruits & Vegetables',
      desc: 'Zesty citrus lemons packed with natural Vitamin C',
      rating: '4.8',
      reviews: '980+',
      price: '₹18',
      originalPrice: '₹28',
      image: 'https://images.unsplash.com/photo-1534531141161-e41d133a8979?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },

    // --- GROCERY & STAPLES ---
    {
      id: 'dn_gs_1',
      name: 'Aashirvaad Whole Wheat Atta 5kg',
      brand: 'Aashirvaad',
      subcategory: 'Grocery & Staples',
      desc: '100% pure stone-ground chakki fresh wheat flour • Free from additives',
      rating: '4.9',
      reviews: '5,450+',
      price: '₹245',
      originalPrice: '₹290',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_gs_2',
      name: 'Fortune Everyday Basmati Rice 5kg',
      brand: 'Fortune',
      subcategory: 'Grocery & Staples',
      desc: 'Aromatic long-grain aged basmati rice for fluffy biryanis & pulao',
      rating: '4.8',
      reviews: '3,890+',
      price: '₹425',
      originalPrice: '₹540',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_gs_3',
      name: 'Tata Sampann Unpolished Toor Dal 1kg',
      brand: 'Tata Sampann',
      subcategory: 'Grocery & Staples',
      desc: 'High-protein unpolished yellow pigeon peas rich in natural fiber',
      rating: '4.9',
      reviews: '4,100+',
      price: '₹155',
      originalPrice: '₹185',
      image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_gs_4',
      name: 'Madhur Pure Crystal Sugar 1kg',
      brand: 'Madhur',
      subcategory: 'Grocery & Staples',
      desc: 'Sulphur-free 100% pure refined sugar crystals for sweets & tea',
      rating: '4.8',
      reviews: '2,600+',
      price: '₹52',
      originalPrice: '₹65',
      image: 'https://images.unsplash.com/photo-1622484210800-8851457145e4?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_gs_5',
      name: 'Tata Salt Vacuum Evaporated Iodized 1kg',
      brand: 'Tata',
      subcategory: 'Grocery & Staples',
      desc: 'Desh Ka Namak - Vacuum evaporated iodized salt for everyday cooking',
      rating: '4.9',
      reviews: '6,200+',
      price: '₹24',
      originalPrice: '₹28',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_gs_6',
      name: 'Rajdhani Thick Poha 500g',
      brand: 'Rajdhani',
      subcategory: 'Grocery & Staples',
      desc: 'Clean & fluffy flattened rice flakes for quick breakfast poha',
      rating: '4.7',
      reviews: '1,820+',
      price: '₹38',
      originalPrice: '₹50',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },

    // --- DAIRY, BREAD & EGGS ---
    {
      id: 'dn_dbe_1',
      name: 'Fresh Toned Milk 1L (A2 Organic)',
      brand: 'Amul',
      subcategory: 'Dairy, Bread & Eggs',
      desc: 'Pasteurized whole milk sourced direct from certified dairy farms',
      rating: '4.9',
      reviews: '4,200+',
      price: '₹64',
      originalPrice: '₹75',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_dbe_2',
      name: 'Mother Dairy Classic Curd 400g',
      brand: 'Mother Dairy',
      subcategory: 'Dairy, Bread & Eggs',
      desc: 'Thick & creamy probiotic dahi made with pasteurized milk',
      rating: '4.9',
      reviews: '3,800+',
      price: '₹35',
      originalPrice: '₹45',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_dbe_3',
      name: 'Milky Mist Fresh Paneer 200g',
      brand: 'Milky Mist',
      subcategory: 'Dairy, Bread & Eggs',
      desc: 'Soft & fresh cottage cheese rich in milk protein & calcium',
      rating: '4.9',
      reviews: '2,900+',
      price: '₹95',
      originalPrice: '₹115',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_dbe_4',
      name: 'Britannia 100% Whole Wheat Bread 400g',
      brand: 'Britannia',
      subcategory: 'Dairy, Bread & Eggs',
      desc: 'Freshly baked soft brown bread with zero maida & high wheat fiber',
      rating: '4.8',
      reviews: '4,150+',
      price: '₹45',
      originalPrice: '₹55',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_dbe_5',
      name: 'Farm Fresh White Eggs (Pack of 12)',
      brand: 'EggOZ',
      subcategory: 'Dairy, Bread & Eggs',
      desc: 'Antibiotic-free clean farm fresh eggs rich in Vitamin D & protein',
      rating: '4.9',
      reviews: '5,600+',
      price: '₹84',
      originalPrice: '₹105',
      image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },
    {
      id: 'dn_dbe_6',
      name: 'Amul Pasteurised Salted Butter 500g',
      brand: 'Amul',
      subcategory: 'Dairy, Bread & Eggs',
      desc: 'Classic salted butter made from fresh cow milk cream',
      rating: '4.9',
      reviews: '5,100+',
      price: '₹275',
      originalPrice: '₹295',
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15 mins',
    },

    // --- SNACKS & BEVERAGES ---
    {
      id: 'dn_sb_1',
      name: 'Parle-G Gold Glucose Biscuits 1kg',
      brand: 'Parle',
      subcategory: 'Snacks & Beverages',
      desc: 'India\'s favorite energy glucose biscuits perfect with hot tea',
      rating: '4.9',
      reviews: '4,500+',
      price: '₹110',
      originalPrice: '₹135',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_sb_2',
      name: 'Lay\'s India\'s Magic Masala Chips 115g',
      brand: 'Lay\'s',
      subcategory: 'Snacks & Beverages',
      desc: 'Crispy ridged potato chips flavored with Indian spices',
      rating: '4.8',
      reviews: '3,700+',
      price: '₹30',
      originalPrice: '₹35',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_sb_3',
      name: 'Real Fruit Power Mixed Fruit Juice 1L',
      brand: 'Real',
      subcategory: 'Snacks & Beverages',
      desc: 'Rich in Vitamin C with natural fruit goodness & zero preservatives',
      rating: '4.8',
      reviews: '2,900+',
      price: '₹115',
      originalPrice: '₹140',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_sb_4',
      name: 'Nescafe Classic Instant Coffee 100g Jar',
      brand: 'Nescafe',
      subcategory: 'Snacks & Beverages',
      desc: '100% pure instant coffee powder crafted from Robusta beans',
      rating: '4.9',
      reviews: '4,800+',
      price: '₹320',
      originalPrice: '₹380',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_sb_5',
      name: 'Brooke Bond Red Label Strong Tea 500g',
      brand: 'Red Label',
      subcategory: 'Snacks & Beverages',
      desc: 'Rich aroma & deep color black tea leaves for perfect chai',
      rating: '4.9',
      reviews: '5,200+',
      price: '₹260',
      originalPrice: '₹310',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_sb_6',
      name: 'Haldiram\'s Nagpur Spicy Bhujia Sev 400g',
      brand: 'Haldiram\'s',
      subcategory: 'Snacks & Beverages',
      desc: 'Crispy fried moth bean flour spicy namkeen snack',
      rating: '4.8',
      reviews: '3,100+',
      price: '₹105',
      originalPrice: '₹130',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },

    // --- OIL & MASALA ---
    {
      id: 'dn_om_1',
      name: 'Fortune Sunlite Sunflower Oil 1L',
      brand: 'Fortune',
      subcategory: 'Oil & Masala',
      desc: 'Refined sunflower cooking oil enriched with Vitamin A & D',
      rating: '4.8',
      reviews: '1,890+',
      price: '₹145',
      originalPrice: '₹175',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_om_2',
      name: 'Freedom Filtered Groundnut Oil 1L',
      brand: 'Freedom',
      subcategory: 'Oil & Masala',
      desc: 'Pure filtered peanut oil for authentic traditional aroma & fry',
      rating: '4.8',
      reviews: '1,650+',
      price: '₹185',
      originalPrice: '₹220',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_om_3',
      name: 'MDH Kitchen King Universal Masala 100g',
      brand: 'MDH',
      subcategory: 'Oil & Masala',
      desc: 'Blend of coriander, cumin, turmeric & aromatic spices',
      rating: '4.9',
      reviews: '2,800+',
      price: '₹78',
      originalPrice: '₹95',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_om_4',
      name: 'Tata Sampann Red Chilli Powder 200g',
      brand: 'Tata Sampann',
      subcategory: 'Oil & Masala',
      desc: 'Rich red color & pungent flavor made from stemless chilies',
      rating: '4.8',
      reviews: '2,100+',
      price: '₹88',
      originalPrice: '₹110',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_om_5',
      name: 'Saffola Gold Pro Healthy Heart Oil 1L',
      brand: 'Saffola',
      subcategory: 'Oil & Masala',
      desc: 'Dual-seed blend of rice bran & sunflower oil with Oryzanol',
      rating: '4.9',
      reviews: '3,400+',
      price: '₹165',
      originalPrice: '₹195',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_om_6',
      name: 'Everest Pure Turmeric Powder 200g',
      brand: 'Everest',
      subcategory: 'Oil & Masala',
      desc: '100% natural golden turmeric powder high in curcumin',
      rating: '4.9',
      reviews: '2,750+',
      price: '₹62',
      originalPrice: '₹78',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },

    // --- HOUSEHOLD ---
    {
      id: 'dn_hh_1',
      name: 'Surf Excel Easy Wash Detergent Powder 1kg',
      brand: 'Surf Excel',
      subcategory: 'Household',
      desc: 'Super-fine washing powder that dissolves fast & removes tough stains',
      rating: '4.9',
      reviews: '6,100+',
      price: '₹140',
      originalPrice: '₹170',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_hh_2',
      name: 'Vim Lemon Dishwash Liquid Gel 500ml',
      brand: 'Vim',
      subcategory: 'Household',
      desc: '1 spoon clean power infused with real lemon juice for grease-free utensils',
      rating: '4.9',
      reviews: '4,900+',
      price: '₹115',
      originalPrice: '₹140',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_hh_3',
      name: 'Lizol Disinfectant Surface Floor Cleaner Citrus 1L',
      brand: 'Lizol',
      subcategory: 'Household',
      desc: 'Kills 99.9% germs & leaves pleasant citrus fragrance on marble & tile floors',
      rating: '4.8',
      reviews: '3,800+',
      price: '₹210',
      originalPrice: '₹245',
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_hh_4',
      name: 'Presto Medium Oxo-Biodegradable Garbage Bags 30s',
      brand: 'Presto',
      subcategory: 'Household',
      desc: 'Leak-proof strong disposal bags with tie-string for kitchen waste',
      rating: '4.7',
      reviews: '1,950+',
      price: '₹125',
      originalPrice: '₹160',
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_hh_5',
      name: 'Comfort After Wash Fabric Conditioner 860ml',
      brand: 'Comfort',
      subcategory: 'Household',
      desc: 'Adds softness & long-lasting morning fresh fragrance to clothes',
      rating: '4.8',
      reviews: '2,600+',
      price: '₹220',
      originalPrice: '₹270',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_hh_6',
      name: 'Colin Glass & Surface Cleaner Spray 500ml',
      brand: 'Colin',
      subcategory: 'Household',
      desc: 'Shine boosters for streak-free glass, mirror & appliance cleaning',
      rating: '4.8',
      reviews: '2,150+',
      price: '₹105',
      originalPrice: '₹130',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },

    // --- PERSONAL CARE ---
    {
      id: 'dn_pc_1',
      name: 'Dove Intense Repair Damage Care Shampoo 650ml',
      brand: 'Dove',
      subcategory: 'Personal Care',
      desc: 'Keratin repair actives nourish damaged hair & reduce breakage',
      rating: '4.9',
      reviews: '5,800+',
      price: '₹480',
      originalPrice: '₹599',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_pc_2',
      name: 'Dettol Original Germ Protection Bathing Soap (Pack of 4)',
      brand: 'Dettol',
      subcategory: 'Personal Care',
      desc: 'Iconic pine fragrance soap offering 99.9% germ protection',
      rating: '4.9',
      reviews: '6,400+',
      price: '₹185',
      originalPrice: '₹220',
      image: 'https://images.unsplash.com/photo-1607006482602-76ca0fd2f88d?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_pc_3',
      name: 'Colgate Strong Teeth Dental Cream Toothpaste 500g',
      brand: 'Colgate',
      subcategory: 'Personal Care',
      desc: 'Amino power formula strengthens enamel & prevents cavities',
      rating: '4.9',
      reviews: '7,100+',
      price: '₹215',
      originalPrice: '₹260',
      image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_pc_4',
      name: 'Himalaya Purifying Neem Face Wash 150ml',
      brand: 'Himalaya',
      subcategory: 'Personal Care',
      desc: 'Herbal formula with neem & turmeric prevents pimples & oily shine',
      rating: '4.8',
      reviews: '4,600+',
      price: '₹165',
      originalPrice: '₹210',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_pc_5',
      name: 'Nivea Soft Light Moisturising Cream 200ml',
      brand: 'Nivea',
      subcategory: 'Personal Care',
      desc: 'Quick-absorbing non-greasy cream enriched with Jojoba Oil & Vitamin E',
      rating: '4.9',
      reviews: '3,900+',
      price: '₹265',
      originalPrice: '₹330',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
    {
      id: 'dn_pc_6',
      name: 'Wild Stone Code Titanium Body Spray Deodorant 150ml',
      brand: 'Wild Stone',
      subcategory: 'Personal Care',
      desc: 'Long-lasting masculine fresh fragrance for 24-hr odor control',
      rating: '4.7',
      reviews: '2,400+',
      price: '₹225',
      originalPrice: '₹299',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80',
      assured: true,
      deliveryTime: '⚡ 15-30 mins',
    },
  ],
  Food: [
    {
      id: 'food_1',
      name: 'Hyderabadi Chicken Dum Biryani Special',
      subcategory: 'Restaurants',
      cuisine: 'Biryani',
      isVeg: false,
      desc: 'Long-grain aromatic basmati rice cooked with succulent chicken & secret spices',
      rating: '4.9',
      reviews: '3,850+',
      price: '₹340',
      priceNum: 340,
      originalPrice: '₹450',
      discountNum: 24,
      deliveryTime: '25 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_2',
      name: 'Butter Chicken & Garlic Naan Combo',
      subcategory: 'Restaurants',
      cuisine: 'North Indian',
      isVeg: false,
      desc: 'Creamy Mughlai butter chicken served with 2 hot butter garlic naans',
      rating: '4.8',
      reviews: '2,100+',
      price: '₹380',
      priceNum: 380,
      originalPrice: '₹490',
      discountNum: 22,
      deliveryTime: '30 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_3',
      name: 'Gourmet Double Cheese Burger Meal',
      subcategory: 'Fast Food',
      cuisine: 'Fast Food',
      isVeg: false,
      desc: 'Grilled juicy patty with double cheddar cheese, fries & chilled soda',
      rating: '4.8',
      reviews: '1,450+',
      price: '₹240',
      priceNum: 240,
      originalPrice: '₹320',
      discountNum: 25,
      deliveryTime: '20 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_4',
      name: 'Paneer Butter Masala & Tandoori Roti Combo',
      subcategory: 'Restaurants',
      cuisine: 'North Indian',
      isVeg: true,
      desc: 'Fresh cottage cheese in rich tomato butter gravy with 3 tandoori rotis',
      rating: '4.8',
      reviews: '1,980+',
      price: '₹280',
      priceNum: 280,
      originalPrice: '₹350',
      discountNum: 20,
      deliveryTime: '25 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_5',
      name: 'Overloaded Pepperoni & Cheese Pizza 12"',
      subcategory: 'Fast Food',
      cuisine: 'Italian',
      isVeg: false,
      desc: 'Hand-tossed sourdough crust topped with mozzarella & smoky pepperoni',
      rating: '4.9',
      reviews: '2,750+',
      price: '₹499',
      priceNum: 499,
      originalPrice: '₹650',
      discountNum: 23,
      deliveryTime: '35 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_6',
      name: 'Special Masala Dosa & Filter Coffee',
      subcategory: 'Restaurants',
      cuisine: 'South Indian',
      isVeg: true,
      desc: 'Crispy golden crepe stuffed with potato masala served with sambar & coconut chutney',
      rating: '4.9',
      reviews: '3,120+',
      price: '₹160',
      priceNum: 160,
      originalPrice: '₹200',
      discountNum: 20,
      deliveryTime: '20 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_7',
      name: 'Schezwan Hakka Noodles & Chili Chicken',
      subcategory: 'Restaurants',
      cuisine: 'Chinese',
      isVeg: false,
      desc: 'Spicy wok-tossed noodles served with savory diced chili chicken gravy',
      rating: '4.7',
      reviews: '1,890+',
      price: '₹290',
      priceNum: 290,
      originalPrice: '₹360',
      discountNum: 19,
      deliveryTime: '30 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'food_8',
      name: 'Belgian Chocolate Lava Cake & Ice Cream',
      subcategory: 'Bakeries',
      cuisine: 'Desserts',
      isVeg: true,
      desc: 'Warm molten chocolate cake paired with vanilla bean ice cream scoop',
      rating: '4.9',
      reviews: '2,400+',
      price: '₹180',
      priceNum: 180,
      originalPrice: '₹230',
      discountNum: 21,
      deliveryTime: '25 mins',
      hasOffer: true,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Services: [
    {
      id: 'srv_1',
      name: 'Full Home Deep Cleaning Service',
      subcategory: 'Cleaning',
      serviceType: 'Cleaning',
      desc: 'Complete kitchen, bathroom, floor scrub & furniture vacuuming by experts',
      rating: '4.9',
      reviews: '1,420+',
      price: '₹1,499',
      priceNum: 1499,
      originalPrice: '₹1,999',
      discountNum: 25,
      serviceTime: '1-2 hours',
      bookingMode: 'scheduled',
      availableToday: true,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_2',
      name: 'Split AC Power Jet Servicing & Gas Check',
      subcategory: 'AC Service',
      serviceType: 'AC Service',
      desc: 'Deep foam jet cleaning, filter wash, cooling coil inspection & gas pressure check',
      rating: '4.8',
      reviews: '2,890+',
      price: '₹599',
      priceNum: 599,
      originalPrice: '₹799',
      discountNum: 25,
      serviceTime: '30-45 mins',
      bookingMode: 'instant',
      availableToday: true,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_3',
      name: 'Emergency Plumbing Repair & Leakage Fixing',
      subcategory: 'Plumber',
      serviceType: 'Plumber',
      desc: 'Tap repair, pipe leak fix, drain unblocking & flush tank fitting by certified plumber',
      rating: '4.8',
      reviews: '1,150+',
      price: '₹299',
      priceNum: 299,
      originalPrice: '₹399',
      discountNum: 25,
      serviceTime: '30-45 mins',
      bookingMode: 'instant',
      availableToday: true,
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_4',
      name: 'Electrical Repairs & MCB/Switchboard Installation',
      subcategory: 'Electrician',
      serviceType: 'Electrician',
      desc: 'Short circuit fix, heavy appliance wiring, fan & light fixture fitting',
      rating: '4.9',
      reviews: '1,780+',
      price: '₹349',
      priceNum: 349,
      originalPrice: '₹499',
      discountNum: 30,
      serviceTime: '30-45 mins',
      bookingMode: 'instant',
      availableToday: true,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_5',
      name: 'Washing Machine Repair & Motor Inspection',
      subcategory: 'Appliance Repair',
      serviceType: 'Appliance Repair',
      desc: 'Top load & front load diagnosis, drum belt replacement & noise fix',
      rating: '4.7',
      reviews: '940+',
      price: '₹449',
      priceNum: 449,
      originalPrice: '₹599',
      discountNum: 25,
      serviceTime: '1-2 hours',
      bookingMode: 'scheduled',
      availableToday: true,
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_6',
      name: 'Luxury Spa Facial & De-Tan Pedicure Package',
      subcategory: 'Beauty & Wellness',
      serviceType: 'Beauty & Wellness',
      desc: 'Organic glow facial, foot reflexology massage & herbal de-tan wrap at home',
      rating: '4.9',
      reviews: '2,100+',
      price: '₹1,299',
      priceNum: 1299,
      originalPrice: '₹1,799',
      discountNum: 27,
      serviceTime: '1-2 hours',
      bookingMode: 'both',
      availableToday: true,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Stay: [
    {
      id: 'stay_1',
      name: 'Coorg Heritage Villa',
      subcategory: 'Villas',
      propertyType: 'Villas',
      starRating: 5,
      location: 'Coorg, Karnataka',
      locationCity: 'Coorg',
      desc: 'Luxury villa nestled amidst coffee plantations with private plunge pool and breakfast.',
      rating: '4.9',
      reviews: '630',
      price: '₹7,250 / night',
      priceNum: 7250,
      originalPrice: '₹9,500',
      discount: '24% OFF',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Pool', 'Free Wi-Fi', 'Breakfast', 'Parking', 'AC'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_2',
      name: 'Goa Luxury Beachfront Resort',
      subcategory: 'Resorts',
      propertyType: 'Resorts',
      starRating: 5,
      location: 'Goa',
      locationCity: 'Goa',
      desc: 'Direct beach access resort with infinity pool, sea view balconies & luxury spa.',
      rating: '4.9',
      reviews: '920',
      price: '₹4,999 / night',
      priceNum: 4999,
      originalPrice: '₹7,500',
      discount: '33% OFF',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Beach Access', 'Pool', 'Spa', 'Free Wi-Fi', 'AC', 'Restaurant'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_3',
      name: 'Ooty Tea Estate Cottage',
      subcategory: 'Homestays',
      propertyType: 'Homestays',
      starRating: 4,
      location: 'Ooty, Tamil Nadu',
      locationCity: 'Ooty',
      desc: 'Panoramic Nilgiri hills view cottage with bonfire lounge & organic farm dining.',
      rating: '4.8',
      reviews: '480',
      price: '₹3,200 / night',
      priceNum: 3200,
      originalPrice: '₹4,800',
      discount: '33% OFF',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Breakfast', 'Parking', 'Free Wi-Fi', 'AC'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_4',
      name: 'Jaipur Royal Heritage Palace',
      subcategory: 'Hotels',
      propertyType: 'Hotels',
      starRating: 5,
      location: 'Jaipur, Rajasthan',
      locationCity: 'Jaipur',
      desc: 'Traditional Rajasthani heritage palace hotel with royal suites & courtyard shows.',
      rating: '4.9',
      reviews: '810',
      price: '₹5,499 / night',
      priceNum: 5499,
      originalPrice: '₹7,999',
      discount: '31% OFF',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Restaurant', 'Pool', 'Free Wi-Fi', 'AC', 'Spa'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_5',
      name: 'Bengaluru Central Business Hotel',
      subcategory: 'Hotels',
      propertyType: 'Hotels',
      starRating: 4,
      location: 'Bengaluru, Karnataka',
      locationCity: 'Bengaluru',
      desc: 'Modern corporate hotel in MG Road with 24/7 fitness center & fine dining.',
      rating: '4.7',
      reviews: '340',
      price: '₹3,899 / night',
      priceNum: 3899,
      originalPrice: '₹5,200',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Free Wi-Fi', 'Gym', 'Restaurant', 'AC', 'Parking'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_6',
      name: 'Mysuru Palace View Suites',
      subcategory: 'Hotels',
      propertyType: 'Hotels',
      starRating: 3,
      location: 'Mysuru, Karnataka',
      locationCity: 'Mysuru',
      desc: 'Boutique hotel offering direct royal palace views, rooftop dining & heritage suites.',
      rating: '4.8',
      reviews: '290',
      price: '₹2,799 / night',
      priceNum: 2799,
      originalPrice: '₹3,999',
      discount: '30% OFF',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Parking', 'Breakfast', 'Free Wi-Fi', 'AC', 'Restaurant'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_7',
      name: 'Wayanad Forest Retreat',
      subcategory: 'Resorts',
      propertyType: 'Resorts',
      starRating: 5,
      location: 'Wayanad, Kerala',
      locationCity: 'Wayanad',
      desc: 'Eco resort set in Western Ghats rainforests with infinity pool & wildlife safaris.',
      rating: '4.8',
      reviews: '510',
      price: '₹6,499 / night',
      priceNum: 6499,
      originalPrice: '₹8,500',
      discount: '23% OFF',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Pool', 'Nature View', 'Breakfast', 'Free Wi-Fi', 'AC', 'Spa'],
      deliveryTime: 'Free cancellation',
    },
    {
      id: 'stay_8',
      name: 'Bengaluru Luxury Serviced Apartment',
      subcategory: 'Apartments',
      propertyType: 'Apartments',
      starRating: 4,
      location: 'Bengaluru, Karnataka',
      locationCity: 'Bengaluru',
      desc: 'Spacious 2BHK luxury serviced apartment with modular kitchen & high-speed Wi-Fi.',
      rating: '4.6',
      reviews: '210',
      price: '₹4,299 / night',
      priceNum: 4299,
      originalPrice: '₹5,800',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Kitchen', 'Free Wi-Fi', 'Parking', 'AC', 'Gym'],
      deliveryTime: 'Free cancellation',
    },
  ],
  Travel: [
    {
      id: 'bus_1',
      name: 'VRL Travels - AC Sleeper (2+1)',
      subcategory: 'AC Sleeper',
      operator: 'VRL Travels',
      busType: 'AC Sleeper',
      route: 'Bangalore ➔ Goa',
      departureTime: '09:30 PM',
      departureSlot: 'Evening (6 PM - 11 PM)',
      boardingPoints: ['Majestic', 'Madiwala', 'Silk Board', 'Yeshwantpur'],
      droppingPoints: ['Panaji', 'Mapusa', 'Madgaon'],
      seatsAvailable: 14,
      desc: 'Individual TV, clean blankets, charging point, water bottle & live GPS tracking',
      rating: '4.9',
      reviews: '2,480+',
      price: '₹1,299',
      priceNum: 1299,
      originalPrice: '₹1,600',
      discountNum: 19,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Live Tracking', 'Charging Point', 'Water Bottle', 'Blanket', 'Reading Light'],
    },
    {
      id: 'bus_2',
      name: 'KSRTC Airavat Club Class Multi-Axle',
      subcategory: 'Volvo Multi-Axle',
      operator: 'KSRTC',
      busType: 'Volvo Multi-Axle',
      route: 'Bangalore ➔ Chennai',
      departureTime: '06:30 AM',
      departureSlot: 'Morning (6 AM - 12 PM)',
      boardingPoints: ['Majestic', 'Shantinagar', 'Electronic City', 'Hosur'],
      droppingPoints: ['Koyambedu', 'Guindy', 'Tambaram'],
      seatsAvailable: 22,
      desc: 'Premium Volvo Club Class with reclining ergonomic seats & free Wi-Fi',
      rating: '4.8',
      reviews: '4,150+',
      price: '₹850',
      priceNum: 850,
      originalPrice: '₹1,050',
      discountNum: 19,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Live Tracking', 'Emergency Contact', 'Water Bottle', 'Wi-Fi'],
    },
    {
      id: 'bus_3',
      name: 'IntrCity SmartBus - Electric AC Sleeper',
      subcategory: 'Electric Bus',
      operator: 'IntrCity SmartBus',
      busType: 'Electric Bus',
      route: 'Bangalore ➔ Hyderabad',
      departureTime: '11:15 PM',
      departureSlot: 'Night (After 11 PM)',
      boardingPoints: ['Majestic', 'Hebbal', 'Yelahanka', 'KIAL Airport Road'],
      droppingPoints: ['Gachibowli', 'Ameerpet', 'MGBS'],
      seatsAvailable: 8,
      desc: 'Smart lounge boarding, private cabin sleeper pods with personal display screen',
      rating: '4.9',
      reviews: '1,890+',
      price: '₹1,499',
      priceNum: 1499,
      originalPrice: '₹1,999',
      discountNum: 25,
      image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=500&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Live Tracking', 'Lounge Access', 'Blanket', 'Charging Point', 'Snacks'],
    },
    {
      id: 'bus_4',
      name: 'Orange Tours & Travels - AC Seater / Sleeper',
      subcategory: 'AC Seater',
      operator: 'Orange Travels',
      busType: 'AC Seater',
      route: 'Bangalore ➔ Coimbatore',
      departureTime: '02:30 PM',
      departureSlot: 'Afternoon (12 PM - 6 PM)',
      boardingPoints: ['Madiwala', 'Silk Board', 'Electronic City'],
      droppingPoints: ['Gandhipuram', 'Omni Bus Stand', 'KMCH'],
      seatsAvailable: 28,
      desc: 'Semi-sleeper pushback seats with high-speed USB-C chargers & air suspension',
      rating: '4.7',
      reviews: '1,620+',
      price: '₹699',
      priceNum: 699,
      originalPrice: '₹899',
      discountNum: 22,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Live Tracking', 'Charging Point', 'Water Bottle'],
    },
    {
      id: 'bus_5',
      name: 'SRS Travels - Non-AC Sleeper Coach',
      subcategory: 'Non-AC Sleeper',
      operator: 'SRS Travels',
      busType: 'Non-AC Sleeper',
      route: 'Bangalore ➔ Hubli',
      departureTime: '10:00 PM',
      departureSlot: 'Evening (6 PM - 11 PM)',
      boardingPoints: ['Majestic', 'Yeshwantpur', 'Nelamangala'],
      droppingPoints: ['Old Bus Stand', 'Chennamma Circle', 'Gokul Road'],
      seatsAvailable: 6,
      desc: 'Affordable sleeper berths with curtains, charging sockets & luggage hold',
      rating: '4.6',
      reviews: '920+',
      price: '₹550',
      priceNum: 550,
      originalPrice: '₹700',
      discountNum: 21,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
      assured: true,
      amenities: ['Charging Point', 'Emergency Contact'],
    },
  ],
  Healthcare: [
    {
      id: 'srv_hc_1',
      name: 'Doctor Video Consultation',
      subcategory: 'Clinics',
      desc: 'Connect with verified MBBS/MD specialist • Instant 15 mins slot',
      rating: '4.9',
      reviews: '520+',
      price: '₹399',
      originalPrice: '₹699',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_hc_2',
      name: 'Full Body Health Checkup',
      subcategory: 'Diagnostic Centers',
      desc: '65+ essential blood tests with free doorstep sample collection',
      rating: '4.8',
      reviews: '340+',
      price: '₹999',
      originalPrice: '₹1,999',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_hc_3',
      name: 'Dental Care & Scaling',
      subcategory: 'Dental Care',
      desc: 'Pain-free consultation, teeth cleaning & cavity inspection',
      rating: '4.9',
      reviews: '210+',
      price: '₹499',
      originalPrice: '₹999',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_hc_4',
      name: 'Home Physiotherapy Session',
      subcategory: 'Physiotherapy',
      desc: 'Certified physiotherapist for back, joint & rehabilitation care',
      rating: '4.9',
      reviews: '180+',
      price: '₹699',
      originalPrice: '₹1,200',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  'Home Services': [
    {
      id: 'srv_hs_1',
      name: 'AC Repair & Deep Jet Wash',
      subcategory: 'AC Repair',
      desc: 'Complete cooling coil jet wash, gas leak check & 30-day warranty',
      rating: '4.9',
      reviews: '850+',
      price: '₹499',
      originalPrice: '₹899',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_hs_2',
      name: 'Electrician Home Inspection',
      subcategory: 'Electrician',
      desc: 'Switchboard, MCB, appliance wiring & chandelier fitting',
      rating: '4.8',
      reviews: '410+',
      price: '₹199',
      originalPrice: '₹349',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_hs_3',
      name: 'Plumbing & Leakage Fix',
      subcategory: 'Plumber',
      desc: 'Tap, flush tank, sink pipe repair & bathroom drainage clearing',
      rating: '4.8',
      reviews: '390+',
      price: '₹249',
      originalPrice: '₹499',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_hs_4',
      name: 'Complete Home Deep Cleaning',
      subcategory: 'Home Cleaning',
      desc: 'Kitchen, bathroom & living room machine scrubbing & sanitization',
      rating: '4.9',
      reviews: '620+',
      price: '₹1,499',
      originalPrice: '₹2,499',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Legal: [
    {
      id: 'srv_leg_1',
      name: 'Legal Consultation',
      subcategory: 'Legal Consultation',
      desc: '30-minute private phone consultation with High Court Advocate',
      rating: '4.9',
      reviews: '310+',
      price: '₹799',
      originalPrice: '₹1,500',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_leg_2',
      name: 'Rental Agreement Drafting',
      subcategory: 'Agreement Drafting',
      desc: 'E-stamped government legal draft delivered to doorstep',
      rating: '4.8',
      reviews: '480+',
      price: '₹499',
      originalPrice: '₹899',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_leg_3',
      name: 'Company & GST Registration',
      subcategory: 'Company Registration',
      desc: 'Private Limited / LLP setup with DIN, PAN & certificate of incorporation',
      rating: '4.9',
      reviews: '190+',
      price: '₹2,499',
      originalPrice: '₹4,500',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Financial: [
    {
      id: 'srv_fin_1',
      name: 'CA Tax & ITR Filing',
      subcategory: 'Tax Planning',
      desc: 'Expert CA review, maximum deductions & hassle-free e-filing',
      rating: '4.9',
      reviews: '670+',
      price: '₹699',
      originalPrice: '₹1,200',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_fin_2',
      name: 'Home Loan & Advisory',
      subcategory: 'Home Loans',
      desc: 'Lowest interest rates comparison across top 12 banks with 0 fee',
      rating: '4.8',
      reviews: '280+',
      price: '₹299',
      originalPrice: '₹500',
      image: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Digital: [
    {
      id: 'srv_dig_1',
      name: 'Website & App Development',
      subcategory: 'Website Development',
      desc: 'Custom modern responsive React website with SEO & hosting setup',
      rating: '4.9',
      reviews: '140+',
      price: '₹8,999',
      originalPrice: '₹15,000',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_dig_2',
      name: 'UI/UX & Branding Design',
      subcategory: 'UI/UX Design',
      desc: 'Modern mobile app UI/UX, brand identity & logo design package',
      rating: '4.9',
      reviews: '195+',
      price: '₹3,499',
      originalPrice: '₹6,000',
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Automobile: [
    {
      id: 'srv_auto_1',
      name: 'Doorstep Foam Car Wash',
      subcategory: 'Car Wash',
      desc: 'High-pressure foam wash, interior vacuuming & tyre polish',
      rating: '4.8',
      reviews: '560+',
      price: '₹449',
      originalPrice: '₹799',
      image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_auto_2',
      name: 'Periodic Car Service',
      subcategory: 'Car Service',
      desc: 'Engine oil replacement, oil filter & 35-point health check',
      rating: '4.9',
      reviews: '310+',
      price: '₹1,899',
      originalPrice: '₹2,800',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Education: [
    {
      id: 'srv_edu_1',
      name: '1-on-1 Online Tutoring',
      subcategory: 'Online Courses',
      desc: 'Personalized Math, Science & Coding sessions with top educators',
      rating: '4.9',
      reviews: '410+',
      price: '₹499',
      originalPrice: '₹800',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_edu_2',
      name: 'AI & Data Science Masterclass',
      subcategory: 'Skill Development',
      desc: 'Industry-certified project masterclass with placement assistance',
      rating: '4.9',
      reviews: '290+',
      price: '₹4,999',
      originalPrice: '₹8,999',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Fitness: [
    {
      id: 'srv_fit_1',
      name: 'Personal Fitness Trainer',
      subcategory: 'Personal Training',
      desc: 'Home or online 1-on-1 workout training with customized diet plan',
      rating: '4.9',
      reviews: '230+',
      price: '₹899',
      originalPrice: '₹1,500',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
    {
      id: 'srv_fit_2',
      name: 'Full Body Ayurvedic Massage',
      subcategory: 'Spa Services',
      desc: '60-min herbal oil deep relaxation therapy by certified therapists',
      rating: '4.8',
      reviews: '175+',
      price: '₹1,299',
      originalPrice: '₹2,100',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
  Events: [
    {
      id: 'srv_ev_1',
      name: 'Event & Wedding Photography',
      subcategory: 'Photography',
      desc: 'Full-day candid & traditional photography with edited digital album',
      rating: '4.9',
      reviews: '190+',
      price: '₹3,999',
      originalPrice: '₹6,500',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=80',
      assured: true,
    },
  ],
};

// General category icon mapping
const getCategoryIconName = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('fruit') || n.includes('veg') || n.includes('apple')) return 'Apple';
  if (n.includes('groc') || n.includes('staple') || n.includes('package') || n.includes('atta') || n.includes('rice')) return 'Package';
  if (n.includes('dairy') || n.includes('milk') || n.includes('egg') || n.includes('bread')) return 'Milk';
  if (n.includes('snack') || n.includes('beverage') || n.includes('cookie') || n.includes('drink')) return 'Cookie';
  if (n.includes('oil') || n.includes('masala') || n.includes('flame') || n.includes('spice')) return 'Flame';
  if (n.includes('house') || n.includes('clean') || n.includes('detergent') || n.includes('sparkles')) return 'Sparkles';
  if (n.includes('personal') || n.includes('care') || n.includes('soap') || n.includes('heart')) return 'Heart';
  if (n.includes('health') || n.includes('doctor')) return 'Activity';
  if (n.includes('home') || n.includes('repair')) return 'Home';
  if (n.includes('legal') || n.includes('law')) return 'Scale';
  if (n.includes('finan') || n.includes('tax') || n.includes('loan')) return 'DollarSign';
  if (n.includes('digit') || n.includes('web') || n.includes('tech')) return 'Cpu';
  if (n.includes('auto') || n.includes('car')) return 'Car';
  if (n.includes('edu') || n.includes('course')) return 'GraduationCap';
  if (n.includes('fit') || n.includes('gym')) return 'Dumbbell';
  if (n.includes('event') || n.includes('photo')) return 'PartyPopper';
  if (n.includes('business')) return 'Building2';
  if (n.includes('insur')) return 'Shield';
  if (n.includes('travel')) return 'Plane';
  if (n.includes('stay') || n.includes('hotel')) return 'Bed';
  if (n.includes('employ') || n.includes('job')) return 'Briefcase';
  if (n.includes('all') || n.includes('shop') || n.includes('store') || n.includes('basket')) return 'ShoppingBag';
  return 'Package';
};

export default function CategoryDetails() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const routeParams = (route.params as any) || {};
  const categoryName = routeParams.categoryName || 'Services';

  const { colors, themeMode } = useThemeStore();
  const isLight = colors.background === '#FFFDF5' || colors.background === '#FFFFFF' || colors.background === '#F8FAFC' || colors.background === '#FFF8E8' || themeMode === 'light';

  const loadAllOrders = useOrderStore((state) => state.loadAllOrders);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState<string>('All');
  const [schedulingItem, setSchedulingItem] = useState<any | null>(null);
  const [selectedDateObj, setSelectedDateObj] = useState<any | null>(null);
  const [selectedSlotObj, setSelectedSlotObj] = useState<any | null>(null);

  // Service-Type Aware Field States
  const [consultationMode, setConsultationMode] = useState<'video' | 'clinic' | 'phone' | 'office'>('video');
  const [patientNameInput, setPatientNameInput] = useState('Rahul Kumar');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [selectedProblemPackage, setSelectedProblemPackage] = useState('Standard Service & Jet Wash');
  const [selectedAddress, setSelectedAddress] = useState('Koramangala 5th Block, Bangalore');
  const [selectedDuration, setSelectedDuration] = useState('1 Hour Session');
  const [vehicleModelInput, setVehicleModelInput] = useState('Honda City - Petrol (KA-01-MJ-1234)');
  const [fulfillmentMode, setFulfillmentMode] = useState<'doorstep' | 'workshop'>('doorstep');
  const [travelGuests, setTravelGuests] = useState('2 Travellers');
  const [stayRoomType, setStayRoomType] = useState('Deluxe Garden View');
  const [requirementBrief, setRequirementBrief] = useState('');

  // Cart & Wishlist Store State
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = (id: string) => wishlistItems.some((w) => w.id === id);

  // --- STAY MODULE ISOLATED STATE ---
  const isStayCategory = (categoryName || '').toLowerCase().includes('stay') || (categoryName || '').toLowerCase().includes('hotel') || (categoryName || '').toLowerCase().includes('resort');

  const [selectedDestination, setSelectedDestination] = useState<string>('All Destinations');
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);

  // Date Range Picker State
  const [checkInDate, setCheckInDate] = useState('12 Sep');
  const [checkOutDate, setCheckOutDate] = useState('15 Sep');
  const [stayNights, setStayNights] = useState(3);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Guest Selector State
  const [stayAdults, setStayAdults] = useState(2);
  const [stayChildren, setStayChildren] = useState(0);
  const [stayRooms, setStayRooms] = useState(1);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Filter, Sort & Map State
  const [isStayFilterOpen, setIsStayFilterOpen] = useState(false);
  const [selectedStaySort, setSelectedStaySort] = useState<'Recommended' | 'Price Low → High' | 'Price High → Low' | 'Rating'>('Recommended');
  const [isStaySortOpen, setIsStaySortOpen] = useState(false);
  const [isStayMapOpen, setIsStayMapOpen] = useState(false);

  // Applied Stay Filter Options
  const [selectedStayPriceRange, setSelectedStayPriceRange] = useState<string>('All');
  const [selectedStayPropTypes, setSelectedStayPropTypes] = useState<string[]>([]);
  const [selectedStayStarRatings, setSelectedStayStarRatings] = useState<number[]>([]);
  const [selectedStayGuestRating, setSelectedStayGuestRating] = useState<number | null>(null);
  const [selectedStayAmenities, setSelectedStayAmenities] = useState<string[]>([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);

  // Draft Stay Filter Options (inside modal before tapping Apply)
  const [draftStayPriceRange, setDraftStayPriceRange] = useState<string>('All');
  const [draftStayPropTypes, setDraftStayPropTypes] = useState<string[]>([]);
  const [draftStayStarRatings, setDraftStayStarRatings] = useState<number[]>([]);
  const [draftStayGuestRating, setDraftStayGuestRating] = useState<number | null>(null);
  const [draftStayAmenities, setDraftStayAmenities] = useState<string[]>([]);
  const [draftFreeCancelOnly, setDraftFreeCancelOnly] = useState(false);

  const openStayFilterModal = () => {
    setDraftStayPriceRange(selectedStayPriceRange);
    setDraftStayPropTypes([...selectedStayPropTypes]);
    setDraftStayStarRatings([...selectedStayStarRatings]);
    setDraftStayGuestRating(selectedStayGuestRating);
    setDraftStayAmenities([...selectedStayAmenities]);
    setDraftFreeCancelOnly(freeCancelOnly);
    setIsStayFilterOpen(true);
  };

  const resetStayDraftFilters = () => {
    setDraftStayPriceRange('All');
    setDraftStayPropTypes([]);
    setDraftStayStarRatings([]);
    setDraftStayGuestRating(null);
    setDraftStayAmenities([]);
    setDraftFreeCancelOnly(false);
  };

  const applyStayFilters = () => {
    setSelectedStayPriceRange(draftStayPriceRange);
    setSelectedStayPropTypes(draftStayPropTypes);
    setSelectedStayStarRatings(draftStayStarRatings);
    setSelectedStayGuestRating(draftStayGuestRating);
    setSelectedStayAmenities(draftStayAmenities);
    setFreeCancelOnly(draftFreeCancelOnly);
    setIsStayFilterOpen(false);
  };

  const stayActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStayPriceRange !== 'All') count++;
    if (selectedStayPropTypes.length > 0) count += selectedStayPropTypes.length;
    if (selectedStayStarRatings.length > 0) count += selectedStayStarRatings.length;
    if (selectedStayGuestRating !== null) count++;
    if (selectedStayAmenities.length > 0) count += selectedStayAmenities.length;
    if (freeCancelOnly) count++;
    return count;
  }, [
    selectedStayPriceRange,
    selectedStayPropTypes,
    selectedStayStarRatings,
    selectedStayGuestRating,
    selectedStayAmenities,
    freeCancelOnly,
  ]);

  // Products Specific Filter States (Applied & Draft)
  const isProductsCategory = (categoryName || '').toLowerCase().includes('product');

  const [selectedProdCategory, setSelectedProdCategory] = useState<string>('All');
  const [selectedProdBrand, setSelectedProdBrand] = useState<string>('All');
  const [selectedProdPrice, setSelectedProdPrice] = useState<string>('All');
  const [selectedProdRating, setSelectedProdRating] = useState<number | null>(null);
  const [selectedProdDiscount, setSelectedProdDiscount] = useState<string>('All');
  const [selectedProdInStockOnly, setSelectedProdInStockOnly] = useState<boolean>(false);

  // Draft States for Products Filter Modal
  const [draftProdCategory, setDraftProdCategory] = useState<string>('All');
  const [draftProdBrand, setDraftProdBrand] = useState<string>('All');
  const [draftProdPrice, setDraftProdPrice] = useState<string>('All');
  const [draftProdRating, setDraftProdRating] = useState<number | null>(null);
  const [draftProdDiscount, setDraftProdDiscount] = useState<string>('All');
  const [draftProdInStockOnly, setDraftProdInStockOnly] = useState<boolean>(false);

  const [isProdFilterOpen, setIsProdFilterOpen] = useState(false);

  const openProdFilterModal = () => {
    setDraftProdCategory(selectedProdCategory);
    setDraftProdBrand(selectedProdBrand);
    setDraftProdPrice(selectedProdPrice);
    setDraftProdRating(selectedProdRating);
    setDraftProdDiscount(selectedProdDiscount);
    setDraftProdInStockOnly(selectedProdInStockOnly);
    setIsProdFilterOpen(true);
  };

  const resetProdDraftFilters = () => {
    setDraftProdCategory('All');
    setDraftProdBrand('All');
    setDraftProdPrice('All');
    setDraftProdRating(null);
    setDraftProdDiscount('All');
    setDraftProdInStockOnly(false);
  };

  const applyProdFilters = () => {
    setSelectedProdCategory(draftProdCategory);
    setSelectedProdBrand(draftProdBrand);
    setSelectedProdPrice(draftProdPrice);
    setSelectedProdRating(draftProdRating);
    setSelectedProdDiscount(draftProdDiscount);
    setSelectedProdInStockOnly(draftProdInStockOnly);
    setIsProdFilterOpen(false);
  };

  const prodActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedProdCategory !== 'All') count++;
    if (selectedProdBrand !== 'All') count++;
    if (selectedProdPrice !== 'All') count++;
    if (selectedProdRating !== null) count++;
    if (selectedProdDiscount !== 'All') count++;
    if (selectedProdInStockOnly) count++;
    return count;
  }, [
    selectedProdCategory,
    selectedProdBrand,
    selectedProdPrice,
    selectedProdRating,
    selectedProdDiscount,
  ]);

  // Daily Needs Specific Filter States (Applied & Draft)
  const isDailyNeedsCategory = (categoryName || '').toLowerCase().includes('daily') || (categoryName || '').toLowerCase().includes('grocery') || (categoryName || '').toLowerCase().includes('need');

  const [selectedDnCategory, setSelectedDnCategory] = useState<string>('All');
  const [selectedDnBrand, setSelectedDnBrand] = useState<string>('All');
  const [selectedDnPrice, setSelectedDnPrice] = useState<string>('All');
  const [selectedDnRating, setSelectedDnRating] = useState<number | null>(null);
  const [selectedDnPackSize, setSelectedDnPackSize] = useState<string>('All');
  const [selectedDnInStockOnly, setSelectedDnInStockOnly] = useState<boolean>(false);
  const [selectedDnDeliveryTime, setSelectedDnDeliveryTime] = useState<string>('All');

  // Draft States for Daily Needs Filter Modal
  const [draftDnCategory, setDraftDnCategory] = useState<string>('All');
  const [draftDnBrand, setDraftDnBrand] = useState<string>('All');
  const [draftDnPrice, setDraftDnPrice] = useState<string>('All');
  const [draftDnRating, setDraftDnRating] = useState<number | null>(null);
  const [draftDnPackSize, setDraftDnPackSize] = useState<string>('All');
  const [draftDnInStockOnly, setDraftDnInStockOnly] = useState<boolean>(false);
  const [draftDnDeliveryTime, setDraftDnDeliveryTime] = useState<string>('All');

  const [isDnFilterOpen, setIsDnFilterOpen] = useState(false);

  const openDnFilterModal = () => {
    setDraftDnCategory(selectedDnCategory);
    setDraftDnBrand(selectedDnBrand);
    setDraftDnPrice(selectedDnPrice);
    setDraftDnRating(selectedDnRating);
    setDraftDnPackSize(selectedDnPackSize);
    setDraftDnInStockOnly(selectedDnInStockOnly);
    setDraftDnDeliveryTime(selectedDnDeliveryTime);
    setIsDnFilterOpen(true);
  };

  const resetDnDraftFilters = () => {
    setDraftDnCategory('All');
    setDraftDnBrand('All');
    setDraftDnPrice('All');
    setDraftDnRating(null);
    setDraftDnPackSize('All');
    setDraftDnInStockOnly(false);
    setDraftDnDeliveryTime('All');
  };

  const applyDnFilters = () => {
    setSelectedDnCategory(draftDnCategory);
    setSelectedDnBrand(draftDnBrand);
    setSelectedDnPrice(draftDnPrice);
    setSelectedDnRating(draftDnRating);
    setSelectedDnPackSize(draftDnPackSize);
    setSelectedDnInStockOnly(draftDnInStockOnly);
    setSelectedDnDeliveryTime(draftDnDeliveryTime);
    setIsDnFilterOpen(false);
  };

  const dnActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDnCategory !== 'All') count++;
    if (selectedDnBrand !== 'All') count++;
    if (selectedDnPrice !== 'All') count++;
    if (selectedDnRating !== null) count++;
    if (selectedDnPackSize !== 'All') count++;
    if (selectedDnInStockOnly) count++;
    if (selectedDnDeliveryTime !== 'All') count++;
    return count;
  }, [
    selectedDnCategory,
    selectedDnBrand,
    selectedDnPrice,
    selectedDnRating,
    selectedDnPackSize,
    selectedDnInStockOnly,
  ]);

  // Food Specific Filter States (Applied & Draft)
  const isFoodCategory = (categoryName || '').toLowerCase().includes('food') || (categoryName || '').toLowerCase().includes('restaurant') || (categoryName || '').toLowerCase().includes('dining');

  const [selectedFoodCuisine, setSelectedFoodCuisine] = useState<string>('All');
  const [selectedFoodVegMode, setSelectedFoodVegMode] = useState<string>('All');
  const [selectedFoodPrice, setSelectedFoodPrice] = useState<string>('All');
  const [selectedFoodRating, setSelectedFoodRating] = useState<number | null>(null);
  const [selectedFoodDeliveryTime, setSelectedFoodDeliveryTime] = useState<string>('All');
  const [selectedFoodOffersOnly, setSelectedFoodOffersOnly] = useState<boolean>(false);

  // Draft States for Food Filter Modal
  const [draftFoodCuisine, setDraftFoodCuisine] = useState<string>('All');
  const [draftFoodVegMode, setDraftFoodVegMode] = useState<string>('All');
  const [draftFoodPrice, setDraftFoodPrice] = useState<string>('All');
  const [draftFoodRating, setDraftFoodRating] = useState<number | null>(null);
  const [draftFoodDeliveryTime, setDraftFoodDeliveryTime] = useState<string>('All');
  const [draftFoodOffersOnly, setDraftFoodOffersOnly] = useState<boolean>(false);

  const [isFoodFilterOpen, setIsFoodFilterOpen] = useState(false);

  const openFoodFilterModal = () => {
    setDraftFoodCuisine(selectedFoodCuisine);
    setDraftFoodVegMode(selectedFoodVegMode);
    setDraftFoodPrice(selectedFoodPrice);
    setDraftFoodRating(selectedFoodRating);
    setDraftFoodDeliveryTime(selectedFoodDeliveryTime);
    setDraftFoodOffersOnly(selectedFoodOffersOnly);
    setIsFoodFilterOpen(true);
  };

  const resetFoodDraftFilters = () => {
    setDraftFoodCuisine('All');
    setDraftFoodVegMode('All');
    setDraftFoodPrice('All');
    setDraftFoodRating(null);
    setDraftFoodDeliveryTime('All');
    setDraftFoodOffersOnly(false);
  };

  const applyFoodFilters = () => {
    setSelectedFoodCuisine(draftFoodCuisine);
    setSelectedFoodVegMode(draftFoodVegMode);
    setSelectedFoodPrice(draftFoodPrice);
    setSelectedFoodRating(draftFoodRating);
    setSelectedFoodDeliveryTime(draftFoodDeliveryTime);
    setSelectedFoodOffersOnly(draftFoodOffersOnly);
    setIsFoodFilterOpen(false);
  };

  const foodActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedFoodCuisine !== 'All') count++;
    if (selectedFoodVegMode !== 'All') count++;
    if (selectedFoodPrice !== 'All') count++;
    if (selectedFoodRating !== null) count++;
    if (selectedFoodDeliveryTime !== 'All') count++;
    if (selectedFoodOffersOnly) count++;
    return count;
  }, [
    selectedFoodCuisine,
    selectedFoodVegMode,
    selectedFoodPrice,
    selectedFoodRating,
    selectedFoodDeliveryTime,
  ]);

  // Services Specific Filter States (Applied & Draft)
  const isServicesCategory = (categoryName || '').toLowerCase().includes('service') && !(categoryName || '').toLowerCase().includes('stay');

  const [selectedSrvType, setSelectedSrvType] = useState<string>('All');
  const [selectedSrvPrice, setSelectedSrvPrice] = useState<string>('All');
  const [selectedSrvRating, setSelectedSrvRating] = useState<number | null>(null);
  const [selectedSrvAvailability, setSelectedSrvAvailability] = useState<boolean>(false);
  const [selectedSrvTime, setSelectedSrvTime] = useState<string>('All');
  const [selectedSrvBookingMode, setSelectedSrvBookingMode] = useState<string>('All');

  // Draft States for Services Filter Modal
  const [draftSrvType, setDraftSrvType] = useState<string>('All');
  const [draftSrvPrice, setDraftSrvPrice] = useState<string>('All');
  const [draftSrvRating, setDraftSrvRating] = useState<number | null>(null);
  const [draftSrvAvailability, setDraftSrvAvailability] = useState<boolean>(false);
  const [draftSrvTime, setDraftSrvTime] = useState<string>('All');
  const [draftSrvBookingMode, setDraftSrvBookingMode] = useState<string>('All');

  const [isSrvFilterOpen, setIsSrvFilterOpen] = useState(false);

  const openSrvFilterModal = () => {
    setDraftSrvType(selectedSrvType);
    setDraftSrvPrice(selectedSrvPrice);
    setDraftSrvRating(selectedSrvRating);
    setDraftSrvAvailability(selectedSrvAvailability);
    setDraftSrvTime(selectedSrvTime);
    setDraftSrvBookingMode(selectedSrvBookingMode);
    setIsSrvFilterOpen(true);
  };

  const resetSrvDraftFilters = () => {
    setDraftSrvType('All');
    setDraftSrvPrice('All');
    setDraftSrvRating(null);
    setDraftSrvAvailability(false);
    setDraftSrvTime('All');
    setDraftSrvBookingMode('All');
  };

  const applySrvFilters = () => {
    setSelectedSrvType(draftSrvType);
    setSelectedSrvPrice(draftSrvPrice);
    setSelectedSrvRating(draftSrvRating);
    setSelectedSrvAvailability(draftSrvAvailability);
    setSelectedSrvTime(draftSrvTime);
    setSelectedSrvBookingMode(draftSrvBookingMode);
    setIsSrvFilterOpen(false);
  };

  const srvActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSrvType !== 'All') count++;
    if (selectedSrvPrice !== 'All') count++;
    if (selectedSrvRating !== null) count++;
    if (selectedSrvAvailability) count++;
    if (selectedSrvTime !== 'All') count++;
    if (selectedSrvBookingMode !== 'All') count++;
    return count;
  }, [
    selectedSrvType,
    selectedSrvPrice,
    selectedSrvRating,
    selectedSrvAvailability,
    selectedSrvTime,
  ]);

  // Travel / Bus Booking Specific Filter States (Applied & Draft)
  const isTravelCategory = (categoryName || '').toLowerCase().includes('travel') || (categoryName || '').toLowerCase().includes('bus');

  const [selectedBusDepartureTime, setSelectedBusDepartureTime] = useState<string>('All');
  const [selectedBusType, setSelectedBusType] = useState<string>('All');
  const [selectedBusOperator, setSelectedBusOperator] = useState<string>('All');
  const [selectedBusPrice, setSelectedBusPrice] = useState<string>('All');
  const [selectedBusBoarding, setSelectedBusBoarding] = useState<string>('All');
  const [selectedBusDropping, setSelectedBusDropping] = useState<string>('All');
  const [selectedBusSeatsAvailableOnly, setSelectedBusSeatsAvailableOnly] = useState<boolean>(false);
  const [selectedBusRating, setSelectedBusRating] = useState<number | null>(null);

  // Draft States for Bus Filter Modal
  const [draftBusDepartureTime, setDraftBusDepartureTime] = useState<string>('All');
  const [draftBusType, setDraftBusType] = useState<string>('All');
  const [draftBusOperator, setDraftBusOperator] = useState<string>('All');
  const [draftBusPrice, setDraftBusPrice] = useState<string>('All');
  const [draftBusBoarding, setDraftBusBoarding] = useState<string>('All');
  const [draftBusDropping, setDraftBusDropping] = useState<string>('All');
  const [draftBusSeatsAvailableOnly, setDraftBusSeatsAvailableOnly] = useState<boolean>(false);
  const [draftBusRating, setDraftBusRating] = useState<number | null>(null);

  const [isBusFilterOpen, setIsBusFilterOpen] = useState(false);

  const openBusFilterModal = () => {
    setDraftBusDepartureTime(selectedBusDepartureTime);
    setDraftBusType(selectedBusType);
    setDraftBusOperator(selectedBusOperator);
    setDraftBusPrice(selectedBusPrice);
    setDraftBusBoarding(selectedBusBoarding);
    setDraftBusDropping(selectedBusDropping);
    setDraftBusSeatsAvailableOnly(selectedBusSeatsAvailableOnly);
    setDraftBusRating(selectedBusRating);
    setIsBusFilterOpen(true);
  };

  const resetBusDraftFilters = () => {
    setDraftBusDepartureTime('All');
    setDraftBusType('All');
    setDraftBusOperator('All');
    setDraftBusPrice('All');
    setDraftBusBoarding('All');
    setDraftBusDropping('All');
    setDraftBusSeatsAvailableOnly(false);
    setDraftBusRating(null);
  };

  const applyBusFilters = () => {
    setSelectedBusDepartureTime(draftBusDepartureTime);
    setSelectedBusType(draftBusType);
    setSelectedBusOperator(draftBusOperator);
    setSelectedBusPrice(draftBusPrice);
    setSelectedBusBoarding(draftBusBoarding);
    setSelectedBusDropping(draftBusDropping);
    setSelectedBusSeatsAvailableOnly(draftBusSeatsAvailableOnly);
    setSelectedBusRating(draftBusRating);
    setIsBusFilterOpen(false);
  };

  const busActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBusDepartureTime !== 'All') count++;
    if (selectedBusType !== 'All') count++;
    if (selectedBusOperator !== 'All') count++;
    if (selectedBusPrice !== 'All') count++;
    if (selectedBusBoarding !== 'All') count++;
    if (selectedBusDropping !== 'All') count++;
    if (selectedBusSeatsAvailableOnly) count++;
    if (selectedBusRating !== null) count++;
    return count;
  }, [
    selectedBusDepartureTime,
    selectedBusType,
    selectedBusOperator,
    selectedBusPrice,
    selectedBusBoarding,
    selectedBusDropping,
    selectedBusSeatsAvailableOnly,
    selectedBusRating,
  ]);

  // Confirmed Stay Bookings Array
  const [myStayBookings, setMyStayBookings] = useState<Array<any>>([
    {
      id: 'CN-STAY-28491',
      hotelName: 'Coorg Heritage Villa',
      roomName: 'Deluxe Room',
      location: 'Coorg, Karnataka',
      checkIn: '12 Sep',
      checkOut: '15 Sep',
      nights: 3,
      guests: '2 Adults • 1 Room',
      totalPaid: '₹23,925',
      status: 'Confirmed',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    },
  ]);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [bookingsTab, setBookingsTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');

  const getDiscountBadgeText = (priceStr?: string, origPriceStr?: string) => {
    if (!priceStr || !origPriceStr) return '14% OFF';
    const p = parseInt(priceStr.replace(/[^\d]/g, ''), 10);
    const op = parseInt(origPriceStr.replace(/[^\d]/g, ''), 10);
    if (op > p && op > 0) {
      const pct = Math.round(((op - p) / op) * 100);
      return `${pct}% OFF`;
    }
    return '14% OFF';
  };

  // Voice Search Animation
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const wave1 = useRef(new Animated.Value(6)).current;
  const wave2 = useRef(new Animated.Value(14)).current;
  const wave3 = useRef(new Animated.Value(10)).current;
  const wave4 = useRef(new Animated.Value(18)).current;

  // Category-specific metadata resolver
  const catMeta = useMemo(() => {
    const cat = (categoryName || 'Services').toLowerCase().trim();

    if (cat.includes('prod')) {
      return {
        allPillLabel: 'All Products',
        sectionTitle: (sub: string) => (sub === 'All' ? 'POPULAR PRODUCTS' : `${sub.toUpperCase()} PRODUCTS`),
        countLabel: (count: number) => `${count} ${count === 1 ? 'product' : 'products'}`,
        priceLabel: 'Price',
        ctaText: 'Add to Cart',
        actionType: 'cart',
        emptyText: 'No products found',
        searchPlaceholder: 'Search products by brand, name or specs...',
      };
    }

    if (cat.includes('daily') || cat.includes('groc')) {
      return {
        allPillLabel: 'All',
        sectionTitle: (sub: string) => (sub === 'All' ? 'FRESH DAILY NEEDS & GROCERIES' : `${sub.toUpperCase()}`),
        countLabel: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
        priceLabel: 'Price',
        ctaText: 'Add to Cart',
        actionType: 'cart',
        emptyText: 'No matching grocery items found',
        searchPlaceholder: 'Search groceries, fruits, vegetables & more',
      };
    }

    if (cat.includes('food') || cat.includes('dine') || cat.includes('restau')) {
      return {
        allPillLabel: 'All Dishes',
        sectionTitle: (sub: string) => (sub === 'All' ? 'POPULAR FOOD' : `${sub.toUpperCase()} DISHES`),
        countLabel: (count: number) => `${count} ${count === 1 ? 'dish' : 'dishes'}`,
        priceLabel: 'Price',
        ctaText: 'Order Now',
        actionType: 'cart',
        emptyText: 'No food items found',
        searchPlaceholder: 'Search biryani, burgers, pizza, dishes...',
      };
    }

    if (cat.includes('stay') || cat.includes('hotel') || cat.includes('resort')) {
      return {
        allPillLabel: 'All Stays',
        sectionTitle: (sub: string) => (sub === 'All' ? 'POPULAR STAYS' : `${sub.toUpperCase()} STAYS`),
        countLabel: (count: number) => `${count} ${count === 1 ? 'stay' : 'stays'}`,
        priceLabel: 'Per Night',
        ctaText: 'Reserve Stay',
        actionType: 'booking',
        emptyText: 'No stays or hotels found',
        searchPlaceholder: 'Search resorts, hotels, homestays...',
      };
    }

    if (cat.includes('trav') || cat.includes('bus')) {
      return {
        allPillLabel: 'All Buses',
        sectionTitle: (sub: string) => (sub === 'All' ? 'AVAILABLE BUSES' : `${sub.toUpperCase()} BUSES`),
        countLabel: (count: number) => `${count} ${count === 1 ? 'bus' : 'buses'}`,
        priceLabel: 'Fare per seat',
        ctaText: 'Select Seats',
        actionType: 'booking',
        emptyText: 'No buses found for this route',
        searchPlaceholder: 'Search buses, operators, routes, boarding points...',
      };
    }

    if (cat.includes('job') || cat.includes('career')) {
      return {
        allPillLabel: 'All Roles',
        sectionTitle: (sub: string) => (sub === 'All' ? 'LATEST JOBS' : `${sub.toUpperCase()}`),
        countLabel: (count: number) => `${count} ${count === 1 ? 'opening' : 'openings'}`,
        priceLabel: 'Salary',
        ctaText: 'Apply Now',
        actionType: 'job',
        emptyText: 'No job openings found',
        searchPlaceholder: 'Search job title, skill, company, department, location...',
      };
    }

    // Default: SERVICES
    return {
      allPillLabel: 'All Services',
      sectionTitle: (sub: string) => (sub === 'All' ? 'POPULAR SERVICES' : `${sub.toUpperCase()} SERVICES`),
      countLabel: (count: number) => `${count} ${count === 1 ? 'service' : 'services'}`,
      priceLabel: 'Starting from',
      ctaText: 'Book Service',
      actionType: 'booking',
      emptyText: 'No services found',
      searchPlaceholder: 'Search home repair, doctors, legal, AC repair...',
    };
  }, [categoryName]);

  // Subcategories list matching active category
  const availableSubcats = useMemo(() => {
    if (categoryName === 'Jobs' || categoryName === 'Jobs & Careers') {
      return ['All', 'Full-Time Jobs', 'Internships', 'IT & Tech', 'Design', 'Marketing', 'Remote'];
    }
    
    // Check if categoryName exists in SIDEBAR_DATA
    const catSidebarKey = Object.keys(SIDEBAR_DATA).find(
      (k) => k.toLowerCase() === categoryName.toLowerCase() || categoryName.toLowerCase().includes(k.toLowerCase())
    );
    if (catSidebarKey && SIDEBAR_DATA[catSidebarKey]?.subcategories) {
      const rawSubcats = Object.keys(SIDEBAR_DATA[catSidebarKey].subcategories);
      return ['All', ...rawSubcats];
    }

    // Fallback to curated catalog keys
    if (CURATED_SERVICES_CATALOG[categoryName]) {
      const subSet = new Set(CURATED_SERVICES_CATALOG[categoryName].map((i) => i.subcategory));
      return ['All', ...Array.from(subSet)];
    }

    const rawSubcats = Object.keys(SIDEBAR_DATA['Services']?.subcategories || {});
    return ['All', ...rawSubcats];
  }, [categoryName]);

  // Sync initial subcategory param
  useEffect(() => {
    if (routeParams.subCategoryName && availableSubcats.includes(routeParams.subCategoryName)) {
      setSelectedSubcat(routeParams.subCategoryName);
    }
  }, [routeParams.subCategoryName, availableSubcats]);

  // Voice wave animation loop
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isVoiceListening) {
      anim = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1, { toValue: 18, duration: 260, useNativeDriver: false }),
            Animated.timing(wave1, { toValue: 6, duration: 260, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave2, { toValue: 8, duration: 220, useNativeDriver: false }),
            Animated.timing(wave2, { toValue: 22, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave3, { toValue: 20, duration: 280, useNativeDriver: false }),
            Animated.timing(wave3, { toValue: 6, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave4, { toValue: 8, duration: 200, useNativeDriver: false }),
            Animated.timing(wave4, { toValue: 18, duration: 200, useNativeDriver: false }),
          ]),
        ])
      );
      anim.start();
    } else {
      wave1.setValue(6);
      wave2.setValue(14);
      wave3.setValue(10);
      wave4.setValue(18);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isVoiceListening, wave1, wave2, wave3, wave4]);

  const handleMicPress = async () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      let isGranted = true;
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Connect Mobile needs microphone access for voice search.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (isGranted) {
        setIsVoiceListening(true);
        setTimeout(() => {
          const isDaily = categoryName.toLowerCase().includes('daily') || categoryName.toLowerCase().includes('groc');
          const simulatedTerms = isDaily
            ? ['Fresh Toned Milk', 'Aashirvaad Whole Wheat Atta', 'Red Tomatoes', 'Fortune Sunflower Oil', 'Dove Shampoo', 'Parle-G']
            : ['AC Repair', 'Doctor Consultation', 'Tax Filing', 'Plumber', 'Car Wash'];
          const randomTerm = simulatedTerms[Math.floor(Math.random() * simulatedTerms.length)];
          setSearchQuery(randomTerm);
          setIsVoiceListening(false);
        }, 2500);
      } else {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access in settings for voice search.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Settings', onPress: () => Linking.openSettings() }]
        );
      }
    } catch {
      setIsVoiceListening(false);
    }
  };

  // Compile active catalog items matching selected category & search query
  const displayedServices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const targetCategory = (categoryName || 'Services').toLowerCase().trim();
    let allServices: Array<any> = [];

    // Flatten catalog items matching category
    Object.keys(CURATED_SERVICES_CATALOG).forEach((catKey) => {
      const catKeyLower = catKey.toLowerCase().trim();
      let isMatch = false;

      if (targetCategory === 'all') {
        isMatch = true;
      } else if (targetCategory === 'services') {
        // Services category must exclude non-service categories
        isMatch = !['products', 'daily needs', 'food', 'stay', 'travel'].includes(catKeyLower);
      } else {
        isMatch =
          catKeyLower === targetCategory ||
          catKeyLower.includes(targetCategory) ||
          targetCategory.includes(catKeyLower);
      }

      if (isMatch) {
        const items = CURATED_SERVICES_CATALOG[catKey].map((it) => ({
          ...it,
          mainCategory: catKey,
        }));
        allServices = [...allServices, ...items];
      }
    });

    // If no direct catalog matches, generate from SIDEBAR_DATA for categoryName
    if (allServices.length === 0 && targetCategory !== 'all') {
      const catSidebarKey = Object.keys(SIDEBAR_DATA).find(
        (k) => k.toLowerCase() === targetCategory || targetCategory.includes(k.toLowerCase())
      ) || 'Services';

      const sidebarSubcats = SIDEBAR_DATA[catSidebarKey]?.subcategories || {};
      Object.keys(sidebarSubcats).forEach((subName) => {
        const subItems = sidebarSubcats[subName]?.items || [];
        subItems.forEach((leafName: string, lIdx: number) => {
          allServices.push({
            id: `srv_gen_${subName}_${lIdx}`,
            name: leafName,
            subcategory: subName,
            mainCategory: categoryName || subName,
            desc: `Verified ${leafName.toLowerCase()} with quality warranty & fast doorstep delivery.`,
            rating: (4.7 + (lIdx % 3) * 0.1).toFixed(1),
            reviews: `${(lIdx + 2) * 110}+`,
            price: `₹${299 + (lIdx % 5) * 200}`,
            originalPrice: `₹${599 + (lIdx % 5) * 250}`,
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
            assured: true,
          });
        });
      });
    }

    // Filter by Subcategory
    if (selectedSubcat !== 'All') {
      allServices = allServices.filter(
        (s) =>
          s.mainCategory.toLowerCase() === selectedSubcat.toLowerCase() ||
          s.subcategory.toLowerCase() === selectedSubcat.toLowerCase()
      );
    }

    // Filter by Search Query
    if (query) {
      allServices = allServices.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          s.subcategory.toLowerCase().includes(query) ||
          s.mainCategory.toLowerCase().includes(query) ||
          (s.brand && s.brand.toLowerCase().includes(query))
      );
    }

    // Products Specific Filters
    if (isProductsCategory) {
      if (selectedProdCategory !== 'All') {
        allServices = allServices.filter(
          (s) => s.subcategory.toLowerCase() === selectedProdCategory.toLowerCase()
        );
      }
      if (selectedProdBrand !== 'All') {
        allServices = allServices.filter(
          (s) => s.brand && s.brand.toLowerCase() === selectedProdBrand.toLowerCase()
        );
      }
      if (selectedProdPrice === 'Under ₹1,500') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 1500
        );
      } else if (selectedProdPrice === '₹1,500 - ₹5,000') {
        allServices = allServices.filter((s) => {
          const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
          return p >= 1500 && p <= 5000;
        });
      } else if (selectedProdPrice === '₹5,000+') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 5000
        );
      }
      if (selectedProdRating !== null) {
        allServices = allServices.filter((s) => parseFloat(s.rating) >= selectedProdRating);
      }
      if (selectedProdDiscount === '20%+ OFF') {
        allServices = allServices.filter((s) => (s.discountNum || 0) >= 20);
      } else if (selectedProdDiscount === '30%+ OFF') {
        allServices = allServices.filter((s) => (s.discountNum || 0) >= 30);
      } else if (selectedProdDiscount === '40%+ OFF') {
        allServices = allServices.filter((s) => (s.discountNum || 0) >= 40);
      }
      if (selectedProdInStockOnly) {
        allServices = allServices.filter((s) => s.inStock !== false);
      }
    }

    // Daily Needs Specific Filters
    if (isDailyNeedsCategory) {
      if (selectedDnCategory !== 'All') {
        allServices = allServices.filter(
          (s) => s.subcategory.toLowerCase() === selectedDnCategory.toLowerCase()
        );
      }
      if (selectedDnBrand !== 'All') {
        allServices = allServices.filter(
          (s) => s.brand && s.brand.toLowerCase() === selectedDnBrand.toLowerCase()
        );
      }
      if (selectedDnPrice === 'Under ₹50') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 50
        );
      } else if (selectedDnPrice === '₹50 - ₹200') {
        allServices = allServices.filter((s) => {
          const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
          return p >= 50 && p <= 200;
        });
      } else if (selectedDnPrice === '₹200+') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 200
        );
      }
      if (selectedDnRating !== null) {
        allServices = allServices.filter((s) => parseFloat(s.rating) >= selectedDnRating);
      }
      if (selectedDnPackSize === '500g / 1kg') {
        allServices = allServices.filter(
          (s) => s.name.toLowerCase().includes('1kg') || s.name.toLowerCase().includes('500g')
        );
      } else if (selectedDnPackSize === '5kg') {
        allServices = allServices.filter((s) => s.name.toLowerCase().includes('5kg'));
      } else if (selectedDnPackSize === 'Single Pack') {
        allServices = allServices.filter(
          (s) => s.name.toLowerCase().includes('pc') || s.name.toLowerCase().includes('pack')
        );
      }
      if (selectedDnInStockOnly) {
        allServices = allServices.filter((s) => s.inStock !== false);
      }
      if (selectedDnDeliveryTime !== 'All') {
        allServices = allServices.filter(
          (s) => s.deliveryTime && s.deliveryTime.includes(selectedDnDeliveryTime.replace('⚡ ', ''))
        );
      }
    }

    // Food Specific Filters
    if (isFoodCategory) {
      if (selectedFoodCuisine !== 'All') {
        allServices = allServices.filter(
          (s) =>
            (s.cuisine && s.cuisine.toLowerCase() === selectedFoodCuisine.toLowerCase()) ||
            s.subcategory.toLowerCase().includes(selectedFoodCuisine.toLowerCase()) ||
            s.name.toLowerCase().includes(selectedFoodCuisine.toLowerCase())
        );
      }
      if (selectedFoodVegMode === 'Pure Veg') {
        allServices = allServices.filter((s) => s.isVeg === true);
      } else if (selectedFoodVegMode === 'Non-Veg') {
        allServices = allServices.filter((s) => s.isVeg === false);
      }
      if (selectedFoodPrice === 'Under ₹200') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 200
        );
      } else if (selectedFoodPrice === '₹200 - ₹500') {
        allServices = allServices.filter((s) => {
          const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
          return p >= 200 && p <= 500;
        });
      } else if (selectedFoodPrice === '₹500+') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 500
        );
      }
      if (selectedFoodRating !== null) {
        allServices = allServices.filter((s) => parseFloat(s.rating) >= selectedFoodRating);
      }
      if (selectedFoodDeliveryTime === 'Under 30 mins') {
        allServices = allServices.filter((s) => {
          const dt = parseInt((s.deliveryTime || '30').replace(/[^\d]/g, ''), 10);
          return dt <= 30;
        });
      } else if (selectedFoodDeliveryTime === '30-45 mins') {
        allServices = allServices.filter((s) => {
          const dt = parseInt((s.deliveryTime || '30').replace(/[^\d]/g, ''), 10);
          return dt >= 30 && dt <= 45;
        });
      }
      if (selectedFoodOffersOnly) {
        allServices = allServices.filter((s) => s.hasOffer || s.originalPrice);
      }
    }

    // Services Specific Filters
    if (isServicesCategory) {
      if (selectedSrvType !== 'All') {
        allServices = allServices.filter(
          (s) =>
            (s.serviceType && s.serviceType.toLowerCase() === selectedSrvType.toLowerCase()) ||
            s.subcategory.toLowerCase().includes(selectedSrvType.toLowerCase()) ||
            s.name.toLowerCase().includes(selectedSrvType.toLowerCase())
        );
      }
      if (selectedSrvPrice === 'Under ₹500') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 500
        );
      } else if (selectedSrvPrice === '₹500 - ₹1,500') {
        allServices = allServices.filter((s) => {
          const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
          return p >= 500 && p <= 1500;
        });
      } else if (selectedSrvPrice === '₹1,500+') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 1500
        );
      }
      if (selectedSrvRating !== null) {
        allServices = allServices.filter((s) => parseFloat(s.rating) >= selectedSrvRating);
      }
      if (selectedSrvAvailability) {
        allServices = allServices.filter((s) => s.availableToday !== false);
      }
      if (selectedSrvTime !== 'All') {
        allServices = allServices.filter(
          (s) => s.serviceTime && s.serviceTime.toLowerCase().includes(selectedSrvTime.toLowerCase())
        );
      }
      if (selectedSrvBookingMode === 'Instant') {
        allServices = allServices.filter((s) => s.bookingMode === 'instant' || s.bookingMode === 'both');
      } else if (selectedSrvBookingMode === 'Scheduled') {
        allServices = allServices.filter((s) => s.bookingMode === 'scheduled' || s.bookingMode === 'both');
      }
    }

    // Travel / Bus Booking Specific Filters
    if (isTravelCategory) {
      if (selectedBusDepartureTime !== 'All') {
        allServices = allServices.filter(
          (s) =>
            (s.departureSlot && s.departureSlot.toLowerCase() === selectedBusDepartureTime.toLowerCase()) ||
            (s.departureTime && s.departureTime.includes(selectedBusDepartureTime.replace(/\s*\(.*\)/, '')))
        );
      }
      if (selectedBusType !== 'All') {
        allServices = allServices.filter(
          (s) =>
            (s.busType && s.busType.toLowerCase() === selectedBusType.toLowerCase()) ||
            s.subcategory.toLowerCase().includes(selectedBusType.toLowerCase()) ||
            s.name.toLowerCase().includes(selectedBusType.toLowerCase())
        );
      }
      if (selectedBusOperator !== 'All') {
        allServices = allServices.filter(
          (s) =>
            (s.operator && s.operator.toLowerCase().includes(selectedBusOperator.toLowerCase())) ||
            s.name.toLowerCase().includes(selectedBusOperator.toLowerCase())
        );
      }
      if (selectedBusPrice === 'Under ₹700') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 700
        );
      } else if (selectedBusPrice === '₹700 - ₹1,200') {
        allServices = allServices.filter((s) => {
          const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
          return p >= 700 && p <= 1200;
        });
      } else if (selectedBusPrice === '₹1,200+') {
        allServices = allServices.filter(
          (s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 1200
        );
      }
      if (selectedBusBoarding !== 'All') {
        allServices = allServices.filter(
          (s) =>
            s.boardingPoints &&
            s.boardingPoints.some((pt: string) => pt.toLowerCase().includes(selectedBusBoarding.toLowerCase()))
        );
      }
      if (selectedBusDropping !== 'All') {
        allServices = allServices.filter(
          (s) =>
            s.droppingPoints &&
            s.droppingPoints.some((pt: string) => pt.toLowerCase().includes(selectedBusDropping.toLowerCase()))
        );
      }
      if (selectedBusSeatsAvailableOnly) {
        allServices = allServices.filter((s) => (s.seatsAvailable || 0) >= 10);
      }
      if (selectedBusRating !== null) {
        allServices = allServices.filter((s) => parseFloat(s.rating) >= selectedBusRating);
      }
    }

    return allServices;
  }, [
    categoryName,
    selectedSubcat,
    searchQuery,
    isProductsCategory,
    selectedProdCategory,
    selectedProdBrand,
    selectedProdPrice,
    selectedProdRating,
    selectedProdDiscount,
    selectedProdInStockOnly,
    isDailyNeedsCategory,
    selectedDnCategory,
    selectedDnBrand,
    selectedDnPrice,
    selectedDnRating,
    selectedDnPackSize,
    selectedDnInStockOnly,
    selectedDnDeliveryTime,
    isFoodCategory,
    selectedFoodCuisine,
    selectedFoodVegMode,
    selectedFoodPrice,
    selectedFoodRating,
    selectedFoodDeliveryTime,
    selectedFoodOffersOnly,
    isServicesCategory,
    selectedSrvType,
    selectedSrvPrice,
    selectedSrvRating,
    selectedSrvAvailability,
    selectedSrvTime,
    selectedSrvBookingMode,
    isTravelCategory,
    selectedBusDepartureTime,
    selectedBusType,
    selectedBusOperator,
    selectedBusPrice,
    selectedBusBoarding,
    selectedBusDropping,
    selectedBusSeatsAvailableOnly,
    selectedBusRating,
  ]);

  // Draft preview products list for modal result count
  const draftProdDisplayedServices = useMemo(() => {
    if (!isProductsCategory) return [];
    let items = (CURATED_SERVICES_CATALOG['Products'] as any[]) || [];
    const query = searchQuery.toLowerCase().trim();

    if (selectedSubcat !== 'All') {
      items = items.filter(
        (s) => s.subcategory.toLowerCase() === selectedSubcat.toLowerCase()
      );
    }
    if (query) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          (s.brand && s.brand.toLowerCase().includes(query))
      );
    }

    if (draftProdCategory !== 'All') {
      items = items.filter((s) => s.subcategory.toLowerCase() === draftProdCategory.toLowerCase());
    }
    if (draftProdBrand !== 'All') {
      items = items.filter((s) => s.brand && s.brand.toLowerCase() === draftProdBrand.toLowerCase());
    }
    if (draftProdPrice === 'Under ₹1,500') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 1500);
    } else if (draftProdPrice === '₹1,500 - ₹5,000') {
      items = items.filter((s) => {
        const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
        return p >= 1500 && p <= 5000;
      });
    } else if (draftProdPrice === '₹5,000+') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 5000);
    }
    if (draftProdRating !== null) {
      items = items.filter((s) => parseFloat(s.rating) >= draftProdRating);
    }
    if (draftProdDiscount === '20%+ OFF') {
      items = items.filter((s) => (s.discountNum || 0) >= 20);
    } else if (draftProdDiscount === '30%+ OFF') {
      items = items.filter((s) => (s.discountNum || 0) >= 30);
    } else if (draftProdDiscount === '40%+ OFF') {
      items = items.filter((s) => (s.discountNum || 0) >= 40);
    }
    if (draftProdInStockOnly) {
      items = items.filter((s) => s.inStock !== false);
    }

    return items;
  }, [
    isProductsCategory,
    selectedSubcat,
    searchQuery,
    draftProdCategory,
    draftProdBrand,
    draftProdPrice,
    draftProdRating,
    draftProdDiscount,
  ]);

  // Draft preview Daily Needs list for modal result count
  const draftDnDisplayedServices = useMemo(() => {
    if (!isDailyNeedsCategory) return [];
    let items = (CURATED_SERVICES_CATALOG['Daily Needs'] as any[]) || [];
    const query = searchQuery.toLowerCase().trim();

    if (selectedSubcat !== 'All') {
      items = items.filter(
        (s) => s.subcategory.toLowerCase() === selectedSubcat.toLowerCase()
      );
    }
    if (query) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          (s.brand && s.brand.toLowerCase().includes(query))
      );
    }

    if (draftDnCategory !== 'All') {
      items = items.filter((s) => s.subcategory.toLowerCase() === draftDnCategory.toLowerCase());
    }
    if (draftDnBrand !== 'All') {
      items = items.filter((s) => s.brand && s.brand.toLowerCase() === draftDnBrand.toLowerCase());
    }
    if (draftDnPrice === 'Under ₹50') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 50);
    } else if (draftDnPrice === '₹50 - ₹200') {
      items = items.filter((s) => {
        const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
        return p >= 50 && p <= 200;
      });
    } else if (draftDnPrice === '₹200+') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 200);
    }
    if (draftDnRating !== null) {
      items = items.filter((s) => parseFloat(s.rating) >= draftDnRating);
    }
    if (draftDnPackSize === '500g / 1kg') {
      items = items.filter((s) => s.name.toLowerCase().includes('1kg') || s.name.toLowerCase().includes('500g'));
    } else if (draftDnPackSize === '5kg') {
      items = items.filter((s) => s.name.toLowerCase().includes('5kg'));
    } else if (draftDnPackSize === 'Single Pack') {
      items = items.filter((s) => s.name.toLowerCase().includes('pc') || s.name.toLowerCase().includes('pack'));
    }
    if (draftDnInStockOnly) {
      items = items.filter((s) => s.inStock !== false);
    }
    if (draftDnDeliveryTime !== 'All') {
      items = items.filter((s) => s.deliveryTime && s.deliveryTime.includes(draftDnDeliveryTime.replace('⚡ ', '')));
    }

    return items;
  }, [
    isDailyNeedsCategory,
    selectedSubcat,
    searchQuery,
    draftDnCategory,
    draftDnBrand,
    draftDnPrice,
    draftDnRating,
    draftDnPackSize,
    draftDnInStockOnly,
  ]);

  // Draft preview Food list for modal result count
  const draftFoodDisplayedServices = useMemo(() => {
    if (!isFoodCategory) return [];
    let items = (CURATED_SERVICES_CATALOG['Food'] as any[]) || [];
    const query = searchQuery.toLowerCase().trim();

    if (selectedSubcat !== 'All') {
      items = items.filter(
        (s) => s.subcategory.toLowerCase() === selectedSubcat.toLowerCase()
      );
    }
    if (query) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          (s.cuisine && s.cuisine.toLowerCase().includes(query))
      );
    }

    if (draftFoodCuisine !== 'All') {
      items = items.filter(
        (s) =>
          (s.cuisine && s.cuisine.toLowerCase() === draftFoodCuisine.toLowerCase()) ||
          s.subcategory.toLowerCase().includes(draftFoodCuisine.toLowerCase()) ||
          s.name.toLowerCase().includes(draftFoodCuisine.toLowerCase())
      );
    }
    if (draftFoodVegMode === 'Pure Veg') {
      items = items.filter((s) => s.isVeg === true);
    } else if (draftFoodVegMode === 'Non-Veg') {
      items = items.filter((s) => s.isVeg === false);
    }
    if (draftFoodPrice === 'Under ₹200') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 200);
    } else if (draftFoodPrice === '₹200 - ₹500') {
      items = items.filter((s) => {
        const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
        return p >= 200 && p <= 500;
      });
    } else if (draftFoodPrice === '₹500+') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 500);
    }
    if (draftFoodRating !== null) {
      items = items.filter((s) => parseFloat(s.rating) >= draftFoodRating);
    }
    if (draftFoodDeliveryTime === 'Under 30 mins') {
      items = items.filter((s) => {
        const dt = parseInt((s.deliveryTime || '30').replace(/[^\d]/g, ''), 10);
        return dt <= 30;
      });
    } else if (draftFoodDeliveryTime === '30-45 mins') {
      items = items.filter((s) => {
        const dt = parseInt((s.deliveryTime || '30').replace(/[^\d]/g, ''), 10);
        return dt >= 30 && dt <= 45;
      });
    }
    if (draftFoodOffersOnly) {
      items = items.filter((s) => s.hasOffer || s.originalPrice);
    }

    return items;
  }, [
    isFoodCategory,
    selectedSubcat,
    searchQuery,
    draftFoodCuisine,
    draftFoodVegMode,
    draftFoodPrice,
    draftFoodRating,
    draftFoodDeliveryTime,
  ]);

  // Draft preview Services list for modal result count
  const draftSrvDisplayedServices = useMemo(() => {
    if (!isServicesCategory) return [];
    let items = (CURATED_SERVICES_CATALOG['Services'] as any[]) || [];
    const query = searchQuery.toLowerCase().trim();

    if (selectedSubcat !== 'All') {
      items = items.filter(
        (s) => s.subcategory.toLowerCase() === selectedSubcat.toLowerCase()
      );
    }
    if (query) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          (s.serviceType && s.serviceType.toLowerCase().includes(query))
      );
    }

    if (draftSrvType !== 'All') {
      items = items.filter(
        (s) =>
          (s.serviceType && s.serviceType.toLowerCase() === draftSrvType.toLowerCase()) ||
          s.subcategory.toLowerCase().includes(draftSrvType.toLowerCase()) ||
          s.name.toLowerCase().includes(draftSrvType.toLowerCase())
      );
    }
    if (draftSrvPrice === 'Under ₹500') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 500);
    } else if (draftSrvPrice === '₹500 - ₹1,500') {
      items = items.filter((s) => {
        const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
        return p >= 500 && p <= 1500;
      });
    } else if (draftSrvPrice === '₹1,500+') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 1500);
    }
    if (draftSrvRating !== null) {
      items = items.filter((s) => parseFloat(s.rating) >= draftSrvRating);
    }
    if (draftSrvAvailability) {
      items = items.filter((s) => s.availableToday !== false);
    }
    if (draftSrvTime !== 'All') {
      items = items.filter((s) => s.serviceTime && s.serviceTime.toLowerCase().includes(draftSrvTime.toLowerCase()));
    }
    if (draftSrvBookingMode === 'Instant') {
      items = items.filter((s) => s.bookingMode === 'instant' || s.bookingMode === 'both');
    } else if (draftSrvBookingMode === 'Scheduled') {
      items = items.filter((s) => s.bookingMode === 'scheduled' || s.bookingMode === 'both');
    }

    return items;
  }, [
    isServicesCategory,
    selectedSubcat,
    searchQuery,
    draftSrvType,
    draftSrvPrice,
    draftSrvRating,
    draftSrvAvailability,
    draftSrvTime,
  ]);

  // Draft preview Bus list for modal result count
  const draftBusDisplayedServices = useMemo(() => {
    if (!isTravelCategory) return [];
    let items = (CURATED_SERVICES_CATALOG['Travel'] as any[]) || [];
    const query = searchQuery.toLowerCase().trim();

    if (selectedSubcat !== 'All') {
      items = items.filter(
        (s) => s.subcategory.toLowerCase() === selectedSubcat.toLowerCase()
      );
    }
    if (query) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          (s.operator && s.operator.toLowerCase().includes(query)) ||
          (s.route && s.route.toLowerCase().includes(query))
      );
    }

    if (draftBusDepartureTime !== 'All') {
      items = items.filter(
        (s) =>
          (s.departureSlot && s.departureSlot.toLowerCase() === draftBusDepartureTime.toLowerCase()) ||
          (s.departureTime && s.departureTime.includes(draftBusDepartureTime.replace(/\s*\(.*\)/, '')))
      );
    }
    if (draftBusType !== 'All') {
      items = items.filter(
        (s) =>
          (s.busType && s.busType.toLowerCase() === draftBusType.toLowerCase()) ||
          s.subcategory.toLowerCase().includes(draftBusType.toLowerCase()) ||
          s.name.toLowerCase().includes(draftBusType.toLowerCase())
      );
    }
    if (draftBusOperator !== 'All') {
      items = items.filter(
        (s) =>
          (s.operator && s.operator.toLowerCase() === draftBusOperator.toLowerCase()) ||
          s.name.toLowerCase().includes(draftBusOperator.toLowerCase())
      );
    }
    if (draftBusPrice === 'Under ₹700') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) < 700);
    } else if (draftBusPrice === '₹700 - ₹1,200') {
      items = items.filter((s) => {
        const p = s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10);
        return p >= 700 && p <= 1200;
      });
    } else if (draftBusPrice === '₹1,200+') {
      items = items.filter((s) => (s.priceNum || parseInt((s.price || '0').replace(/[^\d]/g, ''), 10)) > 1200);
    }
    if (draftBusBoarding !== 'All') {
      items = items.filter(
        (s) =>
          s.boardingPoints &&
          s.boardingPoints.some((pt: string) => pt.toLowerCase().includes(draftBusBoarding.toLowerCase()))
      );
    }
    if (draftBusDropping !== 'All') {
      items = items.filter(
        (s) =>
          s.droppingPoints &&
          s.droppingPoints.some((pt: string) => pt.toLowerCase().includes(draftBusDropping.toLowerCase()))
      );
    }
    if (draftBusSeatsAvailableOnly) {
      items = items.filter((s) => (s.seatsAvailable || 0) >= 10);
    }
    if (draftBusRating !== null) {
      items = items.filter((s) => parseFloat(s.rating) >= draftBusRating);
    }

    return items;
  }, [
    isTravelCategory,
    selectedSubcat,
    searchQuery,
    draftBusDepartureTime,
    draftBusType,
    draftBusOperator,
    draftBusPrice,
    draftBusBoarding,
    draftBusDropping,
    draftBusSeatsAvailableOnly,
    draftBusRating,
  ]);

  // Helper to filter Stay items
  const filterStayList = (
    catalog: any[],
    dest: string,
    subcat: string,
    queryStr: string,
    priceRange: string,
    propTypes: string[],
    starRatings: number[],
    guestRating: number | null,
    amenitiesList: string[],
    freeCancel: boolean,
    sortOpt: string
  ) => {
    let items = [...catalog];
    const query = queryStr.toLowerCase().trim();

    // 1. Filter by Destination
    if (dest !== 'All Destinations') {
      items = items.filter(
        (s) =>
          (s.location && s.location.toLowerCase().includes(dest.toLowerCase())) ||
          (s.locationCity && s.locationCity.toLowerCase().includes(dest.toLowerCase()))
      );
    }

    // 2. Filter by Stay Type Chip
    if (subcat !== 'All' && subcat !== 'All Stays') {
      items = items.filter((s) => s.subcategory.toLowerCase() === subcat.toLowerCase());
    }

    // 3. Filter by Search Query
    if (query) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.location && s.location.toLowerCase().includes(query)) ||
          s.subcategory.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query)
      );
    }

    // 4. Filter by Price Range
    if (priceRange === 'Under ₹3,500') {
      items = items.filter((s) => (s.priceNum || 0) < 3500);
    } else if (priceRange === '₹3,500 - ₹6,000') {
      items = items.filter((s) => (s.priceNum || 0) >= 3500 && (s.priceNum || 0) <= 6000);
    } else if (priceRange === '₹6,000+') {
      items = items.filter((s) => (s.priceNum || 0) > 6000);
    }

    // 5. Filter by Property Types
    if (propTypes.length > 0) {
      items = items.filter((s) =>
        propTypes.some(
          (pt) =>
            s.subcategory.toLowerCase() === pt.toLowerCase() ||
            (s.propertyType && s.propertyType.toLowerCase() === pt.toLowerCase())
        )
      );
    }

    // 6. Filter by Star Ratings
    if (starRatings.length > 0) {
      items = items.filter((s) => s.starRating && starRatings.includes(s.starRating));
    }

    // 7. Filter by Guest Rating
    if (guestRating !== null) {
      items = items.filter((s) => parseFloat(s.rating) >= guestRating);
    }

    // 8. Filter by Amenities
    if (amenitiesList.length > 0) {
      items = items.filter((s) =>
        s.amenities && amenitiesList.every((a) => s.amenities?.includes(a))
      );
    }

    // 9. Filter by Free Cancellation
    if (freeCancel) {
      items = items.filter((s) => s.deliveryTime === 'Free cancellation');
    }

    // 10. Sort
    if (sortOpt === 'Price Low → High') {
      items.sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
    } else if (sortOpt === 'Price High → Low') {
      items.sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
    } else if (sortOpt === 'Rating') {
      items.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    return items;
  };

  // Main screen stays (committed applied filter state)
  const displayedStays = useMemo(() => {
    const catalog = (CURATED_SERVICES_CATALOG['Stay'] as any[]) || [];
    return filterStayList(
      catalog,
      selectedDestination,
      selectedSubcat,
      searchQuery,
      selectedStayPriceRange,
      selectedStayPropTypes,
      selectedStayStarRatings,
      selectedStayGuestRating,
      selectedStayAmenities,
      freeCancelOnly,
      selectedStaySort
    );
  }, [
    selectedDestination,
    selectedSubcat,
    searchQuery,
    selectedStayPriceRange,
    selectedStayPropTypes,
    selectedStayStarRatings,
    selectedStayGuestRating,
    selectedStayAmenities,
    freeCancelOnly,
    selectedStaySort,
  ]);

  // Modal preview stays count (draft uncommitted filter state)
  const draftDisplayedStays = useMemo(() => {
    const catalog = (CURATED_SERVICES_CATALOG['Stay'] as any[]) || [];
    return filterStayList(
      catalog,
      selectedDestination,
      selectedSubcat,
      searchQuery,
      draftStayPriceRange,
      draftStayPropTypes,
      draftStayStarRatings,
      draftStayGuestRating,
      draftStayAmenities,
      draftFreeCancelOnly,
      selectedStaySort
    );
  }, [
    selectedDestination,
    selectedSubcat,
    searchQuery,
    draftStayPriceRange,
    draftStayPropTypes,
    draftStayStarRatings,
    draftStayGuestRating,
    draftStayAmenities,
    draftFreeCancelOnly,
    selectedStaySort,
  ]);

  const filteredJobs = useMemo(() => {
    return CURATED_JOBS_CATALOG.filter((job: JobItem) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.company.toLowerCase().includes(q);
        const matchDept = (job.department || '').toLowerCase().includes(q);
        const matchLoc = job.location.toLowerCase().includes(q);
        const matchSkill = job.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchCompany && !matchDept && !matchLoc && !matchSkill) {
          return false;
        }
      }
      if (selectedSubcat !== 'All') {
        const isIntern = job.itemType === 'INTERNSHIP' || (job.employmentType || '').toLowerCase().includes('intern');
        if (selectedSubcat === 'Internships' && !isIntern) return false;
        if (selectedSubcat === 'Full-Time Jobs' && isIntern) return false;
      }
      return true;
    });
  }, [searchQuery, selectedSubcat]);

  const GENERATE_NEXT_7_DAYS = useCallback(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = dayNames[d.getDay()];
      const dateNum = d.getDate();
      const monthName = monthNames[d.getMonth()];
      const fullDateStr = `${dayName}, ${dateNum} ${monthName} 2026`;
      const isFull = d.getDay() === 1 || d.getDay() === 4;

      days.push({
        id: `day_${i}`,
        dayName,
        dateNum,
        monthName,
        fullDateStr,
        isFull,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dayName}, ${dateNum} ${monthName}`,
      });
    }
    return days;
  }, []);

  const TIMINGS_GRID = [
    { id: 't1', time: '09:00 AM', status: 'AVAILABLE' },
    { id: 't2', time: '10:30 AM', status: 'AVAILABLE' },
    { id: 't3', time: '12:00 PM', status: 'AVAILABLE' },
    { id: 't4', time: '01:30 PM', status: 'NOT_AVAILABLE' },
    { id: 't5', time: '03:00 PM', status: 'AVAILABLE' },
    { id: 't6', time: '04:30 PM', status: 'NOT_AVAILABLE' },
    { id: 't7', time: '06:00 PM', status: 'AVAILABLE' },
    { id: 't8', time: '07:30 PM', status: 'AVAILABLE' },
  ];

  const getEffectiveCategory = useCallback((item: any) => {
    if (!item) return 'Home Services';
    const catName = categoryName || item.mainCategory || item.category || 'Services';
    if (catName.includes('Health') || (item.id && item.id.startsWith('srv_hc'))) return 'Healthcare';
    if (catName.includes('Legal') || (item.id && item.id.startsWith('srv_leg'))) return 'Legal';
    if (catName.includes('Edu') || (item.id && item.id.startsWith('srv_edu'))) return 'Education';
    if (catName.includes('Auto') || (item.id && item.id.startsWith('srv_auto'))) return 'Automobile';
    if (catName.includes('Digit') || (item.id && item.id.startsWith('srv_dig'))) return 'IT/Digital';
    if (catName.includes('Finan') || (item.id && item.id.startsWith('srv_fin'))) return 'Financial';
    if (catName.includes('Travel') || (item.id && item.id.startsWith('srv_trv'))) return 'Travel';
    if (catName.includes('Stay') || (item.id && item.id.startsWith('srv_sty'))) return 'Stay';
    if (catName.includes('Job') || item.itemType === 'JOB') return 'Jobs';
    return 'Home Services';
  }, [categoryName]);

  const getConfirmCtaLabel = useCallback((item: any) => {
    if (!item) return 'Confirm Booking';
    const cat = getEffectiveCategory(item);
    const priceStr = item.price || '₹499';
    switch (cat) {
      case 'Healthcare':
      case 'Legal':
      case 'Financial':
        return `Book Consultation • ${priceStr}`;
      case 'Education':
        return `Book Session • ${priceStr}`;
      case 'Automobile':
      case 'Home Services':
        return `Book Service • ${priceStr}`;
      case 'IT/Digital':
        return `Request Service • ${priceStr}`;
      case 'Travel':
        return `Book Trip • ${priceStr}`;
      case 'Stay':
        return `Reserve Stay • ${priceStr}`;
      default:
        return `Book Service • ${priceStr}`;
    }
  }, [getEffectiveCategory]);

  const handleConfirmBooking = async () => {
    if (!schedulingItem || !selectedDateObj || !selectedSlotObj) return;

    const currentUserName = useAuthStore.getState().currentUser?.name || patientNameInput || 'Uma';
    const currentUserPhone = useAuthStore.getState().currentUser?.phone || '+91 98888 88888';
    const numPrice = parseInt(schedulingItem.price.replace(/[^\d]/g, ''), 10) || 499;
    const effectiveCat = getEffectiveCategory(schedulingItem);
    const bookingId = `BK-${Date.now().toString().slice(-6)}`;

    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: 'v1',
          customer_name: currentUserName,
          customer_phone: currentUserPhone,
          customer_address: selectedAddress,
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: `${schedulingItem.name} (${selectedProblemPackage} • ${selectedDateObj.fullDateStr} at ${selectedSlotObj.time})`,
          amount: numPrice,
          order_type: 'booking',
          category: effectiveCat,
        }),
      });

      const bookedItemName = schedulingItem.name;
      const bookedPrice = schedulingItem.price;

      setSchedulingItem(null);
      setSelectedDateObj(null);
      setSelectedSlotObj(null);

      navigation.navigate('BookingConfirmation', {
        bookingId: bookingId,
        items: [{ name: bookedItemName, price: bookedPrice }],
        totalAmount: numPrice,
        paymentMethod: 'Pay at Doorstep / After Service',
        type: effectiveCat === 'Stay' ? 'stay' : effectiveCat === 'Travel' ? 'travel' : 'service',
        date: selectedDateObj.fullDateStr,
        slot: selectedSlotObj.time,
      });
    } catch {
      const bookedItemName = schedulingItem.name;
      const bookedPrice = schedulingItem.price;

      setSchedulingItem(null);
      setSelectedDateObj(null);
      setSelectedSlotObj(null);

      navigation.navigate('BookingConfirmation', {
        bookingId: bookingId,
        items: [{ name: bookedItemName, price: bookedPrice }],
        totalAmount: numPrice,
        paymentMethod: 'Pay at Doorstep / After Service',
        type: effectiveCat === 'Stay' ? 'stay' : effectiveCat === 'Travel' ? 'travel' : 'service',
        date: selectedDateObj.fullDateStr,
        slot: selectedSlotObj.time,
      });
    }
  };

  const renderCategoryIcon = (subName: string, color = '#0F172A') => {
    const iconName = getCategoryIconName(subName);
    const IconComp = (Icons as any)[iconName] || Icons.Wrench;
    return <IconComp color={color} size={15} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header (#FFF1C7 / Warm Branded) */}
      <View
        style={[
          styles.headerWrapper,
          {
            paddingTop: Math.max(insets.top, 20) + 4,
            backgroundColor: isLight ? '#FFF1C7' : colors.background,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icons.ArrowLeft color={colors.text} size={20} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {categoryName || 'Services'}
          </Text>

          {isStayCategory ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                style={{ padding: 4 }}
                onPress={() => navigation.navigate('Wishlist')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons.Heart color="#EF4444" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.myBookingsHeaderBtn}
                onPress={() => setIsMyBookingsOpen(true)}
              >
                <Text style={styles.myBookingsHeaderBtnText}>My Bookings</Text>
                {myStayBookings.length > 0 && (
                  <View style={styles.myBookingsCountBadge}>
                    <Text style={styles.myBookingsCountBadgeText}>{myStayBookings.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.headerCartBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (categoryName === 'Jobs' || categoryName === 'Jobs & Careers') {
                  navigation.navigate('Wishlist');
                } else {
                  setIsCartVisible(true);
                }
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {categoryName === 'Jobs' || categoryName === 'Jobs & Careers' ? (
                <Icons.Bookmark color={colors.text} size={20} />
              ) : (
                <>
                  <Icons.ShoppingCart color={colors.text} size={20} />
                  {totalCartCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar / Stay Search Block */}
        {isStayCategory ? (
          <View style={styles.staySearchContainer}>
            {/* Field 1: Destination Selector */}
            <TouchableOpacity
              style={styles.staySearchField}
              activeOpacity={0.8}
              onPress={() => setIsDestModalOpen(true)}
            >
              <Icons.MapPin color="#F5B800" size={18} />
              <View style={{ flex: 1 }}>
                <Text style={styles.staySearchLabel}>WHERE ARE YOU GOING?</Text>
                <Text style={styles.staySearchValue} numberOfLines={1}>
                  {selectedDestination === 'All Destinations' ? 'Search city, hotel or destination' : selectedDestination}
                </Text>
              </View>
              <Icons.ChevronDown color="#64748B" size={16} />
            </TouchableOpacity>

            {/* Field 2 & 3 Row: Dates and Guests */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.staySearchField, { flex: 1 }]}
                activeOpacity={0.8}
                onPress={() => setIsCalendarModalOpen(true)}
              >
                <Icons.Calendar color="#F5B800" size={16} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.staySearchLabel}>DATES</Text>
                  <Text style={styles.staySearchValueSmall} numberOfLines={1}>
                    {checkInDate} - {checkOutDate} ({stayNights}n)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.staySearchField, { flex: 1 }]}
                activeOpacity={0.8}
                onPress={() => setIsGuestModalOpen(true)}
              >
                <Icons.Users color="#F5B800" size={16} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.staySearchLabel}>GUESTS & ROOMS</Text>
                  <Text style={styles.staySearchValueSmall} numberOfLines={1}>
                    {stayAdults} Guests • {stayRooms} Room
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Field 4: Text Search Box */}
            <View
              style={[
                styles.searchBarWrapper,
                {
                  marginTop: 8,
                  marginBottom: 0,
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: isLight ? '#FCD34D' : colors.cardBorder,
                },
              ]}
            >
              <Icons.Search color={isLight ? '#64748B' : '#94A3B8'} size={18} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search city, hotel or destination"
                placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 6 }}>
                  <Icons.X color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'} size={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.searchBarWrapper,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                borderColor: isVoiceListening ? '#F5B800' : isLight ? '#FCD34D' : colors.cardBorder,
              },
            ]}
          >
            {isVoiceListening ? (
              <View style={styles.voiceListeningRow}>
                <View style={styles.waveformContainer}>
                  <Animated.View style={[styles.waveBar, { height: wave1 }]} />
                  <Animated.View style={[styles.waveBar, { height: wave2 }]} />
                  <Animated.View style={[styles.waveBar, { height: wave3 }]} />
                  <Animated.View style={[styles.waveBar, { height: wave4 }]} />
                </View>
                <Text style={styles.voiceListeningText}>Listening...</Text>
                <TouchableOpacity onPress={() => setIsVoiceListening(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icons.X color="#F5B800" size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Icons.Search color="#F5B800" size={18} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder={catMeta.searchPlaceholder}
                  placeholderTextColor={isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 6 }}>
                    <Icons.X color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'} size={16} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleMicPress} style={styles.micIconBtn}>
                  <Icons.Mic color={colors.text} size={18} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Accommodation Type Chips */}
        {isStayCategory ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsScroll}>
            {['All Stays', 'Hotels', 'Resorts', 'Villas', 'Homestays', 'Apartments'].map((chip) => {
              const isSel = selectedSubcat === chip || (chip === 'All Stays' && selectedSubcat === 'All');
              const IconComp =
                chip.includes('Hotel') ? Icons.Building2 :
                chip.includes('Resort') ? Icons.Trees :
                chip.includes('Villa') ? Icons.Home :
                chip.includes('Homestay') ? Icons.Home :
                chip.includes('Apartment') ? Icons.Building :
                Icons.Bed;

              return (
                <TouchableOpacity
                  key={chip}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSel ? '#F5B800' : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isSel ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSubcat(chip === 'All Stays' ? 'All' : chip)}
                >
                  <IconComp color={isSel ? '#0F172A' : colors.text} size={14} style={{ marginRight: 6 }} />
                  <Text style={[styles.categoryChipText, { color: isSel ? '#0F172A' : colors.text }]}>{chip}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsScroll}
          >
            {availableSubcats.map((subName) => {
              const isSelected = selectedSubcat.toLowerCase() === subName.toLowerCase();
              return (
                <TouchableOpacity
                  key={subName}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected
                        ? '#F5B800'
                        : isLight
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.06)',
                      borderColor: isSelected
                        ? '#F5B800'
                        : isLight
                        ? '#F1EAD8'
                        : colors.cardBorder,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedSubcat(subName);
                    setSearchQuery('');
                  }}
                >
                  {subName !== 'All' && (
                    <View style={{ marginRight: 5 }}>
                      {renderCategoryIcon(subName, isSelected ? '#0F172A' : isLight ? '#D97706' : '#F5B800')}
                    </View>
                  )}
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#0F172A' : colors.text },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {subName === 'All' ? catMeta.allPillLabel : subName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Toolbar [ Filters ] [ Sort: Recommended ] [ Map ] for Stay */}
        {/* Toolbar: [ Filter ] [ Sort: {selectedStaySort} ] [ Map ] for Stay */}
        {isStayCategory && (
          <View style={styles.stayToolbarRow}>
            <TouchableOpacity
              style={[
                styles.stayToolbarBtn,
                stayActiveFiltersCount > 0 && { backgroundColor: '#F5B800', borderColor: '#F5B800' },
              ]}
              onPress={openStayFilterModal}
            >
              <Icons.Sliders color="#0F172A" size={14} />
              <Text style={[styles.stayToolbarBtnText, stayActiveFiltersCount > 0 && { fontWeight: '900' }]}>
                Filter{stayActiveFiltersCount > 0 ? ` (${stayActiveFiltersCount})` : ''}
              </Text>
              {stayActiveFiltersCount > 0 && (
                <View style={styles.stayFilterCountDot}>
                  <Text style={styles.stayFilterCountDotText}>{stayActiveFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.stayToolbarBtn} onPress={() => setIsStaySortOpen(true)}>
              <Icons.ArrowUpDown color="#0F172A" size={14} />
              <Text style={styles.stayToolbarBtnText}>Sort: {selectedStaySort}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.stayToolbarBtn, { backgroundColor: '#0F172A' }]} onPress={() => setIsStayMapOpen(true)}>
              <Icons.Map color="#F5B800" size={14} />
              <Text style={[styles.stayToolbarBtnText, { color: '#FFFFFF' }]}>Map</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Cards List */}
      <ScrollView
        contentContainerStyle={[styles.contentScroll, { paddingBottom: Math.max(insets.bottom, 20) + 70 }]}
        showsVerticalScrollIndicator={false}
      >
        {isStayCategory ? (
          <View style={{ paddingHorizontal: 4 }}>
            <View style={styles.resultsHeaderRow}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                {selectedSubcat === 'All' || selectedSubcat === 'All Stays' ? 'POPULAR STAYS' : `${selectedSubcat.toUpperCase()} STAYS`}
              </Text>
              <Text style={[styles.resultsCount, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                {displayedStays.length} {displayedStays.length === 1 ? 'stay' : 'stays'}
              </Text>
            </View>

            {displayedStays.length > 0 ? (
              <View style={styles.compact2ColGrid}>
                {displayedStays.map((hotel) => {
                  const isWishlisted = isInWishlist(hotel.id);
                  return (
                    <TouchableOpacity
                      key={hotel.id}
                      style={[
                        styles.compactCard,
                        {
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                          borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                        },
                      ]}
                      activeOpacity={0.88}
                      onPress={() =>
                        navigation.navigate('StayDetails', {
                          stay: hotel,
                          checkIn: checkInDate,
                          checkOut: checkOutDate,
                          nights: stayNights,
                          adults: stayAdults,
                          rooms: stayRooms,
                        })
                      }
                    >
                      <View style={styles.compactImageWrapper}>
                        <Image source={{ uri: hotel.image }} style={styles.compactImage} resizeMode="cover" />
                        <View style={styles.compactDiscountBadge}>
                          <Text style={styles.compactDiscountBadgeText}>{hotel.discount || '24% OFF'}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.compactWishlistBtn}
                          activeOpacity={0.8}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleWishlist({
                              id: hotel.id,
                              name: hotel.name,
                              price: hotel.price,
                              category: 'Stay',
                              image: hotel.image,
                            });
                          }}
                        >
                          <Icons.Heart
                            color={isWishlisted ? '#EF4444' : '#64748B'}
                            size={15}
                            fill={isWishlisted ? '#EF4444' : 'none'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.compactBody}>
                        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
                          {hotel.name}
                        </Text>

                        <Text style={styles.compactCategorySub} numberOfLines={1}>
                          {hotel.location || `${hotel.subcategory} • ${hotel.locationCity || 'India'}`}
                        </Text>

                        <View style={styles.compactRatingRow}>
                          <Icons.Star color="#F5B800" size={11} fill="#F5B800" />
                          <Text style={styles.compactRatingText}>{hotel.rating}</Text>
                          <Text style={styles.compactReviewsText}> ({hotel.reviews} reviews)</Text>
                        </View>

                        <Text style={styles.stayAmenitiesSummaryText} numberOfLines={1}>
                          {(hotel.amenities || ['Pool', 'Free Wi-Fi', 'Breakfast']).join(' • ')}
                        </Text>

                        <View style={styles.compactPriceRow}>
                          <Text style={[styles.compactCurrentPrice, { color: isLight ? '#0F172A' : '#F5B800' }]}>
                            {hotel.price}
                          </Text>
                          {hotel.originalPrice && (
                            <Text style={styles.compactOriginalPrice}>{hotel.originalPrice}</Text>
                          )}
                        </View>

                        <Text style={styles.stayFreeCancelTag}>Free cancellation</Text>

                        <TouchableOpacity
                          style={styles.stayViewRoomsBtn}
                          activeOpacity={0.85}
                          onPress={() =>
                            navigation.navigate('StayDetails', {
                              stay: hotel,
                              checkIn: checkInDate,
                              checkOut: checkOutDate,
                              nights: stayNights,
                              adults: stayAdults,
                              rooms: stayRooms,
                            })
                          }
                        >
                          <Text style={styles.stayViewRoomsBtnText}>View Rooms</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icons.Bed color="#94A3B8" size={36} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 10 }}>
                  No stays or hotels found
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Try resetting filters or searching another destination.
                </Text>
              </View>
            )}
          </View>
        ) : categoryName === 'Jobs' || categoryName === 'Jobs & Careers' ? (
          <View style={{ paddingHorizontal: 4 }}>
            {/* Results Header */}
            <View style={styles.resultsHeaderRow}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                {catMeta.sectionTitle(selectedSubcat)}
              </Text>
              <Text style={[styles.resultsCount, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                {catMeta.countLabel(filteredJobs.length)}
              </Text>
            </View>

            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => navigation.navigate('JobDetails', { job })}
                />
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icons.Briefcase color="#94A3B8" size={36} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 10 }}>
                  {catMeta.emptyText}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Try searching with a different keyword or location.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeaderRow}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                {catMeta.sectionTitle(selectedSubcat)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isProductsCategory && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: prodActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
                      borderColor: prodActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                    activeOpacity={0.8}
                    onPress={openProdFilterModal}
                  >
                    <Icons.Sliders color={prodActiveFiltersCount > 0 ? '#0F172A' : colors.text} size={13} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: prodActiveFiltersCount > 0 ? '#0F172A' : colors.text }}>
                      Filter{prodActiveFiltersCount > 0 ? ` (${prodActiveFiltersCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
                {isDailyNeedsCategory && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: dnActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
                      borderColor: dnActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                    activeOpacity={0.8}
                    onPress={openDnFilterModal}
                  >
                    <Icons.Sliders color={dnActiveFiltersCount > 0 ? '#0F172A' : colors.text} size={13} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: dnActiveFiltersCount > 0 ? '#0F172A' : colors.text }}>
                      Filter{dnActiveFiltersCount > 0 ? ` (${dnActiveFiltersCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
                {isFoodCategory && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: foodActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
                      borderColor: foodActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                    activeOpacity={0.8}
                    onPress={openFoodFilterModal}
                  >
                    <Icons.Sliders color={foodActiveFiltersCount > 0 ? '#0F172A' : colors.text} size={13} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: foodActiveFiltersCount > 0 ? '#0F172A' : colors.text }}>
                      Filter{foodActiveFiltersCount > 0 ? ` (${foodActiveFiltersCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
                {isServicesCategory && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: srvActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
                      borderColor: srvActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                    activeOpacity={0.8}
                    onPress={openSrvFilterModal}
                  >
                    <Icons.Sliders color={srvActiveFiltersCount > 0 ? '#0F172A' : colors.text} size={13} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: srvActiveFiltersCount > 0 ? '#0F172A' : colors.text }}>
                      Filter{srvActiveFiltersCount > 0 ? ` (${srvActiveFiltersCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
                {isTravelCategory && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: busActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
                      borderColor: busActiveFiltersCount > 0 ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.12)',
                      borderWidth: 1,
                      borderRadius: 18,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                    activeOpacity={0.8}
                    onPress={openBusFilterModal}
                  >
                    <Icons.Sliders color={busActiveFiltersCount > 0 ? '#0F172A' : colors.text} size={13} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: busActiveFiltersCount > 0 ? '#0F172A' : colors.text }}>
                      Filter{busActiveFiltersCount > 0 ? ` (${busActiveFiltersCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={[styles.resultsCount, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                  {catMeta.countLabel(displayedServices.length)}
                </Text>
              </View>
            </View>

            {displayedServices.length > 0 ? (
              <View style={styles.compact2ColGrid}>
                {displayedServices.map((service) => {
                  const isWishlisted = wishlistItems.some((w) => w.id === service.id);
                  const discBadge = getDiscountBadgeText(service.price, service.originalPrice);
                  const isCartCategory = catMeta.actionType === 'cart';

                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.compactCard,
                        {
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                          borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                        },
                      ]}
                      activeOpacity={0.92}
                      onPress={() => {
                        if (catMeta.actionType === 'cart') {
                          navigation.navigate('ProductDetails', { item: service, category: categoryName });
                        } else if (catMeta.actionType === 'job') {
                          navigation.navigate('JobDetails', { job: service });
                        } else {
                          const nextDays = GENERATE_NEXT_7_DAYS();
                          const firstAvailDay = nextDays.find((d) => !d.isFull) || nextDays[0];
                          const firstAvailSlot = TIMINGS_GRID.find((t) => t.status === 'AVAILABLE') || TIMINGS_GRID[0];
                          setSelectedDateObj(firstAvailDay);
                          setSelectedSlotObj(firstAvailSlot);
                          setSchedulingItem(service);
                        }
                      }}
                    >
                      {/* Image Wrapper with Discount & Wishlist */}
                      <View style={styles.compactImageWrapper}>
                        <Image source={{ uri: service.image }} style={styles.compactImage} resizeMode="cover" />
                        
                        {/* Top-Left Discount Badge */}
                        <View style={styles.compactDiscountBadge}>
                          <Text style={styles.compactDiscountBadgeText}>{discBadge}</Text>
                        </View>

                        {/* Top-Right Circle Wishlist Button */}
                        <TouchableOpacity
                          style={styles.compactWishlistBtn}
                          activeOpacity={0.8}
                          onPress={() => {
                            toggleWishlist({
                              id: service.id,
                              name: service.name,
                              price: service.price,
                              category: categoryName || service.mainCategory || 'Product',
                              image: service.image,
                            });
                          }}
                        >
                          <Icons.Heart
                            color={isWishlisted ? '#FF2E93' : '#0F172A'}
                            size={13}
                            fill={isWishlisted ? '#FF2E93' : 'transparent'}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Card Body */}
                      <View style={styles.compactBody}>
                        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
                          {service.name}
                        </Text>

                        <Text style={styles.compactCategorySub} numberOfLines={1}>
                          {service.brand
                            ? `${service.brand} • ${service.subcategory}`
                            : `${service.subcategory || service.mainCategory || categoryName}`}
                        </Text>

                        {/* Rating */}
                        <View style={styles.compactRatingRow}>
                          <Icons.Star color="#F5B800" size={11} fill="#F5B800" />
                          <Text style={styles.compactRatingText}>{service.rating}</Text>
                          <Text style={styles.compactReviewsText}> ({service.reviews})</Text>
                        </View>

                        {/* Pricing Row */}
                        <View style={styles.compactPriceRow}>
                          <Text style={[styles.compactCurrentPrice, { color: isLight ? '#0F172A' : '#F5B800' }]}>
                            {service.price}
                          </Text>
                          {service.originalPrice && (
                            <Text style={styles.compactOriginalPrice}>{service.originalPrice}</Text>
                          )}
                          <Text style={styles.compactFreeDeliveryText}>{service.deliveryTime || '⚡ 15-30 mins'}</Text>
                        </View>

                        {/* Action Row */}
                        <View style={styles.compactActionRow}>
                          {(() => {
                            const cartItem = cartItems.find((c) => c.id === service.id);
                            if (cartItem && cartItem.quantity > 0) {
                              return (
                                <View style={styles.stepperContainer}>
                                  <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => {
                                      if (cartItem.quantity > 1) {
                                        updateQuantity(service.id, cartItem.quantity - 1);
                                      } else {
                                        removeFromCart(service.id);
                                      }
                                    }}
                                  >
                                    <Text style={styles.stepperBtnText}>-</Text>
                                  </TouchableOpacity>
                                  <Text style={styles.stepperQtyText}>{cartItem.quantity}</Text>
                                  <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => updateQuantity(service.id, cartItem.quantity + 1)}
                                  >
                                    <Text style={styles.stepperBtnText}>+</Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            }

                            if (catMeta.actionType === 'cart') {
                              return (
                                <TouchableOpacity
                                  style={styles.compactAddBtn}
                                  activeOpacity={0.85}
                                  onPress={() => {
                                    addToCart({
                                      id: service.id,
                                      name: service.name,
                                      price: String(service.price || '₹299'),
                                      category: categoryName,
                                      image: service.image,
                                      quantity: 1,
                                    });
                                  }}
                                >
                                  <Icons.Plus color="#0F172A" size={14} />
                                  <Text style={styles.compactAddBtnText}>ADD</Text>
                                </TouchableOpacity>
                              );
                            }

                            return (
                              <TouchableOpacity
                                style={[styles.compactCtaButton, { flex: 1 }]}
                                activeOpacity={0.85}
                                onPress={() => {
                                  const nextDays = GENERATE_NEXT_7_DAYS();
                                  const firstAvailDay = nextDays.find((d) => !d.isFull) || nextDays[0];
                                  const firstAvailSlot = TIMINGS_GRID.find((t) => t.status === 'AVAILABLE') || TIMINGS_GRID[0];
                                  setSelectedDateObj(firstAvailDay);
                                  setSelectedSlotObj(firstAvailSlot);
                                  setSchedulingItem(service);
                                }}
                              >
                                <Text style={styles.compactCtaButtonText}>Book Service</Text>
                              </TouchableOpacity>
                            );
                          })()}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icons.SearchX color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.35)'} size={40} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{catMeta.emptyText}</Text>
                <Text style={[styles.emptySubtitle, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                  We couldn't find anything matching "{searchQuery}".
                </Text>
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedSubcat('All');
                  }}
                >
                  <Text style={styles.emptyResetBtnText}>View All Items</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Service-Type Aware Booking Modal Sheet */}
      <Modal
        visible={schedulingItem !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSchedulingItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSchedulingItem(null)}
          />
          <View
            style={[
              styles.schedulerCard,
              {
                backgroundColor: isLight ? '#FFFDF5' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.schedulerHeader, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={styles.modalCategoryBadge}>
                    {getEffectiveCategory(schedulingItem).toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '800' }}>● LIVE SLOTS</Text>
                </View>
                <Text style={[styles.schedulerModalTitle, { color: colors.text }]} numberOfLines={1}>
                  {schedulingItem?.name}
                </Text>
                <Text style={[styles.schedulerItemName, { color: '#D97706' }]} numberOfLines={1}>
                  Starting at {schedulingItem?.price || '₹499'} • Certified Provider
                </Text>
              </View>
              <TouchableOpacity
                style={styles.schedulerCloseBtn}
                onPress={() => setSchedulingItem(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {/* --- CATEGORY SPECIFIC CUSTOM CONTROLS --- */}

              {/* 1. HEALTHCARE FIELDS */}
              {getEffectiveCategory(schedulingItem) === 'Healthcare' && (
                <View style={styles.customFieldsSection}>
                  <View style={[styles.providerInfoCard, { backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 184, 0, 0.1)', borderColor: isLight ? '#FDE68A' : 'rgba(245, 184, 0, 0.25)' }]}>
                    <Icons.UserCheck color="#D97706" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.providerTitle, { color: colors.text }]}>Dr. Ananya Sharma • MBBS, MD</Text>
                      <Text style={[styles.providerSubtitle, { color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }]}>Senior Cardiologist • 15+ yrs Exp • 4.9 ★ (120+ Reviews)</Text>
                    </View>
                  </View>

                  <Text style={[styles.fieldLabel, { color: colors.text }]}>CONSULTATION TYPE</Text>
                  <View style={styles.chipOptionsRow}>
                    <TouchableOpacity
                      style={[styles.chipBtn, consultationMode === 'video' && styles.chipBtnActive]}
                      onPress={() => setConsultationMode('video')}
                    >
                      <Icons.Video color={consultationMode === 'video' ? '#0F172A' : colors.text} size={14} />
                      <Text style={[styles.chipBtnText, consultationMode === 'video' && styles.chipBtnTextActive, { color: consultationMode === 'video' ? '#0F172A' : colors.text }]}>Video Call (₹399)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.chipBtn, consultationMode === 'clinic' && styles.chipBtnActive]}
                      onPress={() => setConsultationMode('clinic')}
                    >
                      <Icons.Building color={consultationMode === 'clinic' ? '#0F172A' : colors.text} size={14} />
                      <Text style={[styles.chipBtnText, consultationMode === 'clinic' && styles.chipBtnTextActive, { color: consultationMode === 'clinic' ? '#0F172A' : colors.text }]}>In-Clinic Visit (₹699)</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>PATIENT DETAILS</Text>
                  <TextInput
                    style={[styles.customTextInput, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)', color: colors.text, borderColor: isLight ? '#F1EAD8' : colors.cardBorder }]}
                    value={patientNameInput}
                    onChangeText={setPatientNameInput}
                    placeholder="Patient Name"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.customTextInput, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)', color: colors.text, borderColor: isLight ? '#F1EAD8' : colors.cardBorder, marginTop: 8 }]}
                    value={symptomsInput}
                    onChangeText={setSymptomsInput}
                    placeholder="Symptoms or reason for visit (optional)"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              {/* 2. HOME SERVICES / AUTOMOBILE FIELDS */}
              {(getEffectiveCategory(schedulingItem) === 'Home Services' || getEffectiveCategory(schedulingItem) === 'Automobile') && (
                <View style={styles.customFieldsSection}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>SERVICE PACKAGE</Text>
                  <View style={styles.chipOptionsRow}>
                    {['Standard Cleaning (₹499)', 'Deep Jet Wash (+₹350)', 'Gas Leak Fix (+₹500)'].map((pkg) => (
                      <TouchableOpacity
                        key={pkg}
                        style={[styles.chipBtn, selectedProblemPackage === pkg && styles.chipBtnActive]}
                        onPress={() => setSelectedProblemPackage(pkg)}
                      >
                        <Text style={[styles.chipBtnText, selectedProblemPackage === pkg && styles.chipBtnTextActive, { color: selectedProblemPackage === pkg ? '#0F172A' : colors.text }]}>{pkg}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>SERVICE LOCATION</Text>
                  <View style={[styles.addressCard, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)', borderColor: isLight ? '#F1EAD8' : colors.cardBorder }]}>
                    <Icons.MapPin color="#F5B800" size={16} />
                    <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={1}>{selectedAddress}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MyAddresses')}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#D97706' }}>CHANGE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 3. LEGAL FIELDS */}
              {getEffectiveCategory(schedulingItem) === 'Legal' && (
                <View style={styles.customFieldsSection}>
                  <View style={[styles.providerInfoCard, { backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 184, 0, 0.1)', borderColor: isLight ? '#FDE68A' : 'rgba(245, 184, 0, 0.25)' }]}>
                    <Icons.Scale color="#D97706" size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.providerTitle, { color: colors.text }]}>Adv. Rajesh Varma • High Court Advocate</Text>
                      <Text style={[styles.providerSubtitle, { color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }]}>Corporate & Property Law • 18+ yrs Exp • 4.9 ★</Text>
                    </View>
                  </View>
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 10 }]}>CASE BRIEF & REQUIREMENTS</Text>
                  <TextInput
                    style={[styles.customTextInput, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)', color: colors.text, borderColor: isLight ? '#F1EAD8' : colors.cardBorder }]}
                    value={symptomsInput}
                    onChangeText={setSymptomsInput}
                    placeholder="Briefly describe your legal query or deed verification..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              {/* 4. EDUCATION FIELDS */}
              {getEffectiveCategory(schedulingItem) === 'Education' && (
                <View style={styles.customFieldsSection}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>SESSION DURATION</Text>
                  <View style={styles.chipOptionsRow}>
                    {['1 Hour Session (₹499)', '2 Hours Intensive (₹899)'].map((dur) => (
                      <TouchableOpacity
                        key={dur}
                        style={[styles.chipBtn, selectedDuration === dur && styles.chipBtnActive]}
                        onPress={() => setSelectedDuration(dur)}
                      >
                        <Text style={[styles.chipBtnText, selectedDuration === dur && styles.chipBtnTextActive, { color: selectedDuration === dur ? '#0F172A' : colors.text }]}>{dur}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* 5. STAY / TRAVEL FIELDS */}
              {(getEffectiveCategory(schedulingItem) === 'Stay' || getEffectiveCategory(schedulingItem) === 'Travel') && (
                <View style={styles.customFieldsSection}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>GUESTS / TRAVELLERS</Text>
                  <View style={styles.chipOptionsRow}>
                    {['1 Guest', '2 Guests', 'Family (2+2)'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.chipBtn, travelGuests === g && styles.chipBtnActive]}
                        onPress={() => setTravelGuests(g)}
                      >
                        <Text style={[styles.chipBtnText, travelGuests === g && styles.chipBtnTextActive, { color: travelGuests === g ? '#0F172A' : colors.text }]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* --- DATE CAROUSEL --- */}
              <Text style={[styles.schedulerSectionTitle, { color: colors.text }]}>SELECT DATE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateCarouselContent}>
                {GENERATE_NEXT_7_DAYS().map((dObj) => {
                  const isSelected = selectedDateObj?.id === dObj.id;
                  const isFull = dObj.isFull;

                  return (
                    <TouchableOpacity
                      key={dObj.id}
                      disabled={isFull}
                      activeOpacity={0.8}
                      style={[
                        styles.dateCardPill,
                        {
                          backgroundColor: isSelected
                            ? '#0F172A'
                            : isFull
                            ? isLight ? '#F1F5F9' : 'rgba(255,255,255,0.03)'
                            : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                          borderColor: isSelected
                            ? '#F5B800'
                            : isFull
                            ? 'transparent'
                            : isLight ? '#F1EAD8' : colors.cardBorder,
                          opacity: isFull ? 0.45 : 1,
                        },
                      ]}
                      onPress={() => setSelectedDateObj(dObj)}
                    >
                      <Text style={[styles.dateDayName, { color: isSelected ? '#F5B800' : isLight ? '#64748B' : 'rgba(255,255,255,0.5)' }]}>
                        {dObj.dayName.toUpperCase()}
                      </Text>
                      <Text style={[styles.dateNumText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {dObj.dateNum}
                      </Text>
                      <Text style={[styles.dateMonthText, { color: isSelected ? 'rgba(255,255,255,0.8)' : isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)' }]}>
                        {dObj.monthName}
                      </Text>
                      <View style={[styles.dateStatusBadge, { backgroundColor: isSelected ? '#F5B800' : isFull ? '#EF4444' : '#10B981' }]}>
                        <Text style={[styles.dateStatusBadgeText, { color: isSelected ? '#0F172A' : '#FFFFFF' }]}>
                          {isSelected ? 'SELECTED' : isFull ? 'FULL' : 'AVAILABLE'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* --- TIME SLOT GRID --- */}
              <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginTop: 16 }]}>SELECT TIME SLOT</Text>
              <View style={styles.timeSlotsGrid}>
                {TIMINGS_GRID.map((tObj) => {
                  const isSelected = selectedSlotObj?.id === tObj.id;
                  const isNotAvail = tObj.status === 'NOT_AVAILABLE';

                  return (
                    <TouchableOpacity
                      key={tObj.id}
                      disabled={isNotAvail}
                      activeOpacity={0.8}
                      style={[
                        styles.timeSlotCard,
                        {
                          backgroundColor: isSelected
                            ? '#F5B800'
                            : isNotAvail
                            ? isLight ? '#F1F5F9' : 'rgba(255,255,255,0.03)'
                            : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                          borderColor: isSelected
                            ? '#F5B800'
                            : isNotAvail
                            ? 'transparent'
                            : isLight ? '#F1EAD8' : colors.cardBorder,
                          opacity: isNotAvail ? 0.45 : 1,
                        },
                      ]}
                      onPress={() => setSelectedSlotObj(tObj)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          { color: isSelected ? '#0F172A' : colors.text },
                          isNotAvail && { textDecorationLine: 'line-through' },
                        ]}
                      >
                        {tObj.time}
                      </Text>
                      <Text style={[styles.timeSlotStatusText, { color: isSelected ? '#0F172A' : isNotAvail ? '#EF4444' : '#10B981' }]}>
                        {isSelected ? 'SELECTED' : isNotAvail ? 'FULL' : 'AVAILABLE'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* --- LIVE BOOKING SUMMARY CARD --- */}
              <View style={[styles.bookingSummaryCard, { backgroundColor: isLight ? '#FEF9E7' : 'rgba(245, 184, 0, 0.08)', borderColor: isLight ? '#FDE68A' : 'rgba(245, 184, 0, 0.3)' }]}>
                <View style={styles.summaryRow}>
                  <Icons.Calendar color="#D97706" size={14} />
                  <Text style={[styles.summaryLabel, { color: isLight ? '#0F172A' : '#FFF' }]}>
                    {selectedDateObj ? selectedDateObj.fullDateStr : 'Select Date'} • {selectedSlotObj ? selectedSlotObj.time : 'Select Slot'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Icons.ShieldCheck color="#10B981" size={14} />
                  <Text style={[styles.summarySubText, { color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }]}>
                    You won't be charged yet • Free cancellation up to 2 hrs before
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Confirm CTA */}
            <View style={[styles.schedulerFooter, { borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' }]}>
              <TouchableOpacity
                disabled={!selectedDateObj || !selectedSlotObj}
                style={[
                  styles.confirmBookingBtn,
                  (!selectedDateObj || !selectedSlotObj) && styles.disabledConfirmBtn,
                ]}
                onPress={handleConfirmBooking}
              >
                <Text style={styles.confirmBookingBtnText}>
                  {!selectedDateObj
                    ? 'Select Date to Continue'
                    : !selectedSlotObj
                    ? 'Select Time Slot'
                    : getConfirmCtaLabel(schedulingItem)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- STAY MODULE MODALS --- */}
      {/* 1. Destination Picker Modal */}
      <Modal visible={isDestModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, { color: colors.text }]}>Select Destination</Text>
              <TouchableOpacity onPress={() => setIsDestModalOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {['All Destinations', 'Bengaluru', 'Goa', 'Coorg', 'Ooty', 'Mysuru', 'Jaipur', 'Wayanad'].map((dest) => (
                <TouchableOpacity
                  key={dest}
                  style={[
                    styles.destItemRow,
                    { borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' },
                  ]}
                  onPress={() => {
                    setSelectedDestination(dest);
                    setIsDestModalOpen(false);
                  }}
                >
                  <Icons.MapPin color={selectedDestination === dest ? '#F5B800' : '#64748B'} size={18} />
                  <Text
                    style={[
                      styles.destItemText,
                      { color: selectedDestination === dest ? '#F5B800' : colors.text, fontWeight: selectedDestination === dest ? '800' : '600', flex: 1 },
                    ]}
                  >
                    {dest}
                  </Text>
                  {selectedDestination === dest && <Icons.Check color="#F5B800" size={18} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Date Picker Calendar Modal */}
      <Modal visible={isCalendarModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, { color: colors.text }]}>Select Travel Dates</Text>
              <TouchableOpacity onPress={() => setIsCalendarModalOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.stayDateSummaryBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stayDateSummaryLabel}>CHECK-IN</Text>
                <Text style={styles.stayDateSummaryValue}>{checkInDate}</Text>
              </View>
              <View style={styles.stayDateNightsPill}>
                <Text style={styles.stayDateNightsPillText}>{stayNights} Nights</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.stayDateSummaryLabel}>CHECK-OUT</Text>
                <Text style={styles.stayDateSummaryValue}>{checkOutDate}</Text>
              </View>
            </View>

            <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginTop: 12 }]}>POPULAR DATE RANGES</Text>
            <View style={{ gap: 8, marginVertical: 12 }}>
              {[
                { in: '12 Sep', out: '15 Sep', nights: 3, label: '12 Sep → 15 Sep (3 Nights)' },
                { in: '18 Sep', out: '20 Sep', nights: 2, label: '18 Sep → 20 Sep (Weekend • 2 Nights)' },
                { in: '25 Sep', out: '29 Sep', nights: 4, label: '25 Sep → 29 Sep (Long Stay • 4 Nights)' },
                { in: '02 Oct', out: '06 Oct', nights: 4, label: '02 Oct → 06 Oct (Holiday • 4 Nights)' },
              ].map((range) => {
                const isSel = checkInDate === range.in && checkOutDate === range.out;
                return (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.destItemRow,
                      {
                        backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                        borderColor: isSel ? '#F5B800' : 'transparent',
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                      },
                    ]}
                    onPress={() => {
                      setCheckInDate(range.in);
                      setCheckOutDate(range.out);
                      setStayNights(range.nights);
                    }}
                  >
                    <Icons.Calendar color={isSel ? '#F5B800' : '#64748B'} size={18} />
                    <Text style={[styles.destItemText, { color: isSel ? '#0F172A' : colors.text, fontWeight: isSel ? '800' : '600', flex: 1 }]}>
                      {range.label}
                    </Text>
                    {isSel && <Icons.Check color="#F5B800" size={18} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setIsCalendarModalOpen(false)}>
              <Text style={styles.modalPrimaryBtnText}>Apply Dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Guest Selector Bottom Sheet */}
      <Modal visible={isGuestModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, { color: colors.text }]}>Select Guests & Rooms</Text>
              <TouchableOpacity onPress={() => setIsGuestModalOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16, marginVertical: 16 }}>
              {/* Adults */}
              <View style={styles.guestRow}>
                <View>
                  <Text style={[styles.guestRowTitle, { color: colors.text }]}>Adults</Text>
                  <Text style={styles.guestRowSub}>Ages 12 or above</Text>
                </View>
                <View style={styles.guestStepperRow}>
                  <TouchableOpacity style={styles.guestStepperBtn} onPress={() => setStayAdults((a) => Math.max(1, a - 1))}>
                    <Text style={styles.guestStepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.guestCountText, { color: colors.text }]}>{stayAdults}</Text>
                  <TouchableOpacity style={styles.guestStepperBtn} onPress={() => setStayAdults((a) => a + 1)}>
                    <Text style={styles.guestStepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Children */}
              <View style={styles.guestRow}>
                <View>
                  <Text style={[styles.guestRowTitle, { color: colors.text }]}>Children</Text>
                  <Text style={styles.guestRowSub}>Ages 0 to 11</Text>
                </View>
                <View style={styles.guestStepperRow}>
                  <TouchableOpacity style={styles.guestStepperBtn} onPress={() => setStayChildren((c) => Math.max(0, c - 1))}>
                    <Text style={styles.guestStepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.guestCountText, { color: colors.text }]}>{stayChildren}</Text>
                  <TouchableOpacity style={styles.guestStepperBtn} onPress={() => setStayChildren((c) => c + 1)}>
                    <Text style={styles.guestStepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Rooms */}
              <View style={styles.guestRow}>
                <View>
                  <Text style={[styles.guestRowTitle, { color: colors.text }]}>Rooms</Text>
                  <Text style={styles.guestRowSub}>Number of rooms required</Text>
                </View>
                <View style={styles.guestStepperRow}>
                  <TouchableOpacity style={styles.guestStepperBtn} onPress={() => setStayRooms((r) => Math.max(1, r - 1))}>
                    <Text style={styles.guestStepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.guestCountText, { color: colors.text }]}>{stayRooms}</Text>
                  <TouchableOpacity style={styles.guestStepperBtn} onPress={() => setStayRooms((r) => r + 1)}>
                    <Text style={styles.guestStepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setIsGuestModalOpen(false)}>
              <Text style={styles.modalPrimaryBtnText}>Apply ({stayAdults} Guests, {stayRooms} Room)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. Stay Filter Modal */}
      <Modal visible={isStayFilterOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '88%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 }]}>
            <View style={styles.sheetDragHandle} />
            {/* Header */}
            <View style={[styles.modalSheetHeader, { borderBottomWidth: 1, borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', paddingBottom: 12 }]}>
              <View>
                <Text style={[styles.modalSheetTitle, { color: colors.text, fontSize: 18, fontWeight: '900' }]}>Filter Stays</Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {stayActiveFiltersCount > 0 ? `⚡ ${stayActiveFiltersCount} filter(s) active` : 'Select preferences to refine results'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsStayFilterOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4, borderRadius: 20, backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)' }}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {/* 1. PRICE PER NIGHT WITH VISUAL RANGE CARDS */}
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 0 }]}>PRICE PER NIGHT</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#F5B800' }}>
                    {draftStayPriceRange === 'All' ? 'All Prices' : draftStayPriceRange}
                  </Text>
                </View>

                {/* Price Step Cards */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { label: 'All', icon: '🏷️' },
                    { label: 'Under ₹3,500', icon: '💰' },
                    { label: '₹3,500 - ₹6,000', icon: '✨' },
                    { label: '₹6,000+', icon: '👑' },
                  ].map((prOpt) => {
                    const isSel = draftStayPriceRange === prOpt.label;
                    return (
                      <TouchableOpacity
                        key={prOpt.label}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 9,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftStayPriceRange(prOpt.label)}
                      >
                        <Text style={{ fontSize: 12 }}>{prOpt.icon}</Text>
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {prOpt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. PROPERTY TYPE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PROPERTY TYPE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { type: 'Hotels', icon: '🏨' },
                    { type: 'Resorts', icon: '🌴' },
                    { type: 'Villas', icon: '🏡' },
                    { type: 'Homestays', icon: '🌄' },
                    { type: 'Apartments', icon: '🏢' },
                  ].map((item) => {
                    const isSel = draftStayPropTypes.includes(item.type);
                    return (
                      <TouchableOpacity
                        key={item.type}
                        style={{
                          backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 9,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (isSel) {
                            setDraftStayPropTypes((prev) => prev.filter((p) => p !== item.type));
                          } else {
                            setDraftStayPropTypes((prev) => [...prev, item.type]);
                          }
                        }}
                      >
                        <View style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          borderWidth: 1.5,
                          borderColor: isSel ? '#F5B800' : '#94A3B8',
                          backgroundColor: isSel ? '#F5B800' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {isSel && <Icons.Check color="#0F172A" size={11} strokeWidth={3} />}
                        </View>
                        <Text style={{ fontSize: 12 }}>{item.icon}</Text>
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '800' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {item.type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. STAR RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>STAR RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { star: 5, label: '5 Star ★★★★★' },
                    { star: 4, label: '4 Star ★★★★' },
                    { star: 3, label: '3 Star ★★★' },
                  ].map((stObj) => {
                    const isSel = draftStayStarRatings.includes(stObj.star);
                    return (
                      <TouchableOpacity
                        key={`star_${stObj.star}`}
                        style={{
                          backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 9,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (isSel) {
                            setDraftStayStarRatings((prev) => prev.filter((s) => s !== stObj.star));
                          } else {
                            setDraftStayStarRatings((prev) => [...prev, stObj.star]);
                          }
                        }}
                      >
                        <Icons.Star color={isSel ? '#F5B800' : '#94A3B8'} size={13} fill={isSel ? '#F5B800' : 'transparent'} />
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '800' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {stObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. GUEST RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>GUEST RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { val: 4.8, label: '4.8+ Exceptional' },
                    { val: 4.5, label: '4.5+ Wonderful' },
                    { val: 4.0, label: '4.0+ Very Good' },
                  ].map((grObj) => {
                    const isSel = draftStayGuestRating === grObj.val;
                    return (
                      <TouchableOpacity
                        key={`gr_${grObj.val}`}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 9,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftStayGuestRating(isSel ? null : grObj.val)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{grObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. AMENITIES */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>AMENITIES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { amen: 'Pool', icon: '🏊' },
                    { amen: 'Free Wi-Fi', icon: '📶' },
                    { amen: 'Breakfast', icon: '🍳' },
                    { amen: 'Parking', icon: '🅿️' },
                    { amen: 'AC', icon: '❄️' },
                    { amen: 'Spa', icon: '💆' },
                    { amen: 'Gym', icon: '💪' },
                    { amen: 'Kitchen', icon: '🍳' },
                    { amen: 'Restaurant', icon: '🍽️' },
                  ].map((item) => {
                    const isSel = draftStayAmenities.includes(item.amen);
                    return (
                      <TouchableOpacity
                        key={item.amen}
                        style={{
                          backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 11,
                          paddingVertical: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                        }}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (isSel) {
                            setDraftStayAmenities((prev) => prev.filter((a) => a !== item.amen));
                          } else {
                            setDraftStayAmenities((prev) => [...prev, item.amen]);
                          }
                        }}
                      >
                        <Text style={{ fontSize: 11.5 }}>{item.icon}</Text>
                        <Text style={{ fontSize: 11.5, fontWeight: isSel ? '800' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {item.amen}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. CANCELLATION POLICY */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>CANCELLATION POLICY</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: draftFreeCancelOnly ? '#ECFDF5' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    borderColor: draftFreeCancelOnly ? '#10B981' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  activeOpacity={0.8}
                  onPress={() => setDraftFreeCancelOnly(!draftFreeCancelOnly)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: draftFreeCancelOnly ? '#10B981' : '#94A3B8',
                      backgroundColor: draftFreeCancelOnly ? '#10B981' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {draftFreeCancelOnly && <Icons.Check color="#FFFFFF" size={13} strokeWidth={3} />}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: draftFreeCancelOnly ? '800' : '600', color: colors.text }}>
                      Free Cancellation Only
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    100% Refundable
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  {
                    flex: 1,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                  },
                ]}
                activeOpacity={0.8}
                onPress={resetStayDraftFilters}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 2.2 }]}
                activeOpacity={0.85}
                onPress={applyStayFilters}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  Show {draftDisplayedStays.length} Stays
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Products Filter Modal */}
      <Modal visible={isProdFilterOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '88%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 }]}>
            <View style={styles.sheetDragHandle} />
            {/* Header */}
            <View style={[styles.modalSheetHeader, { borderBottomWidth: 1, borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', paddingBottom: 12 }]}>
              <View>
                <Text style={[styles.modalSheetTitle, { color: colors.text, fontSize: 18, fontWeight: '900' }]}>Filter Products</Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {prodActiveFiltersCount > 0 ? `⚡ ${prodActiveFiltersCount} filter(s) active` : 'Select filters to refine product list'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsProdFilterOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4, borderRadius: 20, backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)' }}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {/* 1. CATEGORY */}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>CATEGORY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Electronics', 'IT & Office', 'Home Appliances'].map((catOpt) => {
                    const isSel = draftProdCategory === catOpt;
                    return (
                      <TouchableOpacity
                        key={catOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftProdCategory(catOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{catOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. BRAND */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>BRAND</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Sony', 'Fitbit', 'Logitech', 'Philips', 'Bose', 'Polaroid'].map((bOpt) => {
                    const isSel = draftProdBrand === bOpt;
                    return (
                      <TouchableOpacity
                        key={bOpt}
                        style={{
                          backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftProdBrand(bOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{bOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. PRICE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PRICE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Under ₹1,500', '₹1,500 - ₹5,000', '₹5,000+'].map((pOpt) => {
                    const isSel = draftProdPrice === pOpt;
                    return (
                      <TouchableOpacity
                        key={pOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftProdPrice(pOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{pOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>MINIMUM RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { val: 4.8, label: '4.8+ Exceptional' },
                    { val: 4.5, label: '4.5+ Wonderful' },
                    { val: 4.0, label: '4.0+ Very Good' },
                  ].map((rObj) => {
                    const isSel = draftProdRating === rObj.val;
                    return (
                      <TouchableOpacity
                        key={`pr_rating_${rObj.val}`}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftProdRating(isSel ? null : rObj.val)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{rObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. DISCOUNT */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>DISCOUNT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', '20%+ OFF', '30%+ OFF', '40%+ OFF'].map((dOpt) => {
                    const isSel = draftProdDiscount === dOpt;
                    return (
                      <TouchableOpacity
                        key={dOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftProdDiscount(dOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{dOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. AVAILABILITY */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>AVAILABILITY</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: draftProdInStockOnly ? '#ECFDF5' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    borderColor: draftProdInStockOnly ? '#10B981' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  activeOpacity={0.8}
                  onPress={() => setDraftProdInStockOnly(!draftProdInStockOnly)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: draftProdInStockOnly ? '#10B981' : '#94A3B8',
                      backgroundColor: draftProdInStockOnly ? '#10B981' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {draftProdInStockOnly && <Icons.Check color="#FFFFFF" size={13} strokeWidth={3} />}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: draftProdInStockOnly ? '800' : '600', color: colors.text }}>
                      In Stock Only
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    Ready to Ship
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  {
                    flex: 1,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                  },
                ]}
                activeOpacity={0.8}
                onPress={resetProdDraftFilters}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 2.2 }]}
                activeOpacity={0.85}
                onPress={applyProdFilters}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  Show {draftProdDisplayedServices.length} Products
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Daily Needs Filter Modal */}
      <Modal visible={isDnFilterOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '88%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 }]}>
            <View style={styles.sheetDragHandle} />
            {/* Header */}
            <View style={[styles.modalSheetHeader, { borderBottomWidth: 1, borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', paddingBottom: 12 }]}>
              <View>
                <Text style={[styles.modalSheetTitle, { color: colors.text, fontSize: 18, fontWeight: '900' }]}>Filter Daily Needs</Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {dnActiveFiltersCount > 0 ? `⚡ ${dnActiveFiltersCount} filter(s) active` : 'Select filters to refine grocery list'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsDnFilterOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4, borderRadius: 20, backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)' }}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {/* 1. GROCERY CATEGORY */}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>GROCERY CATEGORY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Fruits & Vegetables', 'Grocery & Staples', 'Dairy, Bread & Eggs', 'Snacks & Beverages'].map((catOpt) => {
                    const isSel = draftDnCategory === catOpt;
                    return (
                      <TouchableOpacity
                        key={catOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftDnCategory(catOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{catOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. BRAND */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>BRAND</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Farm Fresh', 'Local Farms', 'Shimla Fresh', 'Aashirvaad', 'Fortune', 'Tata Sampann', 'Madhur', 'Tata', 'Rajdhani'].map((bOpt) => {
                    const isSel = draftDnBrand === bOpt;
                    return (
                      <TouchableOpacity
                        key={bOpt}
                        style={{
                          backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftDnBrand(bOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{bOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. PRICE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PRICE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Under ₹50', '₹50 - ₹200', '₹200+'].map((pOpt) => {
                    const isSel = draftDnPrice === pOpt;
                    return (
                      <TouchableOpacity
                        key={pOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftDnPrice(pOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{pOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>MINIMUM RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { val: 4.8, label: '4.8+ Exceptional' },
                    { val: 4.5, label: '4.5+ Wonderful' },
                    { val: 4.0, label: '4.0+ Very Good' },
                  ].map((rObj) => {
                    const isSel = draftDnRating === rObj.val;
                    return (
                      <TouchableOpacity
                        key={`dn_rating_${rObj.val}`}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftDnRating(isSel ? null : rObj.val)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{rObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. PACK SIZE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PACK SIZE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', '500g / 1kg', '5kg', 'Single Pack'].map((psOpt) => {
                    const isSel = draftDnPackSize === psOpt;
                    return (
                      <TouchableOpacity
                        key={psOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftDnPackSize(psOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{psOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. DELIVERY TIME */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>DELIVERY TIME</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', '⚡ 15 mins', '⚡ 15-30 mins'].map((dtOpt) => {
                    const isSel = draftDnDeliveryTime === dtOpt;
                    return (
                      <TouchableOpacity
                        key={dtOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftDnDeliveryTime(dtOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{dtOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 7. AVAILABILITY */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>AVAILABILITY</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: draftDnInStockOnly ? '#ECFDF5' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    borderColor: draftDnInStockOnly ? '#10B981' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  activeOpacity={0.8}
                  onPress={() => setDraftDnInStockOnly(!draftDnInStockOnly)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: draftDnInStockOnly ? '#10B981' : '#94A3B8',
                      backgroundColor: draftDnInStockOnly ? '#10B981' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {draftDnInStockOnly && <Icons.Check color="#FFFFFF" size={13} strokeWidth={3} />}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: draftDnInStockOnly ? '800' : '600', color: colors.text }}>
                      In Stock Only
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    Instant Delivery
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  {
                    flex: 1,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                  },
                ]}
                activeOpacity={0.8}
                onPress={resetDnDraftFilters}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 2.2 }]}
                activeOpacity={0.85}
                onPress={applyDnFilters}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  Show {draftDnDisplayedServices.length} Items
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Food Filter Modal */}
      <Modal visible={isFoodFilterOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '88%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 }]}>
            <View style={styles.sheetDragHandle} />
            {/* Header */}
            <View style={[styles.modalSheetHeader, { borderBottomWidth: 1, borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', paddingBottom: 12 }]}>
              <View>
                <Text style={[styles.modalSheetTitle, { color: colors.text, fontSize: 18, fontWeight: '900' }]}>Filter Food & Restaurants</Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {foodActiveFiltersCount > 0 ? `⚡ ${foodActiveFiltersCount} filter(s) active` : 'Select filters to refine food list'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFoodFilterOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4, borderRadius: 20, backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)' }}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {/* 1. CUISINE */}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>CUISINE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'North Indian', 'South Indian', 'Biryani', 'Chinese', 'Italian', 'Desserts', 'Fast Food'].map((cOpt) => {
                    const isSel = draftFoodCuisine === cOpt;
                    return (
                      <TouchableOpacity
                        key={cOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftFoodCuisine(cOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{cOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. VEG / NON-VEG */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>DIETARY PREFERENCE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { key: 'All', label: 'All Dishes' },
                    { key: 'Pure Veg', label: 'Pure Veg 🌱' },
                    { key: 'Non-Veg', label: 'Non-Veg 🍗' },
                  ].map((vObj) => {
                    const isSel = draftFoodVegMode === vObj.key;
                    return (
                      <TouchableOpacity
                        key={vObj.key}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftFoodVegMode(vObj.key)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{vObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. PRICE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PRICE FOR TWO</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Under ₹200', '₹200 - ₹500', '₹500+'].map((pOpt) => {
                    const isSel = draftFoodPrice === pOpt;
                    return (
                      <TouchableOpacity
                        key={pOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftFoodPrice(pOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{pOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>MINIMUM RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { val: 4.8, label: '4.8+ Exceptional' },
                    { val: 4.5, label: '4.5+ Wonderful' },
                    { val: 4.0, label: '4.0+ Very Good' },
                  ].map((rObj) => {
                    const isSel = draftFoodRating === rObj.val;
                    return (
                      <TouchableOpacity
                        key={`food_rating_${rObj.val}`}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftFoodRating(isSel ? null : rObj.val)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{rObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. DELIVERY TIME */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>DELIVERY TIME</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Under 30 mins', '30-45 mins'].map((dtOpt) => {
                    const isSel = draftFoodDeliveryTime === dtOpt;
                    return (
                      <TouchableOpacity
                        key={dtOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftFoodDeliveryTime(dtOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{dtOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. OFFERS & DISCOUNTS */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>OFFERS & DISCOUNTS</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: draftFoodOffersOnly ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    borderColor: draftFoodOffersOnly ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  activeOpacity={0.8}
                  onPress={() => setDraftFoodOffersOnly(!draftFoodOffersOnly)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: draftFoodOffersOnly ? '#F5B800' : '#94A3B8',
                      backgroundColor: draftFoodOffersOnly ? '#F5B800' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {draftFoodOffersOnly && <Icons.Check color="#0F172A" size={13} strokeWidth={3} />}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: draftFoodOffersOnly ? '800' : '600', color: colors.text }}>
                      Offers & Discounts Only
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    Up to 25% OFF
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  {
                    flex: 1,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                  },
                ]}
                activeOpacity={0.8}
                onPress={resetFoodDraftFilters}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 2.2 }]}
                activeOpacity={0.85}
                onPress={applyFoodFilters}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  Show {draftFoodDisplayedServices.length} Dishes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Services Filter Modal */}
      <Modal visible={isSrvFilterOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '88%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 }]}>
            <View style={styles.sheetDragHandle} />
            {/* Header */}
            <View style={[styles.modalSheetHeader, { borderBottomWidth: 1, borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', paddingBottom: 12 }]}>
              <View>
                <Text style={[styles.modalSheetTitle, { color: colors.text, fontSize: 18, fontWeight: '900' }]}>Filter Home Services</Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {srvActiveFiltersCount > 0 ? `⚡ ${srvActiveFiltersCount} filter(s) active` : 'Select filters to refine services'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSrvFilterOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4, borderRadius: 20, backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)' }}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {/* 1. SERVICE CATEGORY / TYPE */}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>SERVICE CATEGORY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Cleaning', 'AC Service', 'Plumber', 'Electrician', 'Appliance Repair', 'Beauty & Wellness'].map((sType) => {
                    const isSel = draftSrvType === sType;
                    return (
                      <TouchableOpacity
                        key={sType}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftSrvType(sType)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{sType}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. PRICE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PRICE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Under ₹500', '₹500 - ₹1,500', '₹1,500+'].map((pOpt) => {
                    const isSel = draftSrvPrice === pOpt;
                    return (
                      <TouchableOpacity
                        key={pOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftSrvPrice(pOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{pOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. MINIMUM RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>MINIMUM RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { val: 4.8, label: '4.8+ Exceptional' },
                    { val: 4.5, label: '4.5+ Wonderful' },
                    { val: 4.0, label: '4.0+ Very Good' },
                  ].map((rObj) => {
                    const isSel = draftSrvRating === rObj.val;
                    return (
                      <TouchableOpacity
                        key={`srv_rating_${rObj.val}`}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftSrvRating(isSel ? null : rObj.val)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{rObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. AVAILABILITY */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>AVAILABILITY</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: draftSrvAvailability ? '#ECFDF5' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    borderColor: draftSrvAvailability ? '#10B981' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  activeOpacity={0.8}
                  onPress={() => setDraftSrvAvailability(!draftSrvAvailability)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: draftSrvAvailability ? '#10B981' : '#94A3B8',
                      backgroundColor: draftSrvAvailability ? '#10B981' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {draftSrvAvailability && <Icons.Check color="#FFFFFF" size={13} strokeWidth={3} />}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: draftSrvAvailability ? '800' : '600', color: colors.text }}>
                      Available Today Only ⚡
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#059669', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    Same Day Service
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 5. SERVICE TIME */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>SERVICE DURATION</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', '30-45 mins', '1-2 hours'].map((stOpt) => {
                    const isSel = draftSrvTime === stOpt;
                    return (
                      <TouchableOpacity
                        key={stOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftSrvTime(stOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{stOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. INSTANT / SCHEDULED */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>BOOKING MODE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { key: 'All', label: 'All Modes' },
                    { key: 'Instant', label: 'Instant Booking ⚡' },
                    { key: 'Scheduled', label: 'Scheduled Booking 📅' },
                  ].map((bMode) => {
                    const isSel = draftSrvBookingMode === bMode.key;
                    return (
                      <TouchableOpacity
                        key={bMode.key}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftSrvBookingMode(bMode.key)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{bMode.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  {
                    flex: 1,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                  },
                ]}
                activeOpacity={0.8}
                onPress={resetSrvDraftFilters}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 2.2 }]}
                activeOpacity={0.85}
                onPress={applySrvFilters}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  Show {draftSrvDisplayedServices.length} Services
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bus Booking Filter Modal */}
      <Modal visible={isBusFilterOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '88%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 20 }]}>
            <View style={styles.sheetDragHandle} />
            {/* Header */}
            <View style={[styles.modalSheetHeader, { borderBottomWidth: 1, borderBottomColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', paddingBottom: 12 }]}>
              <View>
                <Text style={[styles.modalSheetTitle, { color: colors.text, fontSize: 18, fontWeight: '900' }]}>Filter Bus Bookings</Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {busActiveFiltersCount > 0 ? `⚡ ${busActiveFiltersCount} filter(s) active` : 'Refine bus options for your route'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsBusFilterOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4, borderRadius: 20, backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)' }}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {/* 1. DEPARTURE TIME */}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>DEPARTURE TIME</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    'All',
                    'Morning (6 AM - 12 PM)',
                    'Afternoon (12 PM - 6 PM)',
                    'Evening (6 PM - 11 PM)',
                    'Night (After 11 PM)',
                  ].map((dSlot) => {
                    const isSel = draftBusDepartureTime === dSlot;
                    return (
                      <TouchableOpacity
                        key={dSlot}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusDepartureTime(dSlot)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{dSlot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. BUS TYPE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>BUS TYPE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'AC Sleeper', 'Volvo Multi-Axle', 'Electric Bus', 'AC Seater', 'Non-AC Sleeper'].map((bType) => {
                    const isSel = draftBusType === bType;
                    return (
                      <TouchableOpacity
                        key={bType}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusType(bType)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{bType}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. OPERATOR */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>BUS OPERATOR</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'VRL Travels', 'KSRTC', 'IntrCity SmartBus', 'Orange Travels', 'SRS Travels'].map((op) => {
                    const isSel = draftBusOperator === op;
                    return (
                      <TouchableOpacity
                        key={op}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusOperator(op)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{op}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. PRICE */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>PRICE FARE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Under ₹700', '₹700 - ₹1,200', '₹1,200+'].map((pOpt) => {
                    const isSel = draftBusPrice === pOpt;
                    return (
                      <TouchableOpacity
                        key={pOpt}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusPrice(pOpt)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{pOpt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. BOARDING POINT */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>BOARDING POINT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Majestic', 'Madiwala', 'Silk Board', 'Electronic City', 'Yeshwantpur'].map((bp) => {
                    const isSel = draftBusBoarding === bp;
                    return (
                      <TouchableOpacity
                        key={bp}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusBoarding(bp)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{bp}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. DROPPING POINT */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>DROPPING POINT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Panaji', 'Mapusa', 'Koyambedu', 'Gachibowli', 'Gandhipuram', 'Hubli'].map((dp) => {
                    const isSel = draftBusDropping === dp;
                    return (
                      <TouchableOpacity
                        key={dp}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusDropping(dp)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{dp}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 7. SEAT AVAILABILITY */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>SEAT AVAILABILITY</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: draftBusSeatsAvailableOnly ? '#ECFDF5' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                    borderColor: draftBusSeatsAvailableOnly ? '#10B981' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                    borderWidth: 1.5,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  activeOpacity={0.8}
                  onPress={() => setDraftBusSeatsAvailableOnly(!draftBusSeatsAvailableOnly)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: draftBusSeatsAvailableOnly ? '#10B981' : '#94A3B8',
                      backgroundColor: draftBusSeatsAvailableOnly ? '#10B981' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {draftBusSeatsAvailableOnly && <Icons.Check color="#FFFFFF" size={13} strokeWidth={3} />}
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: draftBusSeatsAvailableOnly ? '800' : '600', color: colors.text }}>
                      10+ Available Seats Only 💺
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#059669', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    High Availability
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 8. RATING */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.schedulerSectionTitle, { color: colors.text, marginBottom: 8 }]}>MINIMUM RATING</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { val: 4.8, label: '4.8+ Exceptional' },
                    { val: 4.5, label: '4.5+ Wonderful' },
                    { val: 4.0, label: '4.0+ Very Good' },
                  ].map((rObj) => {
                    const isSel = draftBusRating === rObj.val;
                    return (
                      <TouchableOpacity
                        key={`bus_rating_${rObj.val}`}
                        style={{
                          backgroundColor: isSel ? '#F5B800' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                          borderColor: isSel ? '#F5B800' : isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                          borderWidth: 1.5,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                        activeOpacity={0.8}
                        onPress={() => setDraftBusRating(isSel ? null : rObj.val)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: isSel ? '900' : '600', color: isSel ? '#0F172A' : colors.text }}>
                          {isSel ? '✓ ' : ''}{rObj.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  {
                    flex: 1,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
                  },
                ]}
                activeOpacity={0.8}
                onPress={resetBusDraftFilters}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 2.2 }]}
                activeOpacity={0.85}
                onPress={applyBusFilters}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  Show {draftBusDisplayedServices.length} Buses
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Stay Sort Modal */}
      <Modal visible={isStaySortOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, { color: colors.text }]}>Sort Stays By</Text>
              <TouchableOpacity onPress={() => setIsStaySortOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginVertical: 12 }}>
              {(['Recommended', 'Price Low → High', 'Price High → Low', 'Rating'] as const).map((sortOpt) => {
                const isSel = selectedStaySort === sortOpt;
                return (
                  <TouchableOpacity
                    key={sortOpt}
                    style={[
                      styles.destItemRow,
                      {
                        backgroundColor: isSel ? '#FFFBEB' : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                        borderColor: isSel ? '#F5B800' : 'transparent',
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      },
                    ]}
                    onPress={() => {
                      setSelectedStaySort(sortOpt);
                      setIsStaySortOpen(false);
                    }}
                  >
                    <Text style={[styles.destItemText, { color: isSel ? '#0F172A' : colors.text, fontWeight: isSel ? '800' : '600', flex: 1 }]}>
                      {sortOpt}
                    </Text>
                    {isSel && <Icons.Check color="#F5B800" size={18} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. Stay Map Modal */}
      <Modal visible={isStayMapOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <View style={[styles.headerWrapper, { paddingTop: Math.max(insets.top, 20), backgroundColor: '#0F172A', borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.headerBackBtn} onPress={() => setIsStayMapOpen(false)}>
                <Icons.ArrowLeft color="#FFFFFF" size={20} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Stay Map ({displayedStays.length} Stays)</Text>
              <View style={{ width: 36 }} />
            </View>
          </View>

          <View style={{ flex: 1, position: 'relative', backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80' }}
              style={{ width: '100%', height: '100%', opacity: 0.7 }}
              resizeMode="cover"
            />
            {displayedStays.map((st, idx) => (
              <TouchableOpacity
                key={st.id}
                style={{
                  position: 'absolute',
                  top: `${20 + (idx * 9) % 65}%`,
                  left: `${15 + (idx * 13) % 70}%`,
                  backgroundColor: '#F5B800',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  elevation: 6,
                }}
                onPress={() => {
                  setIsStayMapOpen(false);
                  navigation.navigate('StayDetails', {
                    stay: st,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    nights: stayNights,
                    adults: stayAdults,
                    rooms: stayRooms,
                  });
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#0F172A' }}>{st.price.split('/')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* 9. My Bookings Sheet */}
      <Modal visible={isMyBookingsOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { backgroundColor: colors.cardBg, maxHeight: '85%' }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, { color: colors.text }]}>My Stay Bookings</Text>
              <TouchableOpacity onPress={() => setIsMyBookingsOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            {/* Bookings Tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
              {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: bookingsTab === tab ? '#F5B800' : isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)',
                      borderColor: bookingsTab === tab ? '#F5B800' : 'transparent',
                    },
                  ]}
                  onPress={() => setBookingsTab(tab)}
                >
                  <Text style={[styles.categoryChipText, { color: bookingsTab === tab ? '#0F172A' : colors.text }]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={{ flex: 1 }}>
              {bookingsTab === 'Upcoming' ? (
                myStayBookings.length > 0 ? (
                  myStayBookings.map((bk) => (
                    <View key={bk.id} style={[styles.bookingCardItem, { borderColor: isLight ? '#F1EAD8' : colors.cardBorder }]}>
                      <Image source={{ uri: bk.image }} style={styles.bookingCardImg} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.roomTitle, { color: colors.text }]}>{bk.hotelName}</Text>
                        <Text style={styles.roomSub}>{bk.roomName} • {bk.location}</Text>
                        <Text style={styles.bookingSummaryDates}>{bk.checkIn} → {bk.checkOut} ({bk.nights} nights)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <Text style={styles.priceRowTotalVal}>{bk.totalPaid}</Text>
                          <View style={styles.confirmedStatusTag}>
                            <Text style={styles.confirmedStatusTagText}>{bk.status}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>No upcoming bookings</Text>
                  </View>
                )
              ) : (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>No {bookingsTab.toLowerCase()} bookings</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cart Modal Dialog Sheet */}
      <CartModal visible={isCartVisible} onClose={() => setIsCartVisible(false)} navigation={navigation} />

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && !isStayCategory && !(categoryName === 'Jobs' || categoryName === 'Jobs & Careers') && (
        <View style={styles.floatingCartBar}>
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingCartCountBadge}>
              <Text style={styles.floatingCartCountText}>{totalCartCount}</Text>
            </View>
            <Text style={styles.floatingCartPriceText}>
              ₹{cartItems.reduce((sum, item) => {
                const p = parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 0;
                return sum + p * item.quantity;
              }, 0)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.floatingCartViewBtn}
            activeOpacity={0.85}
            onPress={() => setIsCartVisible(true)}
          >
            <Text style={styles.floatingCartViewBtnText}>View Cart</Text>
            <Icons.ChevronRight color="#0F172A" size={16} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerCartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1.2,
    paddingLeft: 12,
    paddingRight: 6,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  micIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceListeningRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
    paddingLeft: 2,
    paddingRight: 6,
  },
  waveBar: {
    width: 3.5,
    backgroundColor: '#F5B800',
    borderRadius: 2,
  },
  voiceListeningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5B800',
  },
  categoryChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultsTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resultsCount: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  serviceCardsGrid: {
    gap: 14,
  },
  serviceCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  assuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F5B800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assuredBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  serviceBody: {
    padding: 14,
  },
  ratingAndSubcatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceSubcatText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  ratingBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 184, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewsText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '500',
  },
  serviceNameText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  serviceDescText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 10,
  },
  startingAtLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  servicePriceText: {
    fontSize: 16,
    fontWeight: '900',
  },
  serviceOriginalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5B800',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookNowButtonText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyResetBtn: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyResetBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.65)',
    justifyContent: 'flex-end',
  },
  schedulerCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 18,
    paddingBottom: 28,
  },
  schedulerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  schedulerModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  schedulerItemName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  schedulerCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schedulerSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  modalCategoryBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  customFieldsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  providerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
  },
  providerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  providerSubtitle: {
    fontSize: 10.5,
    marginTop: 1,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipBtnActive: {
    backgroundColor: '#F5B800',
    borderColor: '#F5B800',
  },
  chipBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  chipBtnTextActive: {
    color: '#0F172A',
  },
  customTextInput: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  dateCarouselContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  dateCardPill: {
    width: 68,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDayName: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateNumText: {
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 1,
  },
  dateMonthText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  dateStatusBadge: {
    marginTop: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  dateStatusBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  timeSlotCard: {
    width: '31%',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeSlotStatusText: {
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: 2,
  },
  bookingSummaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  summarySubText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  schedulerFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    marginTop: 14,
  },
  confirmBookingBtn: {
    backgroundColor: '#F5B800',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledConfirmBtn: {
    opacity: 0.5,
  },
  confirmBookingBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },

  // 2-Column Compact Grid Styles (Matching Home Screen)
  compact2ColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 6,
  },
  compactCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1EAD8',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  compactImageWrapper: {
    width: '100%',
    height: 125,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compactDiscountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  compactWishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactBody: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 16,
    minHeight: 32,
    marginBottom: 2,
  },
  compactCategorySub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  compactReviewsText: {
    fontSize: 10,
    color: '#64748B',
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  compactCurrentPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  compactOriginalPrice: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  compactFreeDeliveryText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 'auto',
  },
  compactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactCartIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCtaButton: {
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5B800',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  compactCtaButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1.2,
    borderRadius: 8,
    height: 32,
    flex: 1,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#D97706',
  },
  stepperQtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 4,
  },
  compactAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5B800',
    flex: 1,
  },
  compactAddBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingCartCountBadge: {
    backgroundColor: '#F5B800',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  floatingCartCountText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  floatingCartPriceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  floatingCartViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5B800',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  floatingCartViewBtnText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '800',
  },
  // --- STAY MODULE STYLES ---
  myBookingsHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  myBookingsHeaderBtnText: {
    color: '#F5B800',
    fontSize: 11,
    fontWeight: '800',
  },
  myBookingsCountBadge: {
    backgroundColor: '#F5B800',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myBookingsCountBadgeText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  staySearchContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  staySearchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FCD34D',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  staySearchLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  staySearchValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  staySearchValueSmall: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stayToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  stayToolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stayToolbarBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stayFilterCountDot: {
    backgroundColor: '#EF4444',
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayFilterCountDotText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  stayAmenitiesSummaryText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  stayFreeCancelTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 6,
  },
  stayViewRoomsBtn: {
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5B800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayViewRoomsBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  sheetDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalSheetTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  destItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  destItemText: {
    fontSize: 13.5,
  },
  modalPrimaryBtn: {
    backgroundColor: '#F5B800',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  stayDateSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#F5B800',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  stayDateSummaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
  },
  stayDateSummaryValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  stayDateNightsPill: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stayDateNightsPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestRowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guestRowSub: {
    fontSize: 11,
    color: '#64748B',
  },
  guestStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestStepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestStepperBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
  },
  guestCountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  filterCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  filterCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCheckboxActive: {
    backgroundColor: '#F5B800',
    borderColor: '#F5B800',
  },
  filterCheckText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hotelDetailsSheet: {
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  hotelDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  hotelDetailsBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotelDetailsTitleHeader: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  hotelDetailsHeroImg: {
    width: '100%',
    height: 220,
  },
  hotelDetailsTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  hotelDetailsPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  hotelDetailsPriceText: {
    fontSize: 17,
    fontWeight: '900',
  },
  amenityCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  amenityCheckText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  hotelDetailsDescText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  policyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginTop: 6,
  },
  policyText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  roomCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  roomSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  roomInclusion: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  roomPriceText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },
  selectRoomBtn: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectRoomBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  bookingSummaryBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F5B800',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  bookingSummaryHotel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  bookingSummaryRoom: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D97706',
  },
  bookingSummaryDates: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  bookingSummaryGuests: {
    fontSize: 11,
    color: '#64748B',
  },
  priceBreakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRowLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  priceRowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceRowTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  priceRowTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  inputLabelText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  formInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  successCheckCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingConfirmedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  bookingIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookingCardItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  bookingCardImg: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  confirmedStatusTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confirmedStatusTagText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
});
