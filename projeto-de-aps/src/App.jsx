// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './components/auth/AdminRoute';
import TelaLogin from './components/auth/TelaLogin';
import RedefinirSenha from './components/auth/RedefinirSenha';
import RedefinirSenhaConfirmar from './components/auth/RedefinirSenhaConfirmar';
import TelaCadastro from './components/auth/TelaCadastro';
import AdminDashboard from './components/admin/AdminDashboard';
import GerenciamentoUsuarios from './components/admin/GerenciamentoUsuarios';
import GerenciamentoCategorias from './components/admin/GerenciamentoCategorias';
import TelaQuiz from './components/TelaQuiz';
import ConfiguracaoQuiz from './components/ConfiguracaoQuiz';
import Ranking from './components/Ranking' ;
import PerguntaResposta from './components/admin/PerguntaResposta';
import Sala from './components/admin/Sala';
import SalaDeEspera from './components/SalaDeEspera';
import SalaQuiz from './components/SalaQuiz';
import EntrarNaSala from './components/EntrarNaSala'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rota Inicial/Home (Tela de Cadastro do Jogador) */}
        <Route path="/" element={<TelaLogin />} /> {/* Login é a tela inicial */}
        <Route path="/cadastro" element={<TelaCadastro />} /> {/* Cadastro */}

        <Route path="/redefinir" element={<RedefinirSenha />} />
        <Route path="/redefinir-senha-confirmar" element={<RedefinirSenhaConfirmar />} />

        {/* Rotas do Jogador */}
        <Route path="/jogador/configurar" element={<ConfiguracaoQuiz />} />
        <Route path="/jogador/quiz" element={<TelaQuiz />} />
        <Route path="/jogador/ranking" element={<Ranking />} />
        <Route path="/jogador/entrar-sala" element={<EntrarNaSala />} />

        {/* Rotas do Administrador - Envolvidas no Layout Admin */}
        {/* Nota: O uso de AdminDashboard aqui é um exemplo simples. */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> 
        <Route path="/admin/usuarios" element={<AdminRoute><GerenciamentoUsuarios /></AdminRoute>} />
        <Route path="/admin/perguntas" element={<AdminRoute><PerguntaResposta /></AdminRoute>} />
        <Route path="/admin/categorias" element={<AdminRoute><GerenciamentoCategorias /></AdminRoute>} />
        <Route path="/admin/salas" element={<AdminRoute><Sala /></AdminRoute>}/>

        {/* Rotas Multiplayer */}
        <Route path="/sala/:salaId/lobby" element={<SalaDeEspera />} />
        <Route path="/sala/:salaId/quiz" element={<SalaQuiz />} />

        {/* Rota Padrão (Redireciona para a home) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App