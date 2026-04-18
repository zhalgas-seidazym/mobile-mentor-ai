import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useAppTheme, useTheme } from '@/src/shared/theme';

interface AnalyzingIllustrationProps {
  size?: number;
  isComplete?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

// Neural network node positions (centered around 100,100)
const nodes = [
  { x: 100, y: 50 },   // Top center
  { x: 55, y: 75 },    // Left upper
  { x: 145, y: 75 },   // Right upper
  { x: 40, y: 115 },   // Left middle
  { x: 160, y: 115 },  // Right middle
  { x: 60, y: 150 },   // Left lower
  { x: 140, y: 150 },  // Right lower
  { x: 100, y: 115 },  // Center
];

// Connections between nodes
const connections = [
  [0, 1], [0, 2], [0, 7],
  [1, 3], [1, 7], [1, 5],
  [2, 4], [2, 7], [2, 6],
  [3, 5], [4, 6],
  [5, 7], [6, 7],
];

export function AnalyzingIllustration({ size = 200, isComplete = false }: AnalyzingIllustrationProps) {
  const theme = useAppTheme();
  const { isDark } = useTheme();
  
  // Animation values
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const glow = useSharedValue(0.3);
  const successScale = useSharedValue(0);

  useEffect(() => {
    if (!isComplete) {
      // Rotation for outer ring
      rotation.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );

      // Pulse effect
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Node glow
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      successScale.value = 0;
    } else {
      // Success animation
      successScale.value = withDelay(200, withSequence(
        withTiming(1.2, { duration: 250, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
      ));
    }
  }, [isComplete]);

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.2, 0.6]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.1]) }],
  }));

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const primaryColor = theme.colors.primary[500];
  const secondaryColor = theme.colors.secondary[400];
  const successColor = theme.colors.success?.light || '#22C55E';
  const bgColor = isDark ? theme.colors.primary[900] : theme.colors.primary[50];
  const nodeColor = isDark ? theme.colors.primary[400] : theme.colors.primary[500];
  const lineColor = isDark ? theme.colors.primary[600] : theme.colors.primary[300];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Rotating outer dots */}
      <AnimatedView style={[styles.absoluteCenter, rotatingStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = 100 + Math.cos(rad) * 85;
            const y = 100 + Math.sin(rad) * 85;
            return (
              <Circle
                key={i}
                cx={x}
                cy={y}
                r={4}
                fill={isComplete ? successColor : primaryColor}
                opacity={0.8}
              />
            );
          })}
        </Svg>
      </AnimatedView>

      {/* Pulsing ring */}
      {!isComplete && (
        <AnimatedView style={[styles.absoluteCenter, pulseStyle]}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
            />
          </Svg>
        </AnimatedView>
      )}

      {/* Main static elements */}
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={primaryColor} />
            <Stop offset="100%" stopColor={secondaryColor} />
          </LinearGradient>
          <LinearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={successColor} />
            <Stop offset="100%" stopColor="#15803d" />
          </LinearGradient>
        </Defs>

        {/* Outer dashed ring */}
        <Circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={lineColor}
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity={0.4}
        />

        {/* Middle ring */}
        <Circle
          cx="100"
          cy="100"
          r="75"
          fill="none"
          stroke={lineColor}
          strokeWidth="1"
          opacity={0.3}
        />

        {/* Background circle */}
        <Circle cx="100" cy="100" r="60" fill={bgColor} />

        {/* Neural network connections */}
        <G opacity={0.5}>
          {connections.map(([from, to], i) => (
            <Line
              key={i}
              x1={nodes[from].x}
              y1={nodes[from].y}
              x2={nodes[to].x}
              y2={nodes[to].y}
              stroke={isComplete ? successColor : nodeColor}
              strokeWidth="1.5"
            />
          ))}
        </G>

        {/* Neural network nodes */}
        {nodes.map((node, i) => (
          <G key={i}>
            <Circle
              cx={node.x}
              cy={node.y}
              r={i === 7 ? 10 : 6}
              fill={isComplete ? successColor : nodeColor}
              opacity={i === 7 ? 1 : 0.8}
            />
            <Circle
              cx={node.x - 1.5}
              cy={node.y - 1.5}
              r={i === 7 ? 3 : 2}
              fill="#fff"
              opacity={0.6}
            />
          </G>
        ))}

        {/* Center hexagon */}
        <Path
          d="M100 85 L112 92 L112 108 L100 115 L88 108 L88 92 Z"
          fill={isComplete ? 'url(#successGrad)' : 'url(#coreGrad)'}
        />

        {/* Inner hexagon outline */}
        <Path
          d="M100 78 L116 88 L116 112 L100 122 L84 112 L84 88 Z"
          fill="none"
          stroke={isComplete ? successColor : primaryColor}
          strokeWidth="2"
          opacity={0.6}
        />

        {/* AI icon in center */}
        <Circle cx="96" cy="97" r="2" fill="#fff" />
        <Circle cx="104" cy="97" r="2" fill="#fff" />
        <Path
          d="M94 103 Q100 108 106 103"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>

      {/* Success checkmark overlay */}
      {isComplete && (
        <AnimatedView style={[styles.absoluteCenter, successStyle]}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r="35" fill={successColor} />
            <Path
              d="M85 100 L95 110 L115 90"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </AnimatedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
