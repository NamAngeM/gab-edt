import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { SubjectCard } from '../components/SubjectCard';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const NotesScreen = () => {
  const { userRole } = useAuth();
  const navigation = useNavigation<any>();
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/subjects');
      
      if (response.data?.success) {
        const colors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.outline, COLORS.td];
        
        const mapped = response.data.data.map((sub: any, index: number) => ({
          id: sub.id,
          title: sub.name || "Matière",
          coef: sub.coefficient?.toString() || "1",
          teacher: sub.department?.name || "Non assigné", // En attendant la liaison prof-matière
          color: colors[index % colors.length],
          notes: [] // Les notes réelles devront provenir d'un autre endpoint
        }));
        
        setSubjectsData(mapped);
      }
    } catch (error) {
      console.error("Erreur récupération matières:", error);
      Alert.alert("Erreur", "Impossible de charger les enseignements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

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
        <Text style={styles.subjectsSectionSubtitle}>{subjectsData.length} Enseignements</Text>
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (userRole === 'TEACHER') {
    return (
      <View style={[styles.container, { flex: 1 }]}>
        <View style={styles.subjectsSectionHeader}>
          <Text style={styles.subjectsSectionTitle}>Mes Classes (Évaluations)</Text>
          <Text style={styles.subjectsSectionSubtitle}>Sélectionnez une classe pour saisir des notes</Text>
        </View>

        <TouchableOpacity 
          style={styles.teacherClassCard}
          onPress={() => navigation.navigate('AddGrade', { className: 'Terminale Scientifique S2' })}
        >
          <View style={styles.teacherClassIcon}>
            <Feather name="users" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherClassName}>Terminale Scientifique S2</Text>
            <Text style={styles.teacherClassInfo}>Mathématiques • 35 élèves</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.outline} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.teacherClassCard}
          onPress={() => navigation.navigate('AddGrade', { className: '1ère ES' })}
        >
          <View style={styles.teacherClassIcon}>
            <Feather name="users" size={24} color={COLORS.tertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherClassName}>1ère ES</Text>
            <Text style={styles.teacherClassInfo}>Mathématiques • 28 élèves</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.outline} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={subjectsData}
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
      ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: COLORS.slate500}}>Aucune matière trouvée.</Text>}
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
  },
  teacherClassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  teacherClassIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teacherClassName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  teacherClassInfo: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 4,
  }
});
