import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { View, StatusBar, TouchableOpacity } from 'react-native';


// Screen Imports (to be created next)
import LandingPage from '../screens/LandingPage';
import Splash from '../screens/Splash';
import LocationSelection from '../screens/LocationSelection';
import LanguageSelection from '../screens/LanguageSelection';
import PermissionsScreen from '../screens/PermissionsScreen';
import Login from '../screens/auth/Login';
import JoinNow from '../screens/auth/JoinNow';
import HomeDashboard from '../screens/customer/HomeDashboard';
import CategoryDetails from '../screens/customer/CategoryDetails';
import LiveTracking from '../screens/customer/LiveTracking';
import DeliveryDashboard from '../screens/delivery/DeliveryDashboard';
import DeliveryMap from '../screens/delivery/DeliveryMap';
import ProductDetails from '../screens/customer/ProductDetails';
import MyAddresses from '../screens/customer/MyAddresses';
import PaymentSettings from '../screens/customer/PaymentSettings';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import BookingConfirmationScreen from '../screens/customer/BookingConfirmationScreen';
import EditProfile from '../screens/customer/EditProfile';
import WishlistScreen from '../screens/customer/WishlistScreen';
import RecentlyViewedScreen from '../screens/customer/RecentlyViewedScreen';
import JobDetailsScreen from '../screens/customer/JobDetailsScreen';
import StayDetails from '../screens/customer/StayDetails';
import Snackbar from '../components/Snackbar';


// Tab placeholders/secondary screens
import CustomerOrders from '../screens/customer/CustomerOrders';
import CustomerMembership from '../screens/customer/CustomerMembership';
import CustomerNotifications from '../screens/customer/CustomerNotifications';
import CustomerProfile from '../screens/customer/CustomerProfile';
import Categories from '../screens/customer/Categories';
import CustomerCart from '../screens/customer/CustomerCart';
import { useCartStore } from '../store/cartStore';


import DeliveryOrders from '../screens/delivery/DeliveryOrders';
import DeliveryEarnings from '../screens/delivery/DeliveryEarnings';
import DeliveryProfile from '../screens/delivery/DeliveryProfile';

// Lucide Icon Wrapper
import * as Icons from 'lucide-react-native';

// Define Stack Params
export type RootStackParamList = {
  Auth: undefined;
  CustomerApp: undefined;
  DeliveryApp: undefined;
};

export type AuthStackParamList = {
  LandingPage: undefined;
  Splash: undefined;
  LocationSelection: undefined;
  LanguageSelection: undefined;
  Permissions: undefined;
  Login: undefined;
  JoinNow: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: { screen?: string; params?: any } | undefined;
  CategoryDetails: { categoryName: string; subCategoryName?: string; selectedItem?: string };
  LiveTracking: { orderId: string };
  Notifications: undefined;
  Profile: undefined;
  Membership: undefined;
  LocationSelection: undefined;
  ProductDetails: { item: any; category: string };
  MyAddresses: undefined;
  PaymentSettings: undefined;
  Cart: undefined;
  Checkout: { item?: any } | undefined;
  BookingConfirmation: { bookingId: string; items: any[]; totalAmount: number; paymentMethod: string; type: string; date?: string; slot?: string };
  EditProfile: undefined;
  Wishlist: undefined;
  RecentlyViewed: undefined;
  JobDetails: { job: any; openApplySheet?: boolean };
  StayDetails: { stay: any; checkIn?: string; checkOut?: string; nights?: number; adults?: number; rooms?: number };
};

export type DeliveryStackParamList = {
  DeliveryTabs: undefined;
  DeliveryMap: { orderId: string };
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const CustomerStack = createStackNavigator<CustomerStackParamList>();
const DeliveryStack = createStackNavigator<DeliveryStackParamList>();

const CustomerTab = createBottomTabNavigator();
const DeliveryTab = createBottomTabNavigator();

// Fast Pressable Tab Bar Button for 0ms Touch Response
const FastTabButton = React.memo((props: any) => {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.6}
      style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
    />
  );
});

// --- ICON HELPERS ---
const TabIcon = React.memo(({ name, color, size }: { name: string; color: string; size: number }) => {
  switch (name) {
    case 'Home':
      return <Icons.Home color={color} size={size} />;
    case 'LayoutGrid':
      return <Icons.LayoutGrid color={color} size={size} />;
    case 'ShoppingBag':
      return <Icons.ShoppingBag color={color} size={size} />;
    case 'Crown':
      return <Icons.Crown color={color} size={size} />;
    case 'User':
      return <Icons.User color={color} size={size} />;
    default:
      const IconComponent = (Icons as any)[name];
      return IconComponent ? <IconComponent color={color} size={size} /> : <View style={{ width: size, height: size }} />;
  }
});

// Memoized Screen Components for Bottom Tabs to prevent unnecessary re-renders
const MemoizedHomeDashboard = React.memo(HomeDashboard);
const MemoizedCategories = React.memo(Categories);
const MemoizedCustomerOrders = React.memo(CustomerOrders);
const MemoizedCustomerMembership = React.memo(CustomerMembership);
const MemoizedCustomerProfile = React.memo(CustomerProfile);

const MemoizedDeliveryDashboard = React.memo(DeliveryDashboard);
const MemoizedDeliveryOrders = React.memo(DeliveryOrders);
const MemoizedDeliveryEarnings = React.memo(DeliveryEarnings);
const MemoizedDeliveryProfile = React.memo(DeliveryProfile);

// Static memoized tab icon renderers for Customer tab bar
const renderHomeIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="Home" color={color} size={size} />
);
const renderCategoriesIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="LayoutGrid" color={color} size={size} />
);
const renderOrdersIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="ShoppingBag" color={color} size={size} />
);
const renderMembershipIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="Crown" color={color} size={size} />
);
const renderProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="User" color={color} size={size} />
);

// Static memoized tab icon renderers for Delivery tab bar
const renderDeliveryTruckIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="Truck" color={color} size={size} />
);
const renderDeliveryListIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="List" color={color} size={size} />
);
const renderDeliveryDollarIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="DollarSign" color={color} size={size} />
);

// --- CUSTOMER BOTTOM TAB NAVIGATION ---
function CustomerTabNavigator() {
  const colors = useThemeStore((state) => state.colors);
  const themeMode = useThemeStore((state) => state.themeMode);
  const isLight = colors.background === '#FFFDF5' || colors.background === '#F8FAFC' || colors.background === '#FFFFFF' || themeMode === 'light';

  return (
    <CustomerTab.Navigator
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => <FastTabButton {...props} />,
        tabBarStyle: {
          backgroundColor: isLight ? '#FFFDF5' : colors.background,
          borderTopColor: isLight ? '#F1EAD8' : colors.cardBorder,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#F5B800',
        tabBarInactiveTintColor: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.45)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
        },
      }}
    >
      <CustomerTab.Screen
        name="Home"
        component={MemoizedHomeDashboard}
        options={{
          tabBarIcon: renderHomeIcon,
          tabBarLabel: 'Home',
        }}
      />
      <CustomerTab.Screen
        name="Categories"
        component={MemoizedCategories}
        options={{
          tabBarIcon: renderCategoriesIcon,
          tabBarLabel: 'Categories',
        }}
      />
      <CustomerTab.Screen
        name="Orders"
        component={MemoizedCustomerOrders}
        options={{
          tabBarIcon: renderOrdersIcon,
          tabBarLabel: 'Orders',
        }}
      />
      <CustomerTab.Screen
        name="Membership"
        component={MemoizedCustomerMembership}
        options={{
          tabBarIcon: renderMembershipIcon,
          tabBarLabel: 'Membership',
        }}
      />
      <CustomerTab.Screen
        name="Profile"
        component={MemoizedCustomerProfile}
        options={{
          tabBarIcon: renderProfileIcon,
          tabBarLabel: 'Profile',
        }}
      />
    </CustomerTab.Navigator>
  );
}


// --- CUSTOMER MAIN NAVIGATOR ---
function CustomerNavigator() {
  const colors = useThemeStore((state) => state.colors);
  const themeMode = useThemeStore((state) => state.themeMode);
  const isLight = colors.background === '#FFFDF5' || colors.background === '#F8FAFC' || colors.background === '#FFFFFF' || themeMode === 'light';


  return (
    <>
      <StatusBar
        barStyle={isLight ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <CustomerStack.Navigator detachInactiveScreens={true} screenOptions={{ headerShown: false }}>
        <CustomerStack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
        <CustomerStack.Screen name="CategoryDetails" component={CategoryDetails} />
        <CustomerStack.Screen name="LiveTracking" component={LiveTracking} />
        <CustomerStack.Screen name="Membership" component={CustomerMembership} />
        <CustomerStack.Screen name="LocationSelection" component={LocationSelection} />
        <CustomerStack.Screen name="ProductDetails" component={ProductDetails} />
        <CustomerStack.Screen name="MyAddresses" component={MyAddresses} />
        <CustomerStack.Screen name="PaymentSettings" component={PaymentSettings} />
        <CustomerStack.Screen name="Cart" component={CustomerCart} />
        <CustomerStack.Screen name="Checkout" component={CheckoutScreen} />
        <CustomerStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        <CustomerStack.Screen name="EditProfile" component={EditProfile} />
        <CustomerStack.Screen name="Wishlist" component={WishlistScreen} />
        <CustomerStack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
        <CustomerStack.Screen name="JobDetails" component={JobDetailsScreen} />
        <CustomerStack.Screen name="StayDetails" component={StayDetails} />
      </CustomerStack.Navigator>
      <Snackbar />
    </>
  );
}


// --- DELIVERY PARTNER BOTTOM TAB NAVIGATION ---
function DeliveryTabNavigator() {
  return (
    <DeliveryTab.Navigator
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => <FastTabButton {...props} />,
        tabBarStyle: {
          backgroundColor: '#050B1E',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#F4C400',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
        }
      }}
    >
      <DeliveryTab.Screen
        name="Dashboard"
        component={MemoizedDeliveryDashboard}
        options={{
          tabBarIcon: renderDeliveryTruckIcon,
          tabBarLabel: 'Dashboard',
        }}
      />
      <DeliveryTab.Screen
        name="Orders"
        component={MemoizedDeliveryOrders}
        options={{
          tabBarIcon: renderDeliveryListIcon,
          tabBarLabel: 'Deliveries',
        }}
      />
      <DeliveryTab.Screen
        name="Earnings"
        component={MemoizedDeliveryEarnings}
        options={{
          tabBarIcon: renderDeliveryDollarIcon,
          tabBarLabel: 'Earnings',
        }}
      />
      <DeliveryTab.Screen
        name="Profile"
        component={MemoizedDeliveryProfile}
        options={{
          tabBarIcon: renderProfileIcon,
          tabBarLabel: 'Profile',
        }}
      />
    </DeliveryTab.Navigator>
  );
}

// --- DELIVERY MAIN NAVIGATOR ---
function DeliveryNavigator() {
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveryStack.Screen name="DeliveryTabs" component={DeliveryTabNavigator} />
      <DeliveryStack.Screen name="DeliveryMap" component={DeliveryMap} />
    </DeliveryStack.Navigator>
  );
}

// --- AUTHENTICATION NAVIGATOR ---
function AuthNavigator() {
  const isOnboarded = useAuthStore((state) => state.isOnboarded);

  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isOnboarded ? 'LandingPage' : 'LanguageSelection'}
    >
      <AuthStack.Screen name="LanguageSelection" component={LanguageSelection} />
      <AuthStack.Screen name="Permissions" component={PermissionsScreen} />
      <AuthStack.Screen name="LandingPage" component={LandingPage} />
      <AuthStack.Screen name="Splash" component={Splash} />
      <AuthStack.Screen name="LocationSelection" component={LocationSelection} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="JoinNow" component={JoinNow} />
    </AuthStack.Navigator>
  );
}

// --- ROOT APP NAVIGATOR ---
export default function AppNavigator() {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser) {
    return <AuthNavigator />;
  }

  if (currentUser.role === 'delivery') {
    return <DeliveryNavigator />;
  }

  // Customers and Vendors navigate to Customer UI structure
  // (Vendors manage and order from customer interface or specialized vendor views inside)
  return <CustomerNavigator />;
}
