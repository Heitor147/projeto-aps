// src/components/auth/RedefinirSenha.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { FaArrowLeft } from 'react-icons/fa';

const RedefinirSenha = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // O Supabase envia um e-mail com um link mágico (magic link)
        // que redireciona o usuário para uma URL de redefinição.
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // Este URL deve ser a URL da sua aplicação onde o usuário pode definir a nova senha.
            // Ex: "http://localhost:5173/redefinir-senha-confirmar"
            // Por padrão, o Supabase usa a URL de fallback configurada no Painel.
            redirectTo: window.location.origin + '/redefinir-senha-confirmar', 
        });

        if (error) {
            setMessage(`Erro: ${error.message}. Tente novamente.`);
            console.error(error);
        } else {
            setMessage('Instruções para redefinição de senha foram enviadas para o seu e-mail!');
            setEmail(''); // Limpa o campo após o envio
        }

        setLoading(false);
    };

    return (
        <div className="tela-container">
            <h2>Esqueci a Senha</h2>
            <p>Digite seu e-mail para receber as instruções de redefinição.</p>
            
            <form onSubmit={handlePasswordReset}>
                <input 
                    type="email" 
                    placeholder="Seu E-mail de Cadastro" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />

                <button type="submit" className="botao-principal" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar E-mail de Redefinição'}
                </button>
            </form>
            
            {message && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                    {message}
                </div>
            )}

            <button onClick={() => navigate('/')} style={{ marginTop: '20px', backgroundColor: '#6c757d' }}>
                <FaArrowLeft /> Voltar ao Login
            </button>
        </div>
    );
};

export default RedefinirSenha;