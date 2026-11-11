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
// asp = largura / altura da imagem; alvo = ponto no alto da cabeça para onde aponta o rabinho do balão
// (fração da largura / altura da imagem; a ponta fica escondida atrás do chapéu / cabelo).
const ALICE = { asp: 444 / 460, alvo: [0.56, 0.14] };
const LUCA = { asp: 489 / 460, alvo: [0.58, 0.16] };
export const CARINHAS = {
  alice: { feliz: { img: aliceFeliz, ...ALICE }, triste: { img: aliceTriste, ...ALICE } },
  luca: { feliz: { img: lucaFeliz, ...LUCA }, triste: { img: lucaTriste, ...LUCA } },
};
