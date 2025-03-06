import glsl from "vite-plugin-glsl";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [glsl(), tailwindcss()],
});
