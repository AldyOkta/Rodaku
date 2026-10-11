import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { EXPLODED_PARTS } from '../constants/explodedParts';
import { COLORS, FONTS } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH * 0.65, 270);

export default function ExplodedWheelSplash({ onFinish }) {
  // Animation controllers
  const explodeAnim = useRef(new Animated.Value(1)).current; // 1 (exploded) -> 0 (assembled)
  const tiltAnim = useRef(new Animated.Value(1)).current; // 1 (isometric) -> 0 (front-view)
  const spinAnim = useRef(new Animated.Value(0)).current; // 0 -> 1 (360deg spin)
  const brandAlpha = useRef(new Animated.Value(0)).current; // 0 -> 1 (brand entrance)
  const containerFade = useRef(new Animated.Value(1)).current; // 1 -> 0 (exit fade)

  useEffect(() => {
    // 1. Explode to Assembled (0 to 1100ms)
    const assembleAnim = Animated.timing(explodeAnim, {
      toValue: 0,
      duration: 1100,
      useNativeDriver: true,
    });

    // 2. Isometric 58° to Flat 2D (900ms to 1600ms)
    const tiltFlatAnim = Animated.timing(tiltAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    });

    // 3. Wheel Spin (1300ms to 2400ms)
    const spinAction = Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1100,
      useNativeDriver: true,
    });

    // 4. Brand Fade-In (1400ms to 2000ms)
    const brandAction = Animated.timing(brandAlpha, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    });

    // 5. Final exit cross-fade (2500ms to 2800ms)
    const exitAction = Animated.timing(containerFade, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    });

    // Orchestrate timeline
    Animated.sequence([
      Animated.parallel([
        assembleAnim,
        Animated.sequence([
          Animated.delay(800),
          tiltFlatAnim,
        ]),
        Animated.sequence([
          Animated.delay(1200),
          spinAction,
        ]),
        Animated.sequence([
          Animated.delay(1350),
          brandAction,
        ]),
      ]),
      Animated.delay(200),
      exitAction,
    ]).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  }, [containerFade, explodeAnim, tiltAnim, spinAnim, brandAlpha, onFinish]);

  // Rotations for 3D perspective
  const rotateX = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '56deg'],
  });

  const rotateZ = Animated.add(
    tiltAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-28deg'],
    }),
    spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })
  );

  // Layer axial offsets based on explosion progress
  // Z depths from splash_screen.html:
  // Rear Seal (-170), Rear Balls (-125), Spacer (-60), Tire (-20), Spokes (0), Hub (+45), Race (+85), Front Balls (+130), Front Seal (+180)
  const factor = 0.45; // scale to fit screen perspective

  const rearSealY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -170 * factor],
  });
  const rearBallsY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -125 * factor],
  });
  const spacerY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60 * factor],
  });
  const tireScale = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.14],
  });
  const tireY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20 * factor],
  });
  const hubY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 45 * factor],
  });
  const raceY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 85 * factor],
  });
  const frontBallsY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130 * factor],
  });
  const frontSealY = explodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180 * factor],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      {/* Blueprint Grid Lines Background */}
      <View style={styles.gridOverlay} pointerEvents="none">
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />
        <View style={styles.centerTargetRing} />
      </View>

      {/* Center 3D Assembly Rig */}
      <View style={styles.stageContainer}>
        {/* Central Axis Glow Guideline */}
        <Animated.View
          style={[
            styles.axisLine,
            {
              opacity: explodeAnim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0, 0.25, 0.85],
              }),
            },
          ]}
        />

        {/* 3D Isometric Rotating Rig */}
        <Animated.View
          style={[
            styles.assemblyRig,
            {
              transform: [
                { perspective: 900 },
                { rotateX },
                { rotateZ },
              ],
            },
          ]}
        >
          {/* 1. Rear Seal (-170) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: rearSealY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.seal }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 2. Rear Bearing Balls (-125) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: rearBallsY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.balls }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 3. Center Hub Spacer (-60) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: spacerY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.spacer }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 4. Aluminum 8-Spoke Core Velg (0) */}
          <View style={styles.partLayer}>
            <Image
              source={{ uri: EXPLODED_PARTS.spokes }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </View>

          {/* 5. PU Tire Ring (-20, scale float) */}
          <Animated.View
            style={[
              styles.partLayer,
              { transform: [{ translateY: tireY }, { scale: tireScale }] },
            ]}
          >
            <Image
              source={{ uri: EXPLODED_PARTS.tire }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 6. Center Hub Ring (+45) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: hubY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.hub }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 7. Inner Race (+85) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: raceY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.race }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 8. Front Ball Bearings (+130) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: frontBallsY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.balls }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 9. Front ABEC-7 Seal (+180) */}
          <Animated.View style={[styles.partLayer, { transform: [{ translateY: frontSealY }] }]}>
            <Image
              source={{ uri: EXPLODED_PARTS.seal }}
              style={styles.partImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Brand Identity Section */}
      <Animated.View style={[styles.brandSection, { opacity: brandAlpha }]}>
        <Text style={styles.brandTitle}>RODAKU</Text>
        <View style={styles.brandAccentLine} />
        <Text style={styles.brandSub}>CATATAN SERVIS & PERAWATAN PRESISI</Text>

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#07090E',
    zIndex: 99999,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 16,
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  centerTargetRing: {
    position: 'absolute',
    width: WHEEL_SIZE * 1.35,
    height: WHEEL_SIZE * 1.35,
    borderRadius: (WHEEL_SIZE * 1.35) / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.06)',
    borderStyle: 'dashed',
  },
  topHud: {
    alignItems: 'center',
    marginTop: 8,
  },
  hudBadge: {
    backgroundColor: 'rgba(18, 53, 91, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(242, 107, 29, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  hudBadgeText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontFamily: FONTS.headingSemiBold,
    letterSpacing: 2,
  },
  stageContainer: {
    width: '100%',
    height: WHEEL_SIZE * 1.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisLine: {
    position: 'absolute',
    width: 2,
    height: WHEEL_SIZE * 1.55,
    backgroundColor: 'rgba(0, 229, 255, 0.45)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  assemblyRig: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partLayer: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partImage: {
    width: '100%',
    height: '100%',
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 32,
    fontFamily: FONTS.headingBold,
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(242, 107, 29, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  brandAccentLine: {
    width: 48,
    height: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
    marginVertical: 2,
  },
  brandSub: {
    fontSize: 10,
    fontFamily: FONTS.headingSemiBold,
    color: COLORS.secondary,
    letterSpacing: 2.5,
  },
  telemetryTag: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  telemetryText: {
    fontSize: 9,
    fontFamily: FONTS.bodyMedium,
    color: '#94A3B8',
    letterSpacing: 1,
  },
});
