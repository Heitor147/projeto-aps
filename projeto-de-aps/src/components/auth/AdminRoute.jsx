import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    // Checa se o usuário está logado e se a flag 'isAdmin' é 'true' (string ou boolean)
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const jogadorId = localStorage.getItem('jogadorId');

    if (!jogadorId) {
        // Não logado
        alert('Acesso negado. Faça login primeiro.');
        return <Navigate to="/" />;
    }

    if (!isAdmin) {
        // Logado, mas não admin
        alert('Acesso negado. Você não tem privilégios de administrador.');
        return <Navigate to="/jogador/configurar" />; // Volta para a tela de jogador
    }

    return children;
};

export default AdminRoute;