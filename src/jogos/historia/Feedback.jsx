import { useLayoutEffect, useRef, useState } from 'react';
import './Feedback.css';
import { CARINHAS } from './personagens.js';
import { vozDoFeedback, useVozSincronizada, TextoRevelado } from './voz.jsx';

/* ---------- Feedback com a carinha do narrador e o balão de fala (o mesmo nos 3 minijogos) ----------
   Quem contou a história é quem dá o feedback. Embaixo, à esquerda, fica a carinha (feliz quando
   positivo, tonta quando negativo), olhando para a direita; o balão (oval mais largo que alto) fica
   logo acima da cabeça, e o "rabinho" desce pelo lado direito do rosto até a boca. O botão fica ao
   lado da carinha. O balão tem a altura que o texto pede, dentro de uma proporção fixa. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TX = 0.78;          // área de texto: meia-largura = TX * raio horizontal do oval
const TY = 0.64;          // área de texto: meia-altura = TY * raio vertical do oval
const ASP_MAX = 2.6;      // oval mais "deitado" (texto curto)
const ASP_MIN = 1.65;     // oval mais "redondo" (texto longo)

// Medidas que não dependem do texto. W, H: área do feedback; Ht: altura da tela.
function base(W, Ht, face) {
  const fw = Math.min(0.37 * W, 0.21 * Ht * face.asp, 175);   // largura da carinha
  const fh = fw / face.asp;
  const sw = clamp(W * 0.009, 2.5, 4);                         // espessura do contorno
  const bx = 0.09 * W;                                         // o balão começa um pouco para dentro da cabeça
  const bw = W - bx;
  const rx = bw / 2 - sw;
  return { fw, fh, sw, bx, bw, rx, larguraTexto: 2 * TX * rx };
}

// Posições finais para um oval de altura bh. minTop: até onde o balão pode subir; levantar: folga embaixo.
function montar(g, bh, H, levantar, face) {
  const { fw, fh, sw, bx, bw, rx } = g;
  const faceTop = H - levantar - fh;
  const fundo = faceTop + 0.05 * fh;                 // ponto mais baixo do oval (fica à direita da cabeça)
  const top = fundo - bh;
  const cx = bw / 2, cy = bh / 2, ry = bh / 2 - sw;
  const borda = (x) => cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) - 2.5 * sw;
  // em coordenadas do balão (0,0 = canto superior esquerdo do oval)
  const P = ([x, y]) => [x * fw - bx, faceTop + y * fh - top];
  const [tx, ty] = P(face.boca);                      // ponta: na boca
  const [kx, ky] = P(face.joelho);                    // curva: do lado direito do rosto
  const b1 = Math.max(kx + 0.04 * fw, tx + 0.28 * fw);
  const b2 = b1 + clamp(0.085 * bw, 22, 34);
  const y1 = borda(b1), y2 = borda(b2);
  const rabo = `M${b1},${y1} Q${kx - 0.02 * fw},${ky} ${tx},${ty} Q${kx + 0.16 * fw},${ky + 0.04 * fh} ${b2},${y2} Z`;
  const texto = { left: cx - TX * rx, top: cy - TY * ry, width: 2 * TX * rx, height: 2 * TY * ry };
  return { ...g, bh, top, faceTop, levantar, cx, cy, ry, rabo, svgH: ty + 2 * sw, texto, tip: [tx, ty] };
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
      const W = cena.clientWidth, H = cena.clientHeight, Ht = el.parentElement.clientHeight;
      const topoCena = cena.getBoundingClientRect().top;
      const minTop = irmaos.reduce((m, n) => {
        const r = n.getBoundingClientRect();
        return r.height ? Math.max(m, r.bottom - topoCena + 12) : m;
      }, 4);
      const g = base(W, Ht, face);
      // altura que o texto ocupa com a letra f, na largura do balão
      medidor.style.width = `${g.larguraTexto}px`;
      const altura = (f) => { medidor.style.setProperty('--fb', `${f}px`); return medidor.offsetHeight; };
      let f = clamp(g.bw * 0.046, 11, 16);
      let h = altura(f);
      const espaco = H - minTop - 0.95 * g.fh;                      // altura livre para o oval
      const bhMax = Math.max(80, Math.min(g.bw / ASP_MIN, espaco));
      const bhMin = Math.min(bhMax, g.bw / ASP_MAX);
      const bh = clamp(2 * ((h * 1.06) / (2 * TY) + g.sw), bhMin, bhMax);
      const caixa = 2 * TY * (bh / 2 - g.sw);
      while (h > caixa && f > 8.5) { f -= 0.25; h = altura(f); }
      // sobrando espaço, o conjunto (balão + carinha + botão) fica no meio da área livre, sem colar embaixo
      const sobra = espaco - bh;
      const levantar = escurecer ? 0 : clamp(sobra * 0.5, 0, 0.12 * Ht);
      setL({ ...montar(g, bh, H, levantar, face), f });
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
            <div className="fb-carinha" style={{ top: L.faceTop, width: L.fw, height: L.fh }}>
              <img
                key={face.img}
                className={animacao}
                src={face.img}
                alt={positivo ? 'Personagem feliz' : 'Personagem tonto'}
                draggable={false}
                style={{ transformOrigin: `${face.boca[0] * 100}% ${face.boca[1] * 100}%` }}
              />
            </div>
            <div className="fb-balao" style={{ left: L.bx, top: L.top, transformOrigin: `${L.tip[0]}px ${L.tip[1]}px` }}>
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
            <button
              className="botao pequeno botaoFb fb-botao"
              onClick={onBotao}
              style={{ left: L.fw + 12, bottom: L.levantar + L.fh * 0.3 }}
            >
              {botao}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
