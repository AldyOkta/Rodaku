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
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';
import { getVehicleById, updateVehicle, deleteVehicle } from '../../src/db/database';
import { formatNumber } from '../../src/utils/formatters';

export default function EditVehicleModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = parseInt(params.id, 10);

  const [type, setType] = useState('motor');
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [taxDueDate, setTaxDueDate] = useState('');
  const [stnkExpiryDate, setStnkExpiryDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!vehicleId) {
      Alert.alert('Error', 'ID Kendaraan tidak ditemukan.');
      router.back();
      return;
    }

    try {
      const veh = getVehicleById(vehicleId);
      if (!veh) {
        Alert.alert('Error', 'Kendaraan tidak ditemukan di database.');
        router.back();
        return;
      }

      const vehOdo = veh.odometer_km ? formatNumber(veh.odometer_km) : '0';
      const vehPlate = veh.plate || '';
      const vehTax = veh.tax_due_date || '';
      const vehStnk = veh.stnk_expiry_date || '';

      setType(veh.type);
      setName(veh.name);
      setPlate(vehPlate);
      setOdometerKm(vehOdo);
      setTaxDueDate(vehTax);
      setStnkExpiryDate(vehStnk);

      setInitialData({
        type: veh.type,
        name: veh.name,
        plate: vehPlate,
        odometerKm: vehOdo,
        taxDueDate: vehTax,
        stnkExpiryDate: vehStnk,
      });

      setLoading(false);
    } catch (e) {
      console.error('Error fetching vehicle for edit:', e);
      Alert.alert('Error', 'Gagal memuat data kendaraan.');
      router.back();
    }
  }, [vehicleId]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama kendaraan wajib diisi.');
      return;
    }

    try {
      const odoNum = parseInt(odometerKm.replace(/\D/g, ''), 10) || 0;
      updateVehicle({
        id: vehicleId,
        type,
        name: name.trim(),
        plate: plate.trim() || null,
        odometerKm: odoNum,
        taxDueDate: taxDueDate.trim() || null,
        stnkExpiryDate: stnkExpiryDate.trim() || null,
      });
      router.back();
    } catch (e) {
      console.error('Error updating vehicle:', e);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui kendaraan.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Kendaraan',
      `Apakah Anda yakin ingin menghapus "${name}"? Seluruh riwayat servis, pengisian BBM, dan aturan pengingat terkait kendaraan ini akan dihapus permanen.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Permanen',
          style: 'destructive',
          onPress: () => {
            try {
              deleteVehicle(vehicleId);
              router.back();
            } catch (e) {
              console.error('Error deleting vehicle:', e);
              Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus kendaraan.');
            }
          },
        },
      ]
    );
  };

  const isDirty = () => {
    if (!initialData) return false;
    return (
      type !== initialData.type ||
      name.trim() !== initialData.name.trim() ||
      plate.trim() !== initialData.plate.trim() ||
      odometerKm.trim() !== initialData.odometerKm.trim() ||
      taxDueDate.trim() !== initialData.taxDueDate.trim() ||
      stnkExpiryDate.trim() !== initialData.stnkExpiryDate.trim()
    );
  };

  const handleClose = () => {
    if (isDirty()) {
      Alert.alert(
        'Buang Perubahan?',
        'Ada perubahan data kendaraan yang belum disimpan. Tetap ingin keluar?',
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
          <Text style={styles.loadingText}>Memuat data kendaraan...</Text>
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
            <Text style={styles.headerTitle}>Kelola Kendaraan</Text>
            <Text style={styles.headerSub}>{name}</Text>
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
          {/* Vehicle Type Selection */}
          <Text style={styles.sectionLabel}>TIPE KENDARAAN</Text>
          <View style={styles.typeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.typeOptionCard,
                type === 'motor' && styles.typeOptionCardActive,
              ]}
              onPress={() => setType('motor')}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="two-wheeler"
                size={32}
                color={type === 'motor' ? COLORS.secondary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.typeOptionLabel,
                  type === 'motor' && styles.typeOptionLabelActive,
                ]}
              >
                Sepeda Motor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOptionCard,
                type === 'mobil' && styles.typeOptionCardActive,
              ]}
              onPress={() => setType('mobil')}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="directions-car"
                size={32}
                color={type === 'mobil' ? COLORS.secondary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.typeOptionLabel,
                  type === 'mobil' && styles.typeOptionLabelActive,
                ]}
              >
                Mobil Penumpang
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NAMA / MODEL KENDARAAN *</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="badge" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Contoh: Honda Vario 160"
                  placeholderTextColor={COLORS.textSubtle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOMOR PLAT KENDARAAN</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="pin" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { textTransform: 'uppercase' }]}
                  value={plate}
                  onChangeText={setPlate}
                  placeholder="B 1234 ABC"
                  placeholderTextColor={COLORS.textSubtle}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ODOMETER TERKINI (KM)</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>JATUH TEMPO PAJAK TAHUNAN (PKB)</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="receipt-long" size={20} color={COLORS.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={taxDueDate}
                  onChangeText={setTaxDueDate}
                  placeholder="YYYY-MM-DD (Contoh: 2026-08-20)"
                  placeholderTextColor={COLORS.textSubtle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MASA BERLAKU STNK (5 TAHUNAN)</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="assignment" size={20} color={COLORS.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={stnkExpiryDate}
                  onChangeText={setStnkExpiryDate}
                  placeholder="YYYY-MM-DD (Contoh: 2029-08-20)"
                  placeholderTextColor={COLORS.textSubtle}
                />
              </View>
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
            <Text style={styles.deleteFullBtnText}>Hapus Kendaraan Ini</Text>
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
  typeSelectorRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeOptionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  typeOptionCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryContainer,
  },
  typeOptionLabel: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  typeOptionLabelActive: {
    color: COLORS.secondary,
    fontFamily: FONTS.headingSemiBold,
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
  input: {
    flex: 1,
    fontSize: 14,
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
