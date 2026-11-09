import aliceFeedback from './assets/alice-feedback.png';
import aliceVideo from './assets/alice-falando.mp4';
import aliceParado from './assets/alice-parado.jpg';
import aliceAvatar from './assets/alice-avatar.png';
import lucaVideo from './assets/luca-falando.mp4';
import lucaParado from './assets/luca-parado.jpg';
import lucaAvatar from './assets/luca-avatar.png';

// Quem conta a história (a criança escolhe). Quem conta a história também dá o feedback no fim da partida.
export const NARRADORES = {
  alice: { id: 'alice', nome: 'Alice', video: aliceVideo, parado: aliceParado, avatar: aliceAvatar, cor: '#fc9a98', borda: '#f06c6c' },
  luca: { id: 'luca', nome: 'Luca', video: lucaVideo, parado: lucaParado, avatar: lucaAvatar, cor: '#919cc9', borda: '#3f4b8f' },
};

// Alice de corpo inteiro para o balão de feedback. O do Luca continua sendo o personagem.png de cada jogo.
// asp = largura / altura da imagem; tipX/tipY = onde fica a "boca" (fração da largura / altura), onde a ponta do balão encosta.
export const ALICE_FEEDBACK = { img: aliceFeedback, sprite: { asp: 300 / 720, tipX: 0.8, tipY: 0.17 } };
