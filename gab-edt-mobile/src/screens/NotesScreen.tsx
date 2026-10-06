import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { SubjectCard } from '../components/SubjectCard';
import { AnimatedCard } from '../components/AnimatedCard';
import { useAuth } from '../context/AuthContext';

export const NotesScreen = () => {
  const { userRole } = useAuth();
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const [responseSubjects, responseGrades] = await Promise.all([
        apiClient.get('/api/v1/subjects'),
        userRole === 'STUDENT' || userRole === 'PARENT' ? apiClient.get('/api/v1/grades/mine').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
      ]);
      
      if (responseSubjects.data?.success) {
        const colors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.outline, COLORS.td];
        const grades = responseGrades.data?.data || [];
        
        const mapped = responseSubjects.data.data.map((sub: any, index: number) => {
          // Find grades for this subject
          const subjectGrades = grades.filter((g: any) => g.subjectId === sub.id).map((g: any) => ({
            id: g.id,
            value: g.value,
            coef: g.coefficient || 1,
            title: g.title || "Évaluation"
          }));

          return {
            id: sub.id,
            title: sub.name || "Matière",
            coef: sub.coefficient?.toString() || "1",
            teacher: sub.department?.name || "Non assigné",
            color: colors[index % colors.length],
            notes: subjectGrades
          };
        });
        
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
      <View style={styles.subjectsSectionHeader}>
        <Text style={styles.subjectsSectionTitle}>Mes Notes</Text>
        <Text style={styles.subjectsSectionSubtitle}>{subjectsData.length} matière{subjectsData.length > 1 ? 's' : ''}</Text>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={{ height: 40 }} />
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={subjectsData}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <AnimatedCard index={index}>
          <SubjectCard
            title={item.title}
            coef={item.coef}
            teacher={item.teacher}
            color={item.color}
            notes={item.notes}
          />
        </AnimatedCard>
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
});
