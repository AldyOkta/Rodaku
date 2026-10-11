import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { getDatabase, getActiveVehicle, getVehicleReminders } from '../db/database';
import { getDocumentStatus } from '../utils/formatters';

// Set default notification presentation options (shows banner, plays sound, badges app)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  // Gracefully handle if notifications API is restricted in certain environments
}

/**
 * Request notification permissions from Android & iOS.
 */
export async function requestNotificationPermissions() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('rodaku_reminders', {
        name: 'Pengingat Servis Rodaku',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#12355B',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Notification permission check skipped:', e.message);
    return false;
  }
}

/**
 * Check and trigger local banner notifications for urgent reminders & tax dues.
 */
export async function checkAndTriggerReminderNotifications() {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const vehicle = getActiveVehicle();
    if (!vehicle) return;

    // Resolve Rodaku.png local URI to attach directly into banner
    let wheelImageUri = null;
    try {
      const asset = Asset.fromModule(require('../../assets/Rodaku.png'));
      await asset.downloadAsync();
      wheelImageUri = asset.localUri || asset.uri;
    } catch (e) {
      // Fallback silently if asset cannot resolve
    }

    // Attachments configuration for rich banner notification
    const attachments = wheelImageUri
      ? [{ identifier: 'rodaku-wheel', url: wheelImageUri }]
      : [];

    // 1. Check Document/Tax Dues
    if (vehicle.tax_due_date) {
      const pkbStatus = getDocumentStatus(vehicle.tax_due_date);
      if (pkbStatus && (pkbStatus.status === 'urgent' || pkbStatus.status === 'expired')) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Pajak Tahunan ${vehicle.name}`,
            body: pkbStatus.status === 'expired'
              ? `Pajak tahunan PKB sudah jatuh tempo! Segera lakukan pembayaran di Samsat.`
              : `Pajak tahunan PKB jatuh tempo dalam ${pkbStatus.daysDiff} hari lagi. Siapkan dokumen Anda.`,
            data: { screen: 'reminders', type: 'pajak' },
            attachments,
            sound: true,
          },
          trigger: null, // Send immediately
        });
      }
    }

    if (vehicle.stnk_expiry_date) {
      const stnkStatus = getDocumentStatus(vehicle.stnk_expiry_date);
      if (stnkStatus && (stnkStatus.status === 'urgent' || stnkStatus.status === 'expired')) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Masa Berlaku STNK ${vehicle.name}`,
            body: stnkStatus.status === 'expired'
              ? `STNK 5 tahunan sudah habis masa berlakunya! Perpanjang STNK & ganti plat nomor.`
              : `STNK 5 tahunan akan habis dalam ${stnkStatus.daysDiff} hari lagi.`,
            data: { screen: 'reminders', type: 'stnk' },
            attachments,
            sound: true,
          },
          trigger: null,
        });
      }
    }

    // 2. Check Service Rules (Oli, Servis, Rem, dsb)
    const rules = getVehicleReminders(vehicle.id);
    for (const r of rules) {
      const dueKm = (r.last_done_km || 0) + (r.interval_km || 0);
      const currentKm = vehicle.odometer_km || 0;
      const remainingKm = dueKm - currentKm;
      const notifyThreshold = r.notify_before_km || 500;

      const serviceName = r.service_type.replace('_', ' ').toUpperCase();

      if (remainingKm <= 0) {
        // Terlambat / Jatuh Tempo
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Waktunya Servis: ${serviceName}!`,
            body: `${vehicle.name} sudah mencapai ${currentKm.toLocaleString('id-ID')} km (melewati target ${dueKm.toLocaleString('id-ID')} km). Jadwalkan servis sekarang.`,
            data: { screen: 'reminders', ruleId: r.id },
            attachments,
            sound: true,
          },
          trigger: null,
        });
      } else if (remainingKm <= notifyThreshold) {
        // Mendekati Jatuh Tempo
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Pengingat Servis ${serviceName}`,
            body: `${vehicle.name} tersisa ~${remainingKm.toLocaleString('id-ID')} km lagi sebelum jadwal servis ${serviceName}.`,
            data: { screen: 'reminders', ruleId: r.id },
            attachments,
            sound: true,
          },
          trigger: null,
        });
      }
    }
  } catch (err) {
    console.error('Error checking and triggering notifications:', err);
  }
}
