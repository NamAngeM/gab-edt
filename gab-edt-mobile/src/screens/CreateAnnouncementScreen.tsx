import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CreateAnnouncementScreen = ({ navigation }: any) => {
  const { userRole } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('GENERAL');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert("Erreur", "Le titre et le contenu sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/api/v1/communication/announcements', {
        title,
        content,
        targetAudience,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
        authorId: null // Handled by backend context
      });
      Alert.alert("Succès", "Votre annonce a été publiée.");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de publier l'annonce.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Créer une annonce</Text>
        <TouchableOpacity 
          style={[styles.saveBtn, (!title || !content) && styles.saveBtnDisabled]} 
          onPress={handleSubmit}
          disabled={saving || !title || !content}
        >
          {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Publier</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Titre de l'annonce</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ex: Absence exceptionnelle"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Contenu du message</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Rédigez votre annonce ici..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        <Text style={styles.label}>Audience cible</Text>
        <View style={styles.audienceContainer}>
          {[
            { id: 'GENERAL', label: 'Tout le monde' },
            { id: 'STUDENTS', label: 'Élèves' },
            { id: 'PARENTS', label: 'Parents' }
          ].map(aud => (
            <TouchableOpacity 
              key={aud.id}
              style={[styles.audiencePill, targetAudience === aud.id && styles.audiencePillActive]}
              onPress={() => setTargetAudience(aud.id)}
            >
              <Text style={[styles.audiencePillText, targetAudience === aud.id && styles.audiencePillActiveText]}>
                {aud.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    height: 120,
  },
  audienceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audiencePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  audiencePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  audiencePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  audiencePillActiveText: {
    color: '#FFF',
  }
});
