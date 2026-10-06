import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { FONTS } from '../theme/fonts';

export const SubjectCard = ({ title, coef, teacher, notes, color }: any) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.subjectCard}>
      <TouchableOpacity style={styles.subjectHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.subjectInfoRow}>
          <View style={[styles.subjectColorBar, { backgroundColor: color }]} />
          <View style={styles.subjectDetails}>
            <View style={styles.subjectTitleRow}>
              <Text style={styles.subjectTitle} numberOfLines={1}>{title}</Text>
              <View style={styles.coefBadge}>
                <Text style={styles.coefText}>Coef {coef}</Text>
              </View>
            </View>
            <Text style={styles.teacherText} numberOfLines={1}>{teacher}</Text>
          </View>
        </View>

        <View style={styles.subjectScoreRow}>
          <View style={styles.scoreContainer}>
            <Text style={styles.notesCountText}>{notes?.length || 0} note{(notes?.length || 0) > 1 ? 's' : ''}</Text>
          </View>
          <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={20} color={COLORS.slate400} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {notes && notes.map((note: any, index: number) => (
            <View key={index} style={styles.noteItem}>
              <View style={styles.noteItemInfo}>
                <Text style={styles.noteItemTitle}>{note.title}</Text>
                <Text style={styles.noteItemDate}>{note.date} • Coef. {note.coef}</Text>
              </View>
              <View style={[styles.noteItemScoreBadge, { backgroundColor: `${color}15` }]}>
                <Text style={[styles.noteItemScoreText, { color }]}>{note.value}</Text>
                <Text style={[styles.noteItemScoreMax, { color }]}> / 20</Text>
              </View>
            </View>
          ))}
          {(!notes || notes.length === 0) && (
            <Text style={styles.noNotesText}>Aucune note saisie pour le moment.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  subjectInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectColorBar: {
    width: 6,
    height: 48,
    borderRadius: 3,
    marginRight: 12,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  subjectTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.onSurface,
    marginRight: 8,
  },
  coefBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coefText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.onPrimaryFixedVariant,
  },
  teacherText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.onSurfaceVariant,
  },
  subjectScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  expandedContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: `${COLORS.surfaceContainerLow}60`,
  },
  notesCountText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.onSurfaceVariant,
    marginRight: 6,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteItemInfo: {
    flex: 1,
  },
  noteItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  noteItemDate: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.onSurfaceVariant,
  },
  noteItemScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  noteItemScoreText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONTS.extraBold,
  },
  noteItemScoreMax: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
  },
  noNotesText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    padding: 12,
    textAlign: 'center',
  },
});
