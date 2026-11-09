# 📚 Banco de Preguntas & Evaluador Docente

> Una aplicación de escritorio nativa, moderna y ultra ligera desarrollada con **Tauri, React, Tailwind CSS y KaTeX** para crear, organizar y compilar evaluaciones educativas modulares con soporte para ecuaciones LaTeX, imágenes y exportación a múltiples formatos.

---

## ✨ Características Principales

- **Dos Tipos de Preguntas Modulares:**
  - **Opción Múltiple:** Con alternativas A, B, C, D, marcado de respuesta correcta y hoja de respuestas de burbujas estilo ICFES.
  - **Preguntas Abiertas:** Con configuración de altura del recuadro para procedimientos, demostraciones y justificaciones escritas.
- **Formato Markdown & LaTeX Instantáneo:**
  - Fórmulas matemáticas en línea (`$v = \frac{d}{t}$`) y en bloque (`$$\int f(x)dx$$`) renderizadas en tiempo real con **KaTeX**.
  - **Pegado de imágenes con `Ctrl + V`** directamente desde el portapapeles.
- **Pantalla Dividida Vertical (Split Screen):**
  - **Panel Izquierdo (Banco):** Buscador inteligente en texto completo, filtros por curso, tema, dificultad y etiquetas (`#tags`).
  - **Panel Derecho (Constructor):** Agrega celdas, renumera automáticamente, reordena y asigna puntuaciones dinámicas.
- **Herramientas de Examen:**
  - 🔀 **Mezclar Preguntas:** Genera versiones A y B con un clic.
  - ✨ **Mezclar Incisos:** Aleatoriza las alternativas A, B, C, D manteniendo la respuesta correcta.
  - 👁️ **Modo Estudiante vs. Solucionario:** Alterna entre el examen limpio y la versión con claves de respuesta y justificaciones.
- **Múltiples Formatos de Exportación:**
  - 📄 **LaTeX (.tex):** Plantilla formal institucional de dos columnas con hoja de respuestas y recuadros (copiable o descargable).
  - 📝 **Microsoft Word (.docx):** Documento editable listo para imprimir o enviar.
  - 🖨️ **PDF / Impresión:** Formato de imprenta escolar optimizado con `@media print`.
- **Ultra Ligera y Novedosa:**
  - Desarrollada con el motor nativo de **Tauri (Rust)**, pesando apenas una fracción comparado con aplicaciones en Electron.
  - Almacenamiento local transparente y seguro en formato JSON con respaldo/importación con un clic.

---

## 🚀 Inicio Rápido

### Opción A: Con Docker / Dev Container (Recomendado y 100% Aislado)

Para no instalar compiladores ni herramientas en tu sistema anfitrión:

1. Iniciar el contenedor:
   ```bash
   docker compose up -d --build
   ```
2. Acceder a la interfaz de desarrollo en tu navegador:
   👉 `http://localhost:1420`

### Opción B: Desarrollo Local Nativo

Si cuentas con Node.js y Rust instalados:

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar en modo desarrollo:
   ```bash
   npm run tauri dev
   ```
3. Compilar el binario ejecutable para producción:
   ```bash
   npm run tauri build
   ```

---

## 🛠️ Tecnologías Utilizadas

- **Backend Nativo:** [Tauri v2](https://tauri.app/) (Rust)
- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Tema Oscuro Refinado)
- **Matemáticas & Markdown:** [KaTeX](https://katex.org/) + [Marked](https://marked.js.org/)
- **Exportadores:** `docx`, `file-saver` y generador LaTeX personalizado.

---

## 📄 Licencia

Este proyecto es de código abierto bajo la [Licencia MIT](LICENSE). Siéntete libre de usarlo, adaptarlo y compartirlo con otros docentes.
