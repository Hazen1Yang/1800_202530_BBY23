import { defineConfig } from "vite";
import { resolve } from "path";
import viteCompression from "vite-plugin-compression";

// This tells Vite/Rollup to treat multiple HTML files
// as entry points so each becomes its own page.
export default defineConfig({
  build: {
    minify: 'terser',
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        goals: resolve(__dirname, "goals.html"),
        quiz: resolve(__dirname, "quiz.html"),
        quizResults: resolve(__dirname, "quizResults.html"),
        programs: resolve(__dirname, "programs.html"),
        roadmap: resolve(__dirname, "roadmap.html"),
        testimonials: resolve(__dirname, "testimonials.html"),
        faq: resolve(__dirname, "faq.html"),
        about: resolve(__dirname, "about.html"),
        careers: resolve(__dirname, "careers.html"),
        task: resolve(__dirname, "task.html"),
      },
    },
  },
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
});
