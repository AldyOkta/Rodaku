import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, TYPOGRAPHY } from '../constants/theme';
import { getAllVehicles, setActiveVehicle } from '../db/database';
import { formatKm } from '../utils/formatters';

export default function HeaderBar({ vehicle, onVehicleChanged, onSwitchVehicle }) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);

  const handleOpenSwitcher = () => {
    if (onSwitchVehicle) {
      onSwitchVehicle();
      return;
    }
    try {
      const all = getAllVehicles();
      setVehiclesList(all);
      setModalVisible(true);
    } catch (e) {
      console.error('Error fetching vehicles for switcher:', e);
    }
  };

  const handleSelect = (vehId) => {
    try {
      setActiveVehicle(vehId);
      setModalVisible(false);
      if (onVehicleChanged) {
        onVehicleChanged(vehId);
      }
    } catch (e) {
      console.error('Error switching vehicle:', e);
    }
  };

  const handleAddNew = () => {
    setModalVisible(false);
    router.push('/vehicles/new');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.brandBadge}>
          <MaterialIcons name="two-wheeler" size={22} color={COLORS.secondary} />
          <Text style={styles.brandTitle}>Rodaku</Text>
        </View>

        {vehicle ? (
          <TouchableOpacity
            style={styles.vehicleSelector}
            onPress={handleOpenSwitcher}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Pilih kendaraan, saat ini ${vehicle.name}`}
          >
            <Text style={styles.vehicleName} numberOfLines={1}>
              {vehicle.name}
            </Text>
            <MaterialIcons name="expand-more" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={handleAddNew}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={16} color={COLORS.secondary} />
            <Text style={styles.addVehicleText}>Tambah Kendaraan</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Vehicle Switcher Bottom Sheet / Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Pilih Kendaraan Aktif</Text>
                <Text style={styles.sheetSub}>Ganti kendaraan untuk melihat catatan servis</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.vehicleScroll} contentContainerStyle={styles.vehicleScrollContent}>
              {vehiclesList.map((v) => {
                const isSelected = vehicle && vehicle.id === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.vehicleOption, isSelected && styles.vehicleOptionActive]}
                    onPress={() => handleSelect(v.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.optionIconWrapper}>
                      <MaterialIcons
                        name={v.type === 'mobil' ? 'directions-car' : 'two-wheeler'}
                        size={22}
                        color={isSelected ? COLORS.primary : COLORS.textMuted}
                      />
                    </View>

                    <View style={styles.optionDetails}>
                      <View style={styles.optionNameRow}>
                        <Text style={[styles.optionName, isSelected && styles.optionNameActive]}>
                          {v.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>AKTIF</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.optionMeta}>
                        {v.plate ? `${v.plate} • ` : ''}Odo: {formatKm(v.odometer_km)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setModalVisible(false);
                          router.push({ pathname: '/vehicles/edit', params: { id: v.id } });
                        }}
                        style={{ padding: 4 }}
                        accessibilityLabel={`Kelola ${v.name}`}
                      >
                        <MaterialIcons name="tune" size={18} color={COLORS.textMuted} />
                      </TouchableOpacity>
                      {isSelected ? (
                        <MaterialIcons name="check-circle" size={22} color={COLORS.primary} />
                      ) : (
                        <MaterialIcons name="radio-button-unchecked" size={22} color={COLORS.textSubtle} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.sheetAddBtn}
              onPress={handleAddNew}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.sheetAddBtnText}>Tambah Kendaraan Baru</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md - 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 56,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  vehicleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 190,
    flexShrink: 1,
    minHeight: 44,
  },
  vehicleName: {
    ...TYPOGRAPHY.bodySm,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
    flexShrink: 1,
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceRaised,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minHeight: 44,
  },
  addVehicleText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: 36,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textSubtle,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  sheetSub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  vehicleScroll: {
    maxHeight: 280,
  },
  vehicleScrollContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 56,
  },
  vehicleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(18, 53, 91, 0.06)',
  },
  optionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionDetails: {
    flex: 1,
    gap: 2,
  },
  optionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionName: {
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.text,
  },
  optionNameActive: {
    color: COLORS.primary,
  },
  activeTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  activeTagText: {
    fontSize: 9,
    fontFamily: FONTS.heading,
    color: '#16A34A',
  },
  optionMeta: {
    fontSize: 11,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  sheetAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    marginTop: SPACING.md,
    minHeight: 48,
  },
  sheetAddBtnText: {
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    color: '#FFFFFF',
  },
});
