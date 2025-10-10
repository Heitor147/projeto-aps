// src/components/Ranking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaTrophy, FaRedo } from 'react-icons/fa';

const Ranking = () => {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);

    // 1. Obter todas as tentativas de todos os jogadores (quiz_player_attempts)
    // 2. Obter todas as respostas (quiz_player)
    // 3. Obter os dados dos usuários (usuarios)
    
    // NOTA: É MUITO mais eficiente fazer o cálculo do ranking no banco de dados (função Supabase/SQL).
    // Aqui, faremos o cálculo no front-end para simplificar o exemplo React.
    
    try {
      // Buscar dados de usuários (nome, equipe, turma)
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, nome');
      if (userError) throw userError;
      const userMap = new Map(userData.map(u => [u.id, u.nome]));

      // Buscar tentativas (para contar tentativas)
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('quiz_player_attempts')
        .select('id, usuario');
      if (attemptsError) throw attemptsError;
      
      // Contar tentativas por usuário
      const attemptsCount = attemptsData.reduce((acc, attempt) => {
        acc[attempt.usuario] = (acc[attempt.usuario] || 0) + 1;
        return acc;
      }, {});

      // Buscar respostas e acertos
      const { data: answersData, error: answersError } = await supabase
        .from('quiz_player')
        .select('usuario, tentativa_id, acerto');
      if (answersError) throw answersError;

      // Calcular acertos por usuário (na ÚLTIMA tentativa, ou total - dependendo da regra)
      // Vamos simplificar: calcular acertos na MELHOR tentativa (aqui calculamos acertos totais da última tentativa)
      const userLatestAttempt = attemptsData.reduce((acc, attempt) => {
          if (!acc[attempt.usuario] || attempt.id > acc[attempt.usuario].id) {
              acc[attempt.usuario] = attempt;
          }
          return acc;
      }, {});

      const rankingMap = {};
      
      // Itera sobre as respostas e associa aos usuários
      answersData.forEach(answer => {
        const userId = answer.usuario;
        
        // Verifica se é a tentativa mais recente
        if (userLatestAttempt[userId] && answer.tentativa_id === userLatestAttempt[userId].id) {
            if (!rankingMap[userId]) {
                rankingMap[userId] = { acertos: 0, total: 0 };
            }
            rankingMap[userId].total += 1;
            if (answer.acerto) {
                rankingMap[userId].acertos += 1;
            }
        }
      });

      // Formatar o Ranking Final
      const finalRanking = Object.keys(rankingMap).map(userId => ({
        nome: userMap.get(userId) || `Usuário ID: ${userId}`,
        acertos: rankingMap[userId].acertos,
        total: rankingMap[userId].total,
        tentativas: attemptsCount[userId] || 0
      }));

      // Ordenar: primeiro por acertos (desc), depois por tentativas (asc)
      finalRanking.sort((a, b) => {
        if (b.acertos !== a.acertos) {
          return b.acertos - a.acertos;
        }
        return a.tentativas - b.tentativas; // Desempate: menos tentativas ganha
      });
      
      setRanking(finalRanking);
      
    } catch (error) {
      console.error('Erro ao buscar dados do Ranking:', error.message);
      alert('Não foi possível carregar o ranking.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    localStorage.removeItem('tentativaId'); // Limpa a tentativa anterior
    navigate('/jogador/quiz');
  };
  
  const currentJogadorNome = localStorage.getItem('jogadorNome') || 'Você';

  if (loading) {
    return <div className="tela-container"><h2>Calculando Ranking...</h2></div>;
  }

  return (
    <div className="tela-container">
      <h2>Ranking Gincana 2026</h2>
      
      <div style={{ marginBottom: '20px' }}>
          <button 
              onClick={() => navigate('/')} 
              className="botao-principal" 
              style={{ backgroundColor: '#6c757d' }}
          >
              <FaArrowLeft /> Voltar ao início
          </button>
          <button 
              onClick={handlePlayAgain} 
              className="botao-principal" 
              style={{ marginLeft: '10px' }}
          >
              <FaRedo /> Jogar de novo
          </button>
      </div>

      <div style={{ 
          border: '1px solid #ccc', 
          borderRadius: '10px', 
          padding: '10px', 
          backgroundColor: '#fff', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
      }}>
        {ranking.map((jogador, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '10px 0', 
              borderBottom: index < ranking.length - 1 ? '1px solid #eee' : 'none',
              backgroundColor: jogador.nome === currentJogadorNome ? '#e6ffe6' : 'white' // Destaque para o próprio jogador
            }}
          >
            <span style={{ fontSize: '24px', marginRight: '15px' }}>
              {index === 0 ? <FaTrophy color="gold" /> : (index === 1 ? <FaTrophy color="silver" /> : (index === 2 ? <FaTrophy color="#cd7f32" /> : index + 1))}
            </span>
            <div style={{ flexGrow: 1 }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{jogador.nome}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Acertos: {jogador.acertos}/{jogador.total} | Tentativas: {jogador.tentativas}
              </p>
            </div>
            {/* Imagem de perfil mockada (como no wireframe) */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000', marginRight: '10px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;