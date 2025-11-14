// src/components/EntrarNaSala.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaDoorOpen, FaArrowLeft } from 'react-icons/fa';

const EntrarNaSala = () => {
    const navigate = useNavigate();
    const jogadorId = localStorage.getItem('jogadorId');
    const [salaIdInput, setSalaIdInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoinSala = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!jogadorId) {
            alert('Erro: Jogador não identificado. Faça login novamente.');
            navigate('/');
            return;
        }

        const salaId = parseInt(salaIdInput);
        if (isNaN(salaId)) {
            alert('Código da Sala inválido. Digite apenas números.');
            setLoading(false);
            return;
        }

        // 1. Verificar se a sala existe e está aberta ('Aberto')
        const { data: salaData, error: salaError } = await supabase
            .from('salas')
            .select('estado_jogo')
            .eq('id', salaId)
            .single();

        if (salaError || !salaData) {
            alert('Sala não encontrada ou ID incorreto.');
            setLoading(false);
            return;
        }
        
        if (salaData.estado_jogo.status !== 'Aberto') {
            alert(`A sala ${salaId} está '${salaData.estado_jogo.status}'. Não é possível entrar.`);
            setLoading(false);
            return;
        }


        // 2. Registrar a tentativa do jogador vinculada à sala
        const { data: attemptData, error: attemptError } = await supabase
            .from('quiz_player_attempts')
            // total_perguntas é temporariamente 0 até o admin iniciar e definir
            .insert([{ usuario: jogadorId, sala_id: salaId, total_perguntas: 0 }]) 
            .select('id')
            .single();

        if (attemptError) {
             // Pode ocorrer erro se o jogador tentar entrar duas vezes.
             if (attemptError.code === '23505') { 
                 alert('Você já está registrado para entrar nesta sala. Redirecionando...');
             } else {
                 console.error('Erro ao registrar tentativa para sala:', attemptError.message);
                 alert('Erro ao entrar na sala. Tente novamente.');
                 setLoading(false);
                 return;
             }
        }
        
        // 3. Sucesso: Redirecionar para o Lobby da Sala
        // O Lobby (SalaDeEspera.jsx) usará o Realtime para monitorar o status.
        navigate(`/sala/${salaId}/lobby`);
        setLoading(false);
    };

    return (
        <div className="tela-container">
            <button onClick={() => navigate('/jogador/configurar')} style={{ marginBottom: '20px', backgroundColor: '#6c757d' }}>
                <FaArrowLeft /> Voltar
            </button>
            
            <h2><FaDoorOpen /> Entrar em Sala Multiplayer</h2>
            <p>Peça o código para o administrador do Quiz.</p>
            
            <form onSubmit={handleJoinSala} style={{ marginTop: '20px' }}>
                <input 
                    type="number" 
                    placeholder="Digite o Código da Sala (ID)" 
                    value={salaIdInput} 
                    onChange={(e) => setSalaIdInput(e.target.value)} 
                    required 
                    min="1"
                />

                <button type="submit" className="botao-principal" disabled={loading}>
                    {loading ? 'Verificando...' : 'Entrar na Sala'}
                </button>
            </form>
        </div>
    );
};

export default EntrarNaSala;