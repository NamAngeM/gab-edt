import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const ServicesScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Carte d'Identité Numérique */}
      <View style={styles.idCard}>
        <View style={styles.idHeaderRow}>
          <View style={styles.idPhotoContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHJNKU99dUMqUFN_j-2-6aVd-U7IC5DpjLISiDlh0RducGjFcb4G6G1lDupt5r_VmzGkcuNVTZYsCvFumlDbHkdPB0v2iGFtwufdAtH0V8TbMhWSPgYsnFmau_amBkcmyPNByrKDSDRroE226mzH1mpPRM8FON7QYn3a8WB3vqLWR8zOOafwgAEZZ9o_YU-zZRoTJyU_PQ-sDcAG_nVh3neoGo3Mu_p-HV9gVDVWw7MM5gPb0A7GBq' }} 
              style={styles.idPhoto} 
            />
            <View style={styles.idActiveDot} />
          </View>
          <View style={styles.idInfoBox}>
            <View style={styles.idStatusRow}>
              <Text style={styles.idStatusText}>BADGE NUMÉRIQUE ACTIF</Text>
              <MaterialIcons name="verified" size={14} color={COLORS.secondary} />
            </View>
            <Text style={styles.idName}>Obame Kevin Nguema</Text>
            <Text style={styles.idDetails}>Terminale S2 • Mat. LMBA-2026</Text>
          </View>
          <TouchableOpacity style={styles.qrButton}>
            <MaterialIcons name="qr-code-2" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.idFooter}>
          <View style={styles.idFooterLeft}>
            <View style={styles.idFooterIconBox}>
              <MaterialIcons name="badge" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.idFooterTitle}>Accès Portique Principal</Text>
              <Text style={styles.idFooterSubtitle}>Valide jusqu'en Juillet 2026</Text>
            </View>
          </View>
          <View style={styles.idValidBadge}>
            <View style={styles.idValidDot} />
            <Text style={styles.idValidText}>En Règle</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconWrapper, { backgroundColor: `${COLORS.secondaryContainer}40` }]}>
              <MaterialIcons name="account-balance-wallet" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.statAddBadge}>
              <Text style={styles.statAddBadgeText}>+ Solde</Text>
            </View>
          </View>
          <Text style={styles.statLabel}>SOLDE CANTINE</Text>
          <Text style={styles.statValue}>14 500 <Text style={styles.statCurrency}>FCFA</Text></Text>
          <TouchableOpacity style={styles.statButtonPrimary}>
            <MaterialIcons name="add" size={16} color={COLORS.white} />
            <Text style={styles.statButtonPrimaryText}>Recharger</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconWrapper, { backgroundColor: COLORS.primaryFixed }]}>
              <MaterialIcons name="menu-book" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statCDIText}>CDI Central</Text>
          </View>
          <Text style={styles.statLabel}>PRÊTS EN COURS</Text>
          <Text style={styles.statValue}>2 <Text style={styles.statUnit}>ouvrages</Text></Text>
          <View style={styles.statFooterInfo}>
            <MaterialIcons name="schedule" size={14} color={COLORS.tertiary} />
            <Text style={styles.statReturnText}>Retour: 28 Sept</Text>
          </View>
        </View>
      </View>

      {/* Hub Services */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services de l'Élève</Text>
        <Text style={styles.sectionSubtitle}>6 MODULES</Text>
      </View>

      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={[styles.serviceIcon, { backgroundColor: COLORS.secondaryContainer }]}>
            <MaterialIcons name="restaurant" size={22} color={COLORS.secondary} />
          </View>
          <View style={styles.serviceHeaderText}>
            <Text style={styles.serviceTitle}>Cantine & Restauration</Text>
            <Text style={styles.serviceSubtitle}>Service de déjeuner • Réfectoire A</Text>
          </View>
          <View style={styles.serviceActiveDot} />
        </View>
        <View style={styles.serviceInnerBox}>
          <View style={styles.serviceInnerHeader}>
            <Text style={styles.serviceInnerTitle}><MaterialIcons name="lunch-dining" size={14} /> Menu du jour</Text>
            <Text style={styles.serviceInnerTime}>11h30 - 14h00</Text>
          </View>
          <View style={styles.menuItemsRow}>
            <Text style={styles.menuItem}>• Poulet Nyembwe</Text>
            <Text style={styles.menuItem}>• Poisson braisé</Text>
          </View>
        </View>
      </View>

      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={[styles.serviceIcon, { backgroundColor: COLORS.primaryFixed }]}>
            <MaterialIcons name="local-library" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.serviceHeaderText}>
            <Text style={styles.serviceTitle}>Bibliothèque & CDI</Text>
            <Text style={styles.serviceSubtitle}>Recherche et emprunts</Text>
          </View>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>Ouvert</Text>
          </View>
        </View>
      </View>

      {/* Assistance */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assistance & Vie Scolaire</Text>
        <View style={styles.bureauBadge}>
          <View style={styles.bureauDot} />
          <Text style={styles.bureauText}>Bureau Ouvert</Text>
        </View>
      </View>

      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD82etZYACpdDrO8hRHIT0Aiz6qLStli1eCJhiyda0srPSqJaj9OYmvRXaplXNxZJE1QWyeOfSFFZgzAseapr89zQ6T-l-Jg7To8zzSCSmw2lYunaZr2BqPNGWmQS8a2jHD2IJVUh_72lugG1DH1MF1_Vxgy7ihVU3EzFVWTYKjgYQ-E74kIocaS4vzCjyesLg-9zDcfviQ4Lap8obR3Q8iMePEIBWiAsmh1LQ7dkR7Nki9m3xjnS8Q' }}
            style={styles.cpePhoto}
          />
          <View style={styles.serviceHeaderText}>
            <Text style={styles.cpeRole}>CPE RÉFÉRENT • Cycle Terminal</Text>
            <Text style={styles.serviceTitle}>Mme Ondo Viviane</Text>
            <Text style={styles.serviceSubtitle}>Bureau Vie Scolaire 104</Text>
          </View>
          <TouchableOpacity style={styles.chatButton}>
            <MaterialIcons name="chat" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.absenceForm}>
          <Text style={styles.absenceTitle}>Signalement Rapide</Text>
          <Text style={styles.absenceSubtitle}>Absence / Retard</Text>
          <View style={styles.formRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>Retard (Transport)</Text>
              <MaterialIcons name="arrow-drop-down" size={20} />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>08:30</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <MaterialIcons name="send" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sendButtonText}>Transmettre à la Vie Scolaire</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  idCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  idHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  idPhotoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  idPhoto: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  idActiveDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
  },
  idInfoBox: {
    flex: 1,
  },
  idStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  idStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    marginRight: 4,
  },
  idName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  idDetails: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  qrButton: {
    padding: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 8,
  },
  idFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: 8,
  },
  idFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idFooterIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  idFooterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  idFooterSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  idValidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idValidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 4,
  },
  idValidText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSecondaryContainer,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statAddBadge: {
    backgroundColor: `${COLORS.secondaryFixed}40`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statAddBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  statCDIText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  statCurrency: {
    fontSize: 11,
    fontWeight: '600',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
  },
  statButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  statButtonPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 4,
  },
  statFooterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statReturnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.tertiary,
    marginLeft: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  
  serviceCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceHeaderText: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  serviceActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
  serviceInnerBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  serviceInnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceInnerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  serviceInnerTime: {
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  menuItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItem: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  serviceTag: {
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },

  bureauBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bureauDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 4,
  },
  bureauText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  cpePhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  cpeRole: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absenceForm: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },
  absenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  absenceSubtitle: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  inputText: {
    fontSize: 12,
    color: COLORS.onSurface,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  }
});
