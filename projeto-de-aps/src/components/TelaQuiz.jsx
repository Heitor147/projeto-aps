// src/components/TelaQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getPerguntas } from './APISupa';
import { FaArrowLeft, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const N_QUESTOES_QUIZ = 3; // Define o total de questões a serem respondidas

const TelaQuiz = () => {
    const navigate = useNavigate();
    const jogadorId = localStorage.getItem('jogadorId');

    // Estado das perguntas
    const [perguntasDisponiveis, setPerguntasDisponiveis] = useState([]); // Todas as perguntas
    const [perguntasQuiz, setPerguntasQuiz] = useState([]); // As 20 perguntas selecionadas
    const [perguntaAtualIndex, setPerguntaAtualIndex] = useState(0);

    // Estado da tentativa
    const [tentativaId, setTentativaId] = useState(null);
    const [respostasJogador, setRespostasJogador] = useState({}); // { idPergunta: textoRespostaSelecionada }
    const [loading, setLoading] = useState(true);

    // Função auxiliar para selecionar N questões aleatórias
    const selectRandomQuestions = (allQuestions) => {
        // Implementação simples de shuffle e slice
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, N_QUESTOES_QUIZ);
    };

    // 1. Iniciar o Quiz (Busca perguntas e registra a tentativa)
    useEffect(() => {
        if (!jogadorId) {
            alert('Jogador não identificado. Retornando ao início.');
            navigate('/');
            return;
        }

        const startQuiz = async () => {
            setLoading(true);

            const usuarioArray = [jogadorId];

            // A. Registrar Tentativa no Supabase
            const { data: tentativaData, error: tentativaError } = await supabase
                .from('quiz_player_attempts')
                .insert([{ usuario: jogadorId }])
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

            // B. Buscar e Selecionar Perguntas
            const allQuestions = await getPerguntas(); // Usa a função do APISupa.jsx
            if (allQuestions.length < N_QUESTOES_QUIZ) {
                alert(`Apenas ${allQuestions.length} questões disponíveis. O quiz exige ${N_QUESTOES_QUIZ}.`);
            }
            const selectedQuestions = selectRandomQuestions(allQuestions);
            setPerguntasDisponiveis(allQuestions);
            setPerguntasQuiz(selectedQuestions);
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
            // Obter a resposta correta da pergunta atual
            const perguntaAtual = perguntasQuiz[perguntaAtualIndex];
            const respostaCorreta = perguntaAtual.respostas.find(r => r.isCorreta)?.texto || '';
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
                // Continua, mas com aviso, pois a falha do BD não deve travar o quiz
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
            <div className="tela-container">
                <h2>Carregando Quiz...</h2>
                <p>Buscando perguntas e iniciando sua tentativa.</p>
            </div>
        );
    }

    const perguntaAtual = perguntasQuiz[perguntaAtualIndex];

    const getRespostasAsArray = (respostas) => {
        if (Array.isArray(respostas)) {
            return respostas;
        }
        // Tenta converter se for string JSON
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

    return (
        <div className="tela-container">
            <h2>Quiz Gincana 2026</h2>
            <p>Categoria: **{perguntaAtual.categoria}**</p>

            <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
                <h3>{perguntaAtualIndex + 1}. {perguntaAtual.texto}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {getRespostasAsArray(perguntaAtual.respostas).map((resposta, index) => (
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