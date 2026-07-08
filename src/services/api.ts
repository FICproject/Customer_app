import { Platform } from 'react-native';
import { API_URL_ANDROID, API_URL_IOS } from './env';

const BACKEND_URL = Platform.select({
  android: API_URL_ANDROID,
  ios: API_URL_IOS,
  default: API_URL_IOS
});

// Haversine distance formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Generate intermediate coordinates for simulated maps
export function generateMockRoute(lat1: number, lon1: number, lat2: number, lon2: number, steps = 15): [number, number][] {
  const path: [number, number][] = [];
  const midLat = lat1 + (lat2 - lat1) * 0.45;
  const midLng = lon1 + (lon2 - lon1) * 0.65;

  const controlPoints: [number, number][] = [
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

// Mock Database in memory
const mockDB = {
  partners: [
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
      status: 'Offline',
      availability: false,
      current_latitude: 12.9398,
      current_longitude: 77.6239,
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
  ],
  orders: [
    {
      id: 'ORD1245',
      order_number: 'ORD1245',
      vendor_id: 'v1',
      customer_name: 'Amit Verma',
      customer_phone: '+91 98888 88888',
      customer_address: 'Koramangala 5th Block, Bangalore',
      customer_latitude: 12.9498,
      customer_longitude: 77.6289,
      product_details: 'boAt Rockerz 450 x 1',
      amount: 2499,
      status: 'Delivered',
      created_at: new Date(Date.now() - 3600 * 3000).toISOString()
    },
    {
      id: 'ORD1244',
      order_number: 'ORD1244',
      vendor_id: 'v1',
      customer_name: 'Neha Singh',
      customer_phone: '+91 97777 66666',
      customer_address: 'HSR Layout Sector 2, Bangalore',
      customer_latitude: 12.9248,
      customer_longitude: 77.6389,
      product_details: 'OnePlus Nord Watch x 1',
      amount: 3999,
      status: 'Preparing',
      created_at: new Date(Date.now() - 1800 * 1000).toISOString()
    }
  ],
  earnings: [
    {
      id: 'e1',
      delivery_partner_id: 'dp1',
      order_id: 'ORD1245',
      per_delivery_earning: 60,
      incentive: 10,
      bonus: 5,
      date: new Date().toISOString().split('T')[0]
    }
  ],
  assignments: [] as any[]
};

const handleFallbackRequest = async (endpoint: string, options: any = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;
  const urlPath = endpoint.split('?')[0];

  console.log(`[API Fallback]: ${method} ${endpoint}`);

  // Auth routes
  if (urlPath.startsWith('/auth/login')) {
    const { email, role } = body;
    let displayName = email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    if (role === 'vendor') {
      return {
        status: 'success',
        data: { id: 'v1', name: 'ABC Electronics', email, role: 'vendor' }
      };
    } else if (role === 'delivery') {
      let partner = mockDB.partners.find((p) => p.id === email || p.name.includes(displayName));
      if (!partner) {
        partner = {
          id: 'dp1',
          name: displayName || 'Ravi Kumar',
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
        };
        mockDB.partners.push(partner);
      }
      return {
        status: 'success',
        data: {
          id: partner.id,
          name: partner.name,
          email,
          role: 'delivery',
          status: partner.status,
          availability: partner.availability
        }
      };
    } else {
      return {
        status: 'success',
        data: { id: `cust_${displayName.toLowerCase()}`, name: displayName, email, role: 'customer' }
      };
    }
  }

  // Delivery partners CRUD
  if (urlPath.startsWith('/vendors/delivery-partners')) {
    if (method === 'GET') {
      return { status: 'success', data: mockDB.partners };
    }

    if (method === 'POST') {
      const newPartner = {
        id: 'dp_' + Math.floor(Math.random() * 10000),
        ...body,
        photo: body.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        status: 'Offline',
        availability: false,
        current_latitude: 12.9348,
        current_longitude: 77.6189,
        joining_date: new Date().toISOString().split('T')[0]
      };
      mockDB.partners.push(newPartner);
      return { status: 'success', data: newPartner };
    }
  }

  // Orders routes
  if (urlPath === '/orders' && method === 'GET') {
    return { status: 'success', data: mockDB.orders };
  }

  if (urlPath.startsWith('/orders/') && method === 'GET') {
    const orderId = urlPath.split('/orders/')[1];
    const order = mockDB.orders.find((o) => o.id === orderId);
    if (!order) return { status: 'error', message: 'Order not found' };

    const assignment = mockDB.assignments.find((a) => a.order_id === orderId && a.status !== 'Rejected');
    
    let partner = null;
    if (assignment) {
      partner = mockDB.partners.find((p) => p.id === assignment.delivery_partner_id);
    }

    const timeline = [
      { status: 'Order Placed', timestamp: order.created_at || new Date().toISOString(), notes: 'Order confirmed' }
    ];
    if (order.status !== 'Order Received') {
      timeline.push({ status: 'Preparing', timestamp: new Date().toISOString(), notes: 'Processing items' });
    }
    if (['Ready For Pickup', 'Assigned', 'Picked Up', 'Out For Delivery', 'Delivered'].includes(order.status)) {
      timeline.push({ status: 'Ready For Pickup', timestamp: new Date().toISOString(), notes: 'Waiting for partner' });
    }
    if (order.status === 'Delivered') {
      timeline.push({ status: 'Delivered', timestamp: new Date().toISOString(), notes: 'Order complete' });
    }

    return {
      status: 'success',
      data: {
        order,
        timeline,
        assignment,
        partner,
        tracking: partner ? { latitude: partner.current_latitude, longitude: partner.current_longitude } : null
      }
    };
  }

  if (urlPath === '/orders' && method === 'POST') {
    const orderId = 'ORD' + Math.floor(Math.random() * 9000);
    const newOrder = {
      id: orderId,
      order_number: orderId,
      status: 'Order Received',
      created_at: new Date().toISOString(),
      ...body
    };
    mockDB.orders.unshift(newOrder);

    // Emulate Auto assignment
    setTimeout(() => {
      const available = mockDB.partners.find((p) => p.status === 'Available' && p.availability);
      if (available) {
        available.status = 'Busy';
        available.availability = false;

        const newAsg = {
          id: 'asg_' + Math.floor(Math.random() * 9000),
          order_id: orderId,
          delivery_partner_id: available.id,
          status: 'Pending',
          assigned_at: new Date().toISOString()
        };
        mockDB.assignments.push(newAsg);
        newOrder.status = 'Assigned To Delivery Partner';
      }
    }, 2000);

    return { status: 'success', data: newOrder };
  }

  // Ready for pickup trigger
  if (urlPath.endsWith('/ready') && method === 'POST') {
    const orderId = urlPath.split('/orders/')[1].split('/ready')[0];
    const order = mockDB.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = 'Ready For Pickup';
      
      const available = mockDB.partners.find((p) => p.status === 'Available' && p.availability);
      if (available) {
        available.status = 'Busy';
        available.availability = false;

        mockDB.assignments.push({
          id: 'asg_' + Math.floor(Math.random() * 9000),
          order_id: orderId,
          delivery_partner_id: available.id,
          status: 'Pending',
          assigned_at: new Date().toISOString()
        });
        order.status = 'Assigned To Delivery Partner';
      }
      return { status: 'success', data: order };
    }
  }

  // Delivery partner dashboard
  if (urlPath.startsWith('/delivery-partners/') && urlPath.endsWith('/dashboard') && method === 'GET') {
    const partnerId = urlPath.split('/delivery-partners/')[1].split('/dashboard')[0];
    const partner = mockDB.partners.find((p) => p.id === partnerId);
    if (!partner) return { status: 'error', message: 'Partner not found' };

    const activeAssignment = mockDB.assignments.find((a) => a.delivery_partner_id === partnerId && ['Pending', 'Accepted'].includes(a.status));
    
    let activeOrder = null;
    if (activeAssignment) {
      activeOrder = mockDB.orders.find((o) => o.id === activeAssignment.order_id);
    }

    const myEarnings = mockDB.earnings.filter((e) => e.delivery_partner_id === partnerId);

    return {
      status: 'success',
      data: {
        profile: partner,
        stats: {
          todayCompleted: myEarnings.length,
          todayEarnings: myEarnings.reduce((acc, e) => acc + e.per_delivery_earning, 0),
          rating: 4.9
        },
        activeAssignment: activeAssignment || null,
        activeOrder: activeOrder || null
      }
    };
  }

  if (urlPath.startsWith('/delivery-partners/') && urlPath.endsWith('/earnings') && method === 'GET') {
    const partnerId = urlPath.split('/delivery-partners/')[1].split('/earnings')[0];
    const myEarnings = mockDB.earnings.filter((e) => e.delivery_partner_id === partnerId);
    return { status: 'success', data: myEarnings };
  }

  // Update status (online/offline)
  if (urlPath.startsWith('/delivery-partners/') && urlPath.endsWith('/status') && method === 'PUT') {
    const partnerId = urlPath.split('/delivery-partners/')[1].split('/status')[0];
    const { status, availability } = body;
    const partner = mockDB.partners.find((p) => p.id === partnerId);
    if (partner) {
      partner.status = status;
      partner.availability = availability !== undefined ? availability : (status === 'Available');
      return { status: 'success', data: partner };
    }
  }

  // Accept/Reject assignment
  if (urlPath.startsWith('/delivery-partners/assignments/') && urlPath.endsWith('/respond') && method === 'POST') {
    const asgId = urlPath.split('/delivery-partners/assignments/')[1].split('/respond')[0];
    const { action } = body;
    const asg = mockDB.assignments.find((a) => a.id === asgId);
    if (asg) {
      asg.status = action === 'accept' ? 'Accepted' : 'Rejected';

      const order = mockDB.orders.find((o) => o.id === asg.order_id);

      if (action === 'accept') {
        if (order) order.status = 'Delivery Partner Accepted';
      } else {
        if (order) order.status = 'Ready For Pickup';
        const partner = mockDB.partners.find((p) => p.id === asg.delivery_partner_id);
        if (partner) {
          partner.status = 'Available';
          partner.availability = true;
        }
      }
      return { status: 'success', message: 'Responded successfully' };
    }
  }

  // Delivery Step completions
  if (urlPath.startsWith('/delivery-partners/deliveries/') && urlPath.endsWith('/step') && method === 'POST') {
    const orderId = urlPath.split('/delivery-partners/deliveries/')[1].split('/step')[0];
    const { step, partnerId, otp } = body;

    const order = mockDB.orders.find((o) => o.id === orderId);
    if (!order) return { status: 'error', message: 'Order not found' };

    let nextStatus = order.status;
    const partner = mockDB.partners.find((p) => p.id === partnerId);

    if (step === 'pickup') {
      nextStatus = 'Picked Up';
      if (partner) partner.status = 'On Delivery';
    } else if (step === 'start') {
      nextStatus = 'Out For Delivery';
    } else if (step === 'near_customer') {
      nextStatus = 'Near Customer';
    } else if (step === 'complete') {
      if (otp !== '1234' && otp !== orderId.replace(/[^\d]/g, '').slice(-4)) {
        return { status: 'error', message: 'Invalid OTP code' };
      }
      nextStatus = 'Delivered';

      if (partner) {
        partner.status = 'Available';
        partner.availability = true;
      }

      mockDB.earnings.push({
        id: 'e_' + Math.floor(Math.random() * 10000),
        delivery_partner_id: partnerId,
        order_id: orderId,
        per_delivery_earning: 65,
        incentive: 10,
        bonus: 0,
        date: new Date().toISOString().split('T')[0]
      });
    }

    order.status = nextStatus;
    return { status: 'success', data: order };
  }

  if (urlPath === '/maps/route') {
    const { startLat, startLng, endLat, endLng } = body;
    const dist = getDistance(startLat, startLng, endLat, endLng);
    const duration = Math.ceil(dist / 0.4) + 2;
    const route = generateMockRoute(startLat, startLng, endLat, endLng);
    return {
      status: 'success',
      data: {
        distance: parseFloat(dist.toFixed(2)),
        duration,
        route
      }
    };
  }

  return { status: 'success', data: {} };
};

export const apiFetch = async (endpoint: string, options: any = {}) => {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.warn(`[API] Fallback to Mock DB due to error:`, error);
    return await handleFallbackRequest(endpoint, options);
  }
};
