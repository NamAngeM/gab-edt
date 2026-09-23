import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';


const SubjectCard = ({ title, coef, teacher, notes, color }: any) => {
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
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.slate400} />
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
                <Text style={[styles.noteItemScoreText, { color }]}>{note.score}</Text>
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

export const NotesScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Bannière */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerIconBox}>
            <MaterialIcons name="verified" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Terminale Scientifique S2</Text>
            <Text style={styles.bannerSubtitle}>Année Scolaire 2024–2025 • Semaine 7</Text>
          </View>
        </View>
        <View style={styles.officialBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.officialBadgeText}>Arrêté officiel</Text>
        </View>
      </View>

      {/* Périodes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll} contentContainerStyle={styles.periodContent}>
        <TouchableOpacity style={styles.periodPillActive}>
          <View style={styles.periodPillDot} />
          <Text style={styles.periodPillActiveText}>Trimestre 1 (En cours)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.periodPillInactive}>
          <Text style={styles.periodPillInactiveText}>Trimestre 2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.periodPillInactive}>
          <Text style={styles.periodPillInactiveText}>Trimestre 3</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Matières */}
      <View style={styles.subjectsSectionHeader}>
        <Text style={styles.subjectsSectionTitle}>Détail des Matières</Text>
        <Text style={styles.subjectsSectionSubtitle}>6 Enseignements</Text>
      </View>

      <SubjectCard 
        title="Mathématiques" coef="6" teacher="M. Ndong Mba"
        color={COLORS.primary}
        notes={[
          { title: 'Devoir Surveillé 1', date: '18 Sept', coef: 2, score: '17' },
          { title: 'Interrogation écrite', date: '05 Oct', coef: 1, score: '14,5' },
        ]}
      />

      <SubjectCard 
        title="Sciences Physiques" coef="5" teacher="Mme Ondo"
        color={COLORS.tertiary}
        notes={[
          { title: 'TP Pratique Optique', date: '02 Oct', coef: 1, score: '15,5' },
        ]}
      />

      <SubjectCard 
        title="SVT" coef="5" teacher="Sciences de la Vie et de la Terre"
        color={COLORS.secondary}
        notes={[
          { title: 'Évaluation de synthèse', date: '25 Sept', coef: 2, score: '16' },
          { title: 'Exposé', date: '10 Oct', coef: 1, score: '14' },
        ]}
      />

      <SubjectCard 
        title="Anglais (LV1)" coef="2" teacher="Mme Walker"
        color={COLORS.td}
        notes={[
          { title: 'Compréhension orale', date: '28 Sept', coef: 1, score: '18' },
        ]}
      />

      <SubjectCard 
        title="Histoire-Géographie" coef="3" teacher="M. Essone"
        color={COLORS.outline}
        notes={[]}
      />

      {/* Download button */}
      <TouchableOpacity style={styles.downloadButton}>
        <Feather name="download" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
        <Text style={styles.downloadButtonText}>Télécharger le relevé PDF officiel</Text>
      </TouchableOpacity>
      <Text style={styles.officialText}>
        <Text style={{ color: COLORS.secondary, fontSize: 16 }}>•</Text> Cachet officiel : Lycée National Léon Mba • Libreville
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  banner: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 4,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSecondaryFixed,
  },
  
  periodScroll: {
    marginBottom: 12,
  },
  periodContent: {
    gap: 8,
    paddingVertical: 2,
  },
  periodPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  periodPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondaryFixed,
    marginRight: 6,
  },
  periodPillActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  periodPillInactive: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodPillInactiveText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },

  subjectsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  subjectsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subjectsSectionSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

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
    color: COLORS.onPrimaryFixedVariant,
  },
  teacherText: {
    fontSize: 11,
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
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  noteItemDate: {
    fontSize: 11,
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
  },
  noteItemScoreMax: {
    fontSize: 10,
    fontWeight: '600',
  },
  noNotesText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    padding: 12,
    textAlign: 'center',
  },

  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  officialText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
  }
});
