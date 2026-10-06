import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { FONTS } from '../theme/fonts';

export const CourseCard = ({ time, duration, type, typeLabel, title, room, teacher, initial, initialBg, initialColor, color, isTeacher, onReportDelay, onCancelClass, onRollCall, onAddHomework, onToggleHomework, isCancelled, delayMinutes, homeworkTitle, isHomeworkDone, isParent }: any) => (
  <View style={[styles.courseCard, isCancelled && styles.courseCardCancelled]}>
    <View style={[styles.courseColorBar, { backgroundColor: isCancelled ? COLORS.outlineVariant : color }]} />
    <View style={[styles.courseContent, isCancelled && { opacity: 0.6 }]}>
      <View style={styles.courseHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.courseTime, { color }]}>{time}</Text>
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
            <View style={[styles.typeBadge, { backgroundColor: COLORS.warning }]}>
              <Text style={[styles.typeBadgeText, { color: COLORS.white }]}>+{delayMinutes} MIN</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.courseTitle, isCancelled && { textDecorationLine: 'line-through' }]}>{title}</Text>

      <View style={styles.courseFooter}>
        <View style={styles.roomBadge}>
          <MaterialIcons name="location-on" size={13} color={COLORS.slate500} style={{ marginRight: 4 }} />
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
              <MaterialIcons
                name={isHomeworkDone ? "check-box" : "check-box-outline-blank"}
                size={20}
                color={isHomeworkDone ? COLORS.primary : COLORS.outline}
              />
            ) : (
              <MaterialIcons name="menu-book" size={18} color={COLORS.primary} />
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
            <MaterialIcons name="edit-note" size={16} color={COLORS.successDark} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnTextAddHw}>Devoirs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnRollCall} onPress={onRollCall}>
            <MaterialIcons name="fact-check" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnTextRollCall}>Appel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnDelay} onPress={onReportDelay}>
            <MaterialIcons name="schedule" size={16} color={COLORS.warningDark} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnTextDelay}>Retard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnCancel} onPress={onCancelClass}>
            <MaterialIcons name="cancel" size={16} color={COLORS.error} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnTextCancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.slate200,
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
    fontFamily: FONTS.extraBold,
    letterSpacing: -0.2,
  },
  courseDuration: {
    fontSize: 12,
    fontFamily: FONTS.medium,
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
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.semiBold,
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
    fontFamily: FONTS.bold,
  },
  teacherText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
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
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnTextAddHw: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.successDark,
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
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  actionBtnDelay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnTextDelay: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.warningDark,
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
    fontFamily: FONTS.bold,
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
    backgroundColor: COLORS.slate50,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  homeworkText: {
    marginLeft: 10,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.slate800,
    flex: 1,
  },
  homeworkTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.slate500,
  }
});
