// src/components/SalaQuiz.jsx (Esqueleto)
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

const SalaQuiz = () => {
    const { salaId } = useParams();
    const navigate = useNavigate();
    const [salaEstado, setSalaEstado] = useState(null);
    const [perguntaAtual, setPerguntaAtual] = useState(null);
    // ... (mais estados para timer, respostas, etc.)

    // 1. Conexão Realtime e Atualização do Jogo
    useEffect(() => {
        const channel = supabase
            .channel(`quiz-sala:${salaId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'salas', filter: `id=eq.${salaId}` },
                (payload) => {
                    const novoEstado = payload.new;
                    setSalaEstado(novoEstado.estado_jogo);
                    // Lógica para buscar a nova pergunta se o ID mudou
                    if (novoEstado.estado_jogo.perguntaAtualId !== salaEstado?.perguntaAtualId) {
                        fetchPergunta(novoEstado.estado_jogo.perguntaAtualId);
                    }
                }
            )
            .subscribe();

        // 2. Busca inicial do estado e primeira pergunta
        const fetchInitialData = async () => {
            const { data } = await supabase.from('salas').select('estado_jogo, perguntas_selecionadas').eq('id', salaId).single();
            if (data && data.estado_jogo.status === 'Em Jogo') {
                setSalaEstado(data.estado_jogo);
                fetchPergunta(data.estado_jogo.perguntaAtualId);
            } else {
                 navigate(`/sala/${salaId}/lobby`); // Se não estiver em jogo, volta para o lobby
            }
        };
        fetchInitialData();
        
        return () => { supabase.removeChannel(channel); };
    }, [salaId, navigate, salaEstado]);

    const fetchPergunta = async (perguntaId) => {
        if (!perguntaId) return;
        const { data } = await supabase
            .from('quiz_admin')
            .select('texto, peso, respostas') // Traz apenas o necessário para a tela
            .eq('id', perguntaId)
            .single();
        setPerguntaAtual(data);
    };

    if (!salaEstado || !perguntaAtual) {
        return <div className="tela-container"><FaSpinner className="spinner" /> Sincronizando Jogo...</div>;
    }

    return (
        <div className="tela-container">
            <h2>Quiz Multiplayer - {salaId}</h2>
            <p>Pergunta {salaEstado.indicePergunta} / {salaEstado.perguntas_selecionadas?.length || '...'}</p>
            <p>Tempo Restante: {salaEstado.tempoRestante || 'N/A'}</p>
            
            <div style={{ padding: '20px', border: '2px solid #333', borderRadius: '8px', backgroundColor: '#fff' }}>
                <h3>{perguntaAtual.texto}</h3>
                {/* Lógica de respostas e envio de dados para quiz_player */}
            </div>
            
            {/* ... (Exibir placar, respostas, etc.) */}
            <button onClick={() => navigate(`/sala/${salaId}/lobby`)}>Voltar ao Lobby</button>
        </div>
    );
};

export default SalaQuiz;