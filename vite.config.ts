import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const pagina = (caminho: string) => fileURLToPath(new URL(caminho, import.meta.url));

// O app principal + os 3 minigames, cada um como uma página própria (/jogos/<nome>.html).
// Eles abrem dentro de um <iframe> na tela de histórias, então o CSS de um jogo nunca mistura com o do app.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: pagina('./index.html'),
        jogoPrato: pagina('./jogos/prato.html'),
        jogoSemaforo: pagina('./jogos/semaforo.html'),
        jogoCesta: pagina('./jogos/cesta.html')
      }
    }
  }
});
