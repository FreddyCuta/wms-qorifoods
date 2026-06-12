import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite config — React + Tailwind v4 (plugin oficial de Tailwind para Vite)
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
