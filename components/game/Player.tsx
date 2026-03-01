import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayerState, PLAYER_SIZE, CANNON_WIDTH, CANNON_LENGTH } from '@/lib/game/types';

interface Props {
  player: PlayerState;
}

export function Player({ player }: Props) {
  const angleDeg = (player.angle * 180) / Math.PI;

  return (
    <View
      style={[
        styles.container,
        {
          left: player.x,
          top: player.y,
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
        },
      ]}
    >
      <View style={styles.body} />
      <View
        style={[
          styles.cannon,
          {
            transform: [{ rotate: `${angleDeg}deg` }],
          },
        ]}
      >
        <View style={styles.cannonBarrel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  body: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  cannon: {
    position: 'absolute',
    width: CANNON_LENGTH,
    height: CANNON_WIDTH,
    top: PLAYER_SIZE / 2 - CANNON_WIDTH / 2,
    left: PLAYER_SIZE / 2,
    transformOrigin: `0px ${CANNON_WIDTH / 2}px`,
  },
  cannonBarrel: {
    width: CANNON_LENGTH,
    height: CANNON_WIDTH,
    backgroundColor: '#15803d',
    borderRadius: 2,
  },
});
