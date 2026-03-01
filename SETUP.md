# Jogo Tank — Setup e Build

## Pre-requisitos

| Ferramenta | Versao minima | Para que |
|---|---|---|
| **Node.js** | 18+ | Runtime JS |
| **npm** | 9+ | Gerenciador de pacotes |
| **JDK 17** (Zulu ou Temurin) | 17.x | Build Android (GraalVM **nao** funciona com o Gradle do Android) |
| **Android SDK** | Platform 35+ | Compilacao nativa Android |
| **ADB** | qualquer | Instalar APK no dispositivo |

## Instalacao do projeto

```bash
# Clonar e entrar no diretorio
git clone <repo-url>
cd jogo-tank

# Instalar dependencias
npm install
```

## Rodar no navegador (Web)

Nao precisa de JDK nem Android SDK. So Node.

```bash
npm run web
# ou
npx expo start --web
```

Abre automaticamente em `http://localhost:8081`. Controles: WASD/setas para mover, mouse para mirar, clique/espaco para atirar.

## Rodar no Android

### 1. Instalar JDK 17

O Expo/React Native exige **JDK 17** (nao 11, nao 21+). A distro recomendada e **Zulu**:

**macOS (brew):**
```bash
brew install --cask zulu@17
```

**macOS (manual, sem sudo):**
```bash
curl -L "https://cdn.azul.com/zulu/bin/zulu17.64.17-ca-jdk17.0.18-macosx_aarch64.tar.gz" -o /tmp/zulu17.tar.gz
mkdir -p ~/zulu-jdk17
tar -xzf /tmp/zulu17.tar.gz -C ~/zulu-jdk17 --strip-components=1
```

**sdkman:**
```bash
sdk install java 17.0.18-tem
```

Depois, configurar o `JAVA_HOME` no seu shell (`~/.zshrc` ou `~/.bashrc`):
```bash
# Exemplo para brew:
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# Exemplo para instalacao manual:
export JAVA_HOME=$HOME/zulu-jdk17
```

Verificar:
```bash
java -version
# Deve mostrar: openjdk version "17.x.x"
```

### 2. Instalar Android SDK

Se voce **nao** tem o Android Studio, instale o minimo via command-line tools:

```bash
# Definir onde fica o SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
mkdir -p $ANDROID_HOME

# Baixar command-line tools (macOS ARM)
curl -o /tmp/cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
unzip /tmp/cmdline-tools.zip -d $ANDROID_HOME/cmdline-tools/
mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest

# Aceitar licencas
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses

# Instalar componentes necessarios
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
  "platforms;android-35" \
  "platforms;android-36" \
  "build-tools;35.0.0" \
  "platform-tools" \
  "ndk;27.2.12479018" \
  "cmake;3.22.1"
```

Adicionar ao shell (`~/.zshrc`):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

### 3. Conectar dispositivo Android

**Via USB:**
```bash
adb devices
# Deve listar o dispositivo
```

**Via WiFi (Android 11+):**

1. No tablet: Configuracoes > Opcoes do desenvolvedor > Depuracao sem fio > ativar
2. Parear (primeira vez): tocar em "Parear dispositivo com codigo" e usar:
   ```bash
   adb pair <ip>:<porta-de-pareamento>
   # Digitar o codigo exibido no tablet
   ```
3. Conectar:
   ```bash
   adb connect <ip>:<porta>
   ```
4. Verificar:
   ```bash
   adb devices
   # Deve mostrar o dispositivo como "device"
   ```

### 4. Gerar o APK e instalar

```bash
# Build de debug (gera android/ e compila o APK)
npx expo run:android

# Ou, se quiser so gerar o APK sem instalar automaticamente:
npx expo run:android --no-install

# O APK fica em:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Instalar manualmente no dispositivo:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Rodar em modo dev (hot reload)

Depois do primeiro build, para dev com hot reload:

```bash
# Iniciar o servidor Metro (acessivel na rede local)
npx expo start --android

# Ou, se o dispositivo ja tem o app instalado:
npx expo start
# Abrir o app no tablet — ele conecta ao Metro automaticamente
```

O tablet precisa estar na **mesma rede WiFi** que o computador.

## Estrutura do projeto

```
app/               → Telas (expo-router)
components/game/   → Componentes do jogo (Player, Enemy, Projectile, GameCanvas, TouchControls)
hooks/             → Hooks (useGameLoop, useKeyboard, useMouse)
lib/game/          → Logica pura (collision, types)
```

## Controles

| Plataforma | Mover | Mirar | Atirar |
|---|---|---|---|
| **Web** | WASD / setas | Mouse | Clique / Espaco |
| **Android** | Joystick esquerdo (arrastar) | Joystick direito (arrastar) | Joystick direito (tocar) |

## Troubleshooting

**Build falha com erro de `jlink`:**
Voce provavelmente esta usando GraalVM. Troque para Zulu ou Temurin JDK 17.

**`adb devices` nao mostra o tablet:**
Verifique se a depuracao USB/sem fio esta ativada nas opcoes do desenvolvedor.

**Metro nao conecta no tablet:**
Certifique-se de que ambos estao na mesma rede WiFi. Tente `npx expo start --tunnel` como alternativa.

**Erro "SDK location not found":**
Defina `ANDROID_HOME` corretamente e/ou crie o arquivo `android/local.properties`:
```
sdk.dir=/Users/SEU_USUARIO/Library/Android/sdk
```
