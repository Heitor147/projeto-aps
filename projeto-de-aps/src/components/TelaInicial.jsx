// src/components/TelaInicial.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cadastrarJogador } from './APIUser'
import { FaPlay } from 'react-icons/fa' // Ícone de Play

const TelaInicial = () => {
  const [nome, setNome] = useState('')
  const [equipe, setEquipe] = useState('')
  const [turma, setTurma] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nome || !equipe || !turma) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    const jogadorId = await cadastrarJogador({ nome, equipe, turma })

    if (jogadorId) {
      // Armazena o ID do jogador (ou outros dados) no localStorage/Contexto se necessário
      localStorage.setItem('jogadorId', jogadorId)
      localStorage.setItem('jogadorNome', nome) 

      // Navega para a tela do Quiz
      navigate('/jogador/configurar') 
    }
  }

  return (
    <div className="tela-container">
      <h2>Quiz Gincana 2026</h2>
      <p>
        Seja bem-vindo ao Quiz da Gincana 2026! Aqui, reunimos diversas questões sobre
        assuntos variados, desde tecnologia até história e química. Insira seus dados abaixo e
        comece a jogar.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Value"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="equipe">Equipe</label>
          <input
            id="equipe"
            type="text"
            value={equipe}
            onChange={(e) => setEquipe(e.target.value)}
            placeholder="Value"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="turma">Turma</label>
          <input
            id="turma"
            type="text"
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            placeholder="Value"
            required
          />
        </div>

        <button type="submit" className="botao-principal">
          <FaPlay /> Iniciar
        </button>
      </form>
      <hr style={{margin: '20px 0'}} />
      {/* Link simples para simular login de Administrador para fins de navegação */}
      <p>Acesso Admin: <a href="/admin/perguntas">Ir para Gerenciar Perguntas</a></p>
    </div>
  )
}

export default TelaInicial