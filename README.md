# 🎮 Jogo Tank

Um jogo de batalha de tanques frenético construído com Expo e React Native. 

## 🚀 Jogo Online
Acesse a versão mais recente diretamente no seu navegador:
**[https://geracao-ai.github.io/jogo-tank/](https://geracao-ai.github.io/jogo-tank/)**

---

## 💻 Como Rodar Localmente (Web)

Se você quiser rodar o jogo na sua máquina para testar ou desenvolver:

### 1. Instalar Dependências
```bash
npm install
```

### 2. Rodar em Modo Desenvolvimento
Isso abrirá o servidor Metro com suporte a hot-reload.
```bash
npm run web
```

### 3. Build de Produção
Para gerar os arquivos otimizados:
```bash
npm run build:web
```
Os arquivos serão gerados na pasta `dist/`.

### 4. Deploy para GitHub Pages
Para atualizar automaticamente a pasta `docs/` usada pelo GitHub Pages:
```bash
npm run deploy
```

### 5. Servir o Build Localmente
```bash
npx serve dist
```
O jogo estará disponível em `http://localhost:3000`.

---

## 📱 Rodar no Android
Para instruções detalhadas de como compilar e instalar no Android (APK), consulte o arquivo:
👉 [SETUP.md](./SETUP.md)

---

## 🛠️ Controles

| Ação | Web | Android |
|---|---|---|
| **Mover** | `WASD` ou Setas | Joystick Esquerdo |
| **Mirar** | Mouse | Joystick Direito |
| **Atirar** | Clique ou `Espaço` | Joystick Direito (Toque/Soltar) |

---

## 🏗️ Estrutura do Projeto

- `app/`: Roteamento e telas principais.
- `components/game/`: Lógica visual do jogo (Tanque, Inimigos, Projéteis).
- `hooks/`: Gerenciamento de loops e entradas (teclado/mouse).
- `lib/game/`: Lógica matemática e física de colisões.

---

Desenvolvido com ❤️ usando **Expo** e **React Native Web**.
