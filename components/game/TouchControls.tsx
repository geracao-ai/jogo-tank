import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { KeysPressed } from '@/lib/game/types';
import { MouseState } from '@/hooks/useMouse';

const DEAD_ZONE = 12;
const STICK_SIZE = 130;
const KNOB_SIZE = 50;

interface TouchInfo {
  side: 'left' | 'right';
  startX: number;
  startY: number;
}

interface Props {
  keysRef: React.RefObject<KeysPressed>;
  mouseRef: React.RefObject<MouseState>;
}

export function TouchControls({ keysRef, mouseRef }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const touchMapRef = useRef(new Map<number, TouchInfo>());

  const processInput = useCallback(() => {
    let hasLeft = false;
    let leftDx = 0;
    let leftDy = 0;
    let hasRight = false;
    let rightDx = 0;
    let rightDy = 0;

    for (const [, info] of touchMapRef.current) {
      if (info.side === 'left') {
        hasLeft = true;
        leftDx = (info as any).currentX - info.startX;
        leftDy = (info as any).currentY - info.startY;
      } else {
        hasRight = true;
        rightDx = (info as any).currentX - info.startX;
        rightDy = (info as any).currentY - info.startY;
      }
    }

    if (hasLeft) {
      keysRef.current.left = leftDx < -DEAD_ZONE;
      keysRef.current.right = leftDx > DEAD_ZONE;
      keysRef.current.up = leftDy < -DEAD_ZONE;
      keysRef.current.down = leftDy > DEAD_ZONE;
    } else {
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.up = false;
      keysRef.current.down = false;
    }

    if (hasRight) {
      const norm = Math.sqrt(rightDx * rightDx + rightDy * rightDy);
      if (norm > DEAD_ZONE) {
        mouseRef.current.overrideAngle = Math.atan2(rightDy, rightDx);
      }
      mouseRef.current.clicked = true;
    } else {
      mouseRef.current.clicked = false;
      mouseRef.current.overrideAngle = null;
    }
  }, [keysRef, mouseRef]);

  const gesture = Gesture.Manual()
    .runOnJS(true)
    .onTouchesDown((event, manager) => {
      for (const touch of event.changedTouches) {
        const side = touch.absoluteX < screenWidth / 2 ? 'left' : 'right';
        touchMapRef.current.set(touch.id, {
          side,
          startX: touch.absoluteX,
          startY: touch.absoluteY,
          currentX: touch.absoluteX,
          currentY: touch.absoluteY,
        } as any);
      }
      manager.activate();
      processInput();
    })
    .onTouchesMove((event) => {
      for (const touch of event.changedTouches) {
        const info = touchMapRef.current.get(touch.id);
        if (info) {
          (info as any).currentX = touch.absoluteX;
          (info as any).currentY = touch.absoluteY;
        }
      }
      processInput();
    })
    .onTouchesUp((event, manager) => {
      for (const touch of event.changedTouches) {
        touchMapRef.current.delete(touch.id);
      }
      processInput();
      if (event.numberOfTouches === 0) {
        manager.end();
      }
    });

  if (Platform.OS === 'web') return null;

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.overlay}>
        <View style={styles.leftArea}>
          <View style={styles.stickOuter}>
            <View style={styles.stickKnob} />
          </View>
          <Text style={styles.label}>MOVE</Text>
        </View>
        <View style={styles.rightArea}>
          <View style={[styles.stickOuter, styles.fireOuter]}>
            <View style={[styles.stickKnob, styles.fireKnob]} />
          </View>
          <Text style={styles.label}>AIM + FIRE</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 30,
    zIndex: 20,
  },
  leftArea: {
    alignItems: 'center',
  },
  rightArea: {
    alignItems: 'center',
  },
  stickOuter: {
    width: STICK_SIZE,
    height: STICK_SIZE,
    borderRadius: STICK_SIZE / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireOuter: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  stickKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fireKnob: {
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 6,
  },
});
