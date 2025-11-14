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
    
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });
    
        if (authError) {
            alert(`Erro de login: ${authError.message}`);
            setLoading(false);
            return;
        }
    
        const userId = authData.user.id;
        
        // 1. BUSCAR O PERFIL DO USUÁRIO
        const { data: perfilData, error: perfilError } = await supabase
            .from('usuarios')
            .select('nome, admin') // Confirme se a coluna é 'nome' e não outra
            .eq('id', userId)
            .single();
    
        // 2. TRATAMENTO DE ERRO/DADOS NULOS
        if (perfilError) {
            console.error('Erro ao buscar perfil:', perfilError.message);
            alert('Login OK, mas erro ao buscar perfil. O usuário pode ter sido excluído ou não existe na tabela "usuarios".');
            setLoading(false);
            return;
        }
    
        if (!perfilData) {
             // Isso pode acontecer se o Trigger tiver falhado e não criado a linha.
             alert('Erro: Perfil do usuário não encontrado na tabela "usuarios".');
             setLoading(false);
             return;
        }
        
        // 3. DEFINIÇÃO ROBUSTA DAS VARIÁVEIS
        // Usa o valor de perfilData.nome. Se for NULL ou undefined, usa 'Jogador'.
        const nomeDoPerfilBuscado = perfilData.nome || 'Jogador';
        const isAdmin = perfilData.admin;
        
        // 4. SALVAR NO LOCALSTORAGE
        localStorage.setItem('jogadorNome', nomeDoPerfilBuscado); 
        localStorage.setItem('jogadorId', userId);
        localStorage.setItem('isAdmin', isAdmin);
    
        // 5. Redirecionamento
        if (isAdmin) {
            navigate('/admin/dashboard');
        } else {
            navigate('/jogador/configurar');
        }
    
        setLoading(false);
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