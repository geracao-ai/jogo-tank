import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Vec2 } from '@/lib/game/types';

export interface MouseState {
  position: Vec2;
  clicked: boolean;
  overrideAngle: number | null;
}

export function useMouse(arenaRef: React.RefObject<any>): React.RefObject<MouseState> {
  const state = useRef<MouseState>({
    position: { x: 0, y: 0 },
    clicked: false,
    overrideAngle: null,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    state.current.position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, [arenaRef]);

  const handleMouseDown = useCallback(() => {
    state.current.clicked = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    state.current.clicked = false;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = arenaRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseup', handleMouseUp);
    };
  }, [arenaRef, handleMouseMove, handleMouseDown, handleMouseUp]);

  return state;
}
