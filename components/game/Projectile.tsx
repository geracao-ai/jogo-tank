import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProjectileState } from '@/lib/game/types';

interface Props {
  projectile: ProjectileState;
}

export function Projectile({ projectile }: Props) {
  return (
    <View
      style={[
        styles.body,
        {
          left: projectile.x,
          top: projectile.y,
          width: projectile.width,
          height: projectile.height,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    position: 'absolute',
    backgroundColor: '#facc15',
    borderRadius: 3,
  },
});
