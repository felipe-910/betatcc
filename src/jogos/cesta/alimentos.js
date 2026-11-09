// Os três tipos de alimento do jogo (mesma ideia do semáforo: verde, amarelo e vermelho).
//   saudavel    = alimentos nutritivos
//   consumivel  = "não tão saudáveis": podem fazer parte da alimentação, com atenção à frequência e à quantidade
//   naoSaudavel = doces, refrigerantes e frituras: devem ser consumidos com menos frequência
export const TIPOS = ['saudavel', 'consumivel', 'naoSaudavel'];

// Alimentos vindos dos jogos Semáforo Saudável e Monte seu prato (menos arroz e feijão), mais os da cesta.
// A classificação segue o Semáforo: verde = saudavel; amarelo (frango, carne, ovo) = consumivel; vermelho (nuggets) = naoSaudavel.
// Para trocar a classificação de um alimento, é só mudar o "tipo" dele aqui.
// Para incluir um alimento novo: coloque o PNG em src/assets, importe em assets.js e adicione uma linha aqui.
export const ALIMENTOS = [
  { id: 'maca', nome: 'Maçã', tipo: 'saudavel' },
  { id: 'laranja', nome: 'Laranja', tipo: 'saudavel' },
  { id: 'banana', nome: 'Banana', tipo: 'saudavel' },
  { id: 'cenoura', nome: 'Cenoura', tipo: 'saudavel' },
  { id: 'pao', nome: 'Pão', tipo: 'saudavel' },
  { id: 'abobora', nome: 'Abóbora', tipo: 'saudavel' },
  { id: 'batata', nome: 'Batata', tipo: 'saudavel' },
  { id: 'brocolis', nome: 'Brócolis', tipo: 'saudavel' },
  { id: 'macarrao', nome: 'Macarrão', tipo: 'saudavel' },
  { id: 'milho', nome: 'Milho', tipo: 'saudavel' },
  { id: 'tomate', nome: 'Tomate', tipo: 'saudavel' },
  { id: 'melancia', nome: 'Melancia', tipo: 'saudavel' },
  { id: 'abacaxi', nome: 'Abacaxi', tipo: 'saudavel' },
  { id: 'uva', nome: 'Uva', tipo: 'saudavel' },
  { id: 'chuchu', nome: 'Chuchu', tipo: 'saudavel' },
  { id: 'beterraba', nome: 'Beterraba', tipo: 'saudavel' },
  { id: 'alface', nome: 'Alface', tipo: 'saudavel' },
  { id: 'agriao', nome: 'Agrião', tipo: 'saudavel' },
  { id: 'couve', nome: 'Couve', tipo: 'saudavel' },
  { id: 'queijo', nome: 'Queijo', tipo: 'consumivel' },
  { id: 'salsicha', nome: 'Salsicha', tipo: 'consumivel' },
  { id: 'carne', nome: 'Carne', tipo: 'consumivel' },
  { id: 'frango', nome: 'Frango', tipo: 'consumivel' },
  { id: 'ovo', nome: 'Ovo', tipo: 'consumivel' },
  { id: 'bombom', nome: 'Bombom', tipo: 'naoSaudavel' },
  { id: 'refri', nome: 'Refrigerante', tipo: 'naoSaudavel' },
  { id: 'nuggets', nome: 'Nuggets', tipo: 'naoSaudavel' },
];
