import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "0.0.0.0", // Permitir acceso desde fuera del contenedor
    watch: {
      usePolling: true, // Para soporte de hot-reload con volúmenes montados en Docker
    },
  },
});
