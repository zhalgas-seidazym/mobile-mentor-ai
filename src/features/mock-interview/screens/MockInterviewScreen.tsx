import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { InterviewBubble, MicrophoneIcon } from '../components';
import { useInterviewStore } from '@/src/shared/stores';
import { getErrorMessage } from '@/src/shared/api/client';

type SessionStatus = 'idle' | 'recording' | 'processing' | 'playing' | 'starting' | 'completed';
type MessageRole = 'interviewer' | 'candidate';
type MessageType = 'text' | 'audio';

interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  text?: string;
  durationMs?: number;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MockInterviewScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiSoundRef = useRef<Audio.Sound | null>(null);
  const pressActiveRef = useRef(false);

  const {
    session,
    currentQuestion,
    lastAnswer,
    isLoading: isStartingSession,
    isProcessing: isSubmitting,
    isResumed,
    error: storeError,
    resumeOrStartInterview,
    submitAnswer,
    reset: resetInterviewStore,
  } = useInterviewStore();

  const micScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  const [messages, setMessages] = useState<Message[]>([]);
  const [recordingMs, setRecordingMs] = useState(0);
  const [status, setStatus] = useState<SessionStatus>('starting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize interview session on mount
  useEffect(() => {
    initializeInterview();
    return () => {
      resetInterviewStore();
    };
  }, []);

  const initializeInterview = async () => {
    setStatus('starting');
    setErrorMessage(null);

    try {
      const result = await resumeOrStartInterview();

      if (result.isNew) {
        // New session - show the first question
        setMessages([
          {
            id: `interviewer-${Date.now()}`,
            role: 'interviewer',
            type: 'text',
            text: result.question?.text || 'Please answer the interview question.',
          },
        ]);
      } else if (result.question?.text) {
        // Resumed session with question available - show it
        setMessages([
          {
            id: `interviewer-${Date.now()}`,
            role: 'interviewer',
            type: 'text',
            text: result.question.text,
          },
        ]);
      } else {
        // Resumed session without question - show prompt to continue
        setMessages([
          {
            id: `interviewer-${Date.now()}`,
            role: 'interviewer',
            type: 'text',
            text: 'You have an active interview session. Please record your answer to continue.',
          },
        ]);
      }
      setStatus('idle');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('idle');
    }
  };

  // Pulse animation for recording state
  useEffect(() => {
    if (status === 'recording') {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [status, pulseScale]);

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: status === 'recording' ? 0.3 : 0,
  }));

  const appendMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${message.role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...message,
      },
    ]);
  }, []);

  const clearRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const unloadAiSound = useCallback(async () => {
    if (!aiSoundRef.current) {
      return;
    }

    try {
      await aiSoundRef.current.unloadAsync();
    } catch {
      // Ignore unload errors on cleanup
    } finally {
      aiSoundRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (status === 'recording' || status === 'processing' || status === 'playing' || status === 'starting') {
      return;
    }

    setErrorMessage(null);

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Microphone permission is required for voice interview.');
        return;
      }
      if (!pressActiveRef.current) {
        return;
      }

      await unloadAiSound();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      if (!pressActiveRef.current) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      recordingStartedAtRef.current = Date.now();
      setRecordingMs(0);
      clearRecordingTimer();
      recordingTimerRef.current = setInterval(() => {
        const startedAt = recordingStartedAtRef.current;
        if (!startedAt) {
          return;
        }
        setRecordingMs(Date.now() - startedAt);
      }, 120);
      setStatus('recording');
    } catch {
      setStatus('idle');
      setErrorMessage('Failed to start recording. Please try again.');
    }
  }, [clearRecordingTimer, status, unloadAiSound]);

  const stopRecordingAndSubmit = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    clearRecordingTimer();
    recordingStartedAtRef.current = null;
    setRecordingMs(0);
    setStatus('processing');

    const recording = recordingRef.current;
    recordingRef.current = null;

    let audioUri: string | null = null;
    try {
      await recording.stopAndUnloadAsync();
      audioUri = recording.getURI();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch {
      setStatus('idle');
      setErrorMessage('Recording failed. Hold the mic a bit longer and retry.');
      return;
    }

    if (!audioUri) {
      setStatus('idle');
      setErrorMessage('No audio captured. Try again.');
      return;
    }

    try {
      const result = await submitAnswer(audioUri);

      // Add user's transcribed answer
      if (result.user_answer_text) {
        appendMessage({
          role: 'candidate',
          type: 'text',
          text: result.user_answer_text,
        });
      }

      // Handle different response statuses
      if (result.status === 'completed') {
        appendMessage({
          role: 'interviewer',
          type: 'text',
          text: `Great job! Interview completed. Your current streak: ${result.current_streak || 0} days.`,
        });
        setStatus('completed');
        return;
      }

      // Add feedback if available
      if (result.feedback) {
        appendMessage({
          role: 'interviewer',
          type: 'text',
          text: result.feedback,
        });
      }

      // Handle follow-up question
      if (result.status === 'need_followup' && result.followup_question) {
        appendMessage({
          role: 'interviewer',
          type: 'text',
          text: result.followup_question.text,
        });
      }

      // Handle next main question after final
      if (result.status === 'final' && result.next_question) {
        appendMessage({
          role: 'interviewer',
          type: 'text',
          text: result.next_question.text,
        });
      }

      setStatus('idle');
    } catch (error) {
      appendMessage({
        role: 'interviewer',
        type: 'text',
        text: 'I could not process your answer. Please try again.',
      });
      setStatus('idle');
      setErrorMessage(getErrorMessage(error));
    }
  }, [appendMessage, clearRecordingTimer, recordingMs, submitAnswer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages, status]);

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      void unloadAiSound();
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        void recording.stopAndUnloadAsync();
      }
    };
  }, [clearRecordingTimer, unloadAiSound]);

  const statusText = useMemo(() => {
    if (status === 'starting') {
      return 'Starting interview...';
    }

    if (status === 'recording') {
      return formatDuration(recordingMs);
    }

    if (status === 'processing' || isSubmitting) {
      return 'Processing...';
    }

    if (status === 'playing') {
      return 'Playing response...';
    }

    if (status === 'completed') {
      return 'Interview completed';
    }

    return 'Hold to speak';
  }, [recordingMs, status, isSubmitting]);

  const micDisabled = status === 'processing' || status === 'playing' || status === 'starting' || status === 'completed' || isSubmitting;

  const progressPercentage = session
    ? (session.main_question_index / session.total_main_questions) * 100
    : 0;

  // Completed screen
  if (status === 'completed') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <View style={styles.completedContainer}>
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.completedIconContainer}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.completedIcon}
            >
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Animated.Text
            entering={FadeIn.delay(400).duration(400)}
            style={[styles.completedTitle, { color: theme.colors.text.primary }]}
          >
            Great Job!
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(500).duration(400)}
            style={[styles.completedSubtitle, { color: theme.colors.text.secondary }]}
          >
            You've completed today's interview practice
          </Animated.Text>
          <Animated.View entering={FadeIn.delay(700).duration(400)} style={styles.completedButtons}>
            <TouchableOpacity
              style={[styles.completedButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.completedButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surfaceSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Mock Interview</Text>
          {session && (
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: theme.colors.text.tertiary }]}>
                Question {session.main_question_index} of {session.total_main_questions}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Progress Bar */}
      {session && (
        <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border.default }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%`, backgroundColor: theme.colors.primary[500] },
            ]}
          />
        </View>
      )}

      {/* Messages Container */}
      <View style={styles.messagesWrapper}>
        {status === 'starting' && messages.length === 0 ? (
          <View style={styles.startingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>
              Starting your interview session...
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={[styles.messagesContent, { paddingBottom: 140 }]}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message, index) => (
                <InterviewBubble
                  key={message.id}
                  role={message.role}
                  type={message.type}
                  text={message.text}
                  durationMs={message.durationMs}
                  index={index}
                />
              ))}

              {(status === 'processing' || isSubmitting) && (
                <View style={[styles.processingBubble, { backgroundColor: theme.colors.primary[50] }]}>
                  <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                  <Text style={[styles.processingText, { color: theme.colors.primary[500] }]}>
                    Thinking...
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Floating Microphone Control */}
            <View style={styles.micFloatingContainer}>
              {/* Pulse ring */}
              <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />

              {/* Outer ring */}
              <View
                style={[
                  styles.micRing,
                  { backgroundColor: theme.colors.surfaceSecondary },
                  status === 'recording' && styles.micRingActive,
                  micDisabled && styles.micRingDisabled,
                ]}
              >
                <Animated.View style={micAnimatedStyle}>
                  <Pressable
                    disabled={micDisabled}
                    delayLongPress={140}
                    onPressIn={() => {
                      pressActiveRef.current = true;
                      micScale.value = withSpring(0.92);
                    }}
                    onLongPress={() => {
                      void startRecording();
                    }}
                    onPressOut={() => {
                      pressActiveRef.current = false;
                      micScale.value = withSpring(1);
                      void stopRecordingAndSubmit();
                    }}
                    style={styles.micButton}
                  >
                    <LinearGradient
                      colors={
                        status === 'recording' ? ['#FF6B8A', '#FF4D6D'] : ['#8B7BF7', '#6A5AE0']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.micInner}
                    >
                      {status === 'processing' || isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <MicrophoneIcon size={28} />
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>

              {/* Status text */}
              <Text
                style={StyleSheet.flatten([
                  styles.statusText,
                  { color: theme.colors.text.secondary, backgroundColor: theme.colors.surface },
                  status === 'recording' && styles.statusTextRecording,
                ])}
              >
                {statusText}
              </Text>

              {(errorMessage || storeError) && (
                <Text style={[styles.errorText, { backgroundColor: theme.colors.surface }]} numberOfLines={2}>
                  {errorMessage || storeError}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  progressInfo: {
    marginTop: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Completed screen styles
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  completedIconContainer: {
    marginBottom: 24,
  },
  completedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  completedButtons: {
    width: '100%',
  },
  completedButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  completedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messagesWrapper: {
    flex: 1,
    position: 'relative',
  },
  startingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  processingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 4,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  micFloatingContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 8,
  },
  pulseRing: {
    position: 'absolute',
    top: 8,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B8A',
  },
  micRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  micRingActive: {
    backgroundColor: 'rgba(255, 232, 236, 0.95)',
  },
  micRingDisabled: {
    opacity: 0.6,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  micInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextRecording: {
    color: '#FF4D6D',
    fontWeight: '700',
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
