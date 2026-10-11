import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SERVICE_THEMES } from '../../src/constants/theme';
import { getRecordById, updateRecord, deleteRecord, getVehicleById } from '../../src/db/database';
import { formatRupiah, formatNumber } from '../../src/utils/formatters';

const SERVICE_TYPE_KEYS = [
  'oli',
  'servis_berkala',
  'bbm',
  'pajak',
  'stnk',
  'ban',
  'rem',
  'aki',
  'lainnya',
];

export default function EditRecordModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recordId = parseInt(params.id, 10);

  const [vehicle, setVehicle] = useState(null);
  const [serviceType, setServiceType] = useState('oli');
  const [odometerKm, setOdometerKm] = useState('');
  const [cost, setCost] = useState('');
  const [liters, setLiters] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!recordId) {
      Alert.alert('Error', 'ID Catatan tidak ditemukan.');
      router.back();
      return;
    }

    try {
      const rec = getRecordById(recordId);
      if (!rec) {
        Alert.alert('Error', 'Catatan tidak ditemukan di database.');
        router.back();
        return;
      }

      const recOdo = rec.odometer_km ? formatNumber(rec.odometer_km) : '';
      const recCost = rec.cost ? formatNumber(rec.cost) : '';
      const recLiters = rec.liters ? rec.liters.toString() : '';
      const recNotes = rec.notes || '';
      const recDate = rec.date;

      setServiceType(rec.service_type);
      setOdometerKm(recOdo);
      setCost(recCost);
      setLiters(recLiters);
      setNotes(recNotes);
      setDate(recDate);

      setInitialData({
        serviceType: rec.service_type,
        odometerKm: recOdo,
        cost: recCost,
        liters: recLiters,
        notes: recNotes,
        date: recDate,
      });

      const veh = getVehicleById(rec.vehicle_id);
      setVehicle(veh);
      setLoading(false);
    } catch (e) {
      console.error('Error fetching record for edit:', e);
      Alert.alert('Error', 'Gagal memuat catatan.');
      router.back();
    }
  }, [recordId]);

  const handleSave = () => {
    if (!recordId || !vehicle) return;

    const odoNum = parseInt(odometerKm.replace(/\D/g, ''), 10) || 0;
    const costNum = parseInt(cost.replace(/\D/g, ''), 10) || 0;
    const litersNum = serviceType === 'bbm' ? parseFloat(liters) || null : null;

    try {
      updateRecord({
        id: recordId,
        vehicleId: vehicle.id,
        serviceType,
        date: date.trim() || new Date().toISOString().split('T')[0],
        odometerKm: odoNum,
        cost: costNum,
        liters: litersNum,
        notes: notes.trim(),
      });
      router.back();
    } catch (e) {
      console.error('Error updating record:', e);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui catatan.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Catatan',
      'Apakah Anda yakin ingin menghapus catatan servis ini? Riwayat dan kalkulasi odometer akan diperbarui otomatis.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            try {
              deleteRecord(recordId, vehicle.id);
              router.back();
            } catch (e) {
              console.error('Error deleting record:', e);
              Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus catatan.');
            }
          },
        },
      ]
    );
  };

  const isDirty = () => {
    if (!initialData) return false;
    return (
      serviceType !== initialData.serviceType ||
      odometerKm !== initialData.odometerKm ||
      cost !== initialData.cost ||
      liters !== initialData.liters ||
      notes !== initialData.notes ||
      date !== initialData.date
    );
  };

  const handleClose = () => {
    if (isDirty()) {
      Alert.alert(
        'Buang Perubahan?',
        'Ada perubahan catatan yang belum disimpan. Tetap ingin keluar?',
        [
          { text: 'Tetap di Sini', style: 'cancel' },
          {
            text: 'Buang & Keluar',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header Modal */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Edit Catatan</Text>
            <Text style={styles.headerSub}>{vehicle?.name || 'Kendaraan'}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteHeaderBtn}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Selection Grid for Service Type */}
          <Text style={styles.sectionLabel}>PILIH JENIS CATATAN</Text>
          <View style={styles.typeGrid}>
            {SERVICE_TYPE_KEYS.map((key) => {
              const theme = SERVICE_THEMES[key];
              const isSelected = serviceType === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeChip,
                    isSelected && {
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      shadowColor: theme.color,
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setServiceType(key)}
                  activeOpacity={0.75}
                >
                  <MaterialIcons
                    name={theme.icon}
                    size={16}
                    color={isSelected ? theme.color : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && { color: theme.color, fontFamily: FONTS.headingSemiBold },
                    ]}
                  >
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form Inputs */}
          <View style={styles.formSection}>
            {/* Odometer Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ODOMETER SAAT SERVIS (KM)</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="speed" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={odometerKm}
                  onChangeText={(text) => setOdometerKm(formatNumber(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSubtle}
                />
                <Text style={styles.inputUnit}>KM</Text>
              </View>
            </View>

            {/* Cost Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BIAYA / PENGELUARAN (RP)</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputCurrency}>Rp</Text>
                <TextInput
                  style={styles.input}
                  value={cost}
                  onChangeText={(text) => setCost(formatNumber(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSubtle}
                />
              </View>
              {cost ? (
                <Text style={styles.costPreview}>
                  {formatRupiah(parseInt(cost.replace(/\D/g, ''), 10) || 0)}
                </Text>
              ) : null}
            </View>

            {/* Liters Input (Only for BBM) */}
            {serviceType === 'bbm' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>JUMLAH LITER BENSIN</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="local-gas-station" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={liters}
                    onChangeText={setLiters}
                    keyboardType="decimal-pad"
                    placeholder="Contoh: 4.5"
                    placeholderTextColor={COLORS.textSubtle}
                  />
                  <Text style={styles.inputUnit}>Liter</Text>
                </View>
              </View>
            )}

            {/* Date Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TANGGAL SERVIS (YYYY-MM-DD)</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="calendar-today" size={20} color={COLORS.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textSubtle}
                />
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CATATAN & DETAIL PENGERJAAN</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Bengkel, merek oli, suku cadang yang diganti..."
                placeholderTextColor={COLORS.textSubtle}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check" size={22} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteFullBtn}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete-forever" size={20} color={COLORS.error} />
            <Text style={styles.deleteFullBtnText}>Hapus Catatan Ini</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  deleteHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 140,
    gap: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.headingBold,
    color: COLORS.textSubtle,
    letterSpacing: 1.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
  },
  formSection: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputCurrency: {
    fontSize: 15,
    fontFamily: FONTS.headingBold,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.monoBold,
    color: COLORS.text,
    height: '100%',
  },
  inputUnit: {
    fontSize: 13,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  costPreview: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.secondary,
    marginTop: 2,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    height: 80,
    textAlignVertical: 'top',
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginTop: SPACING.sm,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: FONTS.headingBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  deleteFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
  },
  deleteFullBtnText: {
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.error,
  },
});
