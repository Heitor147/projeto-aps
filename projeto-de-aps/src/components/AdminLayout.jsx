// src/components/AdminLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaUsers, FaSignOutAlt, FaHome } from 'react-icons/fa';

// Estilo básico para o layout admin (pode ser movido para global.css)
const layoutStyle = {
    padding: '20px',
    backgroundColor: '#e9e9e9', // Fundo cinza suave
    minHeight: '100vh',
};

const navStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    padding: '10px',
    borderBottom: '2px solid #ccc',
};

const AdminLayout = ({ children }) => {
  return (
    <div style={layoutStyle}>
      <header>
        <h1 style={{ color: '#333' }}>Quiz Gincana 2026 - Painel Admin</h1>
      </header>
      
      <nav style={navStyle}>
        {/* Link para Gerenciar Perguntas */}
        <Link to="/admin/perguntas" className="botao-principal">
          <FaQuestionCircle /> Gerenciar Perguntas
        </Link>
        
        {/* Link para Gerenciar Salas */}
        <Link to="/admin/salas" className="botao-principal">
          <FaUsers /> Gerenciar Salas
        </Link>
        
        {/* Link para a página inicial (Sair do Admin) */}
        <Link 
          to="/" 
          className="botao-principal" 
          style={{ backgroundColor: '#dc3545', marginLeft: 'auto' }} // Botão Vermelho à direita
        >
          <FaSignOutAlt /> Sair do Admin
        </Link>
      </nav>
      
      <main>
        {children} {/* Aqui é onde PerguntaResposta.jsx ou Sala.jsx será renderizado */}
      </main>
      
      <footer style={{ marginTop: '50px', paddingTop: '10px', textAlign: 'center', color: '#666' }}>
        <p>Área de Gerenciamento. Todos os dados são armazenados no Supabase.</p>
        <Link to="/">
            <FaHome /> Voltar ao Início
        </Link>
      </footer>
    </div>
  );
};

export default AdminLayout;