import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { FONTS } from '../theme/fonts';
import { apiClient } from '../api/client';
import { CourseCard } from '../components/CourseCard';
import { AnimatedCard } from '../components/AnimatedCard';
import { CourseSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDateParam = (d: Date) => d.toISOString().split('T')[0];

export const PlanningScreen = () => {
  const { userRole } = useAuth();
  const navigation = useNavigation<any>();
  const [planningData, setPlanningData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));

  const [promptVisible, setPromptVisible] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptMessage, setPromptMessage] = useState('');
  const [promptValue, setPromptValue] = useState('');
  const [promptCallback, setPromptCallback] = useState<((val: string) => void) | null>(null);

  const showPrompt = (title: string, message: string, defaultValue: string, onConfirm: (val: string) => void) => {
    setPromptTitle(title);
    setPromptMessage(message);
    setPromptValue(defaultValue);
    setPromptCallback(() => onConfirm);
    setPromptVisible(true);
  };

  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const goToPreviousWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
    setSelectedDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
    setSelectedDate(next);
  };

  const goToToday = () => {
    const today = new Date();
    setWeekStart(getMonday(today));
    setSelectedDate(today);
  };

  const fetchPlanning = useCallback(async () => {
    try {
      setLoading(true);
      const dateParam = formatDateParam(selectedDate);
      const response = await apiClient.get(`/api/v1/schedule-events?startDate=${dateParam}&endDate=${dateParam}`);

      if (response.data?.success) {
        const events = response.data.data.map((event: any) => {
          const start = new Date(event.startAt);
          const end = new Date(event.endAt);

          const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
          const diffMs = end.getTime() - start.getTime();
          const diffH = Math.floor(diffMs / 3600000);
          const diffM = Math.round((diffMs % 3600000) / 60000);
          const duration = diffM > 0 ? `${diffH}h${diffM.toString().padStart(2, '0')}` : `${diffH}h00`;

          return {
            id: event.id,
            isBreak: false,
            time: `${formatTime(start)} - ${formatTime(end)}`,
            duration,
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
            delayMinutes: event.delayMinutes || 0,
            homeworkTitle: event.homeworkTitle,
            isHomeworkDone: event.isHomeworkDone,
            homeworkId: event.homeworkId,
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
  }, [selectedDate]);

  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]);

  const isToday = isSameDay(selectedDate, new Date());
  const dayLabel = `${DAYS_FR[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTHS_FR[selectedDate.getMonth()]}`;

  const renderHeader = () => (
    <>
      <View style={styles.dateSelectorContainer}>
        <View style={styles.dateHeader}>
          <View>
            <Text style={styles.dateSubtitle}>EMPLOI DU TEMPS</Text>
            <Text style={styles.dateTitle}>{isToday ? "Aujourd'hui" : dayLabel}</Text>
          </View>
          {!isToday && (
            <TouchableOpacity style={styles.weekBadge} onPress={goToToday}>
              <Text style={styles.weekBadgeText}>Aujourd'hui</Text>
            </TouchableOpacity>
          )}
          {isToday && (
            <View style={styles.weekBadgeLive}>
              <Text style={styles.weekBadgeText}>En direct</Text>
            </View>
          )}
        </View>

        <View style={styles.weekNav}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.weekNavBtn}>
            <MaterialIcons name="chevron-left" size={20} color={COLORS.slate600} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollContent}>
            {weekDays.map((d) => {
              const active = isSameDay(d, selectedDate);
              const today = isSameDay(d, new Date());
              return (
                <TouchableOpacity
                  key={d.toISOString()}
                  style={[styles.dateItem, active && styles.dateItemActive, today && !active && styles.dateItemToday]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.dateDayText, active && styles.dateDayActive]}>{DAYS_FR[d.getDay()]}</Text>
                  <Text style={[styles.dateNumText, active && styles.dateNumActive]}>{d.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={goToNextWeek} style={styles.weekNavBtn}>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.slate600} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daySeparator}>
        <View style={styles.dayBadge}>
          <MaterialIcons name="event" size={12} color={COLORS.brand700} style={{ marginRight: 6 }} />
          <Text style={styles.dayBadgeText}>{planningData.length} séance{planningData.length > 1 ? 's' : ''}{isToday ? " aujourd'hui" : ''}</Text>
        </View>
      </View>
    </>
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
    showPrompt(
      "Signaler un retard",
      `Durée du retard pour ${item.title} (en minutes) :`,
      "15",
      async (minutes) => {
        if (minutes && !isNaN(Number(minutes))) {
          try {
            await apiClient.put(`/api/v1/schedule-events/${item.id}/delay?minutes=${minutes}`);
            Alert.alert("Succès", `Un retard de ${minutes} min a été signalé.`);
            fetchPlanning();
          } catch (e) {
            Alert.alert("Erreur", "Impossible de signaler le retard.");
          }
        }
      }
    );
  };

  const handleCancelClass = (item: any) => {
    Alert.alert(
      "Annuler le cours",
      `Êtes-vous sûr de vouloir annuler le cours de ${item.title} ?`,
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
              Alert.alert("Erreur", "Impossible d'annuler le cours.");
            }
          }
        }
      ]
    );
  };

  const handleAddHomework = (item: any) => {
    showPrompt(
      "Ajouter un travail",
      `Titre du devoir pour ${item.title} :`,
      "",
      async (title) => {
        if (title) {
          try {
            await apiClient.post(`/api/v1/schedule-events/${item.id}/homework`, { title });
            Alert.alert("Succès", "Le devoir a été ajouté.");
            fetchPlanning();
          } catch (e) {
            Alert.alert("Erreur", "Impossible d'ajouter le devoir.");
          }
        }
      }
    );
  };

  const handleToggleHomework = async (item: any) => {
    try {
      setPlanningData(prev => prev.map(ev =>
        ev.id === item.id ? { ...ev, isHomeworkDone: !ev.isHomeworkDone } : ev
      ));
      await apiClient.put(`/api/v1/homework/${item.homeworkId}/status`, { completed: !item.isHomeworkDone });
    } catch (e) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut du devoir.");
      fetchPlanning();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={planningData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          if (item.isBreak) {
            return (
              <View style={styles.lunchBreak}>
                <View style={styles.lunchBreakBadge}>
                  <MaterialIcons name="coffee" size={12} color="#F59E0B" style={{ marginRight: 6 }} />
                  <Text style={styles.lunchBreakText}>{item.text}</Text>
                </View>
              </View>
            );
          }
          return (
            <AnimatedCard index={index}>
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
            </AnimatedCard>
          );
        }}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 40 }} />}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.slate500 }}>Aucun cours prévu.</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <MaterialIcons name="qr-code-scanner" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={promptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{promptTitle}</Text>
            <Text style={styles.modalMessage}>{promptMessage}</Text>
            <TextInput
              style={styles.modalInput}
              value={promptValue}
              onChangeText={setPromptValue}
              autoFocus
              keyboardType={promptTitle.includes('retard') ? 'numeric' : 'default'}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setPromptVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={() => {
                setPromptVisible(false);
                promptCallback?.(promptValue);
              }}>
                <Text style={styles.modalBtnConfirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
  },
  dateSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate400,
    letterSpacing: 0.5,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.extraBold,
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
  weekBadgeLive: {
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
    fontFamily: FONTS.bold,
    color: COLORS.brand700,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekNavBtn: {
    padding: 8,
  },
  dateScrollContent: {
    paddingVertical: 4,
    gap: 6,
    flexGrow: 1,
    justifyContent: 'center',
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  dateItemActive: {
    backgroundColor: COLORS.brand600,
    borderColor: COLORS.brand600,
    shadowColor: COLORS.brand500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dateItemToday: {
    borderColor: COLORS.brand500,
    borderWidth: 2,
  },
  dateDayText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.medium,
    color: COLORS.slate400,
    letterSpacing: 0.3,
  },
  dateDayActive: {
    color: COLORS.brand100,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
  },
  dateNumText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.slate700,
    marginTop: 2,
  },
  dateNumActive: {
    color: '#FFF',
    fontWeight: '900',
    fontFamily: FONTS.black,
  },
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
    fontFamily: FONTS.extraBold,
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
    fontFamily: FONTS.semiBold,
    color: COLORS.slate400,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.slate900,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.slate600,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.slate900,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate500,
  },
  modalBtnConfirm: {
    backgroundColor: COLORS.brand600,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
});
