import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const ActuScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.outline} style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher une actualité..."
            placeholderTextColor={COLORS.outline}
          />
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="tune" size={18} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          <TouchableOpacity style={styles.filterPillActive}>
            <Text style={styles.filterPillActiveText}>Tout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPillInactive}>
            <View style={styles.errorDot} />
            <Text style={styles.filterPillInactiveText}>Urgences & Avis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPillInactive}>
            <Text style={styles.filterPillInactiveText}>Vie Scolaire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPillInactive}>
            <Text style={styles.filterPillInactiveText}>Examens & Bacs</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* A la une */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="campaign" size={18} color={COLORS.primary} />
          <Text style={styles.headerTitle}>À LA UNE • DIRECTION</Text>
        </View>
        <Text style={styles.headerLive}>En direct</Text>
      </View>

      <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
        <View style={styles.heroImageContainer}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Wyuzoti8Rl8w855jiWpndQngIoki3sHnGAT75A1CVXu5RycYoMlVFsMGSjnFd07ui5_O9p4evgtpxci2-GuDFFAUm8q4mQLnuPKg2Hm-MqpelOOkwdEzOriDEslCuPS5pHODDQtN3jvxFYSM_Fi6oeFkywj6oRIQJ5YWmGcpaz9Tz5MXFWl19zucFlR99H23Sdakq6Cc5j4Y6JJD1o0y76c5jwURSXuWPgSfr9qewH-ms7Z58Lqd' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroImportantBadge}>
            <View style={styles.whitePulseDot} />
            <Text style={styles.heroImportantText}>IMPORTANT</Text>
          </View>
          <View style={styles.heroReadTimeBadge}>
            <MaterialIcons name="schedule" size={14} color={COLORS.inverseOnSurface} />
            <Text style={styles.heroReadTimeText}>2 min</Text>
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroSub}>Note Officielle N° 402/DES-LNLM</Text>
            <Text style={styles.heroMain}>Calendrier des devoirs surveillés - 1er Trimestre</Text>
          </View>
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroDescription} numberOfLines={2}>
            La Direction des Études informe l'ensemble des professeurs principaux et des élèves de Seconde, Première et Terminale que la première vague d'évaluations communes débutera dès le 14 Octobre.
          </Text>
          <View style={styles.heroFooter}>
            <View style={styles.heroTimeRow}>
              <MaterialIcons name="history" size={16} color={COLORS.outline} />
              <Text style={styles.heroTimeText}>Publié il y a 2h</Text>
            </View>
            <View style={styles.heroActionRow}>
              <Text style={styles.heroActionText}>Consulter</Text>
              <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Flux de l'établissement */}
      <View style={[styles.headerRow, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Flux de l'Établissement</Text>
        <Text style={styles.headerLive}>Cette semaine</Text>
      </View>

      <TouchableOpacity style={styles.articleCard} activeOpacity={0.8}>
        <View style={styles.articleHeader}>
          <View style={[styles.articleCategoryBadge, { backgroundColor: COLORS.primaryFixed }]}>
            <Text style={[styles.articleCategoryText, { color: COLORS.onPrimaryFixed }]}>Vie Scolaire</Text>
          </View>
          <Text style={styles.articleDate}>22 Sept • 14:30</Text>
        </View>
        <View style={styles.articleBody}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyBJQTE5KXeZsTH8OI4dzut1CDrVSp443G6OqmMUPqf7usPRFhGw5qw8euiSJ8Ds1orpOC4AxyedXa6Tykz6DjhWuxDfDpukGt0wbCslnAjqMb-k11KoOhEIPPc5pNuH358ioElfrmgF-OfPdVsExi8NEYbudDIG0_Zz0aeDopgNocUXCPQJdFvJ_9awuV4_LLhlY_nb5S4KG7Jm9_AC7t0-B5kf9pHWt9Tbm9bC8YU167jDkXOICp' }}
            style={styles.articleImage}
          />
          <View style={styles.articleTextContent}>
            <Text style={styles.articleTitle} numberOfLines={2}>
              Cérémonie de remise des prix d'excellence scientifique
            </Text>
            <Text style={styles.articleDesc} numberOfLines={2}>
              Félicitations aux 18 lauréats du Club Robotique et Olympiades de Physique qui ont brillé au concours national.
            </Text>
          </View>
        </View>
        <View style={styles.articleFooter}>
          <View style={styles.articleHighlight}>
            <MaterialIcons name="military-tech" size={16} color={COLORS.secondary} />
            <Text style={styles.articleHighlightText}>18 Lauréats honorés</Text>
          </View>
          <View style={styles.articleActionBox}>
            <Text style={styles.articleActionBtn}>Lire la suite</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.articleCard} activeOpacity={0.8}>
        <View style={styles.articleHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.articleCategoryBadge, { backgroundColor: COLORS.secondaryContainer, marginRight: 6 }]}>
              <Text style={[styles.articleCategoryText, { color: COLORS.onSecondaryContainer }]}>Scolarité</Text>
            </View>
            <View style={[styles.articleCategoryBadge, { backgroundColor: COLORS.surfaceContainerHighest }]}>
              <MaterialIcons name="verified" size={12} color={COLORS.onPrimaryFixedVariant} style={{ marginRight: 2 }} />
              <Text style={[styles.articleCategoryText, { color: COLORS.onPrimaryFixedVariant }]}>Ministère</Text>
            </View>
          </View>
          <Text style={styles.articleDate}>20 Sept</Text>
        </View>
        <View style={styles.articleBodyNoImage}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            Avis aux élèves de Terminale : Inscription aux épreuves du Baccalauréat 2026/2027
          </Text>
          <Text style={styles.articleDesc} numberOfLines={2}>
            La vérification des pièces d'état civil est ouverte auprès du secrétariat du Proviseur Adjoint jusqu'au 5 Novembre.
          </Text>
        </View>
        <View style={styles.documentCard}>
          <View style={styles.documentInfo}>
            <MaterialIcons name="assignment" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.documentTitle}>Dossier candidature Bac</Text>
              <Text style={styles.documentMeta}>Format PDF • 1.4 Mo</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <MaterialIcons name="download" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

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
  searchSection: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  filterButton: {
    padding: 4,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    gap: 8,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillActiveText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterPillInactiveText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  headerLive: {
    fontSize: 10,
    color: COLORS.outline,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  heroCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  heroImageContainer: {
    height: 180,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(19, 27, 46, 0.4)',
  },
  heroImportantBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  whitePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },
  heroImportantText: {
    color: COLORS.onError,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroReadTimeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 48, 68, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroReadTimeText: {
    color: COLORS.inverseOnSurface,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginBottom: 2,
  },
  heroMain: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroContent: {
    padding: 10,
  },
  heroDescription: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 8,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTimeText: {
    fontSize: 11,
    color: COLORS.outline,
    marginLeft: 4,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },

  articleCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleCategoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  articleDate: {
    fontSize: 10,
    color: COLORS.outline,
  },
  articleBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  articleBodyNoImage: {
    marginBottom: 10,
  },
  articleImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  articleTextContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 18,
    marginBottom: 4,
  },
  articleDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleHighlightText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  articleActionBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  articleActionBtn: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  documentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  documentMeta: {
    fontSize: 10,
    color: COLORS.outline,
  },
  downloadBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
  }
});
