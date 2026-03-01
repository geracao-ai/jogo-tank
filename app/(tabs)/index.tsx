import { StyleSheet, View } from 'react-native';
import { GameCanvas } from '@/components/game/GameCanvas';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <GameCanvas />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
