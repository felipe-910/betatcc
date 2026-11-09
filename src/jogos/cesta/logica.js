import { TIPOS } from './alimentos.js';
import { FEEDBACKS, GRUPOS_FEEDBACK } from './feedbacks.js';

export const TOTAL_ITENS = 30; // alimentos que caem em cada rodada
// Quantos de cada tipo caem na rodada (a ordem é sorteada). A rodada é sempre justa e comparável.
export const COMPOSICAO = { saudavel: 16, consumivel: 7, naoSaudavel: 7 };
// "Muitos" alimentos saudáveis = cerca de dois terços dos que caíram (ficar parado no meio não basta)
export const MUITOS_SAUDAVEIS = 11;
export const POUCOS_SAUDAVEIS = 4;

export const embaralhar = (v, rnd = Math.random) => {
  const a = [...v];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Sorteia n alimentos de um tipo, repetindo a lista embaralhada para todos aparecerem parecido
const sortearDoTipo = (lista, n, rnd) => {
  const r = [];
  while (r.length < n) r.push(...embaralhar(lista, rnd));
  return r.slice(0, n);
};

// A "sacola" da rodada: a ordem em que os alimentos vão cair
export const montarSacola = (alimentos, rnd = Math.random) => {
  const sacola = [];
  TIPOS.forEach((tipo) => {
    const lista = alimentos.filter((a) => a.tipo === tipo);
    if (lista.length) sacola.push(...sortearDoTipo(lista, COMPOSICAO[tipo], rnd));
  });
  const m = embaralhar(sacola, rnd);
  // começo amigável: os dois primeiros alimentos são saudáveis
  for (let i = 0; i < 2; i++) {
    if (m[i].tipo === 'saudavel') continue;
    const k = m.findIndex((a, idx) => idx > i && a.tipo === 'saudavel');
    if (k > -1) [m[i], m[k]] = [m[k], m[i]];
  }
  return m;
};

// r = { saudavel, consumivel, naoSaudavel }: quantos alimentos de cada tipo foram para a cesta
export const avaliar = (r) => {
  const s = r.saudavel, c = r.consumivel, n = r.naoSaudavel;
  const total = s + c + n;
  let grupo;
  if (total === 0) grupo = 'nada';
  else if (s >= MUITOS_SAUDAVEIS && s > c + n) {
    grupo = n > 0 ? 'positivoAlerta' : c > 0 ? 'positivoOrientacao' : 'totalmentePositivo';
  } else if (n > s) grupo = 'maisEvitar';
  else if (s < POUCOS_SAUDAVEIS) grupo = 'poucosNutritivos';
  else if (n > 0) grupo = 'misto';
  else grupo = 'poucosNutritivos';
  const positivo = grupo.startsWith('positivo') || grupo === 'totalmentePositivo';
  const estrelas = grupo === 'totalmentePositivo' ? 3 : positivo ? 2 : 1;
  return { grupo, positivo, estrelas };
};

// Um único feedback por rodada. "semente" sorteia qual, entre os da mesma situação.
export const escolherFeedback = (grupo, semente) => {
  const ids = GRUPOS_FEEDBACK[grupo];
  const id = ids[semente % ids.length];
  return { id, ...FEEDBACKS[id] };
};
