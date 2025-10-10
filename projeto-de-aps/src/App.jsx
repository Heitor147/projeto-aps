// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// Importe seus componentes
import AdminLayout from './components/AdminLayout'
import TelaInicial from './components/TelaInicial'
import TelaQuiz from './components/TelaQuiz' // Deve ser criado
import Ranking from './components/Ranking' // Deve ser criado
import PerguntaResposta from './components/PerguntaResposta' // Deve ser criado
import Sala from './components/Sala' // Deve ser criado

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rota Inicial/Home (Tela de Cadastro do Jogador) */}
        <Route path="/" element={<TelaInicial />} />

        {/* Rotas do Jogador */}
        <Route path="/jogador/quiz" element={<TelaQuiz />} />
        <Route path="/jogador/ranking" element={<Ranking />} />

        {/* Rotas do Administrador - Envolvidas no Layout Admin */}
        {/* Nota: O uso de AdminLayout aqui é um exemplo simples. */}
        <Route
          path="/admin/perguntas"
          element={<AdminLayout><PerguntaResposta /></AdminLayout>} // Agora usa o componente importado
        />
        <Route
          path="/admin/salas"
          element={<AdminLayout><Sala /></AdminLayout>} // Agora usa o componente importado
        />

        {/* Rota Padrão (Redireciona para a home) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App