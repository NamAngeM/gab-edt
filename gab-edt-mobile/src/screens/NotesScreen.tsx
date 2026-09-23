import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

import { SubjectCard } from '../components/SubjectCard';

const SUBJECTS_DATA = [
  {
    id: 'maths',
    title: "Mathématiques",
    coef: "6",
    teacher: "M. Ndong Mba",
    color: COLORS.primary,
    notes: [
      { title: 'Devoir Surveillé 1', date: '18 Sept', coef: 2, score: '17' },
      { title: 'Interrogation écrite', date: '05 Oct', coef: 1, score: '14,5' },
    ]
  },
  {
    id: 'physique',
    title: "Sciences Physiques",
    coef: "5",
    teacher: "Mme Ondo",
    color: COLORS.tertiary,
    notes: [
      { title: 'TP Pratique Optique', date: '02 Oct', coef: 1, score: '15,5' },
    ]
  },
  {
    id: 'svt',
    title: "SVT",
    coef: "5",
    teacher: "Sciences de la Vie et de la Terre",
    color: COLORS.secondary,
    notes: [
      { title: 'Évaluation de synthèse', date: '25 Sept', coef: 2, score: '16' },
      { title: 'Exposé', date: '10 Oct', coef: 1, score: '14' },
    ]
  },
  {
    id: 'anglais',
    title: "Anglais (LV1)",
    coef: "2",
    teacher: "Mme Walker",
    color: COLORS.td,
    notes: [
      { title: 'Compréhension orale', date: '28 Sept', coef: 1, score: '18' },
    ]
  },
  {
    id: 'histoire',
    title: "Histoire-Géographie",
    coef: "3",
    teacher: "M. Essone",
    color: COLORS.outline,
    notes: []
  }
];

export const NotesScreen = () => {

  const renderHeader = () => (
    <>
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
        <Text style={styles.subjectsSectionSubtitle}>{SUBJECTS_DATA.length} Enseignements</Text>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      {/* Download button */}
      <TouchableOpacity style={styles.downloadButton}>
        <Feather name="download" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
        <Text style={styles.downloadButtonText}>Télécharger le relevé PDF officiel</Text>
      </TouchableOpacity>
      <Text style={styles.officialText}>
        <Text style={{ color: COLORS.secondary, fontSize: 16 }}>•</Text> Cachet officiel : Lycée National Léon Mba • Libreville
      </Text>
      <View style={{ height: 40 }} />
    </>
  );

  return (
    <FlatList
      data={SUBJECTS_DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SubjectCard 
          title={item.title}
          coef={item.coef}
          teacher={item.teacher}
          color={item.color}
          notes={item.notes}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
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
