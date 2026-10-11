import React, { useState } from 'react';
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
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';
import { insertVehicle, getDatabase } from '../../src/db/database';

export default function NewVehicleModal() {
  const router = useRouter();
  const [type, setType] = useState('motor');
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [taxDueDate, setTaxDueDate] = useState('');
  const [stnkExpiryDate, setStnkExpiryDate] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama kendaraan wajib diisi.');
      return;
    }

    try {
      const odoNum = parseInt(odometerKm.replace(/\D/g, ''), 10) || 0;
      const vehicleId = insertVehicle({
        type,
        name: name.trim(),
        plate: plate.trim() || null,
        odometerKm: odoNum,
        taxDueDate: taxDueDate.trim() || null,
        stnkExpiryDate: stnkExpiryDate.trim() || null,
      });

      // Set as active vehicle
      const db = getDatabase();
      db.runSync(
        `INSERT OR REPLACE INTO settings (key, value) VALUES ('active_vehicle_id', ?);`,
        [vehicleId.toString()]
      );

      router.back();
    } catch (e) {
      console.error('Error adding vehicle:', e);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan kendaraan.');
    }
  };

  const isDirty = () => {
    return (
      type !== 'motor' ||
      name.trim() !== '' ||
      plate.trim() !== '' ||
      odometerKm.trim() !== '' ||
      taxDueDate.trim() !== '' ||
      stnkExpiryDate.trim() !== ''
    );
  };

  const handleClose = () => {
    if (isDirty()) {
      Alert.alert(
        'Buang Perubahan?',
        'Ada data kendaraan yang belum disimpan. Tetap ingin keluar?',
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tambah Kendaraan</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type Selector */}
          <Text style={styles.sectionLabel}>JENIS KENDARAAN</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeOption, type === 'motor' && styles.typeOptionActive]}
              onPress={() => setType('motor')}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="two-wheeler"
                size={22}
                color={type === 'motor' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  type === 'motor' && styles.typeOptionTextActive,
                ]}
              >
                Sepeda Motor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeOption, type === 'mobil' && styles.typeOptionActive]}
              onPress={() => setType('mobil')}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="directions-car"
                size={22}
                color={type === 'mobil' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  type === 'mobil' && styles.typeOptionTextActive,
                ]}
              >
                Mobil
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NAMA / MODEL KENDARAAN</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="drive-file-rename-outline" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Honda Vario 160"
                placeholderTextColor={COLORS.textSubtle}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Plate Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PLAT NOMOR (OPSIONAL)</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="badge" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: B 4521 SXZ"
                placeholderTextColor={COLORS.textSubtle}
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Odometer Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ODOMETER SAAT INI (KM)</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="speed" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textSubtle}
                value={odometerKm}
                onChangeText={setOdometerKm}
              />
              <Text style={styles.inputSuffix}>KM</Text>
            </View>
          </View>

          {/* Tax Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>JATUH TEMPO PAJAK TAHUNAN (YYYY-MM-DD)</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="event" size={20} color={COLORS.secondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 2025-08-20"
                placeholderTextColor={COLORS.textSubtle}
                value={taxDueDate}
                onChangeText={setTaxDueDate}
              />
            </View>
          </View>

          {/* STNK Expiry Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MASA BERLAKU STNK 5 TAHUN (YYYY-MM-DD)</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="assignment" size={20} color={COLORS.tertiary} />
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 2028-08-20"
                placeholderTextColor={COLORS.textSubtle}
                value={stnkExpiryDate}
                onChangeText={setStnkExpiryDate}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check" size={22} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Simpan Kendaraan</Text>
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
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text,
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
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceRaised,
  },
  typeOptionText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  typeOptionTextActive: {
    color: COLORS.text,
    fontFamily: FONTS.headingSemiBold,
  },
  inputGroup: {
    gap: SPACING.xs + 2,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: FONTS.heading,
    color: COLORS.textSubtle,
    letterSpacing: 0.5,
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
  inputSuffix: {
    fontSize: 12,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.primary,
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
