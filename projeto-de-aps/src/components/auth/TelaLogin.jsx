// src/components/auth/TelaLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const TelaLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });

        if (error) {
            alert(`Erro no Login: ${error.message}`);
            setLoading(false);
            return;
        }

        // Login bem-sucedido. Buscar perfil e verificar se é admin
        const userId = data.user.id;
        
        const { data: profileData, error: profileError } = await supabase
            .from('usuarios')
            .select('nome, admin')
            .eq('id', userId)
            .single();

        if (profileError) {
             console.error('Erro ao buscar perfil:', profileError.message);
             alert('Erro ao carregar perfil do jogador.');
             setLoading(false);
             return;
        }

        // Salvar dados no localStorage
        localStorage.setItem('jogadorId', userId);
        localStorage.setItem('jogadorNome', profileData.nome);
        localStorage.setItem('isAdmin', profileData.admin);

        setLoading(false);

        // Redirecionamento baseado no status de Admin
        if (profileData.admin) {
            navigate('/admin/dashboard'); // Redireciona para o painel de administração
        } else {
            navigate('/jogador/configurar'); // Redireciona para a configuração do quiz
        }
    };

    return (
        <div className="tela-container">
            <h2>Login Quiz Gincana</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />

                <button type="submit" className="botao-principal" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            <button 
                onClick={() => navigate('/redefinir')} 
                style={{ marginTop: '10px', backgroundColor: 'transparent', color: '#007bff', border: 'none', padding: '0', cursor: 'pointer' }}
            >
                Esqueceu a senha?
            </button>
            <button onClick={() => navigate('/cadastro')} style={{ marginTop: '10px' }}>
                Não tenho conta (Cadastrar)
            </button>
        </div>
    );
};

export default TelaLogin;