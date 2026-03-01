import { useEffect, useRef, useCallback } from 'react';

type FrameCallback = (deltaTime: number) => void;

export function useGameLoop(callback: FrameCallback, active: boolean = true) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  callbackRef.current = callback;

  const loop = useCallback((time: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    const delta = Math.min(time - lastTimeRef.current, 50); // cap at 50ms to avoid spiral
    lastTimeRef.current = time;

    callbackRef.current(delta);
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!active) {
      lastTimeRef.current = 0;
      return;
    }
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [active, loop]);
}
