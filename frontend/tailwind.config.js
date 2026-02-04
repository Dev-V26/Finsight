import forms from "@tailwindcss/forms";
import lineClamp from "@tailwindcss/line-clamp";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.35)",
      },
    },
  },
  plugins: [forms, lineClamp],
};
