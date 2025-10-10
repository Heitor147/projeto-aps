// src/index.js (Atua como o ponto de entrada / main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <--- Importa o componente principal App
import './styles/global.css'; // Importa os estilos globais

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* <--- Renderiza o App */}
  </React.StrictMode>
);