import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';
import HeaderBar from '../../src/components/HeaderBar';
import OdometerBox from '../../src/components/OdometerBox';
import ServiceBadge from '../../src/components/ServiceBadge';
import { getActiveVehicle, getVehicleRecords, getVehicleReminders } from '../../src/db/database';
import { formatRupiah, formatDate, formatKm } from '../../src/utils/formatters';

export default function GarasiScreen() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const active = getActiveVehicle();
      setVehicle(active);
      if (active) {
        const records = getVehicleRecords(active.id);
        setRecentRecords(records.slice(0, 3));
        const rems = getVehicleReminders(active.id);
        setReminders(rems);
      }
    } catch (e) {
      console.error('Error loading garasi data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const nextReminder = reminders.length > 0 ? reminders[0] : null;

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Empty Vehicle Onboard Card */}
        {!vehicle && (
          <View style={styles.noVehicleCard}>
            <MaterialIcons name="two-wheeler" size={44} color={COLORS.textSubtle} />
            <Text style={styles.noVehicleTitle}>Belum Ada Kendaraan</Text>
            <Text style={styles.noVehicleSub}>
              Tambahkan motor atau mobil Anda untuk mulai memantau odometer dan jadwal perawatan.
            </Text>
            <TouchableOpacity
              style={styles.addFirstVehicleBtn}
              onPress={() => router.push('/vehicles/new')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addFirstVehicleText}>Tambah Kendaraan Pertama</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Vehicle Chassis Card */}
        {vehicle && (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleIconWrapper}>
                  <MaterialIcons
                    name={vehicle.type === 'mobil' ? 'directions-car' : 'two-wheeler'}
                    size={22}
                    color={COLORS.primary}
                  />
                </View>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>AKTIF</Text>
                    </View>
                  </View>
                  <Text style={styles.plateText}>{vehicle.plate || 'Tanpa Plat'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push({ pathname: '/vehicles/edit', params: { id: vehicle.id } })}
                activeOpacity={0.7}
              >
                <MaterialIcons name="tune" size={16} color={COLORS.secondary} />
                <Text style={styles.editBtnText}>Kelola</Text>
              </TouchableOpacity>
            </View>

            {/* Odometer Ribbon Display */}
            <View style={styles.odoWrapper}>
              <OdometerBox km={vehicle.odometer_km} label="Odometer Snapshot" />
            </View>

            {/* Tax & STNK Due Dates */}
            <View style={styles.docRow}>
              <View style={styles.docItem}>
                <MaterialIcons name="receipt-long" size={16} color={COLORS.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel} numberOfLines={1}>Pajak Tahunan</Text>
                  <Text style={styles.docValue} numberOfLines={1}>{formatDate(vehicle.tax_due_date)}</Text>
                </View>
              </View>
              <View style={styles.docDivider} />
              <View style={styles.docItem}>
                <MaterialIcons name="assignment" size={16} color={COLORS.tertiary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel} numberOfLines={1}>STNK 5 Tahun</Text>
                  <Text style={styles.docValue} numberOfLines={1}>{formatDate(vehicle.stnk_expiry_date)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Service Action Card */}
        <TouchableOpacity
          style={styles.quickAddCard}
          activeOpacity={0.85}
          onPress={() => router.push('/records/new')}
        >
          <View style={styles.quickAddContent}>
            <View style={styles.quickAddIconWrapper}>
              <MaterialIcons name="flash-on" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.quickAddTexts}>
              <Text style={styles.quickAddTitle}>Catat Servis & BBM Cepat</Text>
              <Text style={styles.quickAddSub}>Kurang dari 30 detik • Otomatis hitung jadwal</Text>
            </View>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Next Due Service Card */}
        {nextReminder && (() => {
          const kmInterval = nextReminder.interval_km || 1;
          const kmPassed = Math.max(0, (vehicle?.odometer_km || 0) - (nextReminder.last_done_km || 0));
          const progressPct = Math.min(100, Math.max(0, Math.round((kmPassed / kmInterval) * 100)));
          const targetKm = (nextReminder.last_done_km || 0) + (nextReminder.interval_km || 0);
          const remainingKm = Math.max(0, targetKm - (vehicle?.odometer_km || 0));

          return (
            <View style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderTitleRow}>
                  <MaterialIcons name="schedule" size={18} color={COLORS.primary} />
                  <Text style={styles.cardSectionTitle}>Jadwal Servis Terdekat</Text>
                </View>
                <ServiceBadge type={nextReminder.service_type} size="sm" />
              </View>

              <View style={styles.reminderDetails}>
                <View style={styles.reminderMetric}>
                  <Text style={styles.metricLabel}>Target Odometer</Text>
                  <Text style={styles.metricValue}>
                    {formatKm(targetKm)}
                  </Text>
                </View>
                <View style={styles.reminderMetricRight}>
                  <Text style={styles.metricLabel}>Sisa Jarak</Text>
                  <Text style={[styles.metricValue, { color: remainingKm <= 0 ? COLORS.error : remainingKm <= 500 ? COLORS.warning : COLORS.primary }]}>
                    {remainingKm <= 0 ? 'Jatuh Tempo!' : `~${formatKm(remainingKm)}`}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPct}%`,
                      backgroundColor: remainingKm <= 0 ? COLORS.error : remainingKm <= 500 ? COLORS.warning : COLORS.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })()}

        {/* Recent Records List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Riwayat Terkini</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/records')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {recentRecords.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recordItem}
            activeOpacity={0.75}
            onPress={() => router.push({ pathname: '/records/edit', params: { id: item.id } })}
          >
            <View style={styles.recordTop}>
              <View style={styles.recordBadgeRow}>
                <ServiceBadge type={item.service_type} size="sm" />
                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.recordCost}>{formatRupiah(item.cost)}</Text>
                <MaterialIcons name="chevron-right" size={18} color={COLORS.textSubtle} />
              </View>
            </View>
            {item.notes ? (
              <Text style={styles.recordNotes} numberOfLines={2}>
                {item.notes}
              </Text>
            ) : null}
            <View style={styles.recordBottom}>
              <MaterialIcons name="speed" size={14} color={COLORS.textSubtle} />
              <Text style={styles.recordOdo}>{formatKm(item.odometer_km)}</Text>
              {item.liters ? (
                <Text style={styles.recordLiters}>• {item.liters} Liter</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        {recentRecords.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment-late" size={36} color={COLORS.textSubtle} />
            <Text style={styles.emptyText}>Belum ada riwayat catatan.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/records/new')}
            >
              <Text style={styles.emptyBtnText}>+ Catat Pertama Kali</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  vehicleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  vehicleIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleName: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  activePillText: {
    fontSize: 9,
    fontFamily: FONTS.heading,
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  plateText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtnText: {
    fontSize: 11,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.secondary,
  },
  odoWrapper: {
    marginTop: 2,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  docDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  docLabel: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
  },
  docValue: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
    marginTop: 2,
  },
  quickAddCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  quickAddContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  quickAddIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddTexts: {
    gap: 2,
  },
  quickAddTitle: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: '#FFFFFF',
  },
  quickAddSub: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: 'rgba(255, 255, 255, 0.9)',
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
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderMetric: {
    gap: 2,
  },
  reminderMetricRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
  },
  metricValue: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.primary,
  },
  recordItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  recordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordDate: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  recordCost: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  recordNotes: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  recordBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  recordOdo: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
  },
  recordLiters: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  emptyBtn: {
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyBtnText: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.primary,
  },
  noVehicleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noVehicleTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  noVehicleSub: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  addFirstVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    marginTop: 4,
    minHeight: 48,
  },
  addFirstVehicleText: {
    fontSize: 13,
    fontFamily: FONTS.headingSemiBold,
    color: '#FFFFFF',
  },
});
