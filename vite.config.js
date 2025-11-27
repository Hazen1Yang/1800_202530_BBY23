import { defineConfig } from "vite";
import { resolve } from "path";

// This tells Vite/Rollup to treat multiple HTML files
// as entry points so each becomes its own page.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // If you add new HTML pages, add them here.
        index: resolve(__dirname, "index.html"),
        main: resolve(__dirname, "main.html"),
        login: resolve(__dirname, "login.html"),
        // We dont have a profile page yet but this is here just in case
        // for in the future, just uncomment it if you do ever add one.
        // profile: resolve(__dirname, "profile.html"),
        // careers: resolve(__dirname, "careers.html"),
        goals: resolve(__dirname, "goals.html"),
        quiz: resolve(__dirname, "quiz.html"),
        programs: resolve(__dirname, "programs.html"),
        // Even though users shouldn't even need to access template.html
        // i still put it in just in case.
        template: resolve(__dirname, "template.html"),
      },
    },
  },
});
