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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SERVICE_THEMES } from '../../src/constants/theme';
import { getActiveVehicle, insertRecord } from '../../src/db/database';
import { formatNumber } from '../../src/utils/formatters';

const SERVICE_TYPE_KEYS = [
  'oli',
  'servis_berkala',
  'bbm',
  'pajak',
  'ban',
  'rem',
  'aki',
  'lainnya',
];

export default function NewRecordModal() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [serviceType, setServiceType] = useState('oli');
  const [odometerKm, setOdometerKm] = useState('');
  const [cost, setCost] = useState('');
  const [liters, setLiters] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    try {
      const active = getActiveVehicle();
      setVehicle(active);
      if (active) {
        setOdometerKm(active.odometer_km ? formatNumber(active.odometer_km) : '');
      }
    } catch (e) {
      console.error('Error fetching active vehicle:', e);
    }
  }, []);

  const handleSave = () => {
    if (!vehicle) {
      Alert.alert(
        'Perhatian',
        'Belum ada kendaraan yang terdaftar. Tambahkan kendaraan Anda terlebih dahulu.',
        [
          { text: 'Tambah Kendaraan', onPress: () => router.replace('/vehicles/new') },
          { text: 'Batal', style: 'cancel' },
        ]
      );
      return;
    }

    const odoNum = parseInt(odometerKm.replace(/\D/g, ''), 10) || 0;
    const costNum = parseInt(cost.replace(/\D/g, ''), 10) || 0;
    const litersNum = serviceType === 'bbm' ? parseFloat(liters) || null : null;

    if (odoNum < vehicle.odometer_km) {
      Alert.alert(
        'Validasi Odometer',
        `Odometer (${odoNum.toLocaleString('id-ID')} km) lebih kecil dari catatan sebelumnya (${vehicle.odometer_km.toLocaleString('id-ID')} km). Tetap simpan?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Tetap Simpan',
            onPress: () => doInsert(odoNum, costNum, litersNum),
          },
        ]
      );
      return;
    }

    doInsert(odoNum, costNum, litersNum);
  };

  const doInsert = (odoNum, costNum, litersNum) => {
    try {
      insertRecord({
        vehicleId: vehicle.id,
        serviceType,
        date,
        odometerKm: odoNum,
        cost: costNum,
        liters: litersNum,
        notes: notes.trim(),
      });
      router.back();
    } catch (e) {
      console.error('Error saving record:', e);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan catatan.');
    }
  };

  const isDirty = () => {
    const odoInitial = vehicle?.odometer_km ? vehicle.odometer_km.toString() : '';
    return (
      serviceType !== 'oli' ||
      odometerKm !== odoInitial ||
      cost !== '' ||
      liters !== '' ||
      notes !== ''
    );
  };

  const handleClose = () => {
    if (isDirty()) {
      Alert.alert(
        'Buang Perubahan?',
        'Ada data catatan yang belum disimpan. Tetap ingin keluar?',
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
            <Text style={styles.headerTitle}>Catat Servis Cepat</Text>
            <Text style={styles.headerSub}>{vehicle?.name || 'Kendaraan'}</Text>
          </View>
          <View style={{ width: 36 }} />
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
                      borderColor: theme.text,
                    },
                  ]}
                  onPress={() => setServiceType(key)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={theme.icon}
                    size={18}
                    color={isSelected ? theme.text : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && { color: theme.text, fontFamily: FONTS.heading },
                    ]}
                  >
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Odometer Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>ODOMETER SAAT INI (KM)</Text>
              <Text style={styles.labelHint}>Sebelumnya: {vehicle?.odometer_km?.toLocaleString('id-ID')} km</Text>
            </View>
            <View style={styles.inputBox}>
              <MaterialIcons name="speed" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="Contoh: 16.450"
                placeholderTextColor={COLORS.textSubtle}
                value={odometerKm}
                onChangeText={(text) => setOdometerKm(formatNumber(text))}
              />
              <Text style={styles.inputSuffix}>KM</Text>
            </View>
          </View>

          {/* Cost Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BIAYA / PENGELUARAN (RP)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>Rp</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textSubtle}
                value={cost}
                onChangeText={(text) => setCost(formatNumber(text))}
              />
            </View>
          </View>

          {/* Liters input (Conditional on BBM) */}
          {serviceType === 'bbm' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>VOLUME BBM (LITER)</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="local-gas-station" size={20} color={COLORS.secondary} />
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  placeholder="Contoh: 4.8"
                  placeholderTextColor={COLORS.textSubtle}
                  value={liters}
                  onChangeText={setLiters}
                />
                <Text style={styles.inputSuffix}>Liter</Text>
              </View>
            </View>
          )}

          {/* Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TANGGAL KEGIATAN (YYYY-MM-DD)</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="event" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textSubtle}
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CATATAN TAMBAHAN (OPSIONAL)</Text>
            <TextInput
              style={[styles.textInputArea]}
              placeholder="Contoh: Oli mesin SPX2, cek tekanan ban..."
              placeholderTextColor={COLORS.textSubtle}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check" size={22} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Simpan Catatan</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
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
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSubtle,
    letterSpacing: 0.5,
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '45%',
    flex: 1,
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  inputGroup: {
    gap: SPACING.xs + 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSubtle,
    letterSpacing: 0.5,
  },
  labelHint: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.textSubtle,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bodyMedium,
  },
  inputPrefix: {
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.textMuted,
  },
  inputSuffix: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.primary,
  },
  textInputArea: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.body,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    color: '#FFFFFF',
  },
});
