import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Total de questões padrão
const N_QUESTOES_PADRAO = 20;

// Função auxiliar para embaralhar e selecionar
const shuffleAndSlice = (array, count) => {
    // Implementação simples de shuffle e slice
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Função auxiliar para garantir que a resposta JSONB seja um array
const getRespostasAsArray = (respostas) => {
    if (Array.isArray(respostas)) {
        return respostas;
    }
    // Tenta converter se for string JSON (para contornar problemas de JSONB não resolvido)
    if (typeof respostas === 'string') {
        try {
            const parsed = JSON.parse(respostas);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error("Erro ao fazer JSON.parse nas respostas:", e);
        }
    }
    // Retorna array vazio em caso de falha total
    return [];
};


const TelaQuiz = () => {
  const navigate = useNavigate();
  const jogadorId = localStorage.getItem('jogadorId');

  // Estado das perguntas
  const [perguntasQuiz, setPerguntasQuiz] = useState([]); // As perguntas selecionadas para esta rodada
  const [perguntaAtualIndex, setPerguntaAtualIndex] = useState(0);

  // Estado da tentativa
  const [tentativaId, setTentativaId] = useState(null);
  const [respostasJogador, setRespostasJogador] = useState({}); // { idPergunta: textoRespostaSelecionada }
  const [loading, setLoading] = useState(true);

  // 1. Iniciar o Quiz (Busca perguntas e registra a tentativa)
  useEffect(() => {
    if (!jogadorId) {
      alert('Jogador não identificado. Retornando ao início.');
      navigate('/');
      return;
    }

    const startQuiz = async () => {
      setLoading(true);
      
      const configString = localStorage.getItem('quizConfig');
      const configuracao = configString ? JSON.parse(configString) : null;
      
      let selectedQuestions = [];
      let totalQuestionsTarget = N_QUESTOES_PADRAO;

      if (configuracao && configuracao.length > 0) {
        // Modo Configurado
        totalQuestionsTarget = configuracao.reduce((sum, c) => sum + c.quantidade, 0);
        
        for (const { categoria, quantidade } of configuracao) {
          if (quantidade > 0) {
            // Busca perguntas APENAS desta categoria
            const { data: categoriaData, error: categoriaError } = await supabase
              .from('quiz_admin')
              .select('*, categoria_nome:categorias(nome)')
              .eq('categoria_id', categoria.id)
            
            if (categoriaError) {
              console.error(`Erro ao buscar categoria ${categoria}:`, categoriaError.message);
              continue;
            }
            
            // Seleciona aleatoriamente 'quantidade' perguntas da categoria
            const perguntasDaCategoria = shuffleAndSlice(categoriaData, quantidade);
            selectedQuestions = selectedQuestions.concat(perguntasDaCategoria);
          }
        }
        
      } else {
        // Modo Aleatório (Padrão)
        // Busca TODAS as perguntas e seleciona N_QUESTOES_PADRAO
        const { data: allQuestions, error: allError } = await supabase
          .from('quiz_admin')
          .select('*, categoria_nome:categorias(nome)');
          
        if (allError) {
             console.error('Erro ao buscar todas as perguntas:', allError.message);
             setLoading(false);
             return;
        }
        
        selectedQuestions = shuffleAndSlice(allQuestions, N_QUESTOES_PADRAO);
      }
      
      // Embaralha o conjunto FINAL de perguntas
      selectedQuestions.sort(() => 0.5 - Math.random());
      
      if (selectedQuestions.length === 0) {
        alert('Nenhuma pergunta encontrada para esta configuração. Retornando à configuração.');
        setLoading(false);
        navigate('/jogador/configurar');
        return;
      }
      
      setPerguntasQuiz(selectedQuestions);
      // FIM DA NOVA LÓGICA DE SELEÇÃO POR CATEGORIA
      // ----------------------------------------------------
      
      // B. Registrar Tentativa no Supabase
      const { data: tentativaData, error: tentativaError } = await supabase
        .from('quiz_player_attempts')
        // NOTE: O campo 'usuario' deve ser do tipo 'bigint' ou 'text' na sua tabela!
        .insert([{ usuario: jogadorId, total_perguntas: selectedQuestions.length }]) 
        .select('id')
        .single();
      
      if (tentativaError) {
        console.error('Erro ao registrar tentativa:', tentativaError.message);
        alert('Erro ao iniciar o quiz. Tente novamente.');
        setLoading(false);
        navigate('/');
        return;
      }
      
      setTentativaId(tentativaData.id);
      localStorage.setItem('tentativaId', tentativaData.id); // Salva para uso futuro (Ranking)
      setLoading(false);
    };

    startQuiz();
  }, [jogadorId, navigate]);

  // 2. Lógica de Resposta e Armazenamento
  const handleSelectAnswer = async (perguntaId, respostaTexto) => {
    // 2.1. Atualiza estado local
    const newRespostas = { ...respostasJogador, [perguntaId]: respostaTexto };
    setRespostasJogador(newRespostas);

    // 2.2. Armazena a resposta no Supabase (quiz_player)
    if (tentativaId) {
        const perguntaAtual = perguntasQuiz[perguntaAtualIndex];
        
        // Usa a função auxiliar para garantir que as respostas sejam um array
        const respostasArray = getRespostasAsArray(perguntaAtual.respostas); 
        
        // Encontra a resposta correta
        const respostaCorreta = respostasArray.find(r => r.isCorreta)?.texto || '';
        const isAcerto = respostaTexto === respostaCorreta;

        // Tenta inserir ou atualizar a resposta no Supabase
        const { error } = await supabase
            .from('quiz_player')
            .upsert({ 
                usuario: jogadorId, 
                tentativa_id: tentativaId,
                n_pergunta: perguntaAtualIndex + 1, // Número da pergunta na sequência do quiz
                pergunta_id: perguntaId, // ID da pergunta na tabela quiz_admin
                resposta_marcada: respostaTexto,
                acerto: isAcerto
            }, { 
                onConflict: 'usuario, tentativa_id, n_pergunta' // Upsert pela chave composta
            });
        
        if (error) {
            console.error('Erro ao salvar resposta:', error.message);
            alert('Atenção: Houve um erro ao salvar sua resposta no banco de dados.');
        }
    }
  };

  // 3. Lógica de Navegação
  const handleNext = () => {
    if (perguntaAtualIndex < perguntasQuiz.length - 1) {
      setPerguntaAtualIndex(perguntaAtualIndex + 1);
    } else {
      // Fim do quiz
      if (window.confirm('Você chegou ao fim do quiz! Deseja ver seu Ranking?')) {
        // Limpa a configuração para a próxima vez que o jogador começar
        localStorage.removeItem('quizConfig'); 
        navigate('/jogador/ranking');
      }
    }
  };

  const handlePrevious = () => {
    if (perguntaAtualIndex > 0) {
      setPerguntaAtualIndex(perguntaAtualIndex - 1);
    }
  };

  if (loading || perguntasQuiz.length === 0) {
    return (
      <div className="tela-container" style={{ textAlign: 'center' }}>
        <h2><FaSpinner className="spinner" /> Carregando Quiz...</h2>
        <p>Buscando perguntas e iniciando sua tentativa.</p>
      </div>
    );
  }

  const perguntaAtual = perguntasQuiz[perguntaAtualIndex];
  const respostasParaExibir = getRespostasAsArray(perguntaAtual.respostas);

  return (
    <div className="tela-container">
      <h2>Quiz Gincana 2026</h2>
      <p>Questão {perguntaAtualIndex + 1} de {perguntasQuiz.length}</p>
      <p>Categoria: {perguntaAtual.categoria_nome ? perguntaAtual.categoria_nome.nome : 'Carregando...'}</p>
      
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
        <h3>{perguntaAtual.texto}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {respostasParaExibir.map((resposta, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(perguntaAtual.id, resposta.texto)}
              style={{
                backgroundColor: respostasJogador[perguntaAtual.id] === resposta.texto ? '#4CAF50' : '#e0e0e0', // Verde se selecionado
                color: respostasJogador[perguntaAtual.id] === resposta.texto ? 'white' : 'black',
                border: '1px solid #ccc',
                padding: '12px',
                borderRadius: '5px',
                textAlign: 'left',
                transition: 'background-color 0.2s',
                cursor: 'pointer'
              }}
            >
              {respostasJogador[perguntaAtual.id] === resposta.texto && <FaCheckCircle style={{ marginRight: '8px' }} />}
              {resposta.texto}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button 
          onClick={handlePrevious} 
          disabled={perguntaAtualIndex === 0}
          className="botao-principal" 
          style={{ backgroundColor: '#6c757d' }}
        >
          <FaArrowLeft /> Anterior
        </button>
        
        <button 
          onClick={handleNext}
          className="botao-principal"
          disabled={!respostasJogador[perguntaAtual.id]} // Desabilita se não respondeu
        >
          {perguntaAtualIndex < perguntasQuiz.length - 1 ? <><FaArrowRight /> Próxima</> : <><FaCheckCircle /> Finalizar Quiz</>}
        </button>
      </div>
    </div>
  );
};

export default TelaQuiz;