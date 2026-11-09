import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePagina } from '../lib/usePagina';
import { Arbusto, Colinas, Nuvem, Sol } from '../components/CenarioHistorias';
import imgPrato from '../jogos/prato/assets/prato.png';
import imgSemaforo from '../jogos/semaforo/assets/semaforo-verde.png';
import imgCesta from '../jogos/cesta/assets/cesta.png';

// Versão beta para a escola: só esta tela e os 3 minigames (sem login e sem salvar nada).
// Cada opção abre um minigame (página própria em /jogos, aberta num iframe).
const JOGOS = [
  { id: 'cesta', nome: 'Cesta Saudável', descricao: 'Mova a cesta e pegue os alimentos que caem.', url: '/jogos/cesta.html', imagem: imgCesta, fundo: '#d9f0fb' },
  { id: 'semaforo', nome: 'Semáforo Saudável', descricao: 'Escolha a cor do semáforo de cada alimento.', url: '/jogos/semaforo.html', imagem: imgSemaforo, fundo: '#dcf3e0' },
  { id: 'prato', nome: 'Monte seu prato', descricao: 'Arraste os alimentos e monte um prato equilibrado.', url: '/jogos/prato.html', imagem: imgPrato, fundo: '#ffeccb' }
] as const;

// "Histórias" com uma cor em cada letra
const LETRAS = [
  ['H', '#fe6e6d'], ['i', '#f5ab2c'], ['s', '#f9c846'], ['t', '#5aa56a'], ['ó', '#5e6fb8'],
  ['r', '#c47fb5'], ['i', '#8fd3e4'], ['a', '#5db39a'], ['s', '#96ccaa']
] as const;

export default function Historias() {
  usePagina('Histórias', 'historias-page', '#9dd4d1');
  const [jogoAberto, setJogoAberto] = useState<number | null>(null);
  const quadro = useRef<HTMLIFrameElement>(null);
  const tela = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // O título acompanha a largura da tela
  useLayoutEffect(() => {
    const ajustar = () => {
      if (tela.current && titulo.current) {
        titulo.current.style.fontSize = `${Math.min(58, Math.max(28, tela.current.clientWidth * 0.088))}px`;
      }
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []);

  // O minigame avisa (postMessage) quando a criança pede para voltar
  useEffect(() => {
    if (jogoAberto === null) return;
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!quadro.current || e.source !== quadro.current.contentWindow) return;
      const msg = e.data as { origem?: string; tipo?: string } | null;
      if (msg?.origem === 'vale-jogos' && msg.tipo === 'sair') setJogoAberto(null);
    };
    window.addEventListener('message', aoReceber);
    return () => window.removeEventListener('message', aoReceber);
  }, [jogoAberto]);

  return (
    <main className="hist-tela" ref={tela} aria-labelledby="titulo">
      <header className="hist-topo">
        <div className="hist-deco hist-nuvem hist-nuvem--a"><Nuvem /></div>
        <div className="hist-deco hist-nuvem hist-nuvem--b"><Nuvem /></div>
        <div className="hist-deco hist-sol"><Sol /></div>
        <div className="hist-deco hist-colinas"><Colinas /></div>
        <div className="hist-deco hist-arbusto hist-arbusto--e"><Arbusto /></div>
        <div className="hist-deco hist-arbusto hist-arbusto--d"><Arbusto /></div>

        <div className="hist-textos">
          <h1 className="hist-titulo" id="titulo" ref={titulo}>
            <span>Olá, <span>amiguinho</span><span className="hist-exclamacao">!</span></span>
          </h1>
          <p className="hist-sub">Que bom ter você aqui!</p>
        </div>
      </header>

      <section className="hist-corpo" aria-labelledby="hist-secao">
        <h2 className="hist-pill" id="hist-secao">
          {/* o contorno branco fica numa camada só, atrás das letras coloridas (assim uma letra não apaga a outra) */}
          <span className="hist-pill-fundo" aria-hidden="true">Histórias</span>
          <span className="hist-pill-letras">
            {LETRAS.map(([letra, cor], i) => <span key={i} style={{ color: cor }}>{letra}</span>)}
          </span>
        </h2>

        <div className="hist-lista" aria-label="Escolha uma história">
          {JOGOS.map((jogo, i) => (
            <button
              key={jogo.id}
              className="hist-cartao"
              type="button"
              aria-label={`Abrir história ${i + 1}: ${jogo.nome}`}
              onClick={() => setJogoAberto(i)}
            >
              <span className="hist-cartao-img" style={{ background: jogo.fundo }}>
                <img src={jogo.imagem} alt="" />
              </span>
              <span className="hist-cartao-texto">
                <span className="hist-cartao-nome">{jogo.nome}</span>
                <span className="hist-cartao-desc">{jogo.descricao}</span>
              </span>
              <span className="hist-cartao-jogar" aria-hidden="true">Jogar ▶</span>
            </button>
          ))}
        </div>
      </section>

      {jogoAberto !== null && (
        <iframe ref={quadro} className="jogo-frame" src={JOGOS[jogoAberto].url} title={JOGOS[jogoAberto].nome} />
      )}
    </main>
  );
}
