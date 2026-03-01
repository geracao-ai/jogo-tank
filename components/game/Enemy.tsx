import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EnemyState } from '@/lib/game/types';

interface Props {
  enemy: EnemyState;
}

export function Enemy({ enemy }: Props) {
  return (
    <View
      style={[
        styles.body,
        {
          left: enemy.x,
          top: enemy.y,
          width: enemy.width,
          height: enemy.height,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    position: 'absolute',
    backgroundColor: '#ef4444',
    borderRadius: 3,
  },
});
