import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';

export const RollCallScreen = ({ route, navigation }: any) => {
  const { eventId, title } = route.params;
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await apiClient.get(`/api/v1/schedule-events/${eventId}/attendance`);
      if (response.data?.success) {
        setStudents(response.data.data);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger la liste des élèves.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const updates = students.map(s => ({ studentId: s.studentId, status: s.status }));
      await apiClient.put(`/api/v1/schedule-events/${eventId}/attendance`, updates);
      Alert.alert("Succès", "L'appel a été enregistré avec succès.");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible d'enregistrer l'appel.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Appel : {title}</Text>
          <Text style={styles.subtitle}>{students.length} élèves inscrits</Text>
        </View>
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={saveAttendance}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="check" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.studentId}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>{item.studentFirstName.charAt(0)}{item.studentLastName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.studentName}>{item.studentFirstName} {item.studentLastName}</Text>
                <Text style={styles.studentNumber}>{item.studentNumber}</Text>
              </View>
            </View>

            <View style={styles.statusButtons}>
              <TouchableOpacity 
                style={[styles.statusBtn, item.status === 'PRESENT' && styles.statusBtnPresent]}
                onPress={() => handleStatusChange(item.studentId, 'PRESENT')}
              >
                <Text style={[styles.statusBtnText, item.status === 'PRESENT' && styles.statusBtnTextActive]}>P</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusBtn, item.status === 'LATE' && styles.statusBtnLate]}
                onPress={() => handleStatusChange(item.studentId, 'LATE')}
              >
                <Text style={[styles.statusBtnText, item.status === 'LATE' && styles.statusBtnTextActive]}>R</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusBtn, item.status === 'ABSENT' && styles.statusBtnAbsent]}
                onPress={() => handleStatusChange(item.studentId, 'ABSENT')}
              >
                <Text style={[styles.statusBtnText, item.status === 'ABSENT' && styles.statusBtnTextActive]}>A</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  listContainer: {
    padding: 16,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.onSecondaryContainer,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  studentNumber: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  statusBtnTextActive: {
    color: '#FFF',
  },
  statusBtnPresent: {
    backgroundColor: '#10B981', // emerald-500
  },
  statusBtnLate: {
    backgroundColor: '#F59E0B', // amber-500
  },
  statusBtnAbsent: {
    backgroundColor: '#EF4444', // red-500
  },
});
