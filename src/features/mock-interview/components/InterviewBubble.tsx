import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text } from '@/src/shared/components/ui';

type MessageRole = 'interviewer' | 'candidate';
type MessageType = 'text' | 'audio';

interface InterviewBubbleProps {
  role: MessageRole;
  type: MessageType;
  text?: string;
  durationMs?: number;
  index?: number;
}

function formatDuration(ms: number): string {
  const safeMs = Math.max(0, ms || 0);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function InterviewBubble({ role, type, text, durationMs, index = 0 }: InterviewBubbleProps) {
  const isInterviewer = role === 'interviewer';
  const isAudio = type === 'audio';
  const delay = Math.min(index * 80, 240);

  // Generate consistent wave heights based on index
  const waveHeights = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const seed = (index || 0) * 100 + i;
      return 6 + ((seed * 9301 + 49297) % 233) / 233 * 14;
    });
  }, [index]);

  if (isInterviewer) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(350).springify()}
        style={styles.interviewerContainer}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#7C6AFA', '#5B4AE8']}
            style={styles.avatar}
          >
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <View style={styles.bubbleWrapper}>
          <Text style={styles.roleLabel}>Interviewer</Text>
          <LinearGradient
            colors={['#7C6AFA', '#5B4AE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.interviewerBubble}
          >
            {isAudio ? (
              <View style={styles.audioContainer}>
                <View style={styles.waveRow}>
                  {waveHeights.map((height, i) => (
                    <View
                      key={i}
                      style={[styles.waveBar, { height }]}
                    />
                  ))}
                </View>
                <Text style={styles.audioDuration}>{formatDuration(durationMs || 0)}</Text>
              </View>
            ) : (
              <Text style={styles.interviewerText}>{text}</Text>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
    );
  }

  // Candidate (user) bubble
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(350).springify()}
      style={styles.candidateContainer}
    >
      <View style={styles.bubbleWrapperRight}>
        <Text style={styles.roleLabelRight}>You</Text>
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.candidateBubble}
        >
          {isAudio ? (
            <View style={styles.audioRowCandidate}>
              <Ionicons name="mic" size={16} color="rgba(255,255,255,0.9)" style={{ marginRight: 8 }} />
              <View style={styles.waveRowCandidate}>
                {waveHeights.map((height, i) => (
                  <View
                    key={i}
                    style={[styles.waveBarCandidate, { height: height * 0.8 }]}
                  />
                ))}
              </View>
              <Text style={styles.audioDurationCandidate}>{formatDuration(durationMs || 0)}</Text>
            </View>
          ) : (
            <Text style={styles.candidateText}>{text}</Text>
          )}
        </LinearGradient>
      </View>
      <View style={styles.avatarContainerRight}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.avatar}
        >
          <Ionicons name="person" size={16} color="#FFFFFF" />
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Interviewer styles
  interviewerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    maxWidth: '90%',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarContainerRight: {
    marginLeft: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrapper: {
    flex: 1,
  },
  bubbleWrapperRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 4,
  },
  roleLabelRight: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    marginRight: 4,
  },
  interviewerBubble: {
    borderRadius: 20,
    borderTopLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#7C6AFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  interviewerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
  },

  // Audio styles for interviewer
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: 12,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  audioDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Candidate styles
  candidateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-end',
    maxWidth: '90%',
    marginBottom: 16,
  },
  candidateBubble: {
    borderRadius: 20,
    borderTopRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 120,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  candidateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
  },

  // Audio styles for candidate
  audioRowCandidate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveRowCandidate: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: 12,
  },
  waveBarCandidate: {
    width: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  audioDurationCandidate: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
