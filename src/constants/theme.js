/**
 * SOURCE OF TRUTH: E:\Rodaku\PALET.md.md
 * System: Veloce Precision (High-Precision Light Automotive Utility)
 * Target: Android Material 3 Native Design Guidelines
 */

// 1. Color Palette Tokens (Veloce Precision Light Theme)
export const COLORS = {
  // Canvases & Surfaces (60% Neutral Canvas)
  canvas: '#F6F7F9', // Level 0: Neutral Light Canvas (Surface Dim)
  background: '#F6F7F9', // Alias
  surface: '#FFFFFF', // Level 1: Crisp White Chassis Card
  surfaceL1: '#FFFFFF', // Alias
  surfaceRaised: '#F1F4F8', // Level 2: Raised Input, Odometer Chip & Control Tile
  surfaceL2: '#F1F4F8', // Alias
  surfaceHighest: '#E2E8F0', // Level 3: Overlay / Highlight Surface
  
  // Dividers & Hairline Borders
  border: '#E5E7EB', // 1px Slate Hairline Border
  borderHighlight: 'rgba(242, 107, 29, 0.35)', // Mechanical Orange Glow Border
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',

  // Brand Signals & Structural Anchors (30% Structural Deep Navy)
  primary: '#12355B', // Structural Deep Navy (Headers, Navigation, Primary Titles)
  onPrimary: '#FFFFFF', // High contrast text on Navy (Ratio 12.5:1)
  primaryContainer: '#001F3F',
  onPrimaryContainer: '#FFFFFF',

  // Mechanical Action Flare (10% Safety Orange)
  accent: '#F26B1D', // Mechanical High-Energy Safety Orange (FAB, Primary CTAs)
  onAccent: '#FFFFFF',
  secondary: '#F26B1D', // Safety Orange Action Flare
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FFEDD5',
  onSecondaryContainer: '#9A3412',

  // System Diagnostics (Status System)
  tertiary: '#16A34A', // Safe / Aman Green
  onTertiary: '#FFFFFF',
  warning: '#D97706', // Due Soon / Segera Servis Amber
  error: '#DC2626', // Overdue / Terlambat Red
  onError: '#FFFFFF',

  // Typography Contrast Roles (WCAG AAA & AA Compliant)
  text: '#111827', // Slate 900 (High Emphasis Primary Text, Ratio > 16:1)
  textPrimary: '#111827',
  textMuted: '#6B7280', // Slate 500 (Medium Emphasis Metadata, Ratio 4.8:1)
  textSecondary: '#6B7280',
  textSubtle: '#4B5563', // Slate 600 (Low Emphasis / Labels, Ratio 7.5:1)
};

// 2. Typography Hierarchy Roles
export const FONTS = {
  headingBold: 'PlusJakartaSans_700Bold',
  headingSemiBold: 'PlusJakartaSans_600SemiBold',
  heading: 'PlusJakartaSans_700Bold', // Default heading
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  body: 'Inter_400Regular', // Default body
  monoNumber: 'Inter_700Bold', // For tabular numbers
};

export const TYPOGRAPHY = {
  displayLg: {
    fontFamily: FONTS.headingBold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1.2,
    color: COLORS.text,
  },
  displaySm: {
    fontFamily: FONTS.headingBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: COLORS.text,
  },
  headlineLg: {
    fontFamily: FONTS.headingBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: COLORS.text,
  },
  headlineMd: {
    fontFamily: FONTS.headingSemiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: COLORS.text,
  },
  headlineSm: {
    fontFamily: FONTS.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.text,
  },
  bodyLg: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  bodyMd: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  bodySm: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  labelLg: {
    fontFamily: FONTS.headingSemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: COLORS.text,
  },
  labelMd: {
    fontFamily: FONTS.headingBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: COLORS.textMuted,
  },
  labelSm: {
    fontFamily: FONTS.headingBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    color: COLORS.textMuted,
  },
  odometerNum: {
    fontFamily: FONTS.monoNumber,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
    color: COLORS.text,
  },
};

// 3. Shape & Spacing Scales
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 8, // Standard buttons & form inputs
  lg: 14, // Standard structural cards
  xl: 18, // Major chassis cards & sheets
  hero: 24, // Hero balance & summary banners
  full: 9999, // Pill chips & circular FABs
};

// 4. Elevation Tonal Hierarchy
export const ELEVATION = {
  level0: {
    backgroundColor: COLORS.canvas,
  },
  level1: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    shadowColor: 'rgba(18, 53, 91, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  level2: {
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    shadowColor: 'rgba(18, 53, 91, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
};

// 5. Taxonomy Badges & Pill Chips (Veloce Precision)
export const SERVICE_THEMES = {
  oli: {
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#B45309',
    label: 'Ganti Oli',
    icon: 'water-drop',
  },
  servis_berkala: {
    bg: '#E0F2FE',
    border: '#BAE6FD',
    text: '#0369A1',
    label: 'Servis Rutin',
    icon: 'build',
  },
  bbm: {
    bg: '#F3E8FF',
    border: '#E9D5FF',
    text: '#7E22CE',
    label: 'BBM',
    icon: 'local-gas-station',
  },
  pajak: {
    bg: '#FFEDD5',
    border: '#FED7AA',
    text: '#C2410C',
    label: 'Pajak Tahunan',
    icon: 'receipt',
  },
  stnk: {
    bg: '#FFEDD5',
    border: '#FED7AA',
    text: '#C2410C',
    label: 'STNK 5 Tahun',
    icon: 'assignment',
  },
  ban: {
    bg: '#FCE7F3',
    border: '#FBCFE8',
    text: '#BE185D',
    label: 'Ban',
    icon: 'radio-button-checked',
  },
  rem: {
    bg: '#FEE2E2',
    border: '#FECACA',
    text: '#B91C1C',
    label: 'Rem',
    icon: 'disc-full',
  },
  aki: {
    bg: '#FEF9C3',
    border: '#FEF08A',
    text: '#A16207',
    label: 'Aki',
    icon: 'battery-charging-full',
  },
  lainnya: {
    bg: '#F1F5F9',
    border: '#E2E8F0',
    text: '#475569',
    label: 'Lainnya',
    icon: 'more-horiz',
  },
};
