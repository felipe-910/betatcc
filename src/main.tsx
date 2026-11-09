import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Historias from './pages/Historias';
import './styles/style.css';

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Elemento #root não encontrado.');

createRoot(raiz).render(
  <StrictMode>
    <Historias />
  </StrictMode>
);
