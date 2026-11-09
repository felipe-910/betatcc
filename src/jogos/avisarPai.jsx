import { useEffect, useRef } from 'react';

// Os minigames rodam dentro de um <iframe> da tela de histórias (pages/Historias.tsx).
// Eles só "conversam" com o app por mensagens: terminou a partida (com as estrelas) ou pediu para voltar.
export function avisarPai(mensagem) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ origem: 'vale-jogos', ...mensagem }, window.location.origin);
  }
}

// Coloque na tela de resultado: avisa o app UMA vez quando a tela aparece (o app dá o XP
// e guarda a partida na aba "Desempenho"). `resumo` é uma frase curta com como a criança se saiu,
// ex.: "8 de 10 acertos".
export function AvisaFim({ jogo, estrelas, resumo = '', narrador = null, detalhes = null }) {
  const enviado = useRef(false);
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    avisarPai({ tipo: 'fim', jogo, estrelas, resumo, narrador, detalhes });
  }, [jogo, estrelas, resumo, narrador, detalhes]);
  return null;
}

export const voltarParaHistorias = () => avisarPai({ tipo: 'sair' });
