import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, useWindowDimensions, Alert, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../../store/orderStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';
import { SIDEBAR_DATA } from './sidebarData';
import { apiFetch } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import CartModal from '../../components/CartModal';
import { useThemeStore } from '../../store/themeStore';
import { useWishlistStore } from '../../store/wishlistStore';



// Vibrant colors for round button borders (Image 3 design style)
const BUTTON_COLORS = [
  '#FF2E93', // Pink
  '#A020F0', // Purple
  '#00E5FF', // Cyan
  '#39FF14', // Neon Green
  '#FF9100', // Orange
  '#F4C400', // Yellow
  '#E040FB', // Light Purple
  '#00E676', // Light Green
];

// Helper to resolve the correct key in SIDEBAR_DATA
const resolveCategoryKey = (name: string) => {
  if (!name) return 'Services';
  if (name === 'Products') return 'Product';
  if (name === 'Jobs') return 'Job';
  return name;
};

// Helper to get user-friendly display title
const getDisplayTitle = (name: string) => {
  if (name === 'Product') return 'Products';
  if (name === 'Job') return 'Jobs';
  return name;
};

// Helper to map search keywords to relevant Lucide icons
const getIconForCategoryItem = (itemName: string) => {
  const name = itemName.toLowerCase();
  
  // Healthcare
  if (name.includes('hospital')) return 'Building2';
  if (name.includes('clinic')) return 'PlusCircle';
  if (name.includes('diagnostic') || name.includes('lab')) return 'Activity';
  if (name.includes('pharmacy') || name.includes('medicine') || name.includes('otc')) return 'Pills';
  if (name.includes('dental') || name.includes('dentist')) return 'Smile';
  if (name.includes('eye') || name.includes('optical')) return 'Eye';
  if (name.includes('ambulance')) return 'Truck';
  if (name.includes('nurse') || name.includes('nursing')) return 'Heart';
  if (name.includes('checkup') || name.includes('health')) return 'HeartPulse';
  if (name.includes('telemedicine')) return 'PhoneCall';
  if (name.includes('physio')) return 'Accessibility';
  if (name.includes('equipment') || name.includes('device')) return 'Wrench';
  
  // Education
  if (name.includes('school')) return 'School';
  if (name.includes('college') || name.includes('universit')) return 'GraduationCap';
  if (name.includes('course') || name.includes('online')) return 'BookOpen';
  if (name.includes('training') || name.includes('institute')) return 'Award';
  if (name.includes('computer') || name.includes('it') || name.includes('ai')) return 'Cpu';
  if (name.includes('language') || name.includes('class')) return 'Languages';
  if (name.includes('exam') || name.includes('coach')) return 'FileText';
  if (name.includes('certif')) return 'FileBadge';

  // Products / Electronics / IT
  if (name.includes('phone') || name.includes('mobile')) return 'Smartphone';
  if (name.includes('tablet')) return 'Tablet';
  if (name.includes('laptop') || name.includes('pc') || name.includes('desktop')) return 'Laptop';
  if (name.includes('watch')) return 'Watch';
  if (name.includes('bud') || name.includes('headphone') || name.includes('ear')) return 'Headphones';
  if (name.includes('speaker')) return 'Volume2';
  if (name.includes('camera')) return 'Camera';
  if (name.includes('printer')) return 'Printer';
  if (name.includes('monitor') || name.includes('screen')) return 'Tv';
  if (name.includes('keyboard') || name.includes('mouse')) return 'Keyboard';
  if (name.includes('router') || name.includes('network')) return 'Wifi';
  if (name.includes('storage') || name.includes('disk')) return 'HardDrive';
  if (name.includes('refri') || name.includes('wash') || name.includes('ac') || name.includes('cooler') || name.includes('fan') || name.includes('appliance')) return 'Cpu';
  
  // Furniture
  if (name.includes('sofa') || name.includes('couch')) return 'Armchair';
  if (name.includes('table') || name.includes('desk')) return 'Table';
  if (name.includes('bed') || name.includes('mattress')) return 'Bed';
  if (name.includes('chair')) return 'UserCheck';
  if (name.includes('wardrobe') || name.includes('cabinet') || name.includes('shelf')) return 'LayoutGrid';
  
  // Daily Needs / Groceries
  if (name.includes('rice') || name.includes('wheat') || name.includes('flour') || name.includes('staple')) return 'ShoppingBasket';
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('grape') || name.includes('mango') || name.includes('pomegranate')) return 'Apple';
  if (name.includes('vegetable') || name.includes('onion') || name.includes('tomato') || name.includes('potato') || name.includes('carrot') || name.includes('cabbage') || name.includes('green')) return 'Leaf';
  if (name.includes('milk') || name.includes('dairy') || name.includes('curd') || name.includes('butter') || name.includes('ghee') || name.includes('cheese') || name.includes('paneer') || name.includes('yogurt') || name.includes('ice cream')) return 'Milk';
  if (name.includes('water') || name.includes('beverage') || name.includes('tea') || name.includes('coffee') || name.includes('juice') || name.includes('drink')) return 'Droplet';
  if (name.includes('clean') || name.includes('soap') || name.includes('wash') || name.includes('shampoo') || name.includes('paste') || name.includes('brush')) return 'Sparkles';
  if (name.includes('baby') || name.includes('diaper') || name.includes('wipe')) return 'Baby';
  if (name.includes('dog') || name.includes('cat') || name.includes('pet')) return 'Dog';
  if (name.includes('bread') || name.includes('cake') || name.includes('cookie') || name.includes('bake') || name.includes('bun')) return 'Cookie';
  
  // Food
  if (name.includes('burger')) return 'Pizza';
  if (name.includes('pizza')) return 'Pizza';
  if (name.includes('sandwich') || name.includes('wrap') || name.includes('fry')) return 'Utensils';
  if (name.includes('coffee') || name.includes('tea') || name.includes('cafe')) return 'Coffee';
  if (name.includes('dosa') || name.includes('idli') || name.includes('south')) return 'Flame';
  if (name.includes('roti') || name.includes('naan') || name.includes('paneer') || name.includes('north')) return 'Soup';
  if (name.includes('biryani') || name.includes('rice')) return 'UtensilsCrossed';
  if (name.includes('salad') || name.includes('diet') || name.includes('healthy') || name.includes('vegan') || name.includes('veg')) return 'Leaf';
  if (name.includes('cake') || name.includes('pastry') || name.includes('dessert')) return 'Cookie';
  if (name.includes('chicken') || name.includes('mutton') || name.includes('fish') || name.includes('meat')) return 'Flame';
  if (name.includes('home') || name.includes('tiffin')) return 'Home';
  if (name.includes('cater')) return 'PartyPopper';
  
  // Stay
  if (name.includes('hotel') || name.includes('stay') || name.includes('le meridian')) return 'Building2';
  if (name.includes('resort')) return 'Trees';
  if (name.includes('villa') || name.includes('home') || name.includes('apartment') || name.includes('house')) return 'Home';
  if (name.includes('hostel') || name.includes('pg') || name.includes('student')) return 'GraduationCap';
  if (name.includes('camp') || name.includes('adventure')) return 'Compass';
  
  // Travel
  if (name.includes('flight') || name.includes('air')) return 'Plane';
  if (name.includes('train') || name.includes('subway')) return 'Subway';
  if (name.includes('bus')) return 'Bus';
  if (name.includes('cab') || name.includes('taxi') || name.includes('car')) return 'Car';
  if (name.includes('bike') || name.includes('scooter')) return 'Bike';
  if (name.includes('visa')) return 'Contact';
  if (name.includes('passport')) return 'BookOpen';
  if (name.includes('cruise') || name.includes('ship')) return 'Ship';
  
  // Jobs
  if (name.includes('manager') || name.includes('lead') || name.includes('officer')) return 'Briefcase';
  if (name.includes('developer') || name.includes('engineer') || name.includes('coder') || name.includes('programmer')) return 'Laptop';
  if (name.includes('designer') || name.includes('creative') || name.includes('ui') || name.includes('ux')) return 'Sparkles';
  if (name.includes('sales') || name.includes('marketing') || name.includes('biz')) return 'ShoppingBag';
  if (name.includes('admin') || name.includes('office') || name.includes('assistant') || name.includes('support')) return 'PhoneCall';
  if (name.includes('doctor') || name.includes('nurse') || name.includes('health') || name.includes('medical')) return 'HeartPulse';
  if (name.includes('teacher') || name.includes('trainer') || name.includes('prof')) return 'GraduationCap';
  
  return 'Wrench'; // Default icon
};

// Dynamic Generator to create premium listing cards based on item name and category
const getDynamicMockItems = (category: string, selectedItem: string) => {
  const normalizedCategory = resolveCategoryKey(category);
  const items = [];
  
  // Let's generate 3 items for the selected item
  for (let i = 1; i <= 3; i++) {
    const id = `${normalizedCategory.toLowerCase()}_${selectedItem.toLowerCase().replace(/\s+/g, '_')}_${i}`;
    let name = '';
    let rating = (4.5 + Math.random() * 0.4).toFixed(1);
    let price = '';
    let memberPrice = '';
    let desc = '';
    let icon = getIconForCategoryItem(selectedItem);
    let img = '';
    let vendor = '';
    let location = '';
    let duration = '';
    let date = '';
    let company = '';
    let salary = '';
    let exp = '';
    let type = '';

    // Services specific name overrides
    if (normalizedCategory === 'Services') {
      if (selectedItem === 'Hospitals') {
        const hospitalNames = ['City Apollo Hospital', 'Max Health Super Specialty', 'Fortis Medical Center'];
        name = hospitalNames[i - 1];
        price = '₹600 Consultation';
        desc = 'State of the art ICU, 24/7 emergency care and specialized doctors.';
      } else if (selectedItem === 'Clinics') {
        const clinicNames = ['Care & Cure Family Clinic', 'Prime Wellness Clinic', 'Arogya Health Center'];
        name = clinicNames[i - 1];
        price = '₹350 Consultation';
        desc = 'General physician, pediatrics, immunizations and quick health checkups.';
      } else if (selectedItem === 'Diagnostic Centers') {
        const diagnosticNames = ['Metropolis Lab Services', 'Dr. Lal PathLabs', 'Thyrocare Diagnostics'];
        name = diagnosticNames[i - 1];
        price = '₹1,500 Full Checkup';
        desc = 'Blood tests, MRI, CT Scan, X-Ray with quick, digital reports.';
      } else if (selectedItem === 'Pharmacies') {
        const pharmacyNames = ['Apollo Pharmacy Store', 'MedPlus Drugstore', 'Wellness Forever 24/7'];
        name = pharmacyNames[i - 1];
        price = '₹120 Average Cost';
        desc = 'Prescription drugs, health supplements, and baby care accessories.';
      } else {
        name = `Elite ${selectedItem} Services`;
        price = `₹${200 + i * 150}/hr`;
        desc = `Professional and certified solutions for your ${selectedItem.toLowerCase()} needs.`;
      }
    } else if (normalizedCategory === 'Product') {
      if (selectedItem === 'Smartphones') {
        const phoneNames = ['iPhone 15 Pro Max (256GB)', 'Samsung Galaxy S24 Ultra', 'OnePlus 12 5G'];
        const phonePrices = [139999, 124999, 64999];
        name = phoneNames[i - 1];
        price = `₹${phonePrices[i - 1] + 10000}`;
        memberPrice = `₹${phonePrices[i - 1]}`;
        img = [
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80'
        ][i - 1];
        vendor = 'ABC Electronics';
        desc = `Latest flagship ${name} with cutting-edge processor, exceptional cameras, and premium build.`;
      } else {
        name = `Premium ${selectedItem} - Model ${i}`;
        const basePrice = 2000 + i * 1500;
        price = `₹${basePrice + 500}`;
        memberPrice = `₹${basePrice}`;
        img = 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200&auto=format&fit=crop&q=80';
        vendor = 'Quality Goods Ltd';
        desc = `High quality, durable premium ${selectedItem} with advanced styling and full manufacturer warranty.`;
      }
    } else if (normalizedCategory === 'Daily Needs') {
      if (selectedItem === 'Rice') {
        const riceNames = ['Premium Basmati Rice (5kg)', 'Organic Brown Rice (2kg)', 'Kolam Raw Rice (10kg)'];
        const ricePrices = [750, 380, 1100];
        name = riceNames[i - 1];
        price = `₹${ricePrices[i - 1] + 80}`;
        memberPrice = `₹${ricePrices[i - 1]}`;
        desc = 'Aged premium grains, perfect aroma and taste.';
        img = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80';
      } else {
        name = `Fresh ${selectedItem} Pack ${i}`;
        const basePrice = 120 + i * 45;
        price = `₹${basePrice + 20}`;
        memberPrice = `₹${basePrice}`;
        desc = `High quality, freshly sourced ${selectedItem.toLowerCase()} for daily essentials.`;
        img = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&auto=format&fit=crop&q=80';
      }
    } else if (normalizedCategory === 'Food') {
      if (selectedItem === 'Burgers') {
        const burgerNames = ['Truffle Mushroom Double Burger', 'Crispy Chicken Zinger Burger', 'Spicy Paneer Crunch Burger'];
        const burgerPrices = [480, 320, 280];
        name = burgerNames[i - 1];
        price = `₹${burgerPrices[i - 1]}`;
        img = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80';
        vendor = 'Burgers & Co';
        desc = `Juicy and delicious ${name} prepared fresh with local ingredients, served warm.`;
      } else {
        name = `Deluxe ${selectedItem} Special`;
        price = `₹${180 + i * 60}`;
        img = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80';
        vendor = 'Empire Restaurant';
        desc = `Hot and spicy gourmet special chef's preparation of ${selectedItem.toLowerCase()} with signature spices.`;
      }
    } else if (normalizedCategory === 'Stay') {
      const stayNames = [`Grand Resort & Suites ${i}`, `Royal Palace ${selectedItem} ${i}`, `Vista Premium Hotel ${i}`];
      name = stayNames[i - 1];
      location = `${['Koramangala', 'Indiranagar', 'Whitefield'][i - 1]}, Bangalore`;
      price = `₹${4000 + i * 2500}/night`;
      img = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80';
      desc = `Luxurious accommodations at ${name} in ${location} with complementary breakfast, pool access, and premium Wi-Fi.`;
    } else if (normalizedCategory === 'Travel') {
      name = `Premium ${selectedItem} Route ${i}`;
      duration = `${i + 1}h ${i * 15}m`;
      price = `₹${2500 + i * 1200}`;
      date = `June ${20 + i}`;
      vendor = 'IndiGo Premium';
      desc = `Confirm booking on ${vendor} for ${selectedItem.toLowerCase()} route. Duration: ${duration}. Flexible reschedule options.`;
    } else if (normalizedCategory === 'Job') {
      const jobTitles = [`Senior ${selectedItem} Specialist`, `${selectedItem} Lead Manager`, `Associate ${selectedItem} Executive`];
      name = jobTitles[i - 1];
      company = ['Connect Core Team', 'Forge India Logistics', 'TechSolutions Inc.'][i - 1];
      salary = `₹${10 + i * 4}L - ₹${15 + i * 5}L L.P.A`;
      exp = `${i + 1}+ Years`;
      type = i === 1 ? 'Full-time' : i === 2 ? 'Remote' : 'Contract';
      desc = `Full-time placement opportunity at ${company} for an experienced ${name}. Required experience: ${exp}. Salary package: ${salary}.`;
    }

    items.push({
      id,
      name,
      rating,
      price,
      memberPrice,
      desc,
      icon,
      img,
      vendor,
      location,
      duration,
      date,
      company,
      salary,
      exp,
      type,
      restaurant: vendor,
      title: name,
      airline: vendor,
    });
  }

  return items;
};

interface CategoryItemCardProps {
  item: any;
  catKey: string;
  colors: any;
  addToCart: any;
  handlePlaceOrder: any;
  setSchedulingItem: any;
  loadingOrderId: string | null;
  wishlistItems: any[];
  toggleWishlist: any;
}

function CategoryItemCard({ 
  item, 
  catKey, 
  colors, 
  addToCart, 
  handlePlaceOrder, 
  setSchedulingItem, 
  loadingOrderId,
  wishlistItems,
  toggleWishlist
}: CategoryItemCardProps) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const cartItems = useCartStore((state) => state.cartItems);

  const title = item.name || item.title || '';
  const fallbackImg = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&auto=format&fit=crop&q=80';
  const imageUri = item.img || item.image || (catKey === 'Job' ? fallbackImg : null);
  const originalPrice = item.price || item.salary || '';
  const memberPrice = item.memberPrice || item.price || item.salary || '';
  const hasDiscount = item.memberPrice && item.memberPrice !== item.price;
  
  let discountText = '';
  if (hasDiscount) {
    const orig = parseInt(item.price.replace(/[^\d]/g, ''), 10);
    const memb = parseInt(item.memberPrice.replace(/[^\d]/g, ''), 10);
    if (orig && memb) {
      const pct = Math.round(((orig - memb) / orig) * 100);
      discountText = `${pct}% OFF`;
    }
  }

  const rating = item.rating || '4.5';
  const ratingCount = item.ratingCount || '98';
  
  let subtitle = item.desc || '';
  if (catKey === 'Product') {
    subtitle = `By ${item.vendor || 'Connect Vendor'}`;
  } else if (catKey === 'Food') {
    subtitle = item.restaurant || 'Gourmet Kitchen';
  } else if (catKey === 'Stay') {
    subtitle = item.location || 'Luxury Stay';
  } else if (catKey === 'Job') {
    subtitle = item.company || 'Connect Core Team';
  } else if (catKey === 'Travel') {
    subtitle = item.airline || item.duration || 'Airline';
  }

  const isFavorite = wishlistItems.some((i: any) => i.id === item.id);


  const handleBuyOrBook = () => {
    if (catKey === 'Services' || catKey === 'Stay' || catKey === 'Travel') {
      setSchedulingItem({ id: item.id, name: title, price: memberPrice, category: catKey });
    } else {
      handlePlaceOrder(title, memberPrice, catKey);
    }
  };

  const buttonText = () => {
    if (loadingOrderId === item.name) {
      return 'Processing...';
    }
    if (catKey === 'Services' || catKey === 'Stay' || catKey === 'Travel') {
      return 'Book Now';
    }
    return 'Buy Now';
  };

  const renderIcon = (iconName: string, color = '#F4C400') => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.Wrench color={color} size={20} />;
    return <IconComp color={color} size={20} />;
  };

  return (
    <GlassCard style={[styles.feedCard, { width: (width - 52) / 2 }]}>
      {/* Image / Icon Header */}
      <View style={styles.feedImgWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProductDetails', { item, category: catKey })}
          style={{ width: '100%', height: '100%' }}
        >
          {catKey === 'Services' && !item.img ? (
            <View style={styles.centeredIcon}>
              {renderIcon(item.icon, colors.primary)}
            </View>
          ) : (
            <Image source={{ uri: imageUri || '' }} style={styles.feedImg} />
          )}
        </TouchableOpacity>
        
        {discountText ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountText}</Text>
          </View>
        ) : null}

        {catKey !== 'Job' && (
          <TouchableOpacity 
            style={styles.heartBtn} 
            activeOpacity={0.7}
            onPress={() => toggleWishlist({
              id: item.id,
              name: title,
              price: memberPrice,
              category: catKey,
              image: imageUri || undefined,
            })}
          >
            <Icons.Heart 
              color={isFavorite ? "#FF2E93" : colors.text} 
              size={12} 
              fill={isFavorite ? "#FF2E93" : "transparent"} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Details */}
      <TouchableOpacity 
        style={styles.feedDetails} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetails', { item, category: catKey })}
      >
        <Text style={[styles.feedName, { color: colors.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.feedSpec, { color: colors.text, opacity: 0.6 }]} numberOfLines={1}>{subtitle}</Text>

        {/* Rating or Job Badges */}
        {catKey === 'Job' ? (
          <View style={styles.feedRatingRow}>
            <View style={[styles.jobBadge, { backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)' }]}>
              <Text style={[styles.jobBadgeText, { color: colors.text, opacity: 0.6 }]}>{item.type}</Text>
            </View>
            <View style={[styles.jobBadge, { backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)' }]}>
              <Text style={[styles.jobBadgeText, { color: colors.text, opacity: 0.6 }]}>{item.exp}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.feedRatingRow}>
            <View style={styles.ratingBox}>
              <Icons.Star color="#F4C400" size={8} fill="#F4C400" />
              <Text style={[styles.ratingText, { color: colors.text }]}> {rating} ({ratingCount})</Text>
            </View>
            {item.assured !== false && (
              <View style={styles.assuredBadge}>
                <Icons.CheckCircle2 color="#10B981" size={8} />
                <Text style={styles.assuredText}>Assured</Text>
              </View>
            )}
          </View>
        )}

        {/* Price Row */}
        <View style={styles.feedPriceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedPrice} numberOfLines={1}>{memberPrice}</Text>
            {hasDiscount ? (
              <Text style={[styles.feedStrikePrice, { color: colors.text, opacity: 0.4 }]}>{originalPrice}</Text>
            ) : null}
          </View>
          {catKey !== 'Job' && (
            <Text style={[styles.freeDelText, { color: colors.text, opacity: 0.6 }]}>Free Delivery</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.feedActionsRow}>
        {catKey === 'Job' ? (
          <TouchableOpacity 
            style={[styles.feedBuyBtn, { backgroundColor: colors.primary, width: '100%' }]}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Application Submitted', 'Successfully applied to ' + title)}
          >
            <Text style={[styles.feedBuyBtnText, { color: colors.background === '#F8FAFC' ? '#FFFFFF' : '#050B1E' }]}>
              Apply Now
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.feedSmallCartBtn}
              onPress={() => {
                const isAlreadyInCart = cartItems.some(i => i.id === item.id);
                if (isAlreadyInCart) {
                  Alert.alert('Already in Cart', `"${title}" is already in your cart.`);
                } else {
                  addToCart({
                    id: item.id,
                    name: title,
                    price: memberPrice,
                    category: catKey,
                    image: imageUri || undefined,
                  });
                  Alert.alert('Success', `"${title}" added to cart!`);
                }
              }}
            >
              <Icons.ShoppingCart color={colors.primary} size={14} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedBuyBtn, { backgroundColor: colors.primary }]}
              onPress={handleBuyOrBook}
            >
              <Text style={[styles.feedBuyBtnText, { color: colors.background === '#F8FAFC' ? '#FFFFFF' : '#050B1E' }]}>
                {buttonText()}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </GlassCard>
  );
}

export default function CategoryDetails() {
  const { height, width } = useWindowDimensions();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const routeParams = (route.params as any) || {};
  const categoryName = routeParams.categoryName || 'Services';
  const colors = useThemeStore((state) => state.colors);

  const loadAllOrders = useOrderStore((state) => state.loadAllOrders);

  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [schedulingItem, setSchedulingItem] = useState<{ id: string; name: string; price: string; category: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart Store State
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Wishlist Store State
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const TIME_SLOTS = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM',
    '07:30 PM',
  ];

  const getCalendarDays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let startDayOfWeek = firstDayOfMonth.getDay();

    const daysArray: { day: number; dateString: string; isPast: boolean }[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push({ day: 0, dateString: '', isPast: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isPast = date < compareToday;

      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      daysArray.push({ day, dateString, isPast });
    }

    return daysArray;
  };

  const getMonthName = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const today = new Date();
    return `${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  // Sync route params with component state
  const catKey = resolveCategoryKey(categoryName);
  const catData = SIDEBAR_DATA[catKey] || { subcategories: {} };
  const subcategories = Object.keys(catData.subcategories);

  const [activeSubcat, setActiveSubcat] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');

  useEffect(() => {
    setSearchQuery('');
    if (subcategories.length > 0) {
      const initialSubcat = routeParams.subCategoryName || subcategories[0];
      setActiveSubcat(initialSubcat);

      const items = catData.subcategories[initialSubcat]?.items || [];
      const initialItem = routeParams.selectedItem || items[0] || '';
      setSelectedItem(initialItem);
    } else {
      setActiveSubcat('');
      const items = catData.items || [];
      setSelectedItem(routeParams.selectedItem || items[0] || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName, routeParams.subCategoryName, routeParams.selectedItem]);

  // Trigger simulated order creation
  const handlePlaceOrder = async (itemName: string, itemPriceStr: string, date?: string, timeSlot?: string) => {
    const numPrice = parseInt(itemPriceStr.replace(/[^\d]/g, ''), 10) || 500;
    setLoadingOrderId(itemName);

    const detailsString = date && timeSlot ? `${itemName} (Scheduled: ${date} at ${timeSlot})` : itemName;
    const isBooking = ['Services', 'Service', 'Stay', 'Travel', 'Food', 'Jobs'].includes(catKey);

    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: 'v1',
          customer_name: 'Amit Verma',
          customer_phone: '+91 98888 88888',
          customer_address: 'Koramangala 5th Block, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: detailsString,
          amount: numPrice,
          order_type: isBooking ? 'booking' : 'order'
        })
      });

      if (res.status !== 'success') {
        throw new Error(res.message || 'Failed to place order');
      }

      // Load orders in background
      await loadAllOrders();
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    } catch {
      // Fallback order placement in-memory
      await loadAllOrders();
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    } finally {
      setLoadingOrderId(null);
    }
  };

  const renderIcon = (iconName: string, color = '#F4C400') => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.Wrench color={color} size={16} />;
    return <IconComp color={color} size={16} />;
  };

  const displayTitle = getDisplayTitle(catKey);
  const subcatItems = catData.subcategories?.[activeSubcat]?.items || [];
  const dynamicItems = getDynamicMockItems(categoryName, selectedItem);

  const filteredItems = dynamicItems.filter(item => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    
    const nameMatch = item.name && item.name.toLowerCase().includes(term);
    const titleMatch = item.title && item.title.toLowerCase().includes(term);
    const descMatch = item.desc && item.desc.toLowerCase().includes(term);
    const companyMatch = item.company && item.company.toLowerCase().includes(term);
    const restaurantMatch = item.restaurant && item.restaurant.toLowerCase().includes(term);
    const locationMatch = item.location && item.location.toLowerCase().includes(term);
    
    return nameMatch || titleMatch || descMatch || companyMatch || restaurantMatch || locationMatch;
  });

  // Scheduling Modal Elements
  const renderSchedulerModal = () => {
    if (!schedulingItem) return null;

    const days = getCalendarDays();
    const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
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
          <GlassCard style={styles.schedulerCard}>
            {/* Header */}
            <View style={styles.schedulerHeader}>
              <View style={styles.schedulerHeaderTitleContainer}>
                <Text style={styles.schedulerModalTitle}>Schedule Appointment</Text>
                <Text style={styles.schedulerItemName} numberOfLines={1}>
                  {schedulingItem.name}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.schedulerCloseBtn}
                onPress={() => setSchedulingItem(null)}
              >
                <Icons.X color="#FFF" size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.5 }}>
              {/* Step 1: Calendar Option */}
              <Text style={styles.schedulerSectionHeader}>1. SELECT DATE ({getMonthName()})</Text>
              
              {/* Weekday labels */}
              <View style={styles.weekdayRow}>
                {weekdayLabels.map((lbl, idx) => (
                  <Text key={idx} style={styles.weekdayLabel}>{lbl}</Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.calendarGrid}>
                {days.map((item, idx) => {
                  const isSelected = selectedDate === item.dateString;
                  const isDisabled = item.day === 0 || item.isPast;

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={isDisabled}
                      style={[
                        styles.calendarDay,
                        item.day === 0 && { opacity: 0 },
                        item.isPast && styles.disabledDay,
                        isSelected && styles.selectedDay
                      ]}
                      onPress={() => {
                        setSelectedDate(item.dateString);
                        setSelectedTimeSlot(null);
                      }}
                    >
                      {item.day > 0 && (
                        <Text style={[
                          styles.dayText,
                          item.isPast && styles.disabledDayText,
                          isSelected && styles.selectedDayText
                        ]}>
                          {item.day}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Step 2: Timing Options */}
              {selectedDate !== null && (
                <View style={styles.timingSection}>
                  <Text style={styles.schedulerSectionHeader}>2. SELECT TIMING (Slots Available)</Text>
                  <View style={styles.timingGrid}>
                    {TIME_SLOTS.map((slot) => {
                      const isSlotSelected = selectedTimeSlot === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.timingSlot,
                            isSlotSelected && styles.selectedTimingSlot
                          ]}
                          onPress={() => setSelectedTimeSlot(slot)}
                        >
                          <Text style={[
                            styles.timingSlotText,
                            isSlotSelected && styles.selectedTimingSlotText
                          ]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Confirm Actions */}
            <View style={styles.schedulerFooter}>
              <TouchableOpacity
                disabled={!selectedDate || !selectedTimeSlot}
                style={[
                  styles.confirmBookingBtn,
                  (!selectedDate || !selectedTimeSlot) && styles.disabledConfirmBtn
                ]}
                onPress={() => {
                  if (selectedDate && selectedTimeSlot && schedulingItem) {
                    const itemToBook = schedulingItem;
                    setSchedulingItem(null);
                    setSelectedDate(null);
                    setSelectedTimeSlot(null);
                    handlePlaceOrder(itemToBook.name, itemToBook.price, selectedDate, selectedTimeSlot);
                  }
                }}
              >
                <Text style={styles.confirmBookingBtnText}>
                  {!selectedDate 
                    ? 'Select Date to Continue' 
                    : !selectedTimeSlot 
                      ? 'Select Timing Slot' 
                      : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: height * 0.05, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{displayTitle}</Text>
        <TouchableOpacity style={styles.headerCartBtn} activeOpacity={0.7} onPress={() => setIsCartVisible(true)}>
          <Icons.ShoppingCart color={colors.text} size={18} />
          {totalCartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Icons.Search color={colors.text} size={16} style={{ opacity: 0.4 }} />
          <TextInput
            placeholder={`Search ${selectedItem || displayTitle}...`}
            placeholderTextColor={colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.2)'}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        {/* Subcategories Horizontal Scroll */}
        {subcategories.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.subcatPillScroll}
            contentContainerStyle={styles.subcatPillScrollContainer}
          >
            {subcategories.map((subcat) => (
              <TouchableOpacity
                key={subcat}
                style={[
                  styles.subcatPill,
                  {
                    backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                  },
                  activeSubcat === subcat && [styles.activeSubcatPill, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
                onPress={() => {
                  setActiveSubcat(subcat);
                  const firstItem = catData.subcategories[subcat]?.items?.[0] || '';
                  setSelectedItem(firstItem);
                  setSearchQuery('');
                }}
              >
                <Text style={[
                  styles.subcatPillText,
                  { color: colors.text },
                  activeSubcat === subcat && [styles.activeSubcatPillText, { color: colors.background === '#F8FAFC' ? '#FFFFFF' : '#050B1E' }]
                ]}>
                  {subcat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Leaf Items Round Buttons (Image 3 Style) */}
        {subcatItems.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.roundBtnScroll}
            contentContainerStyle={styles.roundBtnScrollContainer}
          >
            {subcatItems.map((item: string, index: number) => {
              const isSelected = selectedItem === item;
              const color = BUTTON_COLORS[index % BUTTON_COLORS.length];
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.roundBtnWrapper}
                  onPress={() => {
                    setSelectedItem(item);
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.roundBtnCircle,
                    { borderColor: color, backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.02)' },
                    isSelected && { backgroundColor: color + '22', borderWidth: 2.5 }
                  ]}>
                    {renderIcon(getIconForCategoryItem(item), color)}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.roundBtnText,
                      { color: colors.text },
                      isSelected && styles.roundBtnTextActive
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Dynamic Render Modules */}
        {dynamicItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text, opacity: 0.5 }]}>No items configured for this module.</Text>
        ) : filteredItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text, opacity: 0.5 }]}>No items match your search query.</Text>
        ) : (
          <View>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>EXCLUSIVE GOLD PASS DEALS FOR {selectedItem.toUpperCase()}</Text>

            <View style={styles.feedGrid}>
              {filteredItems.map((item: any) => (
                <CategoryItemCard
                  key={item.id}
                  item={item}
                  catKey={catKey}
                  colors={colors}
                  addToCart={addToCart}
                  handlePlaceOrder={handlePlaceOrder}
                  setSchedulingItem={setSchedulingItem}
                  loadingOrderId={loadingOrderId}
                  wishlistItems={wishlistItems}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {renderSchedulerModal()}

      {/* Cart Modal Dialog Sheet */}
      <CartModal 
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030714',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFF',
    marginLeft: 8,
  },
  subcatPillScroll: {
    marginBottom: 16,
  },
  subcatPillScrollContainer: {
    paddingRight: 16,
  },
  subcatPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeSubcatPill: {
    backgroundColor: '#F4C400',
    borderColor: '#F4C400',
  },
  subcatPillText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSubcatPillText: {
    color: '#050B1E',
    fontWeight: 'bold',
  },
  roundBtnScroll: {
    marginBottom: 20,
  },
  roundBtnScrollContainer: {
    paddingRight: 16,
  },
  roundBtnWrapper: {
    alignItems: 'center',
    width: 76,
    marginRight: 20, // Clear 20px spacing between one another
  },
  roundBtnCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  roundBtnText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    width: 76,
  },
  roundBtnTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 40,
  },
  sectionHeader: {
    fontSize: 9.5,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginTop: 8,
  },
  cardItem: {
    marginBottom: 16,
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 0, 0.2)',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  itemDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  actionBtn: {
    backgroundColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  cardImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#0D1636',
  },
  vendorText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  strikePrice: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  memberPriceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  stayCardImg: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#0D1636',
  },
  stayDetails: {
    marginTop: 12,
  },
  stayLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stayLocText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  stayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallActionBtn: {
    backgroundColor: '#F4C400',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  travelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  travelRoute: {
    flex: 1,
  },
  travelPrice: {
    alignItems: 'flex-end',
  },
  travelDate: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
    fontWeight: 'bold',
  },
  jobsHeader: {
    marginBottom: 8,
  },
  jobsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  jobBadgeText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold',
  },
  jobSalary: {
    fontSize: 12,
    color: '#F4C400',
    fontWeight: '900',
    marginLeft: 'auto',
  },
  expandedDescContainer: {
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 10,
  },
  expandedDescText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  actionBtnFilled: {
    backgroundColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnFilledText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  actionBtnOutlined: {
    borderWidth: 1.5,
    borderColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutlinedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  stayActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallActionBtnFilled: {
    backgroundColor: '#F4C400',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallActionBtnTextFilled: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  smallActionBtnOutlined: {
    borderWidth: 1.2,
    borderColor: '#F4C400',
    paddingHorizontal: 12,
    paddingVertical: 6.8,
    borderRadius: 8,
  },
  smallActionBtnTextOutlined: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  schedulerCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(13, 22, 54, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  schedulerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 14,
    marginBottom: 16,
  },
  schedulerHeaderTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  schedulerModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  schedulerItemName: {
    fontSize: 12,
    color: '#F4C400',
    marginTop: 2,
    fontWeight: '600',
  },
  schedulerCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schedulerSectionHeader: {
    fontSize: 10.5,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 16,
  },
  calendarDay: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  disabledDay: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    opacity: 0.25,
  },
  selectedDay: {
    backgroundColor: '#F4C400',
    borderColor: '#F4C400',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  disabledDayText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  selectedDayText: {
    color: '#050B1E',
  },
  timingSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
  },
  timingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  timingSlot: {
    width: (380 - 40 - 16) / 3 - 5,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  selectedTimingSlot: {
    backgroundColor: '#F4C400',
    borderColor: '#F4C400',
  },
  timingSlotText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedTimingSlotText: {
    color: '#050B1E',
  },
  schedulerFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
    marginTop: 14,
  },
  confirmBookingBtn: {
    backgroundColor: '#F4C400',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledConfirmBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  confirmBookingBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  headerCartBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF2E93',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  feedCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedImgWrapper: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#0D1636',
  },
  feedImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(5, 11, 30, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  feedDetails: {
    padding: 10,
  },
  feedName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    minHeight: 32,
  },
  feedSpec: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 9,
    marginTop: 2,
  },
  feedRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  assuredText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  feedPrice: {
    color: '#F4C400',
    fontSize: 13,
    fontWeight: '900',
  },
  feedStrikePrice: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 9,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  freeDelText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedDescBox: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  feedDescText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    lineHeight: 14,
  },
  feedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedSmallCartBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedBuyBtn: {
    flex: 1,
    backgroundColor: '#F4C400',
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedBuyBtnText: {
    color: '#050B1E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  centeredIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});
