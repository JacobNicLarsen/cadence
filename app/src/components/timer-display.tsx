import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import { formatDuration, formatTimer } from '@/utils/format';

type NextSegmentInfo = {
  name: string;
  type: 'activity' | 'pause';
  durationSeconds: number;
};

type TimerDisplayProps = {
  segmentName: string;
  segmentType: 'activity' | 'pause';
  remaining: number;
  total: number;
  nextSegment?: NextSegmentInfo;
  isLastSegment?: boolean;
};

export const TimerDisplay = ({
  segmentName,
  segmentType,
  remaining,
  total,
  nextSegment,
  isLastSegment,
}: TimerDisplayProps) => {
  const colors = useThemeColors();
  const progressRatio = total > 0 ? (total - remaining) / total : 0;

  const phaseColor = segmentType === 'pause' ? colors.pause : colors.activity;

  const fontFamily = Platform.select({
    ios: 'ui-rounded',
    default: 'normal',
    web: "var(--font-rounded, 'SF Pro Rounded', sans-serif)",
  });

  return (
    <View style={styles.container}>
      {/* Type label */}
      <Text style={[styles.typeLabel, { color: phaseColor }]}>
        {segmentType === 'pause' ? 'REST' : 'FOCUS'}
      </Text>

      {/* Segment name */}
      <Text
        style={[styles.segmentName, { color: colors.foreground, fontFamily }]}
        numberOfLines={2}>
        {segmentName}
      </Text>

      {/* Time — the hero */}
      <Text style={[styles.time, { color: colors.foreground, fontFamily }]}>
        {formatTimer(remaining)}
      </Text>

      {/* Full-width progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: phaseColor,
              width: `${progressRatio * 100}%`,
            },
          ]}
        />
      </View>

      {/* Next up card */}
      {nextSegment ? (
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <NextUpCard segment={nextSegment} />
        </Animated.View>
      ) : isLastSegment ? (
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <FinishCard />
        </Animated.View>
      ) : (
        <View style={styles.nextUpSpacer} />
      )}
    </View>
  );
};

const NextUpCard = ({ segment }: { segment: NextSegmentInfo }) => {
  const colors = useThemeColors();
  const accentColor = segment.type === 'pause' ? colors.pause : colors.activity;

  return (
    <View style={[styles.nextCard, { backgroundColor: accentColor + '0A' }]}>
      <View style={[styles.nextCardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.nextCardContent}>
        <Text style={[styles.nextCardLabel, { color: colors.mutedForeground }]}>
          Next
        </Text>
        <Text style={[styles.nextCardName, { color: colors.foreground }]} numberOfLines={1}>
          {segment.name || 'Untitled'}
        </Text>
        <Text style={[styles.nextCardDuration, { color: colors.mutedForeground }]}>
          {formatDuration(segment.durationSeconds)}
        </Text>
      </View>
    </View>
  );
};

const FinishCard = () => {
  const colors = useThemeColors();

  return (
    <View style={[styles.nextCard, { backgroundColor: colors.success + '0A' }]}>
      <View style={[styles.nextCardAccent, { backgroundColor: colors.success }]} />
      <View style={styles.nextCardContent}>
        <Text style={[styles.nextCardLabel, { color: colors.mutedForeground }]}>
          Next
        </Text>
        <Text style={[styles.nextCardName, { color: colors.foreground }]}>
          Finish
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  segmentName: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 8,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    lineHeight: 82,
    marginTop: 4,
  },
  progressTrack: {
    width: '80%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nextUpSpacer: {
    height: 72,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 32,
    width: '80%',
  },
  nextCardAccent: {
    width: 3,
    alignSelf: 'stretch',
  },
  nextCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nextCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextCardName: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  nextCardDuration: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 'auto',
  },
});
