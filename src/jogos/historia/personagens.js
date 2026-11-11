import aliceVideo from './assets/alice-falando.mp4';
import aliceParado from './assets/alice-parado.jpg';
import aliceAvatar from './assets/alice-avatar.png';
import lucaVideo from './assets/luca-falando.mp4';
import lucaParado from './assets/luca-parado.jpg';
import lucaAvatar from './assets/luca-avatar.png';
import aliceFeliz from './assets/carinhas/alice-feliz.png';
import aliceTriste from './assets/carinhas/alice-triste.png';
import lucaFeliz from './assets/carinhas/luca-feliz.png';
import lucaTriste from './assets/carinhas/luca-triste.png';

// Quem conta a história (a criança escolhe). Quem conta a história também dá o feedback no fim da partida.
export const NARRADORES = {
  alice: { id: 'alice', nome: 'Alice', video: aliceVideo, parado: aliceParado, avatar: aliceAvatar, cor: '#fc9a98', borda: '#f06c6c' },
  luca: { id: 'luca', nome: 'Luca', video: lucaVideo, parado: lucaParado, avatar: lucaAvatar, cor: '#919cc9', borda: '#3f4b8f' },
};

// Carinhas do feedback: feliz (2 e 3 estrelas, ou acertou) e tonta (1 estrela, ou errou).
// As duas olham para a direita, para o lado do balão.
// asp = largura / altura da imagem; bocaX = onde fica a boca (fração da largura): a ponta do balão fica
// alinhada com ela, acima da cabeça e afastada (sem encostar); topo = alto da cabeça nessa coluna (fração da altura).
export const CARINHAS = {
  alice: {
    feliz: { img: aliceFeliz, asp: 444 / 460, bocaX: 0.65, topo: 0.02 },
    triste: { img: aliceTriste, asp: 444 / 460, bocaX: 0.685, topo: 0.02 },
  },
  luca: {
    feliz: { img: lucaFeliz, asp: 489 / 460, bocaX: 0.62, topo: 0.024 },
    triste: { img: lucaTriste, asp: 489 / 460, bocaX: 0.62, topo: 0.022 },
  },
};
