import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Arquivo de estilos globais (opcional)

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <>
      <App />
    </>
  );
} else {
  console.error("Elemento com id 'root' não encontrado.");
}