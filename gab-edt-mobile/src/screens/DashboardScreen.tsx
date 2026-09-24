import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const DashboardScreen = () => {
  const { userRole, userData } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch today's schedule to find the NEXT class
      const today = new Date().toISOString().split('T')[0];
      const res = await apiClient.get(`/api/v1/schedule-events?startDate=${today}&endDate=${today}`);
      const allEvents = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      
      const now = new Date();
      // Find the current or next event
      const upcoming = allEvents
        .filter((e: any) => new Date(e.endAt) > now)
        .sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        
      if (upcoming.length > 0) {
        setNextEvent(upcoming[0]);
      } else {
        setNextEvent(null);
      }
      
      // If student, we could fetch recent grades or just use a mock stat for now
      // If teacher, maybe classes to grade
    } catch (error) {
      console.error("Erreur Dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <View style={styles.headerArea}>
        <Text style={styles.greeting}>Bonjour, {userData?.firstName || 'Utilisateur'} 👋</Text>
        <Text style={styles.subtitle}>Voici un aperçu de votre journée.</Text>
      </View>

      {/* PROCHAIN COURS WIDGET */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochain Cours</Text>
        {loading ? (
          <View style={[styles.card, { height: 100, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: COLORS.outline }}>Chargement...</Text>
          </View>
        ) : nextEvent ? (
          <View style={styles.eventCard}>
            <View style={styles.eventTimeCol}>
              <Text style={styles.eventTimeMain}>{formatTime(nextEvent.startAt)}</Text>
              <Text style={styles.eventTimeSub}>{formatTime(nextEvent.endAt)}</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{nextEvent.subject?.name || nextEvent.title}</Text>
              <View style={styles.eventMetaRow}>
                <View style={styles.eventMetaBadge}>
                  <MaterialIcons name="meeting-room" size={12} color={COLORS.primary} />
                  <Text style={styles.eventMetaText}>{nextEvent.room?.name || 'Salle'}</Text>
                </View>
                <View style={styles.eventMetaBadge}>
                  <MaterialIcons name="group" size={12} color={COLORS.primary} />
                  <Text style={styles.eventMetaText}>{nextEvent.group?.name || 'Groupe'}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.emptyCard]}>
            <MaterialIcons name="event-available" size={32} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Aucun cours à venir</Text>
            <Text style={styles.emptySub}>Votre journée est terminée !</Text>
          </View>
        )}
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accès Rapide</Text>
        <View style={styles.quickActionsGrid}>
          {userRole === 'TEACHER' && (
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Planning')}>
              <View style={[styles.actionIconArea, { backgroundColor: COLORS.primaryContainer }]}>
                <MaterialIcons name="checklist" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionTitle}>Faire l'appel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Planning')}>
            <View style={[styles.actionIconArea, { backgroundColor: COLORS.secondaryContainer }]}>
              <MaterialIcons name="calendar-month" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionTitle}>Planning</Text>
          </TouchableOpacity>

          {(userRole === 'STUDENT' || userRole === 'PARENT') && (
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Notes')}>
              <View style={[styles.actionIconArea, { backgroundColor: COLORS.tertiaryContainer }]}>
                <MaterialIcons name="school" size={24} color={COLORS.tertiary} />
              </View>
              <Text style={styles.actionTitle}>Mes Notes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Actu')}>
            <View style={[styles.actionIconArea, { backgroundColor: COLORS.errorContainer }]}>
              <MaterialIcons name="campaign" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.actionTitle}>Actualités</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HIGHLIGHT WIDGET */}
      <View style={[styles.highlightCard, { backgroundColor: userRole === 'TEACHER' ? COLORS.primary : COLORS.tertiary }]}>
        <MaterialIcons name={userRole === 'TEACHER' ? 'class' : 'menu-book'} size={48} color="rgba(255,255,255,0.2)" style={styles.highlightIconBg} />
        <View style={styles.highlightContent}>
          <Text style={styles.highlightTitle}>
            {userRole === 'TEACHER' ? 'Fin de Semestre' : 'Examens à venir'}
          </Text>
          <Text style={styles.highlightDesc}>
            {userRole === 'TEACHER' 
              ? 'N\'oubliez pas de saisir toutes vos notes avant le 15.' 
              : 'Consultez le calendrier de vos partiels dans l\'onglet Planning.'}
          </Text>
          <TouchableOpacity style={styles.highlightBtn} onPress={() => navigation.navigate(userRole === 'TEACHER' ? 'Services' : 'Planning')}>
            <Text style={styles.highlightBtnText}>En savoir plus</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 16,
  },
  headerArea: {
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 4,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  eventTimeCol: {
    backgroundColor: COLORS.primaryContainer,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  eventTimeMain: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  eventTimeSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onPrimaryContainer,
    opacity: 0.7,
    marginTop: 4,
  },
  eventContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  eventMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  eventMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  eventMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconArea: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  highlightCard: {
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  highlightIconBg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  highlightContent: {
    position: 'relative',
    zIndex: 1,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  highlightDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 16,
  },
  highlightBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  highlightBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  }
});
