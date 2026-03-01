---
name: jogo-tank-2d
description: Guia de desenvolvimento do jogo 2D de tiro (tank game) em React Native Web com Expo. Use ao implementar features do jogo, corrigir bugs de gameplay, ou adicionar novos sistemas (inimigos, armas, colisão).
---

# Jogo Tank 2D — Skill de Desenvolvimento

## Visão geral

Jogo 2D de tiro top-down onde o jogador controla um tanque (quadrado + retângulo = canhão) e dispara contra inimigos (quadrados). Roda exclusivamente no browser via React Native Web + Expo.

## Stack e restrições

- **Runtime**: Expo 54, React Native 0.81, react-native-web, TypeScript
- **Alvo**: apenas web (`npm run web` / `expo start --web`)
- **Renderização**: Views posicionadas com `position: 'absolute'` — sem Canvas 2D na fase inicial
- **Sem libs externas de física**: game loop manual com `requestAnimationFrame`

## Convenções de código

### Estrutura de pastas

- `components/game/` — componentes visuais do jogo (GameCanvas, Player, Enemy, Projectile)
- `hooks/` — hooks do jogo (useGameLoop, useKeyboard)
- `lib/game/` — lógica pura de jogo (colisão, tipos, spawn, movimento)
- `app/(tabs)/index.tsx` — tela principal do jogo

### Regras

1. **Lógica desacoplada da UI**: funções de colisão, movimento e spawn devem ser puras (recebem estado, retornam novo estado). Ficam em `lib/game/`.
2. **Hooks para efeitos**: game loop, captura de teclado e mouse ficam em `hooks/`.
3. **Componentes sem lógica de jogo**: recebem posição/ângulo via props e apenas renderizam.
4. **Tipos centralizados**: todos os tipos de entidade (Player, Enemy, Projectile, GameState) ficam em `lib/game/types.ts`.
5. **Delta time**: todo movimento deve usar delta time (ms entre frames) para ser independente de framerate.
6. **AABB para colisão**: detecção retângulo vs retângulo; cada entidade tem `{ x, y, width, height }`.

### Controles (web)

- WASD / setas: mover jogador
- Mouse: apontar canhão (ângulo entre jogador e cursor)
- Clique / Espaço: disparar projétil na direção do canhão

## Referências

- [plan.md](../../../plan.md) — plano completo com fases e decisões de design
- [Expo Web docs](https://docs.expo.dev/workflow/web/)
