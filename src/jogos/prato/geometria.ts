// Medidas do prato: usadas no minijogo e na aba "Desempenho" (que mostra o prato que a criança montou).

// Regiões do prato (fração da imagem): [x0, y0, x1, y1, cx, cy] medidas na arte enviada
export const SECOES = {
  esq: [0.0999, 0.1009, 0.4529, 0.8997, 0.3044, 0.5016],
  dirTop: [0.5155, 0.0974, 0.899, 0.4739, 0.6762, 0.3157],
  dirBot: [0.5155, 0.5375, 0.8978, 0.9014, 0.674, 0.6889],
} as const;

// Onde ficam os alimentos dentro da divisão, conforme a quantidade
export const POSICOES: Record<number, ReadonlyArray<readonly [number, number]>> = {
  1: [[0.5, 0.5]],
  2: [[0.5, 0.29], [0.5, 0.71]],
};

// largura do alimento / largura da divisão
export const TAM_ITEM = { esq: 0.7, dirTop: 0.62, dirBot: 0.62 } as const;
