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
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
        });
    
        if (signUpError) {
            alert(`Erro ao registrar: ${signUpError.message}`);
            setLoading(false);
            return;
        }
    
        // Tenta obter a sessão e o ID imediatamente
        const session = signUpData.session;
        const user = signUpData.user;
        
        // Se a confirmação por e-mail estiver ativada, a sessão pode ser nula inicialmente.
        // Usamos o ID do objeto user retornado, que deve existir.
        const userId = user ? user.id : null; 
    
        if (!userId) {
            // Isso acontece se a confirmação de e-mail estiver ligada e o Supabase não retorna sessão.
            alert('Cadastro efetuado. Verifique seu e-mail para confirmar a conta e logar. Não foi possível preencher o perfil agora.');
            setLoading(false);
            navigate('/');
            return; 
        }
        
        // --- PONTO CRÍTICO: Atualização do Perfil ---
        
        console.log('Dados a serem enviados para UPDATE:', { nome, equipe, turma }); 
        // DEBUG: Verifique o console do navegador para confirmar se nome não está vazio aqui.
    
        // 2. FAZER O UPDATE DO PERFIL RECÉM-CRIADO PELO TRIGGER
        const { error: profileError } = await supabase
            .from('usuarios')
            .update({
                // Garante que estamos enviando os valores corretos
                nome: nome, 
                equipe: equipe, 
                turma: turma,
                admin: false 
            })
            .eq('id', userId); // Usa o ID garantido
    
        if (profileError) {
            // Se houver RLS mal configurado ou outro erro de banco, ele será capturado aqui.
            console.error('Erro ao salvar dados do perfil (UPDATE):', profileError.message);
            alert('Conta criada, mas erro ao salvar perfil. Por favor, entre em contato com o administrador.');
        } else {
            alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta e logar.');
        }
    
        setLoading(false);
        navigate('/');
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