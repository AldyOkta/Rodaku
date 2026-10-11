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
import ServiceBadge from '../../src/components/ServiceBadge';
import { getActiveVehicle, getVehicleRecords } from '../../src/db/database';
import { formatRupiah, formatDate, formatKm } from '../../src/utils/formatters';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Semua' },
  { key: 'oli', label: 'Oli' },
  { key: 'servis_berkala', label: 'Servis' },
  { key: 'bbm', label: 'BBM' },
  { key: 'pajak', label: 'Pajak' },
];

export default function RecordsScreen() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const active = getActiveVehicle();
      setVehicle(active);
      if (active) {
        const all = getVehicleRecords(active.id);
        setRecords(all);
      }
    } catch (e) {
      console.error('Error loading records:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredRecords = records.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.service_type === activeFilter;
  });

  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        vehicle={vehicle}
        onVehicleChanged={loadData}
      />

      <View style={styles.container}>
        {/* Filter Pills Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTER_OPTIONS.map((f) => {
              const isSelected = activeFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Total Cost Summary Ribbon */}
        <View style={styles.summaryRibbon}>
          <View>
            <Text style={styles.summaryLabel}>Total Pengeluaran Tercatat</Text>
            <Text style={styles.summaryValue}>{formatRupiah(totalCost)}</Text>
          </View>
          <View style={styles.recordCountPill}>
            <Text style={styles.recordCountText}>{filteredRecords.length} Catatan</Text>
          </View>
        </View>

        {/* Records Stream */}
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
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
          {filteredRecords.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recordCard}
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: '/records/edit', params: { id: item.id } })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <ServiceBadge type={item.service_type} size="sm" />
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.costText}>{formatRupiah(item.cost)}</Text>
                  <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                </View>
              </View>

              {item.notes ? (
                <Text style={styles.notesText}>{item.notes}</Text>
              ) : null}

              <View style={styles.footerRow}>
                <View style={styles.odoBox}>
                  <MaterialIcons name="speed" size={14} color={COLORS.primary} />
                  <Text style={styles.odoText}>{formatKm(item.odometer_km)}</Text>
                </View>
                {item.liters ? (
                  <View style={styles.literBox}>
                    <MaterialIcons name="local-gas-station" size={14} color="#A78BFA" />
                    <Text style={styles.literText}>{item.liters} L</Text>
                  </View>
                ) : null}
                <View style={{ flex: 1 }} />
                <Text style={styles.tapToEditText}>Ketuk untuk edit/hapus</Text>
              </View>
            </TouchableOpacity>
          ))}

          {filteredRecords.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={44} color={COLORS.textSubtle} />
              <Text style={styles.emptyTitle}>Tidak ada catatan untuk filter ini</Text>
              <Text style={styles.emptySub}>
                Ketuk tombol tambah (+) untuk mencatat servis atau BBM baru.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  filterBar: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 11,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  summaryRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginTop: 2,
  },
  recordCountPill: {
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recordCountText: {
    fontSize: 11,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  costText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  notesText: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.text,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 2,
  },
  odoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  odoText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
  },
  literBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  literText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    color: '#C4B5FD',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
    textAlign: 'center',
  },
  tapToEditText: {
    fontSize: 10,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSubtle,
  },
});
