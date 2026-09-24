import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlanningScreen } from '../screens/PlanningScreen';
import { ActuScreen } from '../screens/ActuScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { LiaisonScreen } from '../screens/LiaisonScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const CustomHeader = () => {
  const { logout, userRole } = useAuth();
  const navigation = useNavigation<any>();
  
  // To highlight the active top tab, we need the current route name.
  // A hacky but effective way in a custom header is to read the state.
  const state = navigation.getState();
  const activeTab = state ? state.routes[state.index].name : 'Dashboard';

  return (
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLogoRow}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoSquare}>
                <Text style={styles.logoText}>G</Text>
              </View>
              <View style={styles.gabonBadge}>
                <View style={[styles.gabonStripe, { backgroundColor: COLORS.gabonGreen }]} />
                <View style={[styles.gabonStripe, { backgroundColor: COLORS.gabonYellow }]} />
                <View style={[styles.gabonStripe, { backgroundColor: COLORS.gabonBlue }]} />
              </View>
            </View>
            <View>
              <Text style={styles.headerTitle}>Lycée National Léon Mba</Text>
              <View style={styles.headerStatusRow}>
                <Text style={styles.headerSubtitle}>GAB-EDT • Màj 20:55</Text>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>En direct</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Feather name="bell" size={18} color="#FFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={logout}>
              <Feather name="log-out" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* TOP NAVIGATION TABS */}
        <View style={styles.topTabs}>
          {['Dashboard', 'Planning', 'Actu', 'Services', 'Notes', 'Liaison']
            .filter(tab => {
              if (userRole === 'PARENT') {
                return tab === 'Dashboard' || tab === 'Planning' || tab === 'Notes' || tab === 'Liaison';
              }
              return tab !== 'Liaison';
            })
            .map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={styles.topTab} 
              onPress={() => navigation.navigate(tab)}
            >
              <Text style={[styles.topTabText, activeTab === tab && styles.topTabActiveText]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.topTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <CustomHeader />,
        tabBarStyle: { display: 'none' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Actu" component={ActuScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Liaison" component={LiaisonScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // HEADER STYLES
  headerSafeArea: {
    backgroundColor: COLORS.brand700,
  },
  header: {
    backgroundColor: COLORS.brand700,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  logoSquare: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.brand700,
  },
  gabonBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.brand700,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  gabonStripe: {
    flex: 1,
    width: '100%',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(219, 234, 254, 0.9)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginHorizontal: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6EE7B7',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    borderWidth: 1,
    borderColor: COLORS.brand700,
  },

  // TOP TABS (Restored)
  topTabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.3)', // blue-500/30
    paddingHorizontal: 12,
  },
  topTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  topTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(191, 219, 254, 1)', // blue-200
  },
  topTabActiveText: {
    fontWeight: '700',
    color: '#FFF',
  },
  topTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 4,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  // Removed bottom tab styles
});
