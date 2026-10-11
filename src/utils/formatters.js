export function formatRupiah(amount) {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  const val = Math.round(Number(amount));
  return 'Rp ' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatNumber(val) {
  if (val == null || val === '') return '';
  const clean = val.toString().replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatKm(km) {
  if (km == null || isNaN(km)) return '0 km';
  const val = Math.round(Number(km));
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' km';
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${monthNames[monthIndex] || parts[1]} ${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${monthNames[monthIndex] || parts[1]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getDocumentStatus(dateStr) {
  if (!dateStr) {
    return {
      status: 'none',
      label: 'BELUM DIATUR',
      daysDiff: null,
      color: '#6B7280',
      bg: '#F1F5F9',
      border: '#E2E8F0',
    };
  }

  try {
    const parts = dateStr.split('-');
    const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        label: `LEWAT ${Math.abs(diffDays)} HARI`,
        daysDiff: diffDays,
        color: '#DC2626',
        bg: '#FEE2E2',
        border: '#FECACA',
      };
    } else if (diffDays <= 30) {
      return {
        status: 'warning',
        label: `${diffDays} HARI LAGI`,
        daysDiff: diffDays,
        color: '#D97706',
        bg: '#FEF3C7',
        border: '#FDE68A',
      };
    } else {
      return {
        status: 'safe',
        label: 'AMAN',
        daysDiff: diffDays,
        color: '#16A34A',
        bg: '#DCFCE7',
        border: '#BBF7D0',
      };
    }
  } catch {
    return {
      status: 'safe',
      label: 'AMAN',
      daysDiff: 0,
      color: '#16A34A',
      bg: '#DCFCE7',
      border: '#BBF7D0',
    };
  }
}
