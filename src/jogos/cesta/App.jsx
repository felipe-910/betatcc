import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import './App.css';
import { AvisaFim, voltarParaHistorias } from '../avisarPai.jsx';
import Historia from '../historia/Historia.jsx';
import { ALICE_FEEDBACK } from '../historia/personagens.js';
import { vozDoFeedback, useVozSincronizada, TextoRevelado } from '../historia/voz.jsx';
import { ALIMENTOS } from './alimentos.js';
import { IMAGENS, PROPORCAO, CESTA, CENARIO, PERSONAGEM, BALAO } from './assets.js';
import { TOTAL_ITENS, montarSacola, avaliar, escolherFeedback } from './logica.js';

/* ---------- Ajustes do jogo ---------- */
const ASPECTO_CESTA = 254 / 512;  // altura / largura da imagem da cesta
const T_CONTAGEM = 2.3;           // segundos de "3, 2, 1, Vai!" antes de cair o primeiro alimento
const INTERVALO = [1.35, 0.8];    // segundos entre um alimento e o próximo (começo → fim da rodada)
const VELOCIDADE = [0.3, 0.55];   // velocidade de queda, em alturas da tela por segundo (começo → fim)
const SIMBOLO = { saudavel: '✓', consumivel: '!', naoSaudavel: '✕' };
const CLASSE_CESTA = { saudavel: 'boa', consumivel: 'media', naoSaudavel: 'ruim' };
const ZERO = { saudavel: 0, consumivel: 0, naoSaudavel: 0 };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, p) => a + (b - a) * p;

/* ---------- Ícones (SVG) ---------- */
function Estrela({ cheia }) {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
      <path
        d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9z"
        fill={cheia ? '#f7c531' : '#e3e3e3'} stroke={cheia ? '#d99a00' : '#c4c4c4'} strokeWidth="1.4" strokeLinejoin="round"
      />
    </svg>
  );
}

function Recarregar() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M20 3.5v5.2h-5.2" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Estrutura de tela ---------- */
function Tela({ titulo, onVoltar, tema, cenario, children }) {
  return (
    <div className={`tela${tema ? ` ${tema}` : ''}${cenario ? ' comCenario' : ''}`} style={cenario ? { backgroundImage: `url(${CENARIO})` } : undefined}>
      <div className="header">
        <button className="voltar" onClick={onVoltar} aria-label="Voltar" style={{ visibility: onVoltar ? 'visible' : 'hidden' }}>←</button>
        <div className="titulo">{titulo}</div>
        <div className="voltar" />
      </div>
      {children}
    </div>
  );
}

// Faixa de baixo com as setas de mover (o chão agora é o próprio cenário)
function Piso({ children }) {
  return (
    <div className="piso">
      <div className="pano">{children}</div>
    </div>
  );
}

// Quantos alimentos já estão na cesta: verde = certos; vermelho = errados (tudo que não é nutritivo)
function Placar({ valores, bump }) {
  return (
    <div className="placar">
      {['saudavel', 'naoSaudavel'].map((t) => (
        <div key={`${t}-${bump?.tipo === t ? bump.n : 0}`} className={`chip ${t}${bump?.tipo === t ? ' bump' : ''}`}>
          <i>{SIMBOLO[t]}</i>{t === 'saudavel' ? valores.saudavel : valores.consumivel + valores.naoSaudavel}
        </div>
      ))}
    </div>
  );
}

function Inicio({ onJogar }) {
  return (
    <Tela titulo="Cesta Saudável" onVoltar={voltarParaHistorias} cenario>
      <div className="centro">
        <img src={CESTA} className="inicioImg" alt="" />
        <p className="txt">Mova a cesta e pegue os alimentos que estão caindo!</p>
        <div className="legenda">
          <b><i className="ponto saudavel">{SIMBOLO.saudavel}</i> Alimentos nutritivos</b>
          <b><i className="ponto naoSaudavel">{SIMBOLO.naoSaudavel}</i> Com menos frequência</b>
        </div>
        <button className="botao" onClick={onJogar}>Jogar</button>
      </div>
    </Tela>
  );
}

/* ---------- Feedback com personagem e balão (mesmo componente do Monte seu prato) ---------- */
// Balão horizontal (sem rotação). A ponta fica no canto inferior esquerdo da imagem e é ancorada
// ao lado da boca do personagem; o corpo do balão fica à direita e um pouco acima da cabeça.
// Medidas do PNG em unidades da largura do balão (bw).
const GEO = {
  asp: 800 / 496,          // largura / altura da imagem
  tipX: 0.025, tipY: 0.998, // posição da ponta dentro da imagem (fração)
  tcx: 0.5, tcy: 0.30,      // centro do oval (em bw, a partir do canto superior esquerdo da imagem)
  tw: 0.72, th: 0.38,       // área de texto que cabe dentro do oval (em bw)
};
// proporção do personagem e ponto da boca (fração da largura / altura do sprite)
const SPRITE = { asp: 210 / 720, tipX: 0.92, tipY: 0.165 };

function calcLayout(Wc, Ht, Ho, padB, SPRITE) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PAD = 8;
  const ph = clamp(0.31 * Ht, 190, 330);             // altura do personagem (um pouco menor: o balão ganha largura para o feedback caber inteiro)
  const cw = ph * SPRITE.asp;                         // largura do personagem
  const charLeft = clamp(0.03 * Wc, 8, 0.2 * Wc);     // personagem no canto inferior esquerdo
  const tx = cw * SPRITE.tipX, ty = ph * SPRITE.tipY; // boca (relativa ao personagem)
  const tipXAbs = charLeft + tx;
  const tipYAbs = Ho - padB - ph + ty;                // altura da boca dentro do overlay
  const bwH = (Wc - PAD - tipXAbs) / (1 - GEO.tipX);  // cabe à direita
  const bwV = ((tipYAbs - PAD) * GEO.asp) / GEO.tipY; // cabe acima
  const bw = Math.max(170, Math.min(clamp(1.6 * ph, 230, 400), bwH, bwV));
  return { ph, cw, bw, charLeft, tipX: tipXAbs, tipY: ty };
}

function FeedbackPersonagem({ titulo: tituloOrig, texto: textoOrig, botao, onBotao, escurecer, pula, topo, narrador }) {
  // quem contou a história é quem dá o feedback: Alice (png de corpo inteiro) ou Luca (personagem.png do jogo)
  const { img: imgPersonagem, sprite } = narrador === 'alice' ? ALICE_FEEDBACK : { img: PERSONAGEM, sprite: SPRITE };
  // Luca: a voz gravada lê o feedback e o texto vai aparecendo junto (o balão já nasce do tamanho final).
  const voz = narrador === 'luca' ? vozDoFeedback(tituloOrig, textoOrig) : null;
  // com a voz do Luca, o balão mostra o texto exatamente como ele fala
  const [titulo, texto] = voz ? voz.texto.split('\n') : [tituloOrig, textoOrig];
  const sinc = useVozSincronizada(voz, titulo.length + 1 + texto.length, 350);
  const dito = voz && !sinc.falhou && !sinc.fim ? sinc.n : Infinity;
  const overlayRef = useRef(null);
  const cenaRef = useRef(null);
  const textoRef = useRef(null);
  const mioloRef = useRef(null);
  const [L, setL] = useState(null);

  useLayoutEffect(() => {
    const el = overlayRef.current;
    const medir = () => {
      const cena = cenaRef.current;
      if (!el || !cena) return;
      setL(calcLayout(cena.clientWidth, el.parentElement.clientHeight, el.clientHeight, 0.03 * el.clientWidth, sprite));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sprite]);

  // O feedback aparece inteiro, de uma vez, no balão: a letra é reduzida só o necessário para o texto caber.
  useLayoutEffect(() => {
    const caixa = textoRef.current;
    const miolo = mioloRef.current;
    if (!L || !caixa || !miolo) return;
    let f = L.bw * 0.05;
    const minimo = 7.5;
    caixa.style.setProperty('--fb', `${f}px`);
    while (miolo.offsetHeight > caixa.clientHeight && f > minimo) {
      f -= 0.25;
      caixa.style.setProperty('--fb', `${f}px`);
    }
  }, [L, titulo, texto]);

  const bx = L ? L.tipX - GEO.tipX * L.bw : 0;                 // canto esquerdo do balão
  const by = L ? L.tipY - (GEO.tipY * L.bw) / GEO.asp : 0;      // canto superior do balão

  return (
    <div ref={overlayRef} className={`fbOverlay ${escurecer ? 'escuro' : 'claro'}`} style={topo ? { top: topo } : undefined}>
      <div ref={cenaRef} className="fbCena" style={{ height: L ? L.ph : 200, visibility: L ? 'visible' : 'hidden' }}>
        {L && (
          <>
            <div className="balao" style={{ transformOrigin: `${L.tipX}px ${L.tipY}px` }}>
              <img className="balaoImg" src={BALAO} alt="" style={{ width: L.bw, left: bx, top: by }} />
              <div
                ref={textoRef}
                className="balaoTexto"
                style={{
                  width: GEO.tw * L.bw,
                  height: GEO.th * L.bw,
                  left: bx + (GEO.tcx - GEO.tw / 2) * L.bw,
                  top: by + (GEO.tcy - GEO.th / 2) * L.bw,
                }}
              >
                <div ref={mioloRef}>
                  <div className="fbTitulo"><TextoRevelado texto={titulo} n={dito} /></div>
                  <div className="fbTxt"><TextoRevelado texto={texto} n={dito - titulo.length - 1} /></div>
                </div>
              </div>
            </div>
            <img
              className={`personagem ${pula ? 'pula' : ''}`}
              src={imgPersonagem}
              alt="Personagem"
              style={{ left: L.charLeft, height: L.ph }}
            />
            <button className="botao pequeno botaoFb" onClick={onBotao}>{botao}</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Partida ---------- */
// Tudo que se mexe (alimentos caindo, cesta) é atualizado direto no DOM a cada quadro,
// para o jogo ficar fluido. O React só cuida de contagem, placar e telas.
function Partida({ onFim, onSair }) {
  const campoRef = useRef(null);
  const itensRef = useRef(null);
  const cestaRef = useRef(null);      // cesta (parte de trás)
  const frenteRef = useRef(null);     // borda da frente da cesta: fica por cima do alimento que cai dentro
  const foraRef = useRef(null);       // alimentos que erraram a cesta: sempre à frente de tudo
  const popsRef = useRef(null);
  const ctrl = useRef({ alvo: null, dir: 0 });   // controles: toque/mouse (alvo) e setas/teclado (dir)
  const onFimRef = useRef(onFim);
  onFimRef.current = onFim;

  const [rotulo, setRotulo] = useState('3');     // contagem regressiva
  const [soltos, setSoltos] = useState(0);       // quantos alimentos já caíram
  const [placar, setPlacar] = useState(ZERO);
  const [bump, setBump] = useState(null);

  useEffect(() => {
    const campo = campoRef.current, itensEl = itensRef.current, foraEl = foraRef.current, popsEl = popsRef.current;
    const cestas = [cestaRef.current, frenteRef.current];   // as duas camadas da cesta andam juntas
    const sacola = montarSacola(ALIMENTOS);
    const g = { t: 0, prox: T_CONTAGEM, idx: 0, itens: [], x: 0, alvo: null, ultX: null, fimEm: null, acabou: false, rotulo: '3', cont: { ...ZERO }, n: 0, pegos: {} };
    let W = 0, H = 0, tam = 0, bw = 0, bh = 0;

    const medir = () => {
      W = campo.clientWidth; H = campo.clientHeight;
      tam = clamp(W * 0.15, 44, 68);
      bw = clamp(W * 0.36, 112, 170);
      bh = bw * ASPECTO_CESTA;
      cestas.forEach((c) => { c.style.width = `${bw}px`; c.style.height = `${bh}px`; });
      g.x = clamp(g.x || W / 2, bw / 2, W - bw / 2);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(campo);

    // teclado (computador): setas ou A / D
    const tecla = (e, v) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') ctrl.current.dir = v ? -1 : (ctrl.current.dir === -1 ? 0 : ctrl.current.dir);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') ctrl.current.dir = v ? 1 : (ctrl.current.dir === 1 ? 0 : ctrl.current.dir);
      else return;
      e.preventDefault();
    };
    const baixo = (e) => tecla(e, true), cima = (e) => tecla(e, false);
    window.addEventListener('keydown', baixo);
    window.addEventListener('keyup', cima);

    const efeitoCesta = (tipo) => {
      cestas.forEach((c) => {
        c.classList.remove('boa', 'media', 'ruim');
        void c.offsetWidth; // reinicia a animação
        c.classList.add(CLASSE_CESTA[tipo]);
      });
    };
    const pop = (tipo, x, y) => {
      const el = document.createElement('div');
      el.className = `pop ${tipo}`;
      el.textContent = SIMBOLO[tipo];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.addEventListener('animationend', () => el.remove());
      popsEl.appendChild(el);
    };

    const criarAlimento = () => {
      const alimento = sacola[g.idx];
      const prog = g.idx / (TOTAL_ITENS - 1);
      // tamanho pela "área", para alimentos finos (salsicha, refri) ou largos (macarrão) ficarem equilibrados
      const asp = PROPORCAO[alimento.id] || 1;
      const area = tam * tam * 0.85;
      const w = Math.min(Math.sqrt(area * asp), tam * 1.5), h = Math.min(Math.sqrt(area / asp), tam * 1.5);
      const m = Math.max(w, h) * 0.6;
      let x = W / 2;
      for (let k = 0; k < 8; k++) {            // evita cair sempre no mesmo lugar
        x = m + Math.random() * Math.max(1, W - 2 * m);
        if (g.ultX == null || Math.abs(x - g.ultX) > W * 0.2) break;
      }
      g.ultX = x;
      const el = document.createElement('img');
      el.className = 'alimento';
      el.src = IMAGENS[alimento.id];
      el.alt = '';
      el.draggable = false;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      itensEl.appendChild(el);
      g.itens.push({
        el, alimento, x, y: -h, w, h,
        vy: H * mix(VELOCIDADE[0], VELOCIDADE[1], prog) * (0.9 + Math.random() * 0.2),
        rot: Math.random() * 40 - 20,
        giro: (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 45),
      });
      g.idx += 1;
      setSoltos(g.idx);
      g.prox = g.t + mix(INTERVALO[0], INTERVALO[1], prog);
    };

    let raf = 0, ultimo = performance.now(), fimTimer = 0;
    const quadro = (agora) => {
      raf = requestAnimationFrame(quadro);
      if (g.acabou) return;
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      g.t += dt;

      // contagem regressiva
      const r = g.t < 0.7 ? '3' : g.t < 1.4 ? '2' : g.t < 2.1 ? '1' : g.t < T_CONTAGEM + 0.3 ? 'Vai!' : '';
      if (r !== g.rotulo) { g.rotulo = r; setRotulo(r); }

      // cesta: segue o toque/mouse e as setas
      const c = ctrl.current;
      if (c.alvo !== null) { g.alvo = clamp(c.alvo, bw / 2, W - bw / 2); c.alvo = null; }
      if (c.dir) g.alvo = clamp((g.alvo ?? g.x) + c.dir * W * 1.3 * dt, bw / 2, W - bw / 2);
      let incl = 0;
      if (g.alvo !== null) {
        const d = g.alvo - g.x, passo = W * 2.2 * dt;
        g.x += Math.abs(d) <= passo ? d : Math.sign(d) * passo;
        incl = clamp((g.alvo - g.x) / W * 60, -9, 9);
      }
      const tf = `translate3d(${g.x - bw / 2}px, ${H - bh - 2}px, 0) rotate(${incl}deg)`;
      cestas.forEach((c) => { c.style.transform = tf; });

      // novos alimentos
      if (g.idx < TOTAL_ITENS && g.t >= g.prox) criarAlimento();

      // alimentos caindo
      // O alimento que cai dentro da cesta passa por cima da parte de trás e some atrás da borda da frente.
      // O que erra a cesta passa para a camada da frente e cai inteiro, sem ficar escondido atrás dela.
      const topo = H - bh - 2;                  // topo da cesta
      const yBoca = topo + bh * 0.14;           // borda de trás da cesta: aqui se decide se pegou
      const yLabio = topo + bh * 0.5;           // onde começa a borda da frente
      for (let i = g.itens.length - 1; i >= 0; i--) {
        const it = g.itens[i];
        it.y += it.vy * dt;
        it.rot += it.giro * dt;
        if (!it.pego && !it.passou && it.y >= yBoca) {
          if (Math.abs(it.x - g.x) <= bw * 0.44) {                     // dentro da boca da cesta: pegou!
            const tipo = it.alimento.tipo;
            it.pego = true;
            it.y0 = it.y;
            g.cont[tipo] += 1;
            g.pegos[it.alimento.id] = (g.pegos[it.alimento.id] || 0) + 1;
            g.n += 1;
            const visual = tipo === 'saudavel' ? 'saudavel' : 'naoSaudavel'; // na tela só existe certo (verde) ou errado (vermelho)
            efeitoCesta(visual);
            pop(visual, g.x, topo - 6);
            setPlacar({ ...g.cont });
            setBump({ tipo: visual, n: g.n });
          } else {
            it.passou = true;                  // errou: cai ao lado da cesta, na frente de tudo
            foraEl.appendChild(it.el);
          }
        }
        let escala = 1, opac = 1;
        if (it.pego) {                          // afunda na cesta e some atrás da borda da frente
          const p = clamp((it.y - it.y0) / (yLabio + it.h * 0.15 - it.y0), 0, 1);
          if (p >= 1) { it.el.remove(); g.itens.splice(i, 1); continue; }
          escala = 1 - 0.45 * p;
          opac = 1 - p * p;
        } else if (it.y - it.h > H) { it.el.remove(); g.itens.splice(i, 1); continue; }
        it.el.style.opacity = opac;
        it.el.style.transform = `translate3d(${it.x - it.w / 2}px, ${it.y - it.h / 2}px, 0) rotate(${it.rot}deg) scale(${escala})`;
      }

      // fim da rodada: tudo caiu
      if (g.idx >= TOTAL_ITENS && g.itens.length === 0) {
        if (g.fimEm === null) g.fimEm = g.t + 0.8;
        else if (g.t >= g.fimEm) {
          g.acabou = true;
          fimTimer = setTimeout(() => onFimRef.current({ ...g.cont, pegos: g.pegos }), 0);
        }
      }
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fimTimer);
      ro.disconnect();
      window.removeEventListener('keydown', baixo);
      window.removeEventListener('keyup', cima);
      itensEl.replaceChildren();
      foraEl.replaceChildren();
      popsEl.replaceChildren();
    };
  }, []);

  const apontar = (e) => {
    const r = campoRef.current.getBoundingClientRect();
    ctrl.current.alvo = e.clientX - r.left;
  };
  const segurar = (dir) => ({
    onPointerDown: (e) => { e.preventDefault(); ctrl.current.dir = dir; },
    onPointerUp: () => { if (ctrl.current.dir === dir) ctrl.current.dir = 0; },
    onPointerLeave: () => { if (ctrl.current.dir === dir) ctrl.current.dir = 0; },
    onPointerCancel: () => { if (ctrl.current.dir === dir) ctrl.current.dir = 0; },
    onContextMenu: (e) => e.preventDefault(),
  });

  return (
    <Tela titulo="Cesta Saudável" onVoltar={onSair} cenario>
      <div className="progresso">
        <div className="trilho"><div className="barra" style={{ width: `${(soltos / TOTAL_ITENS) * 100}%` }} /></div>
        <span>{soltos}/{TOTAL_ITENS}</span>
      </div>
      <Placar valores={placar} bump={bump} />

      <div
        ref={campoRef}
        className="campo"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); apontar(e); }}
        onPointerMove={apontar}
      >
        <div ref={itensRef} className="itens" />
        <div ref={cestaRef} className="cesta"><img className="cestaImg" src={CESTA} alt="Cesta" draggable={false} /></div>
        <div ref={frenteRef} className="cesta frente" aria-hidden="true"><img className="cestaImg" src={CESTA} alt="" draggable={false} /></div>
        <div ref={foraRef} className="itens fora" />
        <div ref={popsRef} className="pops" />
        {rotulo && (
          <div className="contagem">
            <span key={rotulo} className={rotulo === 'Vai!' ? 'vai' : ''}>{rotulo}</span>
            {rotulo !== 'Vai!' && <div className="dica">Arraste para mover a cesta</div>}
          </div>
        )}
      </div>

      <Piso>
        <button className="seta" aria-label="Mover para a esquerda" {...segurar(-1)}>←</button>
        <button className="seta" aria-label="Mover para a direita" {...segurar(1)}>→</button>
      </Piso>
    </Tela>
  );
}

/* ---------- Tela de resultado (igual à do Monte seu prato e à do Semáforo Saudável) ---------- */
export function Resultado({ r, onJogar, onSair, semente0, narrador }) {
  const [semente] = useState(() => semente0 ?? Math.floor(Math.random() * 6)); // sorteia qual dos feedbacks da mesma situação aparece
  const { grupo, estrelas } = avaliar(r);
  const { titulo, texto } = escolherFeedback(grupo, semente);   // só UM feedback por rodada
  // frase curta para a aba "Desempenho" dos pais
  const resumo = `${r.saudavel} certos, ${r.consumivel + r.naoSaudavel} errados`;
  // para a aba "Desempenho": certo = alimento nutritivo; qualquer outro conta como errado
  const pegos = ALIMENTOS.filter((a) => r.pegos?.[a.id]).map((a) => ({ id: a.id, nome: a.nome, qtd: r.pegos[a.id], certo: a.tipo === 'saudavel' }));
  const lista = (certo) => pegos.filter((a) => a.certo === certo).map(({ id, nome, qtd }) => ({ id, nome, qtd }));
  const detalhes = { tipo: 'cesta', certos: lista(true), errados: lista(false) };
  return (
    <Tela titulo="Cesta Saudável" onVoltar={onSair} tema="creme">
      <div className="resCard">
        <img className="cestaFim" src={CESTA} alt="" />
        <div className="resDireita">
          <div className="estrelas">{[0, 1, 2].map((n) => <Estrela key={n} cheia={n < estrelas} />)}</div>
          <div className="resPill">Seu resultado</div>
          <Placar valores={r} />
        </div>
      </div>
      <AvisaFim jogo="cesta" estrelas={estrelas} resumo={resumo} narrador={narrador} detalhes={detalhes} />
      <FeedbackPersonagem
        narrador={narrador}
        titulo={titulo}
        texto={texto}
        botao={<><Recarregar />Jogar novamente</>}
        onBotao={onJogar}
        pula={grupo === 'totalmentePositivo'}
        topo="38%"
      />
    </Tela>
  );
}

function Jogo({ onSair, narrador }) {
  const [rodada, setRodada] = useState(0);
  const [resultado, setResultado] = useState(null);
  if (resultado) return <Resultado r={resultado} narrador={narrador} onSair={onSair} onJogar={() => { setResultado(null); setRodada((n) => n + 1); }} />;
  return <Partida key={rodada} onFim={setResultado} onSair={onSair} />;
}

export default function App() {
  // antes do minijogo vem a história (obrigatória); quem a conta é quem dá o feedback no fim
  const [narrador, setNarrador] = useState(null);
  if (!narrador) return <Historia jogo="cesta" fundo="#d9f0fb" titulo="Cesta Saudável" imagem={CESTA} onFim={setNarrador} onSair={voltarParaHistorias} />;
  return <Jogo narrador={narrador} onSair={voltarParaHistorias} />;
}
