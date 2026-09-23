import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

import { CourseCard } from '../components/CourseCard';

const PLANNING_DATA = [
  {
    id: 'course-1',
    isBreak: false,
    time: "08h00 - 10h00", duration: "2h00", type: "CM", typeLabel: "CM", title: "Mathématiques",
    room: "Salle B24", teacher: "M. NGUEMA", initial: "N", initialBg: `${COLORS.primary}20`, initialColor: COLORS.primary, color: COLORS.primary
  },
  {
    id: 'course-2',
    isBreak: false,
    time: "10h00 - 12h00", duration: "2h00", type: "CM", typeLabel: "CM", title: "Histoire-Géographie",
    room: "Amphi A", teacher: "Mme. MBADINGA", initial: "M", initialBg: `${COLORS.outline}20`, initialColor: COLORS.outline, color: COLORS.outline
  },
  {
    id: 'break-1',
    isBreak: true,
    text: "Pause méridienne • 12h00 - 13h30"
  },
  {
    id: 'course-3',
    isBreak: false,
    time: "13h30 - 15h30", duration: "2h00", type: "TP", typeLabel: "TP Pratique", title: "Sciences Physiques",
    room: "Laboratoire 3", teacher: "M. ONDO", initial: "O", initialBg: `${COLORS.tertiary}20`, initialColor: COLORS.tertiary, color: COLORS.tertiary
  }
];

const DateSelector = () => (
  <View style={styles.dateSelectorContainer}>
    <View style={styles.dateHeader}>
      <View>
        <Text style={styles.dateSubtitle}>EMPLOI DU TEMPS</Text>
        <Text style={styles.dateTitle}>Semestre 1 • Tle S2</Text>
      </View>
      <View style={styles.weekBadge}>
        <Text style={styles.weekBadgeText}>Semaine B</Text>
      </View>
    </View>

    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dateScrollContent}
    >
      <TouchableOpacity style={styles.dateItemInactive}>
        <Text style={styles.dateDayInactive}>Ven</Text>
        <Text style={styles.dateNumInactive}>18</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateItemActive}>
        <Text style={styles.dateDayActive}>DEMAIN</Text>
        <Text style={styles.dateNumActive}>Lundi 21</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateItemNext}>
        <Text style={styles.dateDayInactive}>Mar</Text>
        <Text style={styles.dateNumNext}>22 Sept</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateItemNext}>
        <Text style={styles.dateDayInactive}>Mer</Text>
        <Text style={styles.dateNumNext}>23 Sept</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateItemNext}>
        <Text style={styles.dateDayInactive}>Jeu</Text>
        <Text style={styles.dateNumNext}>24 Sept</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export const PlanningScreen = () => {

  const renderHeader = () => (
    <>
      <DateSelector />

      <View style={styles.daySeparator}>
        <View style={styles.dayBadge}>
          <Feather name="calendar" size={12} color={COLORS.brand700} style={{ marginRight: 6 }} />
          <Text style={styles.dayBadgeText}>Demain lundi • 4 séances</Text>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      <View style={styles.nextDayButtonContainer}>
        <TouchableOpacity style={styles.nextDayButton}>
          <Text style={styles.nextDayButtonText}>Mar 22 Septembre</Text>
          <Feather name="chevron-down" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </>
  );

  return (
    <FlatList
      data={PLANNING_DATA}
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
          />
        );
      }}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.mainContent}
      showsVerticalScrollIndicator={false}
    />
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
});
