// src/components/ConfiguracaoQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaPlay, FaList } from 'react-icons/fa';
import { FaDoorOpen, FaUserPlus, FaTrophy } from 'react-icons/fa'

// Total de questões fixo para validação
const N_QUESTOES_MIN = 5;
const N_QUESTOES_MAX = 20;

const ConfiguracaoQuiz = () => {
    const navigate = useNavigate();
    const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
    const [configuracaoCategorias, setConfiguracaoCategorias] = useState({}); // { 'Química': 0, 'História': 0, ... }
    const [totalPerguntas, setTotalPerguntas] = useState(0);
    const [loading, setLoading] = useState(true);
    const jogadorNome = localStorage.getItem('jogadorNome') || 'Jogador';

    useEffect(() => {
        // Busca todas as categorias ÚNICAS no banco de dados
        const fetchCategorias = async () => {
            const { data, error } = await supabase
                .from('quiz_admin')
                .select('categoria')
                .order('categoria', { ascending: true });

            if (error) {
                console.error("Erro ao buscar categorias:", error.message);
                setLoading(false);
                return;
            }

            // Remove duplicatas para obter a lista de categorias únicas
            const categoriasUnicas = [...new Set(data.map(item => item.categoria))];
            setCategoriasDisponiveis(categoriasUnicas);

            // Inicializa a configuração com 0 perguntas por categoria
            const initialConfig = categoriasUnicas.reduce((acc, cat) => {
                acc[cat] = 0;
                return acc;
            }, {});
            setConfiguracaoCategorias(initialConfig);
            setLoading(false);
        };

        fetchCategorias();
    }, []);

    const handleQuantidadeChange = (categoria, quantidade) => {
        const novaConfiguracao = {
            ...configuracaoCategorias,
            [categoria]: Math.max(0, parseInt(quantidade) || 0) // Garante que seja no mínimo 0
        };
        setConfiguracaoCategorias(novaConfiguracao);

        // Recalcula o total
        const novoTotal = Object.values(novaConfiguracao).reduce((sum, num) => sum + num, 0);
        setTotalPerguntas(novoTotal);
    };

    const handleIniciarQuiz = () => {
        if (totalPerguntas < N_QUESTOES_MIN || totalPerguntas > N_QUESTOES_MAX) {
            alert(`O quiz deve ter entre ${N_QUESTOES_MIN} e ${N_QUESTOES_MAX} questões no total. Selecionado: ${totalPerguntas}`);
            return;
        }

        // Filtra e prepara a configuração final para salvar no localStorage
        const configuracaoFinal = Object.entries(configuracaoCategorias)
            .filter(([, quantidade]) => quantidade > 0)
            .map(([categoria, quantidade]) => ({ categoria, quantidade }));

        // Salva a configuração no localStorage para que TelaQuiz.jsx possa ler
        localStorage.setItem('quizConfig', JSON.stringify(configuracaoFinal));

        navigate('/jogador/quiz');
    };

    if (loading) {
        return <div className="tela-container"><h2>Carregando configurações...</h2></div>;
    }

    return (
        <div className="tela-container">
            <h2>{jogadorNome}, pronto para a Gincana?</h2>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' }}>
                {/* NOVO BOTÃO MULTIPLAYER */}
                <button
                    onClick={() => navigate('/jogador/entrar-sala')}
                    className="botao-principal"
                    style={{ backgroundColor: '#ff9800', padding: '15px 30px', fontSize: '1.1em' }}
                >
                    <FaDoorOpen style={{ marginRight: '8px' }} /> Entrar em Sala Multiplayer
                </button>

                {/* Mantém o botão de Ranking */}
                <button
                    onClick={() => navigate('/jogador/ranking')}
                    className="botao-principal"
                    style={{ backgroundColor: '#007bff', padding: '15px 30px', fontSize: '1.1em' }}
                >
                    <FaTrophy style={{ marginRight: '8px' }} /> Ver Ranking
                </button>
            </div>

            <h2>Configurar Quiz</h2>
            <p>Selecione a quantidade de questões que deseja em cada categoria. Total de questões deve ser entre **{N_QUESTOES_MIN}** e **{N_QUESTOES_MAX}**.</p>

            <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
                <p>Total Selecionado: <strong>{totalPerguntas}</strong></p>
            </div>

            {categoriasDisponiveis.map(cat => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>{cat}:</label>
                    <input
                        type="number"
                        min="0"
                        max={N_QUESTOES_MAX}
                        value={configuracaoCategorias[cat]}
                        onChange={(e) => handleQuantidadeChange(cat, e.target.value)}
                        style={{ width: '80px', textAlign: 'center', padding: '8px' }}
                    />
                </div>
            ))}

            <button
                onClick={handleIniciarQuiz}
                className="botao-principal"
                disabled={totalPerguntas < N_QUESTOES_MIN || totalPerguntas > N_QUESTOES_MAX}
                style={{ width: '100%', marginTop: '20px' }}
            >
                <FaPlay /> Iniciar Quiz ({totalPerguntas} questões)
            </button>

            <p style={{ marginTop: '20px' }}>Não quer configurar? <button onClick={() => { localStorage.removeItem('quizConfig'); navigate('/jogador/quiz'); }} className="botao-principal" style={{ backgroundColor: '#007bff' }}>
                <FaList /> Modo Aleatório (20 questões)
            </button></p>
        </div>
    );
};

export default ConfiguracaoQuiz;