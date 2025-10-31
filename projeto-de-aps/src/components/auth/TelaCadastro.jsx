// src/components/auth/TelaCadastro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const TelaCadastro = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [equipe, setEquipe] = useState('');
    const [turma, setTurma] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Registrar o usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
        });

        if (authError) {
            alert(`Erro ao registrar: ${authError.message}`);
            setLoading(false);
            return;
        }

        // 2. Se o registro for bem-sucedido, criar o perfil na sua tabela 'usuarios'
        // NOTA: O Supabase envia um e-mail de confirmação. O profile só é criado
        // se o usuário confirmar o e-mail (idealmente). 

        alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
        navigate('/'); 

        setLoading(false);
    };

    return (
        <div className="tela-container">
            <h2>Registro de Jogador</h2>
            <form onSubmit={handleCadastro}>
                {/* Campos de Autenticação */}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                
                {/* Campos do Perfil */}
                <input type="text" placeholder="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
                <input type="text" placeholder="Equipe" value={equipe} onChange={(e) => setEquipe(e.target.value)} required />
                <input type="text" placeholder="Turma" value={turma} onChange={(e) => setTurma(e.target.value)} required />

                <button type="submit" className="botao-principal" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar e Jogar'}
                </button>
            </form>
            <button onClick={() => navigate('/')} style={{ marginTop: '10px' }}>
                Já tenho conta (Login)
            </button>
        </div>
    );
};

export default TelaCadastro;