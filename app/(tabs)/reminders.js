import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';
import HeaderBar from '../../src/components/HeaderBar';
import ServiceBadge from '../../src/components/ServiceBadge';
import { getActiveVehicle, getVehicleReminders, updateReminderRule } from '../../src/db/database';
import { formatKm, formatDate, getDocumentStatus } from '../../src/utils/formatters';

export default function RemindersScreen() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editKm, setEditKm] = useState('');
  const [editDays, setEditDays] = useState('');

  const openEditRule = (rule) => {
    setEditingRule(rule);
    setEditKm(rule.interval_km ? rule.interval_km.toString() : '');
    setEditDays(rule.interval_days ? rule.interval_days.toString() : '');
  };

  const handleSaveRule = () => {
    if (!editingRule) return;
    const kmNum = parseInt(editKm.replace(/\D/g, ''), 10) || null;
    const daysNum = parseInt(editDays.replace(/\D/g, ''), 10) || null;

    try {
      updateReminderRule({
        id: editingRule.id,
        intervalKm: kmNum,
        intervalDays: daysNum,
        notifyBeforeKm: editingRule.notify_before_km,
        notifyBeforeDays: editingRule.notify_before_days,
        isActive: 1,
      });
      setEditingRule(null);
      loadData();
    } catch (e) {
      console.error('Error updating reminder rule:', e);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui aturan pengingat.');
    }
  };

  const handleDeactivateRule = () => {
    if (!editingRule) return;
    Alert.alert(
      'Nonaktifkan Pengingat',
      `Nonaktifkan pengingat servis untuk "${editingRule.service_type}"? Anda dapat mengaktifkannya kembali sewaktu-waktu.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Nonaktifkan',
          style: 'destructive',
          onPress: () => {
            updateReminderRule({
              id: editingRule.id,
              intervalKm: editingRule.interval_km,
              intervalDays: editingRule.interval_days,
              notifyBeforeKm: editingRule.notify_before_km,
              notifyBeforeDays: editingRule.notify_before_days,
              isActive: 0,
            });
            setEditingRule(null);
            loadData();
          },
        },
      ]
    );
  };

  const loadData = useCallback(() => {
    try {
      const active = getActiveVehicle();
      setVehicle(active);
      if (active) {
        const rems = getVehicleReminders(active.id);
        setReminders(rems);
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error('Error loading reminders:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const pkbStatus = vehicle ? getDocumentStatus(vehicle.tax_due_date) : null;
  const stnkStatus = vehicle ? getDocumentStatus(vehicle.stnk_expiry_date) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        vehicle={vehicle}
        onVehicleChanged={loadData}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
              setRefreshing(false);
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Local Notification Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.bannerIconWrapper}>
            <MaterialIcons name="notifications-active" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Pengingat Lokal Otomatis</Text>
            <Text style={styles.bannerSub}>
              Notifikasi aktif pada ambang 500 km atau 7 hari sebelum jatuh tempo.
            </Text>
          </View>
        </View>

        {/* Section: Dokumen & Pajak Kendaraan */}
        {vehicle && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="fact-check" size={18} color={COLORS.secondary} />
              <Text style={styles.sectionTitle}>Pajak & Masa Berlaku STNK</Text>
            </View>

            <View style={styles.docItemCard}>
              <View style={styles.docLeft}>
                <View style={[styles.docIcon, { backgroundColor: COLORS.secondaryContainer }]}>
                  <MaterialIcons name="receipt-long" size={18} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.docName}>Pajak Tahunan (PKB)</Text>
                  <Text style={styles.docDueDate}>Jatuh tempo: {formatDate(vehicle.tax_due_date)}</Text>
                </View>
              </View>
              {pkbStatus && (
                <View style={[styles.docPill, { backgroundColor: pkbStatus.bg, borderColor: pkbStatus.border }]}>
                  <Text style={[styles.docPillText, { color: pkbStatus.color }]}>{pkbStatus.label}</Text>
                </View>
              )}
            </View>

            <View style={styles.docItemCard}>
              <View style={styles.docLeft}>
                <View style={[styles.docIcon, { backgroundColor: '#DCFCE7' }]}>
                  <MaterialIcons name="assignment" size={18} color={COLORS.tertiary} />
                </View>
                <View>
                  <Text style={styles.docName}>STNK 5 Tahunan & Plat</Text>
                  <Text style={styles.docDueDate}>Berlaku s/d: {formatDate(vehicle.stnk_expiry_date)}</Text>
                </View>
              </View>
              {stnkStatus && (
                <View style={[styles.docPill, { backgroundColor: stnkStatus.bg, borderColor: stnkStatus.border }]}>
                  <Text style={[styles.docPillText, { color: stnkStatus.color }]}>{stnkStatus.label}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Section: Aturan Servis Berkala */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Aturan Pengingat Servis</Text>
          <Text style={styles.activeRulesCount}>{reminders.length} Aturan Aktif</Text>
        </View>

        {reminders.map((r) => {
          const dueKm = (r.last_done_km || 0) + (r.interval_km || 0);
          const currentKm = vehicle?.odometer_km || 0;
          const remainingKm = Math.max(0, dueKm - currentKm);
          const percentUsed = Math.min(100, Math.max(0, (currentKm - (r.last_done_km || 0)) / (r.interval_km || 1) * 100));

          const isOverdue = remainingKm <= 0;
          const isWarning = remainingKm <= (r.notify_before_km || 500);
          const badgeBg = isOverdue ? '#FEE2E2' : isWarning ? '#FEF3C7' : COLORS.surfaceRaised;
          const badgeBorder = isOverdue ? '#FECACA' : isWarning ? '#FDE68A' : COLORS.border;
          const badgeColor = isOverdue ? COLORS.error : isWarning ? COLORS.warning : COLORS.primary;
          const barColor = isOverdue ? COLORS.error : isWarning ? COLORS.warning : COLORS.primary;
          const labelText = isOverdue ? 'Jatuh Tempo!' : `Sisa ~${formatKm(remainingKm)}`;

          return (
            <TouchableOpacity
              key={r.id}
              style={styles.reminderCard}
              activeOpacity={0.8}
              onPress={() => openEditRule(r)}
            >
              <View style={styles.reminderHeader}>
                <ServiceBadge type={r.service_type} size="md" />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.remainingBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                    <Text style={[styles.remainingText, { color: badgeColor }]}>{labelText}</Text>
                  </View>
                  <MaterialIcons name="tune" size={16} color={COLORS.primary} />
                </View>
              </View>

              <View style={styles.ruleMetricsGrid}>
                <View style={styles.ruleMetricCol}>
                  <Text style={styles.ruleMetricLabel}>Interval Pengingat</Text>
                  <Text style={styles.ruleMetricVal}>
                    {r.interval_km ? formatKm(r.interval_km) : ''}
                    {r.interval_days ? ` / ${r.interval_days} hari` : ''}
                  </Text>
                </View>
                <View style={styles.ruleMetricCol}>
                  <Text style={styles.ruleMetricLabel}>Terakhir Servis</Text>
                  <Text style={styles.ruleMetricVal}>
                    {formatKm(r.last_done_km)} ({formatDate(r.last_done_date)})
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${percentUsed}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progLabel}>{formatKm(r.last_done_km)}</Text>
                  <Text style={[styles.progLabel, { color: COLORS.text }]}>Target: {formatKm(dueKm)}</Text>
                </View>
              </View>
              <Text style={styles.tapToEditRuleText}>Ketuk untuk sesuaikan interval jarak / hari</Text>
            </TouchableOpacity>
          );
        })}

        {reminders.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={40} color={COLORS.textSubtle} />
            <Text style={styles.emptyText}>Belum ada aturan pengingat servis.</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Rule Modal */}
      {editingRule && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEditingRule(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sesuaikan Interval Servis</Text>
                <TouchableOpacity onPress={() => setEditingRule(null)}>
                  <MaterialIcons name="close" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Ubah patokan interval untuk perawatan{' '}
                <Text style={{ color: COLORS.primary, fontFamily: FONTS.headingSemiBold }}>
                  {editingRule.service_type.toUpperCase()}
                </Text>
              </Text>

              <View style={styles.modalForm}>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>INTERVAL KILOMETER (KM)</Text>
                  <View style={styles.modalInputWrap}>
                    <TextInput
                      style={styles.modalInput}
                      value={editKm}
                      onChangeText={setEditKm}
                      keyboardType="numeric"
                      placeholder="Contoh: 2000"
                      placeholderTextColor={COLORS.textSubtle}
                    />
                    <Text style={styles.modalUnit}>KM</Text>
                  </View>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>INTERVAL WAKTU (HARI)</Text>
                  <View style={styles.modalInputWrap}>
                    <TextInput
                      style={styles.modalInput}
                      value={editDays}
                      onChangeText={setEditDays}
                      keyboardType="numeric"
                      placeholder="Contoh: 60"
                      placeholderTextColor={COLORS.textSubtle}
                    />
                    <Text style={styles.modalUnit}>Hari</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveRule}
                activeOpacity={0.85}
              >
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.modalSaveText}>Simpan Aturan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeactivateBtn}
                onPress={handleDeactivateRule}
                activeOpacity={0.7}
              >
                <MaterialIcons name="visibility-off" size={18} color={COLORS.error} />
                <Text style={styles.modalDeactivateText}>Nonaktifkan Pengingat Ini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.lg,
  },
  statusBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bannerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 13,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  bannerSub: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  docItemCard: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 13,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
  },
  docDueDate: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  docPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  docPillText: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.secondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  activeRulesCount: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
  },
  reminderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remainingBadge: {
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  remainingText: {
    fontSize: 11,
    fontFamily: FONTS.heading,
    color: COLORS.primary,
  },
  ruleMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceRaised,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ruleMetricCol: {
    gap: 3,
  },
  ruleMetricLabel: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
  },
  ruleMetricVal: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
  },
  progressContainer: {
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progLabel: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  tapToEditRuleText: {
    fontSize: 10,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: COLORS.text,
  },
  modalSub: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  modalForm: {
    gap: SPACING.sm,
    marginVertical: 4,
  },
  modalInputGroup: {
    gap: 4,
  },
  modalInputLabel: {
    fontSize: 10,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textSubtle,
    letterSpacing: 1,
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.monoBold,
    color: COLORS.text,
    height: '100%',
  },
  modalUnit: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  modalSaveText: {
    fontSize: 14,
    fontFamily: FONTS.headingBold,
    color: '#FFFFFF',
  },
  modalDeactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  modalDeactivateText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
  },
});
