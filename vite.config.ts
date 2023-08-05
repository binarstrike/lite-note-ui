import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: "terser",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "pages/login/index.html"),
        signup: resolve(__dirname, "pages/signup/index.html"),
      },
    },
  },
});
