export interface Vec2 {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerState extends Entity {
  angle: number; // radians — direction the cannon points
  speed: number;
}

export interface EnemyState extends Entity {
  speed: number;
}

export interface ProjectileState extends Entity {
  dx: number; // velocity x (px/s)
  dy: number; // velocity y (px/s)
}

export interface GameState {
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  score: number;
  lives: number;
  gameOver: boolean;
  arenaWidth: number;
  arenaHeight: number;
  spawnTimer: number; // ms until next spawn
  spawnInterval: number; // ms between spawns
  difficulty: number; // increases over time
}

export interface KeysPressed {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
}

export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 200; // px/s
export const CANNON_WIDTH = 10;
export const CANNON_LENGTH = 25;
export const ENEMY_SIZE = 32;
export const ENEMY_SPEED = 60; // px/s
export const PROJECTILE_SIZE = 6;
export const PROJECTILE_SPEED = 400; // px/s
export const SHOOT_COOLDOWN = 250; // ms
export const INITIAL_LIVES = 3;
export const INITIAL_SPAWN_INTERVAL = 2000; // ms
export const MIN_SPAWN_INTERVAL = 600; // ms
export const DIFFICULTY_RAMP_RATE = 0.02; // spawn interval reduction per second
