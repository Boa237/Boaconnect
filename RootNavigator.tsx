import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import PublishListingScreen from '../screens/PublishListingScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const GREEN = '#157347';

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: GREEN }}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tabs.Screen name="Publish" component={PublishListingScreen} options={{ title: 'Publier' }} />
      <Tabs.Screen name="Messages" component={ConversationsScreen} options={{ title: 'Messages' }} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // remplaçable par un écran de chargement/splash

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
          <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  if (!user.isProfileComplete) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: "Détail de l'annonce" }} />
        <RootStack.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversation' }} />
        {user.role === 'admin' && (
          <RootStack.Screen name="Admin" component={AdminScreen} options={{ title: 'Modération' }} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
