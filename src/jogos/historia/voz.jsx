import { useEffect, useState } from 'react';
import { VOZ_LUCA } from './vozLuca.js';

// Voz do Luca (a Alice não tem áudio: o texto dela continua aparecendo letra por letra).
// Um único elemento <audio> para o jogo todo: o iPhone/iPad só deixa tocar som depois de um toque,
// e um elemento "destravado" num toque continua liberado depois (inclusive para o feedback no fim da partida).
const SILENCIO = 'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
let elemento = null;
let destravado = false;
const audio = () => {
  if (!elemento && typeof Audio !== 'undefined') {
    elemento = new Audio();
    elemento.preload = 'auto';
  }
  return elemento;
};

// Chamar DENTRO de um clique (ex.: no cartão do Luca).
export function destravarVoz() {
  const a = audio();
  if (!a || destravado) return;
  destravado = true;
  a.src = SILENCIO;
  const p = a.play();
  if (p && p.catch) p.catch(() => {});
}

// Fala da história: VOZ_LUCA.historia[jogo][indice] -> { src, marcas, fala } (ou null)
export const vozDaHistoria = (jogo, indice) => VOZ_LUCA.historia[jogo]?.[indice] ?? null;
// Feedback: procurado pelo próprio texto (título + texto), assim não depende de como cada jogo sorteia.
export const vozDoFeedback = (titulo, texto) => VOZ_LUCA.feedback[`${titulo}\n${texto}`] ?? null;

// Quantas letras já foram ditas no instante t.
// marcas: [inicioLetra, fimLetra, inicioSeg, fimSeg] de cada palavra, na ordem do texto.
function letrasAte(marcas, t) {
  let n = 0;
  for (const [c0, c1, t0, t1] of marcas) {
    if (t < t0) break;
    if (t >= t1) { n = c1; continue; }
    return Math.max(n, Math.round(c0 + ((c1 - c0) * (t - t0)) / (t1 - t0)));
  }
  return n;
}
// O personagem "mexe a boca" só nos trechos com voz (para nas pausas entre as frases).
const emFala = (trechos, t) => trechos.some(([a, b]) => t >= a && t <= b);

// Toca o áudio e devolve quantas letras mostrar, sincronizadas com a voz.
// voz = null -> não faz nada (falhou: true; quem usa cai no comportamento sem áudio).
export function useVozSincronizada(voz, total, atraso = 0) {
  const [st, setSt] = useState({ n: 0, falando: false, fim: false, falhou: !voz });

  useEffect(() => {
    if (!voz) { setSt({ n: total, falando: false, fim: true, falhou: true }); return undefined; }
    const a = audio();
    if (!a) { setSt({ n: 0, falando: false, fim: false, falhou: true }); return undefined; }
    let vivo = true;
    let relogio = 0;
    let timer = 0;
    let ultimo = '';
    setSt({ n: 0, falando: false, fim: false, falhou: false });

    const atualizar = () => {
      if (!vivo) return;
      const t = a.currentTime;
      const n = letrasAte(voz.marcas, t);
      const falando = !a.paused && emFala(voz.fala, t);
      const chave = `${n}|${falando}`;
      if (chave !== ultimo) { ultimo = chave; setSt({ n, falando, fim: false, falhou: false }); }
      clearTimeout(relogio);
      if (!a.paused && !a.ended) relogio = setTimeout(atualizar, 40);
    };
    const terminou = () => { if (vivo) { clearTimeout(relogio); setSt({ n: total, falando: false, fim: true, falhou: false }); } };
    const falhou = () => { if (vivo) { clearTimeout(relogio); setSt((s) => ({ ...s, falando: false, falhou: true })); } };
    const pausou = () => { if (vivo) atualizar(); };

    a.addEventListener('playing', atualizar);
    a.addEventListener('pause', pausou);
    a.addEventListener('ended', terminou);
    a.addEventListener('error', falhou);

    const tocar = () => {
      if (!vivo) return;
      a.src = voz.src;
      const p = a.play();
      if (p && p.then) p.then(() => vivo && atualizar(), (e) => { if (e && e.name !== 'AbortError') falhou(); });
    };
    if (atraso > 0) timer = setTimeout(tocar, atraso); else tocar();

    return () => {
      vivo = false;
      clearTimeout(timer);
      clearTimeout(relogio);
      a.removeEventListener('playing', atualizar);
      a.removeEventListener('pause', pausou);
      a.removeEventListener('ended', terminou);
      a.removeEventListener('error', falhou);
      a.pause();
    };
  }, [voz, total, atraso]);

  return st;
}

// Texto que vai aparecendo sem mudar o tamanho da caixa: a parte ainda não dita fica invisível (mas ocupa espaço).
export function TextoRevelado({ texto, n }) {
  const k = Math.max(0, Math.min(texto.length, n));
  if (k >= texto.length) return texto;
  return (
    <>
      {texto.slice(0, k)}
      <span style={{ visibility: 'hidden' }}>{texto.slice(k)}</span>
    </>
  );
}
