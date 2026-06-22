import { resolve } from "path";
import { defineConfig } from "vite";

// Application multi-pages : chaque fichier HTML est un point d'entree.
export default defineConfig({
  root: ".",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        changePassword: resolve(__dirname, "change-password.html"),
        forgotPassword: resolve(__dirname, "forgot-password.html"),
        resetPassword: resolve(__dirname, "reset-password.html"),
      },
    },
  },
});
