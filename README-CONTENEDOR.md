# Entorno de Desarrollo Seguro en Contenedor (Docker / Dev Container)

Este entorno te permite desarrollar y compilar la aplicación **Banco de Preguntas** de forma 100% aislada, sin instalar dependencias de desarrollo, compiladores ni librerías en tu sistema operativo físico.

---

## ¿Cómo usarlo?

Tienes dos formas sencillas de utilizarlo según tu flujo de trabajo preferido:

### Opción A: Desde tu editor (VS Code o Antigravity / Cursor)
1. Abre esta carpeta en el editor.
2. Si tienes la extensión **Dev Containers**, aparecerá una notificación abajo a la derecha: *"Reopen in Container"* (o presiona `F1` / `Ctrl+Shift+P` y escribe `Dev Containers: Reopen in Container`).
3. El editor construirá el contenedor automáticamente y abrirá una terminal que ya se encuentra dentro del entorno seguro.

---

### Opción B: Desde la terminal con Docker Compose
Si prefieres usar la terminal:

1. **Construir e iniciar el contenedor en segundo plano:**
   ```bash
   docker compose up -d --build
   ```

2. **Entrar a la terminal segura del contenedor:**
   ```bash
   docker compose exec devcontainer bash
   ```

3. **Detener el contenedor cuando termines de trabajar:**
   ```bash
   docker compose down
   ```

---

## ¿Qué contiene este contenedor?
- **Linux Bookworm (Debian estable)** aislado.
- **Rust Toolchain:** `rustc`, `cargo` para Tauri.
- **Node.js LTS (v20)** y `npm` / `pnpm`.
- **Bibliotecas del sistema:** `WebKit2GTK 4.1`, `GTK3`, `libssl`, `librsvg` necesarias para compilar y ejecutar Tauri sin tocar tu sistema.
- **Puertos mapeados:** `1420` y `5173` para acceder a la aplicación desde tu navegador anfitrión.
