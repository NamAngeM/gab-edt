import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const CourseCard = ({ time, duration, type, typeLabel, title, room, teacher, initial, initialBg, initialColor, color }: any) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.courseCard}>
    <View style={[styles.courseColorBar, { backgroundColor: color }]} />
    <View style={styles.courseContent}>
      <View style={styles.courseHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.courseTime, { color: color }]}>{time}</Text>
          <Text style={styles.courseDuration}>({duration})</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.typeBadgeText, { color: color }]}>{typeLabel}</Text>
        </View>
      </View>

      <Text style={styles.courseTitle}>{title}</Text>

      <View style={styles.courseFooter}>
        <View style={styles.roomBadge}>
          <Feather name="map-pin" size={12} color={COLORS.slate500} style={{ marginRight: 4 }} />
          <Text style={styles.roomText}>{room}</Text>
        </View>
        <View style={styles.teacherBadge}>
          <View style={[styles.teacherInitial, { backgroundColor: initialBg }]}>
            <Text style={[styles.teacherInitialText, { color: initialColor }]}>{initial}</Text>
          </View>
          <Text style={styles.teacherText}>{teacher}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    overflow: 'hidden',
  },
  courseColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  courseContent: {
    padding: 12,
    paddingLeft: 18,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseTime: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  courseDuration: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.slate400,
    marginLeft: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 10,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    paddingTop: 10,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherInitial: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  teacherInitialText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teacherText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate800,
  },
});
