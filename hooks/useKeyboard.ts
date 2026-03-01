import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { KeysPressed } from '@/lib/game/types';

const KEY_MAP: Record<string, keyof KeysPressed> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
  ' ': 'shoot',
};

export function useKeyboard(): React.RefObject<KeysPressed> {
  const keys = useRef<KeysPressed>({
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      e.preventDefault();
      keys.current[mapped] = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      keys.current[mapped] = false;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
}
