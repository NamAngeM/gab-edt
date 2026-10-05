import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { CourseCard } from '../components/CourseCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export const RoomScheduleScreen = ({ route, navigation }: any) => {
  const { roomId, roomName } = route.params;
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomSchedule = async () => {
    try {
      setLoading(true);
      // Occupation de la salle (cours publiés), filtrée par l'API
      const response = await apiClient.get('/api/v1/schedule-events', { params: { roomId } });

      if (response.data?.success) {
        const roomEvents = response.data.data;

        const events = roomEvents.map((event: any) => {
          const start = new Date(event.startAt);
          const end = new Date(event.endAt);
          const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
          
          return {
            id: event.id,
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

        // Sort events by time
        events.sort((a: any, b: any) => a.time.localeCompare(b.time));

        setScheduleData(events);
      }
    } catch (error) {
      console.error("Erreur récupération planning salle:", error);
      Alert.alert("Erreur", "Impossible de charger le planning de cette salle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomSchedule();
  }, [roomId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.subtitle}>Planning de la salle</Text>
          <Text style={styles.title}>{roomName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement du planning...</Text>
          </View>
        ) : (
          <FlatList
            data={scheduleData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CourseCard 
                time={item.time} duration={item.duration} type={item.type} typeLabel={item.typeLabel} title={item.title}
                room={item.room} teacher={item.teacher} initial={item.initial} initialBg={item.initialBg} initialColor={item.initialColor} color={item.color}
                isTeacher={false}
                isParent={false}
                isCancelled={item.isCancelled}
                delayMinutes={item.delayMinutes}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="calendar" size={48} color={COLORS.slate300} />
                <Text style={styles.emptyTitle}>Salle Libre</Text>
                <Text style={styles.emptyText}>Aucun cours n'est prévu dans cette salle aujourd'hui.</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.slate500,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.slate500,
    textAlign: 'center',
    lineHeight: 22,
  },
});
