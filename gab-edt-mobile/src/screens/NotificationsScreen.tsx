import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/api/v1/notifications');
      if (response.data && response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      await apiClient.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Aucune notification récente.</Text>}
        renderItem={({ item }) => {
          
          // Formattage basique de la date pour l'exemple
          const d = new Date(item.createdAt);
          const timeString = `${d.getDate()}/${d.getMonth()+1} à ${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;

          return (
            <TouchableOpacity 
              style={[styles.notificationCard, !item.read && styles.unreadCard]}
              onPress={() => markAsRead(item.id, item.read)}
            >
            <View style={[styles.iconContainer, 
              item.type === 'WARNING' ? { backgroundColor: '#FEF3C7' } :
              item.type === 'ERROR' ? { backgroundColor: '#FEE2E2' } :
              { backgroundColor: '#E0F2FE' }
            ]}>
              <Feather 
                name={item.type === 'WARNING' ? 'clock' : item.type === 'ERROR' ? 'x-circle' : 'info'} 
                size={20} 
                color={
                  item.type === 'WARNING' ? '#D97706' :
                  item.type === 'ERROR' ? '#DC2626' :
                  '#0284C7'
                } 
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{timeString}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '800',
    color: COLORS.brand700,
  },
  message: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: COLORS.outline,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
});
