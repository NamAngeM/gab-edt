import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { ActuSkeleton } from '../components/Skeleton';
import { LayoutAnimation, UIManager, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ActuScreen = () => {
  const { userRole } = useAuth();
  const navigation = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const [annRes, notifRes] = await Promise.all([
        apiClient.get('/api/v1/communication/announcements'),
        apiClient.get('/api/v1/notifications')
      ]);
      const annData = Array.isArray(annRes.data) ? annRes.data : [];
      const notifData = notifRes.data?.data || notifRes.data || [];
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAnnouncements(annData);
      setNotifications(Array.isArray(notifData) ? notifData : []);
    } catch (error) {
      console.error("Erreur récupération actualités:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surfaceContainerLowest }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.outline} style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher une actualité..."
            placeholderTextColor={COLORS.outline}
          />
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="tune" size={18} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          <TouchableOpacity style={styles.filterPillActive}>
            <Text style={styles.filterPillActiveText}>Tout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPillInactive}>
            <View style={styles.errorDot} />
            <Text style={styles.filterPillInactiveText}>Urgences & Avis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPillInactive}>
            <Text style={styles.filterPillInactiveText}>Vie Scolaire</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* A la une */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="campaign" size={18} color={COLORS.primary} />
          <Text style={styles.headerTitle}>À LA UNE • DIRECTION</Text>
        </View>
        <Text style={styles.headerLive}>En direct</Text>
      </View>

      {loading ? (
        <View style={{ marginTop: 12 }}>
          <ActuSkeleton />
          <ActuSkeleton />
          <ActuSkeleton />
        </View>
      ) : (
        <>
          {notifications.length > 0 && notifications.map((notif, index) => (
            <TouchableOpacity key={`notif-${notif.id || index}`} style={styles.notificationCard}>
              <View style={styles.notificationIconContainer}>
                <MaterialIcons name={notif.type === 'ERROR' ? 'error' : 'notifications'} size={24} color={notif.type === 'ERROR' ? COLORS.error : COLORS.primary} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notif.title}</Text>
                <Text style={styles.notificationDesc}>{notif.message}</Text>
                <Text style={styles.notificationTime}>{new Date(notif.createdAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {announcements.length > 0 ? (
            announcements.map((ann, index) => (
          <TouchableOpacity key={ann.id || index} style={index === 0 ? styles.heroCard : styles.articleCard} activeOpacity={0.9}>
            <View style={index === 0 ? styles.heroImageContainer : styles.articleHeader}>
              {index === 0 ? (
                <>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Wyuzoti8Rl8w855jiWpndQngIoki3sHnGAT75A1CVXu5RycYoMlVFsMGSjnFd07ui5_O9p4evgtpxci2-GuDFFAUm8q4mQLnuPKg2Hm-MqpelOOkwdEzOriDEslCuPS5pHODDQtN3jvxFYSM_Fi6oeFkywj6oRIQJ5YWmGcpaz9Tz5MXFWl19zucFlR99H23Sdakq6Cc5j4Y6JJD1o0y76c5jwURSXuWPgSfr9qewH-ms7Z58Lqd' }}
                    style={styles.heroImage}
                  />
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroTextContainer}>
                    <Text style={styles.heroSub}>{ann.authorName || 'Direction'}</Text>
                    <Text style={styles.heroMain}>{ann.title}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.articleCategoryBadge, { backgroundColor: COLORS.primaryFixed }]}>
                    <Text style={[styles.articleCategoryText, { color: COLORS.onPrimaryFixed }]}>{ann.targetAudience || 'Général'}</Text>
                  </View>
                  <Text style={styles.articleDate}>{new Date(ann.createdAt).toLocaleDateString()}</Text>
                </>
              )}
            </View>
            <View style={index === 0 ? styles.heroContent : styles.articleBody}>
              {index !== 0 && <Text style={styles.articleTitle} numberOfLines={2}>{ann.title}</Text>}
              <Text style={index === 0 ? styles.heroDescription : styles.articleDesc} numberOfLines={2}>
                {ann.content}
              </Text>
              <View style={index === 0 ? styles.heroFooter : undefined}>
                <View style={index === 0 ? styles.heroTimeRow : undefined}>
                  <MaterialIcons name="history" size={16} color={index === 0 ? COLORS.outline : COLORS.primary} />
                  <Text style={index === 0 ? styles.heroTimeText : undefined}>{new Date(ann.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          ))
          ) : (
            <Text style={{ textAlign: 'center', color: COLORS.slate500, marginTop: 20 }}>Aucune actualité disponible.</Text>
          )}
        </>
      )}
      <View style={{ height: 80 }} />
      </ScrollView>

      {userRole === 'TEACHER' && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('CreateAnnouncement')}
        >
          <Feather name="edit-2" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  searchSection: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  filterButton: {
    padding: 4,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    gap: 8,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillActiveText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterPillInactiveText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  headerLive: {
    fontSize: 10,
    color: COLORS.outline,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  heroCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  heroImageContainer: {
    height: 180,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(19, 27, 46, 0.4)',
  },
  heroImportantBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  whitePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },
  heroImportantText: {
    color: COLORS.onError,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroReadTimeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 48, 68, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroReadTimeText: {
    color: COLORS.inverseOnSurface,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginBottom: 2,
  },
  heroMain: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroContent: {
    padding: 10,
  },
  heroDescription: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 8,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTimeText: {
    fontSize: 11,
    color: COLORS.outline,
    marginLeft: 4,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },

  articleCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleCategoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  articleDate: {
    fontSize: 10,
    color: COLORS.outline,
  },
  articleBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  articleBodyNoImage: {
    marginBottom: 10,
  },
  articleImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  articleTextContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 18,
    marginBottom: 4,
  },
  articleDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleHighlightText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  articleActionBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  articleActionBtn: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  documentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  documentMeta: {
    fontSize: 10,
    color: COLORS.outline,
  },
  downloadBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  notificationCard: {
    backgroundColor: COLORS.errorContainer,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.1)'
  },
  notificationIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.onErrorContainer,
    marginBottom: 4,
  },
  notificationDesc: {
    fontSize: 12,
    color: COLORS.onErrorContainer,
    marginBottom: 6,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 10,
    color: COLORS.outline,
  }
});
