import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

// Mock justifications
const MOCK_MESSAGES = [
  { id: '1', date: '15 Sept 2026', motif: 'Maladie (Gastro)', status: 'Validé', attached: true },
  { id: '2', date: '02 Oct 2026', motif: 'Rendez-vous médical', status: 'En attente', attached: true }
];

export const LiaisonScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [motif, setMotif] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSubmit = () => {
    if (!motif) {
      Alert.alert("Erreur", "Veuillez renseigner un motif.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessages([{
        id: Math.random().toString(),
        date: "Aujourd'hui",
        motif: motif,
        status: 'En attente',
        attached: true
      }, ...messages]);
      setShowForm(false);
      setMotif('');
      setDetails('');
      Alert.alert("Succès", "Votre justificatif a été transmis à la scolarité.");
    }, 1500);
  };

  if (showForm) {
    return (
      <View style={styles.container}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={() => setShowForm(false)} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.formTitle}>Nouvelle justification</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.label}>Motif de l'absence</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: Maladie, Rendez-vous..."
            value={motif}
            onChangeText={setMotif}
          />

          <Text style={styles.label}>Détails supplémentaires (optionnel)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Ajoutez un commentaire pour le professeur..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />

          <TouchableOpacity style={styles.attachBtn}>
            <Feather name="camera" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
            <Text style={styles.attachBtnText}>Prendre en photo le certificat</Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>Veuillez fournir un certificat médical valide ou un mot d'excuse signé.</Text>

          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Envoyer à la scolarité</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Carnet de Liaison</Text>
          <Text style={styles.subtitle}>Gérez les absences et retards de votre enfant</Text>
        </View>
        <MaterialIcons name="menu-book" size={32} color={COLORS.primary} />
      </View>

      <TouchableOpacity style={styles.newActionCard} onPress={() => setShowForm(true)}>
        <View style={styles.newActionIcon}>
          <Feather name="plus" size={24} color="#FFF" />
        </View>
        <View style={styles.newActionTexts}>
          <Text style={styles.newActionTitle}>Justifier une absence</Text>
          <Text style={styles.newActionSubtitle}>Transmettre un mot ou certificat</Text>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Historique des envois</Text>
      
      <FlatList 
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageDate}>{item.date}</Text>
              <View style={[styles.statusBadge, item.status === 'Validé' ? styles.statusValidated : styles.statusPending]}>
                <Text style={[styles.statusText, item.status === 'Validé' ? styles.statusTextValidated : styles.statusTextPending]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.messageMotif}>{item.motif}</Text>
            
            {item.attached && (
              <View style={styles.attachment}>
                <Feather name="paperclip" size={14} color={COLORS.outline} style={{ marginRight: 6 }} />
                <Text style={styles.attachmentText}>Pièce jointe (Certificat)</Text>
              </View>
            )}
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
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.outline,
    marginTop: 2,
  },
  newActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  newActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  newActionTexts: {
    flex: 1,
  },
  newActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  newActionSubtitle: {
    fontSize: 13,
    color: COLORS.slate600,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusValidated: {
    backgroundColor: '#D1FAE5', // emerald-100
  },
  statusPending: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextValidated: {
    color: '#059669', // emerald-600
  },
  statusTextPending: {
    color: '#D97706', // amber-600
  },
  messageMotif: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  attachmentText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  
  // Form Styles
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    marginRight: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  formContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}15`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  attachBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    marginBottom: 30,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
