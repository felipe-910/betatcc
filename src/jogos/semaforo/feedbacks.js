// Feedback de cada alimento, conforme a cor que a criança escolheu (arquivo "maça (2).docx").
// O título é a primeira exclamação; a Alice e o Luca leem o título e o texto (as vozes estão em historia/vozAlice.js e vozLuca.js).
// Chave = id do alimento (o mesmo da imagem) -> cor escolhida.
export const FEEDBACK_ALIMENTO = {
  maca: {
    verde: { titulo: 'Parabéns!', texto: 'A maçã faz muito bem para nós, sabia? A maçã tem vitaminas importantes para o nosso dia a dia, além de deixar você hidratado por mais tempo.' },
    amarelo: { titulo: 'Pertinho!', texto: 'A maçã não se encaixa no amarelo, pois ela faz muito bem ao nosso corpo quando é consumida.' },
    vermelho: { titulo: 'Quase!', texto: 'A maçã não encaixa no vermelho! Ela é uma fruta cheia de vitaminas e fibras que fazem muito bem para o nosso corpo.' },
  },
  laranja: {
    verde: { titulo: 'Muito bem!', texto: 'Você acertou! A laranja é uma fruta deliciosa e rica em vitamina C! Essa vitamina ajuda a manter nosso corpo forte para os nossos dias!' },
    amarelo: { titulo: 'Quase!', texto: 'A laranja pertence ao verde! Ela tem vitamina C, que ajuda nosso corpo a se manter saudável. Podemos aproveitar essa fruta todos os dias!' },
    vermelho: { titulo: 'Ops!', texto: 'A laranja não pertence ao vermelho. Ela é uma fruta cheia de vitamina C e outros nutrientes importantes para o nosso corpo!' },
  },
  cenoura: {
    verde: { titulo: 'Isso mesmo!', texto: 'A cenoura faz muito bem para os nossos olhos! Além de fazer com que você fique mais atento, melhorando seu desempenho em tudo que for fazer!' },
    amarelo: { titulo: 'Por pouco!', texto: 'A cenoura não encaixa no amarelo! Ela é um alimento cheio de nutrientes importantes para o nosso corpo.' },
    vermelho: { titulo: 'Quase!', texto: 'A cenoura não encaixa no vermelho! Ela é uma verdura muito nutritiva e ajuda a manter nosso corpo saudável!' },
  },
  banana: {
    verde: { titulo: 'Quase lá!', texto: 'A banana pertence ao grupo amarelo! Ela é uma fruta nutritiva que fornece energia e possui fibras e minerais importantes para nossa saúde. Mas temos que comer de forma moderada!' },
    amarelo: { titulo: 'Você acertou!', texto: 'A banana é uma fruta deliciosa que fornece energia para nossas brincadeiras e atividades! Ela também tem fibras, vitaminas e minerais que ajudam nosso corpo a funcionar bem. Mas lembre-se! Temos que comer de forma moderada!' },
    vermelho: { titulo: 'Ops!', texto: 'Não foi dessa vez! A banana não pertence ao grupo vermelho. Ela é uma fruta cheia de nutrientes que ajudam nosso corpo a ter energia para brincar, aprender e crescer. Continue tentando!' },
  },
  pao: {
    verde: { titulo: 'Perto demais!', texto: 'O pão não encaixa no verde! Ele pode fazer parte de uma alimentação equilibrada e nos dá energia para as atividades do dia! Mas deve ser consumido de forma moderada!' },
    amarelo: { titulo: 'Acertou!', texto: 'O pão é um dos alimentos mais saborosos que tem! Mas você sabia que tem que comer de forma moderada? Comer muito pão pode fazer com que você fique com muita energia, e isso não vai fazer bem a você! Coma algumas vezes ao dia.' },
    vermelho: { titulo: 'Quase!', texto: 'O pão não precisa ficar no vermelho! Ele pode fazer parte de uma alimentação equilibrada e nos dá energia para as atividades do dia!' },
  },
  queijo: {
    verde: { titulo: 'Muito próximo!', texto: 'O queijo não se encaixa no verde! Apesar de ser bom ao nosso corpo, devemos variar os alimentos e consumir o queijo em pequenas quantidades!' },
    amarelo: { titulo: 'Parabéns!', texto: 'O queijo vai te dar muita força e fortalecer seus ossos! Mas sabia que ele deve ser comido em quantidades pequenas? Apesar do sabor maravilhoso, o queijo, quando consumido em grandes quantidades, pode causar problemas a você. Coma em pequenas fatias, assim você aproveita mais!' },
    vermelho: { titulo: 'Quase!', texto: 'O queijo não se encaixa no vermelho! Ele tem nutrientes importantes e pode fazer parte de uma alimentação equilibrada! Apenas deve ser consumido em pequenas quantidades!' },
  },
  linguica: {
    verde: { titulo: 'Opa!', texto: 'A linguiça não se encaixa no verde! Ela pode ser saborosa, mas não é uma boa opção para comer todos os dias. Existem outros alimentos que podemos escolher para cuidar melhor do seu corpo!' },
    amarelo: { titulo: 'Quase!', texto: 'A linguiça não encaixa no amarelo! Ela é um alimento industrializado e contém bastante sal. Por isso, devemos deixar para comer apenas de vez em quando!' },
    vermelho: { titulo: 'Muito bem!', texto: 'Você acertou! A linguiça deve ser consumida apenas de vez em quando. Que tal escolher um franguinho ou uma carne para deixar seu prato ainda mais nutritivo?' },
  },
  bombom: { // no jogo aparece como "Doce"
    verde: { titulo: 'Opa!', texto: 'Você pôs o doce na luz verde! Ele pode ser gostoso, mas tem bastante açúcar e não oferece muitos nutrientes para o nosso corpo. Por isso, não devemos comer doces todos os dias!' },
    amarelo: { titulo: 'Quase!', texto: 'O doce não encaixa no amarelo! Ele tem bastante açúcar e deve ser consumido apenas de vez em quando. Que tal experimentar uma fruta quando bater aquela vontade de comer algo docinho?' },
    vermelho: { titulo: 'Isso mesmo!', texto: 'Você acertou! Os doces devem ser consumidos apenas de vez em quando. Assim, podemos aproveitar outros alimentos que ajudam nosso corpo a crescer forte e saudável!' },
  },
  refri: {
    verde: { titulo: 'Opa!', texto: 'Você pôs o refrigerante na luz verde! Ele tem bastante açúcar e não oferece os nutrientes que nosso corpo precisa. Para matar a sede, a melhor escolha é sempre a água!' },
    amarelo: { titulo: 'Quase!', texto: 'O refrigerante não encaixa no amarelo! Ele tem muito açúcar e não é uma boa opção para o nosso dia a dia. Que tal escolher um copo de água bem fresquinha?' },
    vermelho: { titulo: 'Parabéns!', texto: 'Você acertou! O refrigerante deve ser evitado no dia a dia e consumido somente em ocasiões especiais, por ter bastante açúcar. A água é a melhor escolha para manter nosso corpo hidratado!' },
  },
};
