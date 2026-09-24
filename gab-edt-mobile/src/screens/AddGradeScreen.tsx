import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';

export const AddGradeScreen = ({ route, navigation }: any) => {
  const { className } = route.params || { className: 'Ma Classe' };
  
  const [title, setTitle] = useState('');
  const [coef, setCoef] = useState('1');
  const [grades, setGrades] = useState<{[key: string]: string}>({});
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // We fetch all active students for this demo
        const res = await apiClient.get('/api/v1/students?active=true&size=100');
        if (res.data?.success && res.data.data?.content) {
          setStudents(res.data.data.content);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Erreur", "Impossible de charger la liste des élèves.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleGradeChange = (id: string, value: string) => {
    // Only allow numbers and comma/dot
    const formatted = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setGrades(prev => ({ ...prev, [id]: formatted }));
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert("Erreur", "Veuillez saisir un titre pour le devoir.");
      return;
    }

    const payloadGrades = Object.keys(grades).map(studentId => ({
      studentId,
      value: parseFloat(grades[studentId])
    })).filter(g => !isNaN(g.value));

    if (payloadGrades.length === 0) {
      Alert.alert("Erreur", "Veuillez saisir au moins une note.");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/api/v1/grades/bulk', {
        title,
        coefficient: parseFloat(coef) || 1.0,
        grades: payloadGrades
      });
      Alert.alert("Succès", "Les notes ont été enregistrées avec succès.");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible d'enregistrer les notes. Vérifiez que le serveur est à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Saisie des notes</Text>
          <Text style={styles.subtitle}>{className}</Text>
        </View>
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          disabled={saving || loading}
        >
          {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="check" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Détails de l'évaluation</Text>
          
          <Text style={styles.label}>Titre du devoir *</Text>
          <TextInput 
            style={styles.input} 
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Contrôle de mi-semestre"
          />

          <Text style={styles.label}>Coefficient</Text>
          <TextInput 
            style={styles.input} 
            value={coef}
            onChangeText={setCoef}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.sectionTitle}>Liste des élèves ({students.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          students.map(student => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
                  <Text style={styles.studentNumber}>{student.studentNumber || 'Sans matricule'}</Text>
                </View>
              </View>
              
              <View style={styles.gradeInputContainer}>
                <TextInput 
                  style={styles.gradeInput}
                  value={grades[student.id] || ''}
                  onChangeText={(val) => handleGradeChange(student.id, val)}
                  keyboardType="numeric"
                  placeholder="-- / 20"
                  maxLength={5}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.onSurface,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.onSecondaryContainer,
    fontWeight: 'bold',
    fontSize: 12,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  studentNumber: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  gradeInputContainer: {
    width: 80,
  },
  gradeInput: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  }
});
