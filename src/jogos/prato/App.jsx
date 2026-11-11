import { useState, useEffect, useRef } from 'react';
import './App.css';
import { AvisaFim, voltarParaHistorias } from '../avisarPai.jsx';
import Historia from '../historia/Historia.jsx';
import { FeedbackPersonagem } from '../historia/Feedback.jsx';
import { SECOES, POSICOES, TAM_ITEM } from './geometria';
import prato from './assets/prato.png';
import brocolis from './assets/brocolis.png';
import cenoura from './assets/cenoura.png';
import tomate from './assets/tomate.png';
import abobora from './assets/abobora.png';
import frango from './assets/frango.png';
import carne from './assets/carne.png';
import ovo from './assets/ovo.png';
import feijao from './assets/feijao.png';
import linguica from './assets/linguica.png';
import nuggets from './assets/nuggets.png';
import arroz from './assets/arroz.png';
import batata from './assets/batata.png';
import macarrao from './assets/macarrao.png';
import milho from './assets/milho.png';
import chuchu from './assets/chuchu.png';
import beterraba from './assets/beterraba.png';
import alface from './assets/alface.png';
import agriao from './assets/agriao.png';
import couve from './assets/couve.png';
import zonaEsq from './assets/zona-esq.png';
import zonaDirTop from './assets/zona-dirTop.png';
import zonaDirBot from './assets/zona-dirBot.png';
import xadrez from './assets/xadrez.jpg';

/* ---------- Dados do jogo ---------- */
// grupo: a que parte do prato o alimento pertence. bom: false = alimento processado (sem exagerar)
const ALIMENTOS = [
  { nome: 'Arroz', imagem: arroz, grupo: 'carboidratos', bom: true },
  { nome: 'Batata', imagem: batata, grupo: 'carboidratos', bom: true },
  { nome: 'Macarrão', imagem: macarrao, grupo: 'carboidratos', bom: true },
  { nome: 'Milho', imagem: milho, grupo: 'carboidratos', bom: true },
  { nome: 'Feijão', imagem: feijao, grupo: 'carboidratos', bom: true },
  { nome: 'Frango', imagem: frango, grupo: 'proteinas', bom: true },
  { nome: 'Carne', imagem: carne, grupo: 'proteinas', bom: true },
  { nome: 'Ovo', imagem: ovo, grupo: 'proteinas', bom: true },
  { nome: 'Linguiça', imagem: linguica, grupo: 'proteinas', bom: false },
  { nome: 'Nuggets', imagem: nuggets, grupo: 'proteinas', bom: false },
  { nome: 'Brócolis', imagem: brocolis, grupo: 'legumes', bom: true },
  { nome: 'Cenoura', imagem: cenoura, grupo: 'legumes', bom: true },
  { nome: 'Tomate', imagem: tomate, grupo: 'legumes', bom: true },
  { nome: 'Abóbora', imagem: abobora, grupo: 'legumes', bom: true },
  { nome: 'Chuchu', imagem: chuchu, grupo: 'legumes', bom: true },
  { nome: 'Beterraba', imagem: beterraba, grupo: 'legumes', bom: true },
  { nome: 'Alface', imagem: alface, grupo: 'legumes', bom: true },
  { nome: 'Agrião', imagem: agriao, grupo: 'legumes', bom: true },
  { nome: 'Couve', imagem: couve, grupo: 'legumes', bom: true },
];

// As 3 divisões, na ordem do jogo. cap = quantos alimentos cabem na divisão.
const GRUPOS = [
  { id: 'carboidratos', secao: 'esq', cap: 2, singular: 'carboidrato', rotulo: '1ª divisão: carboidratos (até 2 alimentos)' },
  { id: 'proteinas', secao: 'dirTop', cap: 1, singular: 'proteína', rotulo: '2ª divisão: proteínas' },
  { id: 'legumes', secao: 'dirBot', cap: 1, singular: 'legume ou verdura', rotulo: '3ª divisão: legumes e verduras' },
];

const MASCARA = { esq: zonaEsq, dirTop: zonaDirTop, dirBot: zonaDirBot }; // formato real de cada divisão
// posição (fração da divisão) de cada alimento, conforme quantos estão na divisão

// Feedbacks positivos (arquivo "feedbacks positivos monte seu prato.docx"), exatamente como no arquivo.
// Cada um: título = primeira frase, texto = o resto. Em cada situação, sorteia um dos dois.
const FEEDBACKS = {
  completo: [ // 1 — prato completo e boas escolhas (com arroz e feijão)
    { titulo: 'Uau, você arrasou!', texto: 'Seu prato ficou cheio de alimentos nutritivos! O arroz, o feijão, as verduras, os legumes e os outros alimentos ajudam nosso corpo a receber os nutrientes de que precisa. Parabéns pelas escolhas!' },
    { titulo: 'Muito bem!', texto: 'Você montou um prato bem variado, com alimentos de diferentes grupos! Cada um deles tem sua importância para o nosso corpo. Continue fazendo boas escolhas e aprendendo sobre alimentação!' },
  ],
  orientacao: [ // 2 — prato adequado, mas com um alimento que deve ser consumido com menor frequência
    { titulo: 'Parabéns!', texto: 'Você montou um prato com vários alimentos importantes para a nossa saúde! Mas lembre-se: variar os alimentos é uma ótima maneira de conseguir diferentes nutrientes. Vamos continuar aprendendo?' },
    { titulo: 'Mandou bem!', texto: 'Seu prato ficou muito legal! Você já sabe que cada grupo de alimentos tem sua importância. Na próxima rodada, continue prestando atenção nas escolhas para montar uma refeição ainda mais variada!' },
  ],
  semArrozFeijao: [ // 3 — prato adequado, mas sem arroz, sem feijão ou sem os dois
    { titulo: 'Muito bom o seu prato!', texto: 'Você fez boas escolhas, mas percebeu que faltou um alimento importante? O arroz e o feijão fornecem nutrientes importantes para o nosso corpo. Na próxima rodada, tente incluir os dois também!' },
    { titulo: 'Você está indo muito bem!', texto: 'Seu prato tem alimentos que ajudam a cuidar da nossa saúde. Para deixá-lo ainda mais completo, lembre-se do arroz e do feijão, que fazem parte de muitas refeições brasileiras. Vamos continuar praticando?' },
  ],
};
// Feedbacks negativos (arquivo feedbacks_negativos_monte_seu_prato.docx). Mesmo formato: título = primeira frase, texto = o resto.
const FEEDBACKS_NEG = {
  poucos: [ // 1 — poucos alimentos nutritivos ou prato pouco variado (sorteia um)
    { titulo: 'Ops!', texto: 'Parece que seu prato ainda precisa de alguns ajustes! Tente escolher alimentos de diferentes grupos para deixar sua refeição mais variada. Vamos tentar mais uma vez?' },
    { titulo: 'Não desanime!', texto: 'Montar um prato equilibrado é uma forma de aprender sobre os alimentos. Observe as opções disponíveis e tente combinar diferentes grupos alimentares na próxima rodada!' },
  ],
  semArrozFeijao: [ // 2 — ausência de arroz e feijão (sorteia um)
    { titulo: 'Ops!', texto: 'Dessa vez, faltaram o arroz e o feijão no seu prato! Eles são alimentos importantes na alimentação e fornecem nutrientes de que nosso corpo precisa. Na próxima rodada, tente incluir os dois!' },
    { titulo: 'Vamos tentar novamente?', texto: 'Seu prato pode ficar ainda mais completo com arroz e feijão! Eles fazem parte de muitas refeições brasileiras e contribuem para uma alimentação variada. Que tal adicioná-los na próxima tentativa?' },
  ],
  ajustes: [ // 3 — muitas escolhas que precisam de ajustes (sorteia um)
    { titulo: 'Quase lá!', texto: 'Você já começou a montar seu prato, mas algumas escolhas podem melhorar. Procure variar os alimentos e dar espaço para diferentes grupos alimentares. Vamos tentar montar um prato mais variado?' },
    { titulo: 'Não desanime!', texto: 'Cada tentativa é uma oportunidade de aprender. Escolha alimentos de diferentes grupos e lembre-se de incluir arroz e feijão quando possível. Você consegue deixar seu prato ainda melhor!' },
  ],
};
const TEMPO_TOTAL = 5 * 60; // 5 minutos por rodada
const N_SLOTS = 8;          // quadrados da bandeja
const N_CERTOS = 4;         // quantos alimentos da divisão aparecem na bandeja (o resto são "intrusos")

const embaralhar = (v) => [...v].sort(() => Math.random() - 0.5);
// Bandeja de uma etapa: alimentos da divisão misturados com alimentos de outros grupos,
// para a criança poder errar e ser corrigida. Alimentos já colocados antes não voltam.
const montarOpcoes = (etapa, usados) => {
  const g = GRUPOS[etapa];
  const certos = embaralhar(ALIMENTOS.filter((a) => a.grupo === g.id && !usados.has(a.nome)));
  const errados = embaralhar(ALIMENTOS.filter((a) => a.grupo !== g.id && !usados.has(a.nome)));
  // nos carboidratos, arroz e feijão sempre aparecem (os feedbacks falam deles)
  const fixos = g.id === 'carboidratos' ? certos.filter((x) => x.nome === 'Arroz' || x.nome === 'Feijão') : [];
  const outros = certos.filter((x) => !fixos.includes(x));
  const nc = Math.min(certos.length, g.id === 'proteinas' ? N_CERTOS + 1 : N_CERTOS);
  const certosBandeja = [...fixos, ...outros].slice(0, Math.max(nc, fixos.length));
  return embaralhar([...certosBandeja, ...errados.slice(0, N_SLOTS - certosBandeja.length)]);
};
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ---------- Ícones (SVG, sem emojis) ---------- */
function Seta() {
  return (
    <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
      <path d="M26 16H7M15 7l-9 9 9 9" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
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
function Tela({ titulo, onVoltar, direita, tema, children }) {
  return (
    <div className={`tela${tema ? ` ${tema}` : ''}`}>
      <div className="xadrez" style={{ backgroundImage: `url(${xadrez})` }} />
      <div className="header">
        <button className="voltar" onClick={onVoltar} aria-label="Voltar" style={{ visibility: onVoltar ? 'visible' : 'hidden' }}><Seta /></button>
        <div className="titulo">{titulo}</div>
        <div className="direita">{direita}</div>
      </div>
      {children}
    </div>
  );
}

function Inicio({ onJogar }) {
  return (
    <Tela titulo="Monte seu prato" onVoltar={voltarParaHistorias}>
      <div className="centro">
        <img src={prato} className="inicioImg" alt="" />
        <p className="txt">Arraste os alimentos certos para cada divisão do prato e monte uma refeição completa!</p>
        <div className="legenda">
          <b><i className="ponto" style={{ background: '#e5a000' }} /> 1ª divisão: carboidratos</b>
          <b><i className="ponto" style={{ background: '#e5484d' }} /> 2ª divisão: proteínas</b>
          <b><i className="ponto" style={{ background: '#3fb618' }} /> 3ª divisão: legumes e verduras</b>
        </div>
        <p className="txt pequenoTxt">Você tem 5 minutos para terminar.</p>
        <button className="botao" onClick={onJogar}>Jogar</button>
      </div>
    </Tela>
  );
}

/* ---------- Prato com os alimentos escolhidos ---------- */
function PratoMontado({ escolhas, ativa, zonaRefs, onPegar, className = '' }) {
  return (
    <div className={`pratoBox ${className}`}>
      <img className="pratoImg" src={prato} alt="Prato com três divisões" draggable={false} />
      {GRUPOS.map((g, i) => {
        const [x0, y0, x1, y1] = SECOES[g.secao];
        const lista = escolhas[i] || [];
        const ehAtiva = ativa === i;
        const pos = POSICOES[Math.max(1, lista.length)];
        return (
          <div
            key={g.id}
            ref={(el) => { if (zonaRefs) zonaRefs.current[i] = el; }}
            className="zona"
            style={{ left: `${x0 * 100}%`, top: `${y0 * 100}%`, width: `${(x1 - x0) * 100}%`, height: `${(y1 - y0) * 100}%` }}
          >
            {ehAtiva && lista.length < g.cap && <img className="mascara" src={MASCARA[g.secao]} alt="" draggable={false} />}
            {lista.map((alimento, k) => (
              <img
                key={alimento.nome}
                className={`porcao ${ehAtiva && onPegar ? 'pegavel' : ''}`}
                src={alimento.imagem}
                alt={alimento.nome}
                draggable={false}
                style={{ left: `${pos[k][0] * 100}%`, top: `${pos[k][1] * 100}%`, width: `${TAM_ITEM[g.secao] * 100}%` }}
                onPointerDown={ehAtiva && onPegar ? (e) => onPegar(e, alimento) : undefined}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Jogo ---------- */
function Jogo({ onSair, narrador }) {
  const [etapa, setEtapa] = useState(0);                       // 0, 1, 2
  const [escolhas, setEscolhas] = useState([[], [], []]);      // alimentos colocados em cada divisão
  const [opcoes, setOpcoes] = useState(() => montarOpcoes(0, new Set()));
  const [tempo, setTempo] = useState(TEMPO_TOTAL);
  const [fim, setFim] = useState(null);                        // null | 'completo' | 'tempo'
  const [arrasto, setArrasto] = useState(null);                // { alimento, x, y, w }
  const [semente, setSemente] = useState(() => Math.floor(Math.random() * 6)); // sorteia qual dos feedbacks da mesma situação aparece
  const zonaRefs = useRef([]);
  const etapaRef = useRef(0);
  etapaRef.current = etapa;

  // cronômetro de 5 minutos para a rodada toda
  useEffect(() => {
    if (fim) return undefined;
    const id = setInterval(() => setTempo((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [fim]);
  useEffect(() => { if (tempo === 0 && !fim) setFim('tempo'); }, [tempo, fim]);

  const grupo = GRUPOS[etapa];
  const naDivisao = escolhas[etapa];
  const ultima = etapa === 2;

  // coloca na divisão atual; se já estiver cheia, o mais antigo volta para a bandeja
  const colocar = (alimento) => setEscolhas((e) => {
    const n = e.map((l) => [...l]);
    const lista = n[etapaRef.current];
    if (lista.length >= GRUPOS[etapaRef.current].cap) lista.shift();
    lista.push(alimento);
    return n;
  });
  const tirar = (alimento) => setEscolhas((e) => e.map((l, i) => (i === etapaRef.current ? l.filter((a) => a !== alimento) : l)));

  const comecarArrasto = (e, alimento, doPrato) => {
    if (fim) return;
    e.preventDefault();
    const larg = e.currentTarget.getBoundingClientRect().width;
    if (doPrato) tirar(alimento);
    setArrasto({ alimento, x: e.clientX, y: e.clientY, w: doPrato ? larg : larg * 0.7 });
    const mover = (ev) => setArrasto((a) => (a ? { ...a, x: ev.clientX, y: ev.clientY } : a));
    const soltar = (ev) => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      const z = zonaRefs.current[etapaRef.current];
      let dentro = false;
      if (z && ev.type === 'pointerup') {
        const r = z.getBoundingClientRect();
        const m = 10;
        dentro = ev.clientX >= r.left - m && ev.clientX <= r.right + m && ev.clientY >= r.top - m && ev.clientY <= r.bottom + m;
      }
      setArrasto(null);
      if (dentro) colocar(alimento);
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
  };

  const avancar = () => {
    if (naDivisao.length === 0) return;
    if (ultima) { setFim('completo'); return; }
    const usados = new Set(escolhas.flat().map((a) => a.nome));
    setOpcoes(montarOpcoes(etapa + 1, usados));
    setEtapa((n) => n + 1);
  };

  const reiniciar = () => {
    setEtapa(0); setEscolhas([[], [], []]); setOpcoes(montarOpcoes(0, new Set()));
    setTempo(TEMPO_TOTAL); setFim(null); setArrasto(null);
    setSemente(Math.floor(Math.random() * 6));
  };

  /* ----- tela de resultado ----- */
  if (fim) {
    const feitas = escolhas.flat();
    const completo = fim === 'completo';
    // alimentos no lugar errado: [alimento, divisão onde foi colocado]
    const erros = escolhas.flatMap((l, i) => l.filter((a) => a.grupo !== GRUPOS[i].id).map((a) => [a, GRUPOS[i]]));
    const processados = feitas.filter((a) => !a.bom);
    const perfeito = completo && erros.length === 0 && processados.length === 0;
    const estrelas = !completo ? 1 : perfeito ? 3 : erros.length <= 1 ? 2 : 1;
    const temArroz = feitas.some((a) => a.nome === 'Arroz');
    const temFeijao = feitas.some((a) => a.nome === 'Feijão');
    // alimentos com problema (no lugar errado ou processados), sem contar o mesmo alimento duas vezes
    const problemas = new Set([...erros.map(([a]) => a.nome), ...processados.map((a) => a.nome)]).size;
    // só UM feedback por rodada: primeiro vê se o prato está adequado, depois confere arroz e feijão
    let fb;
    if (!completo) {
      fb = FEEDBACKS_NEG.poucos;                                    // tempo acabou: prato incompleto/pouco variado
    } else if (problemas === 0) {
      fb = temArroz && temFeijao ? FEEDBACKS.completo : FEEDBACKS.semArrozFeijao;
    } else if (problemas === 1 && erros.length === 0) {
      fb = FEEDBACKS.orientacao;                                    // tudo no lugar certo, mas com um alimento de consumo menos frequente
    } else if (problemas >= 2) {
      fb = FEEDBACKS_NEG.ajustes;                                   // muitas escolhas precisam de ajustes
    } else if (!temArroz && !temFeijao) {
      fb = FEEDBACKS_NEG.semArrozFeijao;
    } else {
      fb = FEEDBACKS_NEG.poucos;
    }
    const { titulo, texto } = Array.isArray(fb) ? fb[semente % fb.length] : fb;
    // frase curta para a aba "Desempenho" dos pais
    const qtd = `${feitas.length} ${feitas.length === 1 ? 'alimento' : 'alimentos'}`;
    const resumo = !completo
      ? `Tempo acabou com ${qtd} no prato`
      : perfeito
        ? `Prato completo e equilibrado (${qtd})`
        : `Prato completo com ${problemas} ${problemas === 1 ? 'alimento' : 'alimentos'} para ajustar`;
    // para a aba "Desempenho": o prato como a criança montou (o id é o nome do arquivo da imagem)
    const idDe = (nome) => nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const detalhes = {
      tipo: 'prato',
      divisoes: GRUPOS.map((g, i) => ({ secao: g.secao, alimentos: escolhas[i].map((a) => ({ id: idDe(a.nome), nome: a.nome })) })),
    };
    return (
      <Tela titulo="Monte seu prato" onVoltar={onSair} tema="creme">
        <div className="resCard">
          <PratoMontado escolhas={escolhas} ativa={-1} className="pratoFim" />
          <div className="resDireita">
            <div className="estrelas">{[0, 1, 2].map((n) => <Estrela key={n} cheia={n < estrelas} />)}</div>
            <div className="resPill">Seu resultado</div>
          </div>
        </div>
        <AvisaFim jogo="prato" estrelas={estrelas} resumo={resumo} narrador={narrador} detalhes={detalhes} />
        <FeedbackPersonagem
          narrador={narrador}
          positivo={estrelas >= 2}
          titulo={titulo}
          texto={texto}
          botao={<><Recarregar />Jogar novamente</>}
          onBotao={reiniciar}
          pula={perfeito}
          topo="36%"
        />
      </Tela>
    );
  }

  /* ----- tela de jogo ----- */
  const urgente = tempo <= 60;
  const noPrato = new Set(escolhas.flat().map((a) => a.nome));
  return (
    <Tela titulo="Monte seu prato" onVoltar={onSair} direita={<span className={`relogio ${urgente ? 'urgente' : ''}`}>{fmt(tempo)}</span>}>
      <div className="areaPrato">
        <PratoMontado escolhas={escolhas} ativa={etapa} zonaRefs={zonaRefs} onPegar={(e, a) => comecarArrasto(e, a, true)} />
      </div>

      <div className="inferior">
        <p className="instrucao">{grupo.rotulo}</p>
        <div className="bandeja" key={etapa}>
          {Array.from({ length: N_SLOTS }, (_, i) => {
            const a = opcoes[i];
            const aqui = a && !noPrato.has(a.nome);
            const pegou = arrasto && a && arrasto.alimento === a;
            return (
              <div key={i} className="slot">
                {aqui && (
                  <button
                    className={`alimento ${pegou ? 'pego' : ''}`}
                    onPointerDown={(e) => comecarArrasto(e, a, false)}
                    aria-label={`Arrastar ${a.nome}`}
                  >
                    <img src={a.imagem} alt="" draggable={false} />
                    <span>{a.nome}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button className="finalizar" disabled={naDivisao.length === 0} onClick={avancar}>{ultima ? 'Finalizar prato' : 'Próximo'}</button>
      </div>

      {arrasto && (
        <img className="fantasma" src={arrasto.alimento.imagem} alt="" style={{ left: arrasto.x, top: arrasto.y, width: arrasto.w }} />
      )}
    </Tela>
  );
}

export default function App() {
  // antes do minijogo vem a história (obrigatória); quem a conta é quem dá o feedback no fim
  const [narrador, setNarrador] = useState(null);
  if (!narrador) return <Historia jogo="prato" fundo="#ffeccb" titulo="Monte seu prato" imagem={prato} onFim={setNarrador} onSair={voltarParaHistorias} />;
  return <Jogo narrador={narrador} onSair={voltarParaHistorias} />;
}
