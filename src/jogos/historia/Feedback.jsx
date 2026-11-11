import { useLayoutEffect, useRef, useState } from 'react';
import './Feedback.css';
import { CARINHAS, NARRADORES } from './personagens.js';
import { vozDoFeedback, useVozSincronizada, TextoRevelado } from './voz.jsx';

/* ---------- Feedback com a carinha do narrador (o mesmo nos 3 minijogos) ----------
   Mesmo visual da caixa de diálogo da história: caixa branca com borda verde, etiqueta com o nome
   de quem fala e o texto em letra bastão. Embaixo, à esquerda, fica a carinha (feliz quando positivo,
   tonta quando negativo) e um rabinho curto sai da caixa apontando para a cabeça. O botão fica ao
   lado da carinha. A letra é a maior que couber no espaço livre da tela. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ETIQUETA = 20;   // quanto a etiqueta do nome sobe acima da caixa
const VAO = 4;         // espaço entre a caixa e o alto da carinha

export function FeedbackPersonagem({ narrador, positivo, titulo: tituloOrig, texto: textoOrig, botao, onBotao, escurecer, pula, topo }) {
  const quem = NARRADORES[narrador] ?? NARRADORES.alice;
  const face = (CARINHAS[narrador] ?? CARINHAS.alice)[positivo ? 'feliz' : 'triste'];
  // a voz gravada (Alice ou Luca) lê o feedback e o texto vai aparecendo junto (a caixa já nasce do tamanho final)
  const voz = vozDoFeedback(narrador, tituloOrig, textoOrig);
  const [titulo, texto] = voz ? voz.texto.split('\n') : [tituloOrig, textoOrig];
  const sinc = useVozSincronizada(voz, titulo.length + 1 + texto.length, 350);
  const dito = voz && !sinc.falhou && !sinc.fim ? sinc.n : Infinity;
  const overlayRef = useRef(null);
  const cenaRef = useRef(null);
  const caixaRef = useRef(null);
  const [L, setL] = useState(null);

  useLayoutEffect(() => {
    const el = overlayRef.current;
    // o que vem antes na tela (cabeçalho, quadro do resultado): a caixa não pode ficar por cima
    const irmaos = escurecer ? [] : [...el.parentElement.children].filter((n) => n !== el);
    const medir = () => {
      const cena = cenaRef.current;
      const caixa = caixaRef.current;
      if (!el || !cena || !caixa) return;
      const W = cena.clientWidth, H = cena.clientHeight, Ht = el.parentElement.clientHeight;
      const topoCena = cena.getBoundingClientRect().top;
      const minTop = irmaos.reduce((m, n) => {
        const r = n.getBoundingClientRect();
        return r.height ? Math.max(m, r.bottom - topoCena + 12) : m;
      }, 4);
      // carinha: até 40% da largura (o botão precisa caber ao lado) e ~20% da altura da tela
      const fw = Math.min(0.4 * W, 0.2 * Ht * face.asp, 165);
      const fh = fw / face.asp;
      // letra: a maior que couber (entre 10 e 17 px)
      const cabe = H - minTop - ETIQUETA - VAO - fh;
      const altura = (f) => { caixa.style.setProperty('--fb', `${f}px`); return caixa.offsetHeight; };
      let f = clamp(Math.min(W * 0.047, Ht * 0.021), 13.5, 17.5);
      let ch = altura(f);
      while (ch > cabe && f > 10) { f -= 0.25; ch = altura(f); }
      // sobrando espaço, o conjunto fica no meio da área livre (não cola embaixo)
      const sobra = cabe - ch;
      const levantar = escurecer ? 0 : clamp(sobra * 0.5, 0, 0.12 * Ht);
      const faceTop = H - levantar - fh;
      const caixaTop = faceTop - VAO - ch;
      // rabinho: sai da borda de baixo da caixa e aponta para o alto da cabeça (a ponta fica atrás dela)
      // coordenadas do desenho do rabinho: x a partir da borda esquerda da caixa; y a partir do topo da borda de baixo (3 px)
      const alvoX = face.alvo[0] * fw, alvoY = face.alvo[1] * fh + VAO + 3;
      const base = clamp(0.075 * W, 22, 30);
      const b1 = alvoX + 0.35 * base, b2 = b1 + base;
      setL({ fw, fh, f, faceTop, caixaTop, levantar, rabo: { b1, b2, tx: alvoX, ty: alvoY } });
    };
    medir();
    const ro = new ResizeObserver(medir);
    [el, ...irmaos].forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [face, escurecer, titulo, texto]);

  const animacao = !positivo ? 'tonta' : pula ? 'pula' : 'feliz';
  const R = L?.rabo;

  return (
    <div ref={overlayRef} className={`fb-overlay ${escurecer ? 'escuro' : 'claro'}`} style={topo ? { top: topo } : undefined}>
      <div ref={cenaRef} className="fb-cena">
        <div
          ref={caixaRef}
          className="fb-caixa"
          style={{ top: L ? L.caixaTop : 0, visibility: L ? 'visible' : 'hidden', transformOrigin: R ? `${R.tx}px 100%` : undefined }}
        >
          <div className="fb-nome" style={{ background: quem.cor, borderColor: quem.borda }}>{quem.nome}</div>
          <div className="fb-titulo"><TextoRevelado texto={titulo} n={dito} /></div>
          <div className="fb-txt"><TextoRevelado texto={texto} n={dito - titulo.length - 1} /></div>
          {R && (
            <svg className="fb-rabo" width={R.b2 + 6} height={R.ty + 6} viewBox={`0 0 ${R.b2 + 6} ${R.ty + 6}`} aria-hidden="true">
              {/* o branco cobre a borda da caixa entre as duas pontas da base; o verde desenha só os lados */}
              <path d={`M${R.b1 - 2},-4 L${R.b2 + 2},-4 L${R.b2},1.5 L${R.tx},${R.ty} L${R.b1},1.5 Z`} fill="#fff" />
              <path d={`M${R.b1},1.5 L${R.tx},${R.ty} L${R.b2},1.5`} fill="none" stroke="#6aaa7e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          )}
        </div>
        {L && (
          <>
            <div className="fb-carinha" style={{ top: L.faceTop, width: L.fw, height: L.fh }}>
              <img key={face.img} className={animacao} src={face.img} alt={positivo ? 'Personagem feliz' : 'Personagem tonto'} draggable={false} />
            </div>
            <button
              className="botao pequeno botaoFb fb-botao"
              onClick={onBotao}
              style={{ left: L.fw + 12, bottom: L.levantar + L.fh * 0.32 }}
            >
              {botao}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
