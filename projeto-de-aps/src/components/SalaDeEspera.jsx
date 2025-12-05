import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaUsers, FaPlay, FaSignOutAlt, FaSpinner } from 'react-icons/fa';

const SalaDeEspera = () => {
    const navigate = useNavigate();
    const { salaId } = useParams();
    const jogadorId = localStorage.getItem('jogadorId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const [sala, setSala] = useState(null);
    const [jogadores, setJogadores] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Conexão Realtime e Busca de Dados da Sala
    useEffect(() => {
        if (!salaId) {
            alert("ID da sala não fornecido.");
            navigate('/admin/dashboard');
            return;
        }

        // Função para buscar a sala e os jogadores
        const fetchSalaData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('salas')
                .select(`*, jogadores:quiz_player_attempts(usuario, id)`) // Busca tentativas vinculadas
                .eq('id', salaId)
                .single();

            if (error || !data) {
                alert('Sala não encontrada ou erro de acesso.');
                navigate('/admin/dashboard');
                return;
            }
            
            setSala(data);
            // Simulação: Transforma as tentativas em "jogadores" no lobby
            // Em um sistema real, você usaria um sistema de presença ou buscaria a lista de usuários logados
            setJogadores(data.jogadores.map(att => att.usuario)); 
            setLoading(false);
        };

        fetchSalaData();

        // 2. Assinar mudanças em tempo real na tabela 'salas'
        const channel = supabase
            .channel(`sala:${salaId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'salas', filter: `id=eq.${salaId}` },
                (payload) => {
                    const novoEstado = payload.new;
                    setSala(novoEstado);
                    
                    // Verifica se o jogo foi iniciado (Status 'Em Jogo')
                    if (novoEstado.estado_jogo.status === 'Em Jogo') {
                        navigate(`/sala/${salaId}/quiz`);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [salaId, navigate]);


    // 3. Ação do Administrador: Iniciar Jogo
    const handleStartGame = async () => {
        if (!isAdmin || !sala) return;

        if (jogadores.length < 2) {
            alert("Mínimo de 2 jogadores para iniciar o quiz multiplayer.");
            return;
        }
        
        // LÓGICA DE SELEÇÃO DE PERGUNTAS (Simplificada)
        // Neste ponto, o Admin deveria selecionar as 20 perguntas (ou usar a lógica de configuração)
        const { data: allQuestions } = await supabase
            .from('quiz_admin')
            .select('id');
        
        // Seleciona 20 IDs aleatórios para o quiz da sala
        const selectedQuestionIds = allQuestions
            .map(q => q.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 20);

        const newGameState = {
            status: "Em Jogo",
            perguntaAtualId: selectedQuestionIds[0],
            indicePergunta: 1,
            tempoRestante: 30, // Ex: 30 segundos por pergunta
        };

        const { error } = await supabase
            .from('salas')
            .update({
                estado_jogo: newGameState,
                perguntas_selecionadas: selectedQuestionIds,
            })
            .eq('id', salaId);

        if (error) {
            console.error('Erro ao iniciar jogo:', error.message);
            alert('Não foi possível iniciar o jogo.');
        }
        // O Realtime Listener (acima) cuidará do redirecionamento
    };


    if (loading) {
        return <div className="tela-container"><FaSpinner className="spinner" /> Carregando Sala...</div>;
    }

    if (!sala) return <div className="tela-container">Sala Indisponível.</div>;

    const salaStatus = sala.estado_jogo.status;
    const isSalaAdmin = sala.administrador_id === jogadorId;
    
    return (
        <div className="tela-container">
            <h2>Sala: {sala.nome}</h2>
            <p>ID da Sala: {salaId}</p>
            <p>Status: {salaStatus}</p>
            <p>Administrador: {sala.administrador_id === jogadorId ? 'Você' : 'Outro Admin'}</p>

            <h3 style={{ marginTop: '20px' }}>Jogadores na Sala <FaUsers /> ({jogadores.length})</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {/* NOTA: Aqui você precisaria buscar o nome do usuário pelo ID */}
                {jogadores.map(id => (
                    <li key={id} style={{ padding: '8px', borderBottom: '1px dotted #ccc' }}>
                        {id === jogadorId ? 'Você (ID: ' + id.substring(0, 4) + '...)' : `Jogador ID: ${id.substring(0, 8)}...`}
                    </li>
                ))}
            </ul>

            {isAdmin && isSalaAdmin && salaStatus === 'Aberto' && (
                <button 
                    onClick={handleStartGame} 
                    className="botao-principal"
                    disabled={loading || jogadores.length < 2}
                    style={{ marginTop: '30px', backgroundColor: jogadores.length < 2 ? '#6c757d' : '#28a745' }}
                >
                    <FaPlay /> {jogadores.length < 2 ? 'Mínimo de 2 jogadores' : 'Iniciar Quiz Multiplayer'}
                </button>
            )}
            
            <button onClick={() => navigate('/admin/dashboard')} style={{ marginTop: '20px', backgroundColor: '#dc3545' }}>
                <FaSignOutAlt /> Sair da Sala
            </button>
        </div>
    );
};

export default SalaDeEspera;