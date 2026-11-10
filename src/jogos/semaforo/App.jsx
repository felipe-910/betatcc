import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import './App.css';
import { AvisaFim, voltarParaHistorias } from '../avisarPai.jsx';
import Historia from '../historia/Historia.jsx';
import { ALICE_FEEDBACK } from '../historia/personagens.js';
import { vozDoFeedback, useVozSincronizada, TextoRevelado } from '../historia/voz.jsx';
import verde from './assets/semaforo-verde.png';
import amarelo from './assets/semaforo-amarelo.png';
import vermelho from './assets/semaforo-vermelho.png';
import apagado from './assets/semaforo-apagado.png';
import bala from '../cesta/assets/bombom.png';
import refri from '../cesta/assets/refri.png';
import linguica from '../prato/assets/linguica.png';
import queijo from '../cesta/assets/queijo.png';
import banana from '../cesta/assets/banana.png';
import pao from '../cesta/assets/pao.png';
import laranja from '../cesta/assets/laranja.png';
import cenoura from '../cesta/assets/cenoura.png';
import maca from '../cesta/assets/maca.png';
import carro from './assets/carro.png';
import cenario from './assets/cenario.jpg';
import personagem from './assets/personagem.png';
import balao from './assets/balao.png';

const IMG = { verde, amarelo, vermelho, apagado, carro, personagem, balao };

const CARRO = IMG.carro;
const PERSONAGEM = IMG.personagem;
const BALAO = IMG.balao;
const LUZES = { verde: IMG.verde, amarelo: IMG.amarelo, vermelho: IMG.vermelho, apagado: IMG.apagado };

// 3 alimentos para cada cor. id = nome da imagem (usado na aba "Desempenho" dos pais).
const ALIMENTOS = [
  { id: 'bombom', nome: 'Bala', cor: 'vermelho', imagem: bala },
  { id: 'refri', nome: 'Refrigerante', cor: 'vermelho', imagem: refri },
  { id: 'linguica', nome: 'Linguiça', cor: 'vermelho', imagem: linguica },
  { id: 'queijo', nome: 'Queijo', cor: 'amarelo', imagem: queijo },
  { id: 'banana', nome: 'Banana', cor: 'amarelo', imagem: banana },
  { id: 'pao', nome: 'Pão', cor: 'amarelo', imagem: pao },
  { id: 'laranja', nome: 'Laranja', cor: 'verde', imagem: laranja },
  { id: 'cenoura', nome: 'Cenoura', cor: 'verde', imagem: cenoura },
  { id: 'maca', nome: 'Maçã', cor: 'verde', imagem: maca },
];

const DICAS = {
  verde: 'Verde: faz muito bem ao corpo! Pode comer sempre.',
  amarelo: 'Amarelo: pode comer, mas sem exagerar.',
  vermelho: 'Vermelho: não é para comer no dia a dia.',
};
const ZONAS = ['verde', 'amarelo', 'vermelho'];
const RODADAS = ALIMENTOS.length;

// recorte do semáforo dentro da imagem quadrada
const LUZ_H = 300, LUZ_W = 150;
const IMG_TAM = (LUZ_H * 1920) / 1750;
const IMG_LEFT = LUZ_W / 2 - 0.5297 * IMG_TAM;
const IMG_TOP = -(120 / 1920) * IMG_TAM;

// Feedbacks da tela de resultado (um por rodada, sorteado). Cada um: título = primeira frase, texto = o resto.
const FEEDBACKS = {
  perfeito: [ // acertou tudo
    { titulo: 'Uau!', texto: 'Você acertou todos os alimentos! Já sabe que o verde faz muito bem, o amarelo pede moderação e o vermelho não é para o dia a dia. Parabéns pelo capricho!' },
    { titulo: 'Arrasou!', texto: 'Você conhece muito bem as cores do semáforo saudável! Escolher bem os alimentos ajuda o nosso corpo a ter energia para brincar, aprender e crescer. Continue assim!' },
    { titulo: 'Que craque do semáforo!', texto: 'Você combinou cada alimento com a cor certa. Saber como cada um deve aparecer na nossa alimentação é uma ótima maneira de cuidar da saúde. Mandou muito bem!' },
  ],
  bom: [ // acertou a maior parte
    { titulo: 'Muito bem!', texto: 'Você acertou quase tudo! Lembre-se: verde pode comer sempre, amarelo sem exagerar e vermelho não é para o dia a dia. Que tal jogar mais uma vez para acertar todos?' },
    { titulo: 'Mandou bem!', texto: 'Você já conhece várias cores do semáforo saudável. Observe com atenção os alimentos que ficaram em dúvida e tente de novo na próxima rodada. Vamos lá?' },
  ],
  precisaMelhorar: [ // acertou poucos
    { titulo: 'Bom começo!', texto: 'Montar o semáforo saudável é uma forma de aprender sobre os alimentos. Lembre-se: verde faz muito bem, amarelo pede cuidado e vermelho não é para o dia a dia. Vamos tentar mais uma vez?' },
    { titulo: 'Não desanime!', texto: 'Cada tentativa é uma chance de aprender. Preste atenção em cada alimento e escolha a cor que combina com ele. Você consegue acertar mais na próxima rodada!' },
  ],
};

const sortear = () => [...ALIMENTOS].sort(() => Math.random() - 0.5);

function Tela({ titulo, onVoltar, tema, children }) {
  return (
    <div className={`tela${tema ? ` ${tema}` : ''}`} style={tema ? undefined : { backgroundImage: `url(${cenario})` }}>
      <div className="header">
        <button className="voltar" onClick={onVoltar} style={{ visibility: onVoltar ? 'visible' : 'hidden' }}>←</button>
        <div className="titulo">{titulo}</div>
        <div className="voltar" />
      </div>
      {children}
      <img className="carro" src={CARRO} alt="" />
    </div>
  );
}

function Semaforo({ acesa, onEscolher, desativado }) {
  return (
    <div className="semaforo">
      <div className="luz">
        <img src={LUZES[acesa || 'apagado']} alt="" style={{ width: IMG_TAM, height: IMG_TAM, left: IMG_LEFT, top: IMG_TOP }} />
        <div className="zonas">
          {ZONAS.map((cor) => (
            <button key={cor} disabled={desativado} onClick={() => onEscolher(cor)} aria-label={`Semáforo ${cor}`} />
          ))}
        </div>
      </div>
      <div className="poste" />
    </div>
  );
}

function Inicio({ onJogar }) {
  return (
    <Tela titulo="Semáforo Saudável" onVoltar={voltarParaHistorias}>
      <div className="centro">
        <img src={LUZES.apagado} className="inicioImg" alt="" />
        <p className="txt">Veja o alimento e escolha a cor do semáforo!</p>
        <div className="legenda">
          <b style={{ color: '#3fb618' }}>● Verde: faz muito bem</b>
          <b style={{ color: '#d99a00' }}>● Amarelo: sem exagerar</b>
          <b style={{ color: '#e5484d' }}>● Vermelho: não no dia a dia</b>
        </div>
        <button className="botao" onClick={onJogar}>Jogar</button>
      </div>
    </Tela>
  );
}

const COR_NOME = { verde: '#3fa03d', amarelo: '#d99a00', vermelho: '#e5484d' };
const DESC = {
  verde: 'Faz muito bem ao corpo e pode comer sempre!',
  amarelo: 'Pode comer, mas sem exagerar.',
  vermelho: 'Não é para comer no dia a dia.',
};

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
  const bw = Math.max(170, Math.min(clamp(1.3 * ph, 230, 360), bwH, bwV));
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
    const minimo = 8.5;
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

function Jogo({ onSair, narrador }) {
  const [rodadas, setRodadas] = useState(sortear);
  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [respostas, setRespostas] = useState([]); // o que a criança respondeu em cada alimento (aba "Desempenho")
  const [escolha, setEscolha] = useState(null);
  const [fim, setFim] = useState(false);
  const [semente, setSemente] = useState(() => Math.floor(Math.random() * 6)); // sorteia qual dos feedbacks da mesma situação aparece

  const alimento = rodadas[indice];
  const respondido = escolha !== null;
  const acertou = respondido && escolha === alimento.cor;
  const ultima = indice + 1 >= RODADAS;

  const escolher = (cor) => {
    if (respondido) return;
    setEscolha(cor);
    setRespostas((l) => [...l, { id: alimento.id, nome: alimento.nome, escolha: cor, certa: alimento.cor }]);
    if (cor === alimento.cor) setAcertos((a) => a + 1);
  };

  const proximo = () => {
    if (ultima) setFim(true);
    else { setIndice((i) => i + 1); setEscolha(null); }
  };

  const reiniciar = () => { setRodadas(sortear()); setIndice(0); setAcertos(0); setRespostas([]); setEscolha(null); setFim(false); setSemente(Math.floor(Math.random() * 6)); };

  if (fim) {
    const perfeito = acertos === RODADAS;
    const bom = acertos / RODADAS >= 0.6;
    const estrelas = perfeito ? 3 : bom ? 2 : 1;
    const fb = perfeito ? FEEDBACKS.perfeito : bom ? FEEDBACKS.bom : FEEDBACKS.precisaMelhorar;
    const { titulo, texto } = fb[semente % fb.length];
    return (
      <Tela titulo="Semáforo Saudável" onVoltar={onSair} tema="creme">
        <div className="resCard">
          <div className="luzFim"><img src={LUZES[bom ? 'verde' : 'amarelo']} alt="" /></div>
          <div className="resDireita">
            <div className="estrelas">{[0, 1, 2].map((n) => <Estrela key={n} cheia={n < estrelas} />)}</div>
            <div className="resPill">Seu resultado</div>
            <div className="resPlacar">{acertos} de {RODADAS} acertos</div>
          </div>
        </div>
        <AvisaFim jogo="semaforo" estrelas={estrelas} resumo={`${acertos} de ${RODADAS} acertos`} narrador={narrador} detalhes={{ tipo: 'semaforo', respostas }} />
        <FeedbackPersonagem
          narrador={narrador}
          titulo={titulo}
          texto={texto}
          botao={<><Recarregar />Jogar novamente</>}
          onBotao={reiniciar}
          pula={perfeito}
          topo="38%"
        />
      </Tela>
    );
  }

  return (
    <Tela titulo="Semáforo Saudável" onVoltar={onSair}>
      <div className="progresso">
        <div className="trilho"><div className="barra" style={{ width: `${((indice + 1) / RODADAS) * 100}%` }} /></div>
        <span>{indice + 1}/{RODADAS}</span>
      </div>
      <div className="palco">
        <div className="colunaSemaforo">
          <Semaforo acesa={respondido ? escolha : null} onEscolher={escolher} desativado={respondido} />
        </div>
        <div key={indice} className="cartao">
          <img src={alimento.imagem} alt={alimento.nome} />
          <span>{alimento.nome}</span>
        </div>
      </div>
      {respondido && (
        <FeedbackPersonagem
          narrador={narrador}
          escurecer
          pula={acertou}
          titulo={acertou ? 'Muito bem!' : 'Quase!'}
          texto={`${alimento.nome} fica no ${alimento.cor}. ${DESC[alimento.cor]}`}
          botao={ultima ? 'Resultado ➜' : 'Próximo ➜'}
          onBotao={proximo}
        />
      )}
    </Tela>
  );
}

export default function App() {
  // antes do minijogo vem a história (obrigatória); quem a conta é quem dá o feedback no fim
  const [narrador, setNarrador] = useState(null);
  if (!narrador) return <Historia jogo="semaforo" fundo="#dcf3e0" titulo="Semáforo Saudável" imagem={verde} onFim={setNarrador} onSair={voltarParaHistorias} />;
  return <Jogo narrador={narrador} onSair={voltarParaHistorias} />;
}
