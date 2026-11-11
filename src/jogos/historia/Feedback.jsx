import { useLayoutEffect, useRef, useState } from 'react';
import './Feedback.css';
import { CARINHAS } from './personagens.js';
import { vozDoFeedback, useVozSincronizada, TextoRevelado } from './voz.jsx';

/* ---------- Feedback com a carinha do narrador e o balão de fala (o mesmo nos 3 minijogos) ----------
   Quem contou a história é quem dá o feedback. Embaixo, à esquerda, fica a carinha (feliz quando
   positivo, tonta quando negativo); o balão ocupa a largura toda logo acima, com a ponta encostando
   no alto da cabeça; o botão fica ao lado da carinha. Tudo é calculado a partir do espaço disponível,
   e o balão tem a altura que o texto pede (texto curto: balão menor; texto longo: usa o espaço todo). */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FOLGA = 1.2;        // altura da área de texto = FOLGA * raio vertical do oval
const LARGURA = 1.56;     // largura da área de texto = LARGURA * raio horizontal do oval

// Parte que não depende do texto. W, H: área do feedback; Ht: altura da tela;
// minTop: até onde o balão pode subir (abaixo do quadro de resultado).
function geometria(W, H, Ht, minTop, face) {
  // carinha: cresce com a tela, mas sem passar de 42% da largura (o botão precisa caber ao lado)
  const fw = Math.min(clamp(0.19 * Ht, 96, 165) * face.asp, 0.42 * W);
  const fh = fw / face.asp;
  const faceTop = H - fh;
  const tipX = face.tipX * fw;                      // ponta do balão: no alto da cabeça
  const tipY = faceTop + face.tipY * fh;
  const sw = clamp(W * 0.011, 3, 4.5);              // espessura do contorno do balão
  const bw = W;                                     // o balão usa a largura toda
  const base = tipY - clamp(0.055 * W, 14, 24);     // ponto mais baixo do oval
  const bhMax = clamp(base - minTop, 90, bw / 1.2); // cabe entre o quadro de resultado e a carinha
  const bhMin = Math.min(bhMax, Math.max(90, bw / 2.6));
  const rx = bw / 2 - sw;
  return { fw, fh, faceTop, tipX, tipY, sw, bw, base, bhMax, bhMin, rx, larguraTexto: LARGURA * rx };
}

// Oval, "rabinho" e área do texto para uma altura bh do oval.
function balao(g, bh) {
  const { bw, sw, rx, tipX, tipY, base } = g;
  const top = base - bh;
  const cx = bw / 2, cy = bh / 2, ry = bh / 2 - sw;
  const borda = (x) => cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) - 3 * sw;
  const tx = tipX, ty = tipY - top;
  const b1 = tx + clamp(0.035 * bw, 8, 16);
  const b2 = b1 + clamp(0.1 * bw, 26, 42);
  const y1 = borda(b1), y2 = borda(b2);
  const rabo = `M${b1},${y1} Q${b1 - 0.15 * (b1 - tx)},${y1 + 0.6 * (ty - y1)} ${tx},${ty} Q${b2 - 0.45 * (b2 - tx)},${y2 + 0.5 * (ty - y2)} ${b2},${y2} Z`;
  const texto = { left: cx - (LARGURA / 2) * rx, top: cy - (FOLGA / 2) * ry, width: LARGURA * rx, height: FOLGA * ry };
  return { ...g, bh, top, cx, cy, ry, rabo, svgH: ty + sw, texto, tip: [tx, ty] };
}

export function FeedbackPersonagem({ narrador, positivo, titulo: tituloOrig, texto: textoOrig, botao, onBotao, escurecer, pula, topo }) {
  const face = (CARINHAS[narrador] ?? CARINHAS.alice)[positivo ? 'feliz' : 'triste'];
  // a voz gravada (Alice ou Luca) lê o feedback e o texto vai aparecendo junto (o balão já nasce do tamanho final)
  const voz = vozDoFeedback(narrador, tituloOrig, textoOrig);
  const [titulo, texto] = voz ? voz.texto.split('\n') : [tituloOrig, textoOrig];
  const sinc = useVozSincronizada(voz, titulo.length + 1 + texto.length, 350);
  const dito = voz && !sinc.falhou && !sinc.fim ? sinc.n : Infinity;
  const overlayRef = useRef(null);
  const cenaRef = useRef(null);
  const medidorRef = useRef(null);
  const [L, setL] = useState(null);

  useLayoutEffect(() => {
    const el = overlayRef.current;
    // o que vem antes na tela (cabeçalho, quadro do resultado): o balão não pode ficar por cima
    const irmaos = escurecer ? [] : [...el.parentElement.children].filter((n) => n !== el);
    const medir = () => {
      const cena = cenaRef.current;
      const medidor = medidorRef.current;
      if (!el || !cena || !medidor) return;
      const topoCena = cena.getBoundingClientRect().top;
      const minTop = irmaos.reduce((m, n) => {
        const r = n.getBoundingClientRect();
        return r.height ? Math.max(m, r.bottom - topoCena + 10) : m;
      }, 4);
      const g = geometria(cena.clientWidth, cena.clientHeight, el.parentElement.clientHeight, minTop, face);
      // altura que o texto ocupa com a letra f, na largura do balão
      medidor.style.width = `${g.larguraTexto}px`;
      const altura = (f) => { medidor.style.setProperty('--fb', `${f}px`); return medidor.offsetHeight; };
      let f = clamp(g.bw * 0.055, 11, 19);
      let h = altura(f);
      // o oval cresce até o texto caber com um respiro; se não houver espaço, a letra diminui só o necessário
      const bh = clamp(2 * ((h * 1.1) / FOLGA + g.sw), g.bhMin, g.bhMax);
      const caixa = FOLGA * (bh / 2 - g.sw);
      while (h > caixa && f > 8) { f -= 0.25; h = altura(f); }
      setL({ ...balao(g, bh), f });
    };
    medir();
    const ro = new ResizeObserver(medir);
    [el, ...irmaos].forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [face, escurecer, titulo, texto]);

  const animacao = !positivo ? 'tonta' : pula ? 'pula' : 'feliz';

  return (
    <div ref={overlayRef} className={`fb-overlay ${escurecer ? 'escuro' : 'claro'}`} style={topo ? { top: topo } : undefined}>
      <div ref={cenaRef} className="fb-cena">
        {/* invisível: só mede quanto espaço o texto precisa */}
        <div ref={medidorRef} className="fb-texto fb-medidor" aria-hidden="true">
          <div className="fb-titulo">{titulo}</div>
          <div className="fb-txt">{texto}</div>
        </div>
        {L && (
          <>
            <div className="fb-balao" style={{ top: L.top, transformOrigin: `${L.tip[0]}px ${L.tip[1]}px` }}>
              <svg className="fb-balao-forma" width={L.bw} height={L.svgH} viewBox={`0 0 ${L.bw} ${L.svgH}`} aria-hidden="true">
                <g fill="none" stroke="#1d1d1d" strokeWidth={2 * L.sw} strokeLinejoin="round">
                  <ellipse cx={L.cx} cy={L.cy} rx={L.rx} ry={L.ry} />
                  <path d={L.rabo} />
                </g>
                <g fill="#fff">
                  <ellipse cx={L.cx} cy={L.cy} rx={L.rx} ry={L.ry} />
                  <path d={L.rabo} />
                </g>
              </svg>
              <div className="fb-texto" style={{ ...L.texto, '--fb': `${L.f}px` }}>
                <div>
                  <div className="fb-titulo"><TextoRevelado texto={titulo} n={dito} /></div>
                  <div className="fb-txt"><TextoRevelado texto={texto} n={dito - titulo.length - 1} /></div>
                </div>
              </div>
            </div>
            <div className="fb-carinha" style={{ top: L.faceTop, width: L.fw, height: L.fh }}>
              <img key={face.img} className={animacao} src={face.img} alt={positivo ? 'Personagem feliz' : 'Personagem tonto'} draggable={false} />
            </div>
            <button
              className="botao pequeno botaoFb fb-botao"
              onClick={onBotao}
              style={{ left: L.fw + 10, bottom: L.fh * 0.3 }}
            >
              {botao}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
