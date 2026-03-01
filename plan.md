# Jogo Tank 2D — Plano de Desenvolvimento

## Visão

Jogo 2D de tiro top-down em React Native Web. O jogador controla um "tanque" (quadrado com retângulo na ponta representando o canhão) e dispara projéteis contra inimigos (quadrados). Alvo: apenas web via Expo.

## Stack

- Expo 54 / React Native 0.81 / react-native-web
- expo-router (file-based routing)
- TypeScript
- Sem libs externas de física — game loop manual com requestAnimationFrame

## Fases

### Fase 1 — Setup e base

- [x] Ambiente web funcionando (`npm run web`)
- [x] Game loop com `requestAnimationFrame` e delta time
- [x] Container do jogo (arena fixa que cabe na tela)
- [x] Jogador estático desenhado (quadrado + retângulo na ponta)

### Fase 2 — Jogador

- [x] Movimento do jogador com teclado (WASD / setas)
- [x] Rotação do canhão (segue mouse ou teclas Q/E)
- [x] Disparo de projéteis (espaço ou clique)

### Fase 3 — Inimigos

- [x] Spawn de inimigos em posições aleatórias nas bordas
- [x] Movimento simples (andam em direção ao jogador)
- [x] Colisão projétil–inimigo (AABB) → ambos removidos
- [x] Inimigos morrem com 1 tiro

### Fase 4 — Regras de jogo

- [ ] Vida do jogador (3 vidas)
- [ ] Game over quando vida chega a 0 (inimigo encosta no jogador)
- [ ] Pontuação (1 ponto por inimigo destruído)
- [ ] Tela de game over + reinício
- [ ] Dificuldade progressiva (spawn mais rápido com o tempo)

### Fase 5 — Polish

- [ ] Cores distintas (jogador verde, inimigos vermelhos, projéteis amarelos)
- [ ] Feedback visual de hit (flash)
- [ ] HUD (vidas, pontuação)
- [ ] Sons (disparo, explosão, game over) — opcional

## Decisões de design

| Tema | Decisão |
|------|---------|
| **Controles** | Teclado: WASD/setas para mover, mouse para apontar canhão, clique/espaço para atirar |
| **Câmera** | Arena fixa que cabe na tela (sem scroll) |
| **Inimigos** | Spawn nas bordas, andam em direção ao jogador, não atiram de volta (v1) |
| **Vitória/derrota** | Sobreviver o máximo possível; game over ao perder todas as vidas |
| **Visual** | Geométrico (quadrados/retângulos), cores sólidas |
| **Performance** | Views posicionadas com absolute; ~10 inimigos e ~20 projéteis simultâneos |

## Estrutura de pastas

```
app/
  (tabs)/
    index.tsx          → Tela do jogo
    _layout.tsx        → Tab layout
  _layout.tsx          → Root layout
components/
  game/
    GameCanvas.tsx     → Container/arena do jogo
    Player.tsx         → Quadrado + retângulo (canhão)
    Enemy.tsx          → Quadrado inimigo
    Projectile.tsx     → Projétil
hooks/
  useGameLoop.ts       → requestAnimationFrame loop
  useKeyboard.ts       → Captura de teclas (web)
lib/
  game/
    collision.ts       → Detecção de colisão AABB
    types.ts           → Tipos (Entity, GameState, etc.)
```

## Links

- [Expo - Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build)
- [Expo - Develop websites](https://docs.expo.dev/workflow/web/)
