import { useEffect, useRef, useCallback } from 'react';
import { Vec2 } from '@/lib/game/types';

interface MouseState {
  position: Vec2;
  clicked: boolean;
}

export function useMouse(arenaRef: React.RefObject<HTMLDivElement | null>): React.RefObject<MouseState> {
  const state = useRef<MouseState>({
    position: { x: 0, y: 0 },
    clicked: false,
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
