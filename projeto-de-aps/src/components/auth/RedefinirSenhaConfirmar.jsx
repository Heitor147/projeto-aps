import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const RedefinirSenhaConfirmar = () => {
    const navigate = useNavigate();
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('Digite sua nova senha abaixo.');

    const handleNewPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (novaSenha !== confirmarSenha) {
            setMessage('As senhas digitadas não coincidem.');
            setLoading(false);
            return;
        }

        // O Supabase já sabe quem é o usuário devido ao token na URL
        const { error } = await supabase.auth.updateUser({
            password: novaSenha,
        });

        if (error) {
            setMessage(`Erro ao redefinir a senha: ${error.message}.`);
            console.error(error);
        } else {
            setMessage('Senha redefinida com sucesso! Você será redirecionado para o login.');
            setNovaSenha('');
            setConfirmarSenha('');
            // Redireciona após 3 segundos
            setTimeout(() => navigate('/'), 3000); 
        }

        setLoading(false);
    };

    return (
        <div className="tela-container">
            <h2>Nova Senha</h2>
            <p>{message}</p>
            
            <form onSubmit={handleNewPassword}>
                <input 
                    type="password" 
                    placeholder="Nova Senha" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Confirmar Nova Senha" 
                    value={confirmarSenha} 
                    onChange={(e) => setConfirmarSenha(e.target.value)} 
                    required 
                />

                <button type="submit" className="botao-principal" disabled={loading}>
                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
            </form>
        </div>
    );
};

export default RedefinirSenhaConfirmar;