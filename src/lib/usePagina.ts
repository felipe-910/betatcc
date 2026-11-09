import { useEffect } from 'react';

// Ajusta o que antes ficava no <head>/<body> de cada .html: título da aba,
// cor do tema do navegador e a classe do <body> (page-white, home-page, historias-page...)
export function usePagina(titulo: string, bodyClass = '', themeColor = '#FBF3E7'): void {
  useEffect(() => {
    document.title = titulo === 'Vale das Frutas' ? titulo : `${titulo} — Vale das Frutas`;
    document.body.className = bodyClass;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    return () => {
      document.body.className = '';
    };
  }, [titulo, bodyClass, themeColor]);
}
