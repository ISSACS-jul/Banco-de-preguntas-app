# Imagen base optimizada de Rust para desarrollo de aplicaciones
FROM mcr.microsoft.com/devcontainers/rust:1-bookworm

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# 1. Instalar dependencias de sistema requeridas para Tauri en Linux y herramientas de compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    xdotool \
    libasound2-dev \
    pkg-config \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar Node.js LTS (v20) y npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

# Configurar el usuario no root por defecto
USER vscode

# Verificar herramientas
RUN rustc --version && cargo --version && node --version && npm --version
