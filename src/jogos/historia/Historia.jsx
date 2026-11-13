import { useEffect, useRef, useState } from 'react';
import './Historia.css';
import { FALAS } from './falas.js';
import { NARRADORES } from './personagens.js';
import { destravarVoz, vozDaHistoria, useVozSincronizada } from './voz.jsx';

/* ---------- Ícones ---------- */
function Seta() {
  return (
    <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
      <path d="M26 16H7M15 7l-9 9 9 9" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Proxima() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M8 4.5l11 7.5-11 7.5z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function Tela({ titulo, onVoltar, children }) {
  return (
    <div className="hs-tela">
      <div className="hs-header">
        <button className="hs-voltar" onClick={onVoltar} aria-label="Voltar"><Seta /></button>
        <div className="hs-titulo">{titulo}</div>
        <div className="hs-voltar" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

/* ---------- 1) Escolha de quem conta a história ---------- */
function Escolha({ titulo, imagem, fundo, onEscolher, onSair }) {
  return (
    <Tela titulo={titulo} onVoltar={onSair}>
      <div className="hs-palco hs-palco--escolha" style={fundo ? { background: fundo } : undefined}>
        {imagem && <img className="hs-jogo-img" src={imagem} alt="" draggable={false} />}
      </div>
      <div className="hs-painel">
        <div className="hs-narrador-rotulo" id="hs-narrador">Narrador</div>
        <div className="hs-cartoes" role="group" aria-labelledby="hs-narrador">
          {['alice', 'luca'].map((id) => {
            const n = NARRADORES[id];
            return (
              <button key={id} className="hs-cartao" style={{ background: n.cor, borderColor: n.borda }} onClick={() => { destravarVoz(); onEscolher(id); }}>
                <img className="hs-cartao-avatar" src={n.avatar} alt="" draggable={false} />
                <span className="hs-cartao-nome">{n.nome}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Tela>
  );
}

/* ---------- 2) Caixa de diálogo (o texto aparece aos poucos; tocar completa a fala) ---------- */
const VELOCIDADE = 24; // ms por letra
const reduzMovimento = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function CaixaFala({ narrador, texto, voz, reserva, indice, total, onFalando, onProxima }) {
  // Com a voz gravada (Alice ou Luca), o texto acompanha a fala (cada palavra aparece quando é dita).
  // Se o áudio não tocar, o texto aparece letra por letra, como antes.
  const sinc = useVozSincronizada(voz, texto.length);
  const comVoz = !!voz && !sinc.falhou;
  const [n, setN] = useState(() => (reduzMovimento() ? texto.length : 0));
  const [inteiro, setInteiro] = useState(false);

  // se a voz falhar no meio, o texto continua de onde parou
  useEffect(() => { if (voz && sinc.falhou) setN((c) => Math.max(c, sinc.n)); }, [voz, sinc.falhou, sinc.n]);

  const mostrar = inteiro || (comVoz && reduzMovimento()) ? texto.length : comVoz ? Math.max(sinc.n, sinc.fim ? texto.length : 0) : n;
  const completo = mostrar >= texto.length;

  useEffect(() => {
    if (comVoz || completo) return undefined;
    const id = setTimeout(() => setN((c) => c + 1), VELOCIDADE);
    return () => clearTimeout(id);
  }, [n, completo, comVoz]);

  // avisa a cena: o personagem "fala" (vídeo rodando) enquanto o texto aparece — com a voz, só enquanto ela está falando
  const falando = comVoz ? sinc.falando : !completo;
  useEffect(() => { onFalando(falando); }, [falando, onFalando]);
  useEffect(() => () => onFalando(false), [onFalando]);

  const mostrarTudo = () => { setInteiro(true); setN(texto.length); };
  const ultima = indice === total - 1;
  const clicar = () => (completo ? onProxima() : mostrarTudo());

  return (
    <div className="hs-dialogo">
      <div className="hs-nome" style={{ background: narrador.cor, borderColor: narrador.borda }}>{narrador.nome}</div>
      <div className="hs-texto" onClick={mostrarTudo} role="group" aria-label={texto}>
        {/* a fala mais longa fica escondida só para reservar o tamanho da caixa (ela não muda de altura entre as falas) */}
        <span className="hs-reserva" aria-hidden="true">{reserva}</span>
        <span className="hs-vivo" aria-hidden="true">{texto.slice(0, mostrar)}</span>
      </div>
      <div className="hs-rodape">
        <div className="hs-pontos" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => <i key={i} className={i <= indice ? 'on' : ''} />)}
        </div>
        <button className="hs-proxima" onClick={clicar}>
          Próxima<Proxima />
        </button>
      </div>
    </div>
  );
}

function Historia2({ jogo, titulo, narrador, onFim, onVoltar }) {
  // cada narrador mostra o texto exatamente como fala na gravação (a Alice lê o texto original)
  const falas = FALAS[jogo].map((f, k) => vozDaHistoria(narrador.id, jogo, k)?.texto ?? f);
  const reserva = falas.reduce((a, b) => (b.length > a.length ? b : a), '');
  const [i, setI] = useState(0);
  const [falando, setFalando] = useState(false);
  const [perguntar, setPerguntar] = useState(false); // terminou a história: "Você entendeu?"
  const video = useRef(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (falando) {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [falando]);

  const proxima = () => (i + 1 >= falas.length ? setPerguntar(true) : setI(i + 1));
  const ouvirDeNovo = () => { setPerguntar(false); setI(0); };

  return (
    <Tela titulo={titulo} onVoltar={onVoltar}>
      <div className="hs-palco hs-palco--historia">
        <video
          ref={video}
          className="hs-video"
          src={narrador.video}
          poster={narrador.parado}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`${narrador.nome} contando a história`}
        />
      </div>
      {perguntar ? (
        <div className="hs-dialogo hs-pergunta">
          <div className="hs-nome" style={{ background: narrador.cor, borderColor: narrador.borda }}>{narrador.nome}</div>
          <p className="hs-pergunta-texto">Você entendeu?</p>
          {/* Sim: vai para o minijogo. Não: a história começa de novo */}
          <div className="hs-pergunta-botoes">
            <button className="hs-proxima hs-sim" onClick={() => onFim(narrador.id)}>Sim</button>
            <button className="hs-proxima hs-nao" onClick={ouvirDeNovo}>Não</button>
          </div>
        </div>
      ) : (
      <CaixaFala key={i} narrador={narrador} texto={falas[i]} voz={vozDaHistoria(narrador.id, jogo, i)} reserva={reserva} indice={i} total={falas.length} onFalando={setFalando} onProxima={proxima} />
      )}
    </Tela>
  );
}

/* ---------- Tela completa: escolha → história → (onFim leva ao minijogo) ---------- */
// jogo: 'cesta' | 'semaforo' | 'prato'. imagem/fundo: ilustração do jogo e cor do quadro na tela de escolha. onFim(idDoNarrador) é chamado quando a última fala termina.
export default function Historia({ jogo, titulo, imagem, fundo, onFim, onSair }) {
  const [narrador, setNarrador] = useState(null);
  if (!narrador) return <Escolha titulo={titulo} imagem={imagem} fundo={fundo} onEscolher={setNarrador} onSair={onSair} />;
  return <Historia2 jogo={jogo} titulo={titulo} narrador={NARRADORES[narrador]} onFim={onFim} onVoltar={() => setNarrador(null)} />;
}
