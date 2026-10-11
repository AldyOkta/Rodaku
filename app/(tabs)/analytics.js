import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SERVICE_THEMES } from '../../src/constants/theme';
import HeaderBar from '../../src/components/HeaderBar';
import { getActiveVehicle, getVehicleRecords } from '../../src/db/database';
import { formatRupiah, formatKm } from '../../src/utils/formatters';

const PERIODS = ['30 Hari', '3 Bulan', 'Tahun Ini', 'Semua'];

export default function AnalyticsScreen() {
  const [vehicle, setVehicle] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Semua');
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState([]);

  const loadData = useCallback(() => {
    try {
      const active = getActiveVehicle();
      setVehicle(active);
      if (active) {
        const recs = getVehicleRecords(active.id);
        setRecords(recs);
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error('Error loading analytics:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter records based on selected period
  const filteredRecords = useMemo(() => {
    if (selectedPeriod === 'Semua') return records;

    const now = new Date();
    const todayMs = now.getTime();
    let daysCutoff = 365;

    if (selectedPeriod === '30 Hari') daysCutoff = 30;
    else if (selectedPeriod === '3 Bulan') daysCutoff = 90;
    else if (selectedPeriod === 'Tahun Ini') {
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
      return records.filter((r) => {
        const rDate = new Date(r.date).getTime();
        return rDate >= startOfYear;
      });
    }

    const cutoffMs = todayMs - daysCutoff * 24 * 60 * 60 * 1000;
    return records.filter((r) => new Date(r.date).getTime() >= cutoffMs);
  }, [records, selectedPeriod]);

  // Dynamic calculations from filtered records
  const totalCost = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  }, [filteredRecords]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const cats = {
      bbm: { cost: 0, count: 0, theme: SERVICE_THEMES.bbm },
      oli: { cost: 0, count: 0, theme: SERVICE_THEMES.oli },
      servis_berkala: { cost: 0, count: 0, theme: SERVICE_THEMES.servis_berkala },
      pajak: { cost: 0, count: 0, theme: SERVICE_THEMES.pajak },
      lainnya: { cost: 0, count: 0, theme: SERVICE_THEMES.lainnya },
    };

    filteredRecords.forEach((r) => {
      let key = r.service_type;
      if (key === 'stnk') key = 'pajak';
      if (!cats[key]) key = 'lainnya';

      cats[key].cost += r.cost || 0;
      cats[key].count += 1;
    });

    return Object.entries(cats)
      .filter(([_, val]) => val.cost > 0)
      .map(([key, val]) => ({
        key,
        cost: val.cost,
        count: val.count,
        theme: val.theme,
        pct: totalCost > 0 ? Math.round((val.cost / totalCost) * 100) : 0,
      }));
  }, [filteredRecords, totalCost]);

  // Fuel efficiency calculation (requires >= 2 fuel records with odo & liters)
  const fuelMetrics = useMemo(() => {
    const fuelLogs = filteredRecords
      .filter((r) => r.service_type === 'bbm' && r.liters && r.liters > 0 && r.odometer_km > 0)
      .sort((a, b) => a.odometer_km - b.odometer_km);

    if (fuelLogs.length < 2) {
      return {
        hasData: false,
        kmPerLiter: null,
        totalLiters: fuelLogs.reduce((sum, r) => sum + (r.liters || 0), 0),
        count: fuelLogs.length,
      };
    }

    const first = fuelLogs[0];
    const last = fuelLogs[fuelLogs.length - 1];
    const distance = last.odometer_km - first.odometer_km;
    // Sum liters of all fuel logs except the first reference fill
    const litersUsed = fuelLogs.slice(1).reduce((sum, r) => sum + (r.liters || 0), 0);

    const kmPerLiter = litersUsed > 0 && distance > 0 ? (distance / litersUsed).toFixed(1) : null;

    return {
      hasData: kmPerLiter !== null,
      kmPerLiter,
      distance,
      count: fuelLogs.length,
    };
  }, [filteredRecords]);

  // Cost per KM calculation
  const costPerKmMetric = useMemo(() => {
    if (filteredRecords.length < 2 || totalCost === 0) return null;

    const odometers = filteredRecords.map((r) => r.odometer_km).filter((o) => o > 0);
    if (odometers.length < 2) return null;

    const minOdo = Math.min(...odometers);
    const maxOdo = Math.max(...odometers);
    const distanceSpan = maxOdo - minOdo;

    if (distanceSpan <= 0) return null;
    return Math.round(totalCost / distanceSpan);
  }, [filteredRecords, totalCost]);

  // Monthly expenditure trend from actual records
  const monthlyTrend = useMemo(() => {
    const monthMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    records.forEach((r) => {
      if (!r.date) return;
      const parts = r.date.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const key = `${year}-${parts[1]}`;
        const label = `${monthNames[monthIdx]} ${year.slice(2)}`;

        if (!monthMap[key]) {
          monthMap[key] = { label, total: 0 };
        }
        monthMap[key].total += r.cost || 0;
      }
    });

    const sortedKeys = Object.keys(monthMap).sort().slice(-5);
    const result = sortedKeys.map((k) => monthMap[k]);
    const maxVal = Math.max(...result.map((m) => m.total), 1);

    return result.map((m) => ({
      label: m.label,
      total: m.total,
      heightPct: Math.max(15, Math.round((m.total / maxVal) * 90)),
    }));
  }, [records]);

  // Native share report
  const handleExport = async () => {
    if (!vehicle) return;

    try {
      const summaryText = [
        `*RODAKU - Laporan Operasional Kendaraan*`,
        `Kendaraan: ${vehicle.name} (${vehicle.plate || 'Tanpa Plat'})`,
        `Odometer Saat Ini: ${formatKm(vehicle.odometer_km)}`,
        `Periode Filter: ${selectedPeriod}`,
        `Total Pengeluaran: ${formatRupiah(totalCost)}`,
        `Total Catatan: ${filteredRecords.length} log`,
        categoryBreakdown.length > 0 ? '\nRincian Kategori:' : '',
        ...categoryBreakdown.map((c) => `- ${c.theme.label}: ${formatRupiah(c.cost)} (${c.pct}%)`),
        fuelMetrics.hasData ? `\nEfisiensi Rata-rata BBM: ${fuelMetrics.kmPerLiter} km/L` : '',
        costPerKmMetric ? `Estimasi Biaya per KM: ${formatRupiah(costPerKmMetric)}/km` : '',
        `\nDiekspor secara offline dari aplikasi Rodaku.`,
      ].filter(Boolean).join('\n');

      await Share.share({
        message: summaryText,
        title: `Laporan Servis ${vehicle.name}`,
      });
    } catch (e) {
      console.error('Error sharing analytics report:', e);
    }
  };

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
        {/* Time Horizon Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodRow}
        >
          {PERIODS.map((period) => {
            const isSelected = selectedPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[styles.periodPill, isSelected && styles.periodPillActive]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.7}
              >
                {isSelected && <View style={styles.periodDot} />}
                <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Master Banner: Total Biaya Operasional Riil */}
        <View style={styles.masterBanner}>
          <View style={styles.bannerHeader}>
            <View>
              <Text style={styles.bannerLabel}>TOTAL BIAYA OPERASIONAL</Text>
              <Text style={styles.bannerSubLabel}>
                Periode: {selectedPeriod} • {filteredRecords.length} Catatan
              </Text>
            </View>
          </View>

          <Text style={styles.totalCostDisplay}>{formatRupiah(totalCost)}</Text>

          <View style={styles.bannerStatsRow}>
            <View style={styles.bannerStat}>
              <View style={[styles.statDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.statLabel}>
                Kendaraan: <Text style={styles.statValBold}>{vehicle?.name || '-'}</Text>
              </Text>
            </View>
            <View style={styles.bannerStat}>
              <View style={[styles.statDot, { backgroundColor: COLORS.tertiary }]} />
              <Text style={styles.statLabel}>
                Odometer: <Text style={styles.statValBold}>{formatKm(vehicle?.odometer_km)}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 2-Column Supporting Dynamic Metrics */}
        <View style={styles.twoColumnGrid}>
          {/* Tile 1: Biaya per KM */}
          <View style={styles.metricTile}>
            <View style={styles.tileHeader}>
              <Text style={styles.tileLabel}>BIAYA PER KM</Text>
              <View style={styles.tileIconCircle}>
                <MaterialIcons name="speed" size={16} color={COLORS.tertiary} />
              </View>
            </View>
            <View style={styles.tileBody}>
              <Text style={styles.tileLargeNumber}>
                {costPerKmMetric ? formatRupiah(costPerKmMetric) : '-'}
              </Text>
              <Text style={styles.tileUnit}>per kilometer</Text>
            </View>
            <View style={styles.tileBadgePill}>
              <Text style={styles.tileBadgeText}>
                {costPerKmMetric ? 'Dari rentang odometer riil' : 'Butuh variasi catatan odo'}
              </Text>
            </View>
          </View>

          {/* Tile 2: Konsumsi BBM */}
          <View style={styles.metricTile}>
            <View style={styles.tileHeader}>
              <Text style={styles.tileLabel}>KONSUMSI BBM</Text>
              <View style={[styles.tileIconCircle, { backgroundColor: COLORS.secondaryContainer }]}>
                <MaterialIcons name="local-gas-station" size={16} color={COLORS.secondary} />
              </View>
            </View>
            <View style={styles.tileBody}>
              <View style={styles.numberWithUnit}>
                <Text style={styles.tileLargeNumber}>
                  {fuelMetrics.hasData ? fuelMetrics.kmPerLiter : '-'}
                </Text>
                {fuelMetrics.hasData && <Text style={styles.inlineUnit}>km/L</Text>}
              </View>
              <Text style={styles.tileUnit}>
                {fuelMetrics.hasData ? `Jarak ${formatKm(fuelMetrics.distance)}` : 'Metode full-to-full'}
              </Text>
            </View>
            <View style={styles.tileBadgePill}>
              <MaterialIcons
                name={fuelMetrics.hasData ? 'check-circle' : 'info'}
                size={12}
                color={fuelMetrics.hasData ? COLORS.primary : COLORS.textSubtle}
              />
              <Text style={styles.tileBadgeText}>
                {fuelMetrics.hasData
                  ? `${fuelMetrics.count}x pengisian bensin`
                  : 'Minimal 2x isi BBM'}
              </Text>
            </View>
          </View>
        </View>

        {/* Expense Breakdown Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardTitleRow}>
            <View style={styles.titleWithIcon}>
              <MaterialIcons name="pie-chart" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Komposisi Pengeluaran</Text>
            </View>
            <Text style={styles.itemCountText}>
              {categoryBreakdown.length} Kategori
            </Text>
          </View>

          {categoryBreakdown.length > 0 ? (
            <>
              {/* Multi-segment progress bar */}
              <View style={styles.multiBarContainer}>
                {categoryBreakdown.map((item) => (
                  <View
                    key={item.key}
                    style={[
                      styles.barSegment,
                      { width: `${item.pct}%`, backgroundColor: item.theme.text },
                    ]}
                  />
                ))}
              </View>

              {/* Breakdown Items List */}
              <View style={styles.breakdownList}>
                {categoryBreakdown.map((item) => (
                  <View key={item.key} style={styles.breakdownItem}>
                    <View style={styles.breakdownLeft}>
                      <View
                        style={[
                          styles.categoryIconSquare,
                          { backgroundColor: item.theme.bg },
                        ]}
                      >
                        <MaterialIcons
                          name={item.theme.icon}
                          size={18}
                          color={item.theme.text}
                        />
                      </View>
                      <View>
                        <Text style={styles.categoryName}>{item.theme.label}</Text>
                        <Text style={styles.categoryMeta}>{item.count} transaksi tercatat</Text>
                      </View>
                    </View>
                    <View style={styles.breakdownRight}>
                      <Text style={styles.categoryCost}>{formatRupiah(item.cost)}</Text>
                      <Text style={[styles.categoryPct, { color: item.theme.text }]}>
                        {item.pct}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyCardBox}>
              <MaterialIcons name="receipt-long" size={32} color={COLORS.textSubtle} />
              <Text style={styles.emptyCardText}>
                Belum ada transaksi pengeluaran pada periode {selectedPeriod}.
              </Text>
            </View>
          )}
        </View>

        {/* Monthly Trend Chart (Real Data) */}
        {monthlyTrend.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.cardTitleRow}>
              <View style={styles.titleWithIcon}>
                <MaterialIcons name="show-chart" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Tren Pengeluaran Riil Bulanan</Text>
              </View>
              <Text style={styles.itemCountText}>{monthlyTrend.length} Bulan</Text>
            </View>

            <View style={styles.chartWrapper}>
              <View style={styles.chartBarsGrid}>
                {monthlyTrend.map((d, index) => {
                  const isLatest = index === monthlyTrend.length - 1;
                  return (
                    <View key={d.label} style={styles.barCol}>
                      <Text
                        style={[
                          styles.barValText,
                          isLatest && { color: COLORS.primary, fontFamily: FONTS.heading },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {d.total > 0 ? (d.total >= 1000000 ? `${(d.total / 1000000).toFixed(1)}jt` : `${Math.round(d.total / 1000)}k`) : '0'}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${d.heightPct}%` },
                            isLatest
                              ? { backgroundColor: COLORS.primary }
                              : { backgroundColor: '#CBD5E1' },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.barMonthLabel,
                          isLatest && { color: COLORS.primary, fontFamily: FONTS.heading },
                        ]}
                      >
                        {d.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Functional Native Export Button */}
        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.85}
          onPress={handleExport}
        >
          <MaterialIcons name="share" size={18} color={COLORS.primary} />
          <Text style={styles.exportBtnText}>Bagikan Rekap Laporan</Text>
        </TouchableOpacity>
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
  periodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  periodPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 4,
    minHeight: 38,
  },
  periodPillActive: {
    backgroundColor: COLORS.surfaceRaised,
    borderColor: COLORS.primary,
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 11,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
  },
  periodTextActive: {
    color: COLORS.text,
  },
  masterBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bannerLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSubtle,
    letterSpacing: 0.6,
  },
  bannerSubLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  totalCostDisplay: {
    fontSize: 28,
    fontFamily: FONTS.headingBold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    flexWrap: 'wrap',
  },
  bannerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  statValBold: {
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metricTile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSubtle,
    letterSpacing: 0.5,
  },
  tileIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBody: {
    gap: 2,
  },
  numberWithUnit: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  tileLargeNumber: {
    fontSize: 20,
    fontFamily: FONTS.headingBold,
    color: COLORS.text,
  },
  inlineUnit: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
  },
  tileUnit: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  tileBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  tileBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  itemCountText: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
  },
  multiBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceRaised,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  barSegment: {
    height: '100%',
    borderRadius: 2,
  },
  breakdownList: {
    gap: SPACING.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  categoryIconSquare: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
  },
  categoryMeta: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  categoryCost: {
    fontSize: 13,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
  },
  categoryPct: {
    fontSize: 10,
    fontFamily: FONTS.bodyMedium,
  },
  emptyCardBox: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  emptyCardText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  chartWrapper: {
    height: 140,
    justifyContent: 'flex-end',
    paddingTop: SPACING.md,
  },
  chartBarsGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barValText: {
    fontSize: 9,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
  },
  barTrack: {
    width: 24,
    height: 80,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: RADIUS.sm,
  },
  barMonthLabel: {
    fontSize: 10,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  exportBtnText: {
    fontSize: 13,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.primary,
  },
});
