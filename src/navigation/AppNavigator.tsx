import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { View } from 'react-native';

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

// Tab placeholders/secondary screens
import CustomerOrders from '../screens/customer/CustomerOrders';
import CustomerMembership from '../screens/customer/CustomerMembership';
import CustomerNotifications from '../screens/customer/CustomerNotifications';
import CustomerProfile from '../screens/customer/CustomerProfile';
import Categories from '../screens/customer/Categories';

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

// --- ICON HELPERS ---
const TabIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <View style={{ width: size, height: size }} />;
  return <IconComponent color={color} size={size} />;
};

// --- CUSTOMER BOTTOM TAB NAVIGATION ---
function CustomerTabNavigator() {
  const colors = useThemeStore((state) => state.colors);

  return (
    <CustomerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grayLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
        }
      }}
    >
      <CustomerTab.Screen
        name="Home"
        component={HomeDashboard}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="Home" color={color} size={size} />,
          tabBarLabel: 'Home',
        }}
      />
      <CustomerTab.Screen
        name="Categories"
        component={Categories}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="LayoutGrid" color={color} size={size} />,
          tabBarLabel: 'Categories',
        }}
      />
      <CustomerTab.Screen
        name="Orders"
        component={CustomerOrders}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="Package" color={color} size={size} />,
          tabBarLabel: 'Orders',
        }}
      />
      <CustomerTab.Screen
        name="Notifications"
        component={CustomerNotifications}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="Bell" color={color} size={size} />,
          tabBarLabel: 'Alerts',
        }}
      />
      <CustomerTab.Screen
        name="Profile"
        component={CustomerProfile}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="User" color={color} size={size} />,
          tabBarLabel: 'Profile',
        }}
      />
    </CustomerTab.Navigator>
  );
}

// --- CUSTOMER MAIN NAVIGATOR ---
function CustomerNavigator() {
  return (
    <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <CustomerStack.Screen name="CategoryDetails" component={CategoryDetails} />
      <CustomerStack.Screen name="LiveTracking" component={LiveTracking} />
      <CustomerStack.Screen name="Membership" component={CustomerMembership} />
      <CustomerStack.Screen name="LocationSelection" component={LocationSelection} />
      <CustomerStack.Screen name="ProductDetails" component={ProductDetails} />
      <CustomerStack.Screen name="MyAddresses" component={MyAddresses} />
      <CustomerStack.Screen name="PaymentSettings" component={PaymentSettings} />
    </CustomerStack.Navigator>
  );
}

// --- DELIVERY PARTNER BOTTOM TAB NAVIGATION ---
function DeliveryTabNavigator() {
  return (
    <DeliveryTab.Navigator
      screenOptions={{
        headerShown: false,
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
        component={DeliveryDashboard}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="Truck" color={color} size={size} />,
          tabBarLabel: 'Dashboard',
        }}
      />
      <DeliveryTab.Screen
        name="Orders"
        component={DeliveryOrders}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="List" color={color} size={size} />,
          tabBarLabel: 'Deliveries',
        }}
      />
      <DeliveryTab.Screen
        name="Earnings"
        component={DeliveryEarnings}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="DollarSign" color={color} size={size} />,
          tabBarLabel: 'Earnings',
        }}
      />
      <DeliveryTab.Screen
        name="Profile"
        component={DeliveryProfile}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="User" color={color} size={size} />,
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
