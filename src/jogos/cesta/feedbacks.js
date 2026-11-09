// Textos exatamente iguais aos dos dois arquivos Word:
//   feedbacks_possitivos.docx  (FP01 a FP06)
//   Feedbacks negativo - Cesta saudável.docx  (FN01 a FN06)
// Cada um: titulo = primeira frase, texto = o resto (o balão mostra os dois, na ordem).
export const FEEDBACKS = {
  FP01: { titulo: 'Uau, você arrasou!', texto: 'Sua cesta ficou cheia de alimentos nutritivos! Frutas, verduras e legumes ajudam nosso corpo a crescer e se desenvolver. Parabéns pelas escolhas!' },
  FP02: { titulo: 'Muito bem!', texto: 'Você conseguiu encher a cesta com alimentos que fazem bem para o nosso corpo! Uma alimentação variada ajuda a fornecer os nutrientes de que precisamos. Continue assim!' },
  FP03: { titulo: 'Parabéns!', texto: 'Você pegou vários alimentos muito bons para o nosso corpo! Mas lembre-se: alguns alimentos precisam de mais atenção quanto à frequência e à quantidade que consumimos. O importante é ter uma alimentação variada!' },
  FP04: { titulo: 'Você foi muito bem!', texto: 'Sua cesta tem vários alimentos nutritivos. Alguns outros também podem fazer parte da alimentação, mas precisamos prestar atenção em quanto e com que frequência os consumimos. Vamos continuar aprendendo?' },
  FP05: { titulo: 'Parabéns!', texto: 'Você pegou vários alimentos muito bons para o nosso corpo! Mas fique de olho: refrigerantes, doces e frituras devem ser consumidos com menos frequência. Que tal dar preferência aos alimentos nutritivos na próxima rodada?' },
  FP06: { titulo: 'Mandou bem!', texto: 'Você conseguiu pegar vários alimentos nutritivos! Só precisamos ter cuidado com doces, refrigerantes e frituras, que não devem ser consumidos em excesso. Cada escolha é uma oportunidade de aprender!' },
  FN01: { titulo: 'Ops!', texto: 'Parece que faltaram alguns alimentos nutritivos na sua cesta! Frutas, verduras e legumes são importantes para o nosso corpo. Na próxima rodada, tente pegar mais desses alimentos!' },
  FN02: { titulo: 'Vamos tentar mais uma vez?', texto: 'Sua cesta poderia ter mais alimentos que ajudam nosso corpo a crescer e se desenvolver! Fique de olho nas frutas, verduras, legumes e outros alimentos nutritivos que aparecerem!' },
  FN03: { titulo: 'Ops!', texto: 'Dessa vez, sua cesta ficou com mais alimentos que devemos evitar consumir em excesso do que alimentos nutritivos. Doces, refrigerantes e frituras são exemplos disso. Na próxima rodada, tente pegar mais frutas, verduras e outros alimentos que fazem bem ao nosso corpo!' },
  FN04: { titulo: 'Quase lá!', texto: 'Você conseguiu pegar alguns alimentos, mas precisamos dar mais espaço aos alimentos nutritivos na cesta. Refrigerantes, doces e frituras não devem ser consumidos em excesso. Vamos tentar pegar mais alimentos variados na próxima vez?' },
  FN05: { titulo: 'Você encontrou vários tipos de alimentos pelo caminho!', texto: 'Mas sabia que frutas, verduras, legumes e outros alimentos nutritivos merecem bastante espaço na nossa alimentação? Já os doces, refrigerantes e frituras precisam ser consumidos com menos frequência. Vamos tentar equilibrar melhor essa cesta?' },
  FN06: { titulo: 'Não desanime!', texto: 'Cada rodada é uma nova oportunidade de aprender. Procure dar preferência aos alimentos nutritivos e lembre-se de que alguns alimentos, como doces e refrigerantes, devem aparecer com menos frequência na alimentação. Você consegue tentar novamente!' },
};

// Qual feedback aparece em cada situação. Só UM por rodada: sorteia entre os da mesma situação.
export const GRUPOS_FEEDBACK = {
  totalmentePositivo: ['FP01', 'FP02'],      // muitos saudáveis, nenhum dos outros tipos
  positivoOrientacao: ['FP03', 'FP04'],      // muitos saudáveis + "não tão saudáveis"
  positivoAlerta: ['FP05', 'FP06'],          // muitos saudáveis + não saudáveis
  poucosNutritivos: ['FN01', 'FN02'],        // faltaram alimentos nutritivos
  maisEvitar: ['FN03'],                      // mais alimentos a evitar do que nutritivos
  misto: ['FN04', 'FN05', 'FN06'],           // pegou dos três tipos, mas precisa melhorar
  nada: ['FN06'],                            // não pegou nada
};
