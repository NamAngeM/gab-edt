import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const CourseCard = ({ time, duration, type, typeLabel, title, room, teacher, initial, initialBg, initialColor, color, isTeacher, onReportDelay, onCancelClass, onRollCall, onAddHomework, onToggleHomework, isCancelled, delayMinutes, homeworkTitle, isHomeworkDone, isParent }: any) => (
  <TouchableOpacity activeOpacity={0.9} style={[styles.courseCard, isCancelled && styles.courseCardCancelled]}>
    <View style={[styles.courseColorBar, { backgroundColor: isCancelled ? COLORS.outlineVariant : color }]} />
    <View style={[styles.courseContent, isCancelled && { opacity: 0.6 }]}>
      <View style={styles.courseHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.courseTime, { color: color }]}>{time}</Text>
          <Text style={styles.courseDuration}>({duration})</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <View style={[styles.typeBadge, { backgroundColor: isCancelled ? COLORS.surfaceContainerHigh : `${color}15` }]}>
            <Text style={[styles.typeBadgeText, { color: isCancelled ? COLORS.outline : color }]}>{typeLabel}</Text>
          </View>
          {isCancelled && (
            <View style={[styles.typeBadge, { backgroundColor: COLORS.error }]}>
              <Text style={[styles.typeBadgeText, { color: COLORS.white }]}>ANNULÉ</Text>
            </View>
          )}
          {!!delayMinutes && !isCancelled && (
            <View style={[styles.typeBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={[styles.typeBadgeText, { color: COLORS.white }]}>+{delayMinutes} MIN</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.courseTitle, isCancelled && { textDecorationLine: 'line-through' }]}>{title}</Text>

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
      
      {!!homeworkTitle && (
        <View style={styles.homeworkSection}>
          <TouchableOpacity 
            style={styles.homeworkRow} 
            onPress={(!isTeacher && !isParent) ? onToggleHomework : undefined}
            disabled={isTeacher || isParent}
          >
            {(!isTeacher && !isParent) ? (
              <Feather 
                name={isHomeworkDone ? "check-square" : "square"} 
                size={18} 
                color={isHomeworkDone ? COLORS.primary : COLORS.outline} 
              />
            ) : (
              <Feather name="book-open" size={16} color={COLORS.primary} />
            )}
            <Text style={[styles.homeworkText, isHomeworkDone && styles.homeworkTextDone]}>
              {homeworkTitle}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isTeacher && (
        <View style={styles.teacherActions}>
          <TouchableOpacity style={styles.actionBtnAddHw} onPress={onAddHomework}>
            <Feather name="edit-3" size={14} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnTextAddHw}>Devoirs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnRollCall} onPress={onRollCall}>
            <Feather name="check-square" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnTextRollCall}>Faire l'appel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnDelay} onPress={onReportDelay}>
            <Feather name="clock" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnTextDelay}>Retard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnCancel} onPress={onCancelClass}>
            <Feather name="x-circle" size={14} color={COLORS.error} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnTextCancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
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
  courseCardCancelled: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.outlineVariant,
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
  teacherActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    gap: 4,
  },
  actionBtnAddHw: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnTextAddHw: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  actionBtnRollCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryContainer,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnTextRollCall: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionBtnDelay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnTextDelay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  actionBtnCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorContainer,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnTextCancel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onErrorContainer,
  },
  homeworkSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  homeworkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  homeworkText: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.slate800,
    flex: 1,
  },
  homeworkTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.slate500,
  }
});
