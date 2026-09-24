import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { CourseCard } from '../components/CourseCard';
import { CourseSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LayoutAnimation, UIManager, Platform } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DateSelector = () => (
  <View style={styles.dateSelectorContainer}>
    <View style={styles.dateHeader}>
      <View>
        <Text style={styles.dateSubtitle}>EMPLOI DU TEMPS</Text>
        <Text style={styles.dateTitle}>Aujourd'hui</Text>
      </View>
      <View style={styles.weekBadge}>
        <Text style={styles.weekBadgeText}>En direct</Text>
      </View>
    </View>

    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dateScrollContent}
    >
      <TouchableOpacity style={styles.dateItemActive}>
        <Text style={styles.dateDayActive}>AJOURD'HUI</Text>
        <Text style={styles.dateNumActive}>Tous les cours</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export const PlanningScreen = () => {
  const { userRole } = useAuth();
  const navigation = useNavigation<any>();
  const [planningData, setPlanningData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlanning = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/schedule-events');
      
      if (response.data?.success) {
        // Map backend DTO to UI model
        const events = response.data.data.map((event: any) => {
          const start = new Date(event.startAt);
          const end = new Date(event.endAt);
          
          const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
          
          return {
            id: event.id,
            isBreak: false, // On ne gère pas les pauses venant de l'API pour l'instant
            time: `${formatTime(start)} - ${formatTime(end)}`,
            duration: "2h00", // Simplifié
            type: "CM",
            typeLabel: "Cours",
            title: event.subject?.name || "Matière inconnue",
            room: event.room?.name || "Salle non assignée",
            teacher: event.teacher ? `${event.teacher.firstName} ${event.teacher.lastName}` : "Professeur inconnu",
            initial: event.subject?.name?.substring(0, 1) || "?",
            initialBg: `${COLORS.primary}20`,
            initialColor: COLORS.primary,
            color: COLORS.primary,
            isCancelled: event.status === 'CANCELLED',
            delayMinutes: event.delayMinutes || 0
          };
        });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPlanningData(events);
      }
    } catch (error) {
      console.error("Erreur récupération planning:", error);
      Alert.alert("Erreur", "Impossible de charger l'emploi du temps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanning();
  }, []);

  const renderHeader = () => (
    <>
      <DateSelector />
      <View style={styles.daySeparator}>
        <View style={styles.dayBadge}>
          <Feather name="calendar" size={12} color={COLORS.brand700} style={{ marginRight: 6 }} />
          <Text style={styles.dayBadgeText}>{planningData.length} séances aujourd'hui</Text>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={{ height: 40 }} />
  );

  if (loading) {
    return (
      <View style={{ flex: 1, marginTop: 12 }}>
        <CourseSkeleton />
        <CourseSkeleton />
        <CourseSkeleton />
        <CourseSkeleton />
      </View>
    );
  }

  const handleReportDelay = (item: any) => {
    Alert.prompt(
      "Signaler un retard",
      `Durée du retard pour le cours de ${item.title} (en minutes) :`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: async (minutes) => {
            if (minutes && !isNaN(Number(minutes))) {
              try {
                await apiClient.put(`/api/v1/schedule-events/${item.id}/delay?minutes=${minutes}`);
                Alert.alert("Succès", `Un retard de ${minutes} min a été signalé et notifié aux élèves.`);
                fetchPlanning();
              } catch (e) {
                console.error(e);
                Alert.alert("Erreur", "Impossible de signaler le retard.");
              }
            }
          }
        }
      ],
      "plain-text",
      "15"
    );
  };

  const handleCancelClass = (item: any) => {
    Alert.alert(
      "Annuler le cours",
      `Êtes-vous sûr de vouloir annuler le cours de ${item.title} ? Une notification sera envoyée.`,
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui, annuler", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.put(`/api/v1/schedule-events/${item.id}/cancel`);
              Alert.alert("Succès", "Le cours a été annulé.");
              fetchPlanning();
            } catch (e) {
              console.error(e);
              Alert.alert("Erreur", "Impossible d'annuler le cours.");
            }
          }
        }
      ]
    );
  };
  const handleAddHomework = (item: any) => {
    Alert.prompt(
      "Ajouter un travail",
      `Titre du devoir pour ${item.title} :`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Ajouter", 
          onPress: async (title) => {
            if (title) {
              try {
                await apiClient.post(`/api/v1/schedule-events/${item.id}/homework`, { title });
                Alert.alert("Succès", "Le devoir a été ajouté.");
                fetchPlanning();
              } catch (e) {
                console.error(e);
                Alert.alert("Erreur", "Impossible d'ajouter le devoir.");
              }
            }
          }
        }
      ],
      "plain-text"
    );
  };

  const handleToggleHomework = async (item: any) => {
    try {
      // Optimistic update
      setPlanningData(prev => prev.map(ev => 
        ev.id === item.id ? { ...ev, isHomeworkDone: !ev.isHomeworkDone } : ev
      ));
      await apiClient.put(`/api/v1/homework/${item.homeworkId}/status`, { completed: !item.isHomeworkDone });
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut du devoir.");
      fetchPlanning(); // Revert
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={planningData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.isBreak) {
            return (
              <View style={styles.lunchBreak}>
                <View style={styles.lunchBreakBadge}>
                  <Feather name="coffee" size={12} color="#F59E0B" style={{ marginRight: 6 }} />
                  <Text style={styles.lunchBreakText}>{item.text}</Text>
                </View>
              </View>
            );
          }
          return (
            <CourseCard 
              time={item.time} duration={item.duration} type={item.type} typeLabel={item.typeLabel} title={item.title}
              room={item.room} teacher={item.teacher} initial={item.initial} initialBg={item.initialBg} initialColor={item.initialColor} color={item.color}
              isTeacher={userRole === 'TEACHER'}
              isParent={userRole === 'PARENT'}
              onReportDelay={() => handleReportDelay(item)}
              onCancelClass={() => handleCancelClass(item)}
              onRollCall={() => navigation.navigate('RollCall', { eventId: item.id, title: item.title })}
              onAddHomework={() => handleAddHomework(item)}
              onToggleHomework={() => handleToggleHomework(item)}
              isCancelled={item.isCancelled}
              delayMinutes={item.delayMinutes}
              homeworkTitle={item.homeworkTitle}
              isHomeworkDone={item.isHomeworkDone}
            />
          );
        }}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: COLORS.slate500}}>Aucun cours prévu.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Feather name="maximize" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  dateSelectorContainer: {
    marginBottom: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  dateSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate400,
    letterSpacing: 0.5,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: -0.5,
  },
  weekBadge: {
    backgroundColor: COLORS.brand100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.6)',
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.brand700,
  },
  dateScrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  dateItemInactive: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  dateItemNext: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateDayInactive: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate400,
  },
  dateNumInactive: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  dateNumNext: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  dateItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: COLORS.brand600,
    shadowColor: COLORS.brand500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dateDayActive: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand100,
    letterSpacing: 0.5,
  },
  dateNumActive: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },

  // Feed
  daySeparator: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayBadgeText: {
    color: COLORS.brand700,
    fontSize: 12,
    fontWeight: '800',
  },

  lunchBreak: {
    alignItems: 'center',
    marginVertical: 2,
    marginBottom: 10,
  },
  lunchBreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lunchBreakText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate400,
  },
  
  nextDayButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  nextDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand600,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.brand500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextDayButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
