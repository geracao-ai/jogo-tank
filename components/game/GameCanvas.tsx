import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useMouse } from '@/hooks/useMouse';
import { aabbCollision, clamp } from '@/lib/game/collision';
import {
  GameState,
  PlayerState,
  EnemyState,
  ProjectileState,
  PLAYER_SIZE,
  PLAYER_SPEED,
  ENEMY_SIZE,
  ENEMY_SPEED,
  PROJECTILE_SIZE,
  PROJECTILE_SPEED,
  SHOOT_COOLDOWN,
  INITIAL_LIVES,
  INITIAL_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  DIFFICULTY_RAMP_RATE,
} from '@/lib/game/types';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

function createInitialState(): GameState {
  return {
    player: {
      x: ARENA_WIDTH / 2 - PLAYER_SIZE / 2,
      y: ARENA_HEIGHT / 2 - PLAYER_SIZE / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      angle: 0,
      speed: PLAYER_SPEED,
    },
    enemies: [],
    projectiles: [],
    score: 0,
    lives: INITIAL_LIVES,
    gameOver: false,
    arenaWidth: ARENA_WIDTH,
    arenaHeight: ARENA_HEIGHT,
    spawnTimer: INITIAL_SPAWN_INTERVAL,
    spawnInterval: INITIAL_SPAWN_INTERVAL,
    difficulty: 0,
  };
}

function spawnEnemy(arenaWidth: number, arenaHeight: number): EnemyState {
  const side = Math.floor(Math.random() * 4);
  let x: number, y: number;

  switch (side) {
    case 0: // top
      x = Math.random() * (arenaWidth - ENEMY_SIZE);
      y = -ENEMY_SIZE;
      break;
    case 1: // right
      x = arenaWidth;
      y = Math.random() * (arenaHeight - ENEMY_SIZE);
      break;
    case 2: // bottom
      x = Math.random() * (arenaWidth - ENEMY_SIZE);
      y = arenaHeight;
      break;
    default: // left
      x = -ENEMY_SIZE;
      y = Math.random() * (arenaHeight - ENEMY_SIZE);
      break;
  }

  return { x, y, width: ENEMY_SIZE, height: ENEMY_SIZE, speed: ENEMY_SPEED };
}

export function GameCanvas() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [started, setStarted] = useState(false);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const keys = useKeyboard();
  const mouse = useMouse(arenaRef);
  const shootCooldownRef = useRef(0);

  const update = useCallback(
    (dt: number) => {
      setGameState((prev) => {
        if (prev.gameOver) return prev;

        const dtSec = dt / 1000;
        const k = keys.current;
        const m = mouse.current;

        // --- Player movement ---
        let px = prev.player.x;
        let py = prev.player.y;

        if (k.up) py -= prev.player.speed * dtSec;
        if (k.down) py += prev.player.speed * dtSec;
        if (k.left) px -= prev.player.speed * dtSec;
        if (k.right) px += prev.player.speed * dtSec;

        px = clamp(px, 0, prev.arenaWidth - PLAYER_SIZE);
        py = clamp(py, 0, prev.arenaHeight - PLAYER_SIZE);

        // --- Cannon angle (toward mouse) ---
        const playerCenterX = px + PLAYER_SIZE / 2;
        const playerCenterY = py + PLAYER_SIZE / 2;
        const angle = Math.atan2(
          m.position.y - playerCenterY,
          m.position.x - playerCenterX
        );

        const player: PlayerState = {
          ...prev.player,
          x: px,
          y: py,
          angle,
        };

        // --- Shooting ---
        const newProjectiles = [...prev.projectiles];
        shootCooldownRef.current = Math.max(0, shootCooldownRef.current - dt);

        if ((k.shoot || m.clicked) && shootCooldownRef.current <= 0) {
          shootCooldownRef.current = SHOOT_COOLDOWN;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          newProjectiles.push({
            x: playerCenterX - PROJECTILE_SIZE / 2 + cos * (PLAYER_SIZE / 2 + 5),
            y: playerCenterY - PROJECTILE_SIZE / 2 + sin * (PLAYER_SIZE / 2 + 5),
            width: PROJECTILE_SIZE,
            height: PROJECTILE_SIZE,
            dx: cos * PROJECTILE_SPEED,
            dy: sin * PROJECTILE_SPEED,
          });
        }

        // --- Move projectiles ---
        const movedProjectiles: ProjectileState[] = [];
        for (const p of newProjectiles) {
          const nx = p.x + p.dx * dtSec;
          const ny = p.y + p.dy * dtSec;
          if (
            nx > -PROJECTILE_SIZE &&
            nx < prev.arenaWidth + PROJECTILE_SIZE &&
            ny > -PROJECTILE_SIZE &&
            ny < prev.arenaHeight + PROJECTILE_SIZE
          ) {
            movedProjectiles.push({ ...p, x: nx, y: ny });
          }
        }

        // --- Spawn enemies ---
        let spawnTimer = prev.spawnTimer - dt;
        const difficulty = prev.difficulty + DIFFICULTY_RAMP_RATE * dtSec;
        const spawnInterval = Math.max(
          MIN_SPAWN_INTERVAL,
          INITIAL_SPAWN_INTERVAL - difficulty * 100
        );
        const newEnemies = [...prev.enemies];

        if (spawnTimer <= 0) {
          spawnTimer = spawnInterval;
          newEnemies.push(spawnEnemy(prev.arenaWidth, prev.arenaHeight));
        }

        // --- Move enemies toward player ---
        for (let i = 0; i < newEnemies.length; i++) {
          const e = newEnemies[i];
          const ecx = e.x + e.width / 2;
          const ecy = e.y + e.height / 2;
          const dx = playerCenterX - ecx;
          const dy = playerCenterY - ecy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const speedMultiplier = 1 + difficulty * 0.1;
            newEnemies[i] = {
              ...e,
              x: e.x + (dx / dist) * e.speed * speedMultiplier * dtSec,
              y: e.y + (dy / dist) * e.speed * speedMultiplier * dtSec,
            };
          }
        }

        // --- Collision: projectile vs enemy ---
        const survivingEnemies: EnemyState[] = [];
        const survivingProjectiles: ProjectileState[] = [];
        const hitEnemyIndices = new Set<number>();
        const hitProjectileIndices = new Set<number>();
        let scoreGain = 0;

        for (let ei = 0; ei < newEnemies.length; ei++) {
          for (let pi = 0; pi < movedProjectiles.length; pi++) {
            if (hitProjectileIndices.has(pi)) continue;
            if (aabbCollision(newEnemies[ei], movedProjectiles[pi])) {
              hitEnemyIndices.add(ei);
              hitProjectileIndices.add(pi);
              scoreGain++;
              break;
            }
          }
        }

        for (let ei = 0; ei < newEnemies.length; ei++) {
          if (!hitEnemyIndices.has(ei)) survivingEnemies.push(newEnemies[ei]);
        }
        for (let pi = 0; pi < movedProjectiles.length; pi++) {
          if (!hitProjectileIndices.has(pi)) survivingProjectiles.push(movedProjectiles[pi]);
        }

        // --- Collision: enemy vs player ---
        let lives = prev.lives;
        let gameOver = prev.gameOver;
        const finalEnemies: EnemyState[] = [];

        for (const e of survivingEnemies) {
          if (aabbCollision(e, player)) {
            lives--;
            if (lives <= 0) {
              gameOver = true;
            }
          } else {
            finalEnemies.push(e);
          }
        }

        return {
          ...prev,
          player,
          enemies: finalEnemies,
          projectiles: survivingProjectiles,
          score: prev.score + scoreGain,
          lives,
          gameOver,
          spawnTimer,
          spawnInterval,
          difficulty,
        };
      });
    },
    [keys, mouse]
  );

  useGameLoop(update, started && !gameState.gameOver);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  const handleRestart = useCallback(() => {
    shootCooldownRef.current = 0;
    setGameState(createInitialState());
    setStarted(true);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View
        ref={arenaRef as React.RefObject<View>}
        style={styles.arena}
      >
        <View style={styles.hud}>
          <Text style={styles.hudText}>Score: {gameState.score}</Text>
          <Text style={styles.hudText}>Lives: {'♥'.repeat(gameState.lives)}</Text>
        </View>
        <Player player={gameState.player} />

        {gameState.enemies.map((e, i) => (
          <Enemy key={`e-${i}`} enemy={e} />
        ))}

        {gameState.projectiles.map((p, i) => (
          <Projectile key={`p-${i}`} projectile={p} />
        ))}

        {!started && !gameState.gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.titleText}>TANK GAME</Text>
            <Text style={styles.instructionText}>WASD / Arrows to move</Text>
            <Text style={styles.instructionText}>Mouse to aim, Click / Space to shoot</Text>
            <Pressable role="button" style={styles.restartButton} onPress={handleStart}>
              <Text style={styles.restartText}>Start Game</Text>
            </Pressable>
          </View>
        )}

        {gameState.gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <Text style={styles.finalScore}>Score: {gameState.score}</Text>
            <Pressable role="button" style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.restartText}>Play Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    zIndex: 10,
  },
  hudText: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  arena: {
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
    // @ts-expect-error web-only cursor style
    cursor: 'crosshair',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#22c55e',
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  instructionText: {
    color: '#94a3b8',
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  gameOverText: {
    color: '#ef4444',
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  finalScore: {
    color: '#facc15',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 12,
  },
  restartButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#22c55e',
    borderRadius: 8,
  },
  restartText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});
