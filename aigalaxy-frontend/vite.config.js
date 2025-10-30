import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },

  plugins: [
    tailwindcss(),

  ],
})



// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//   ],
// })