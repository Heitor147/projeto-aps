// src/components/admin/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUser, FaQuestionCircle, FaSignOutAlt, FaListAlt } from 'react-icons/fa';
import { supabase } from '../../supabaseClient';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const adminNome = localStorage.getItem('jogadorNome');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="tela-container">
            <h2>Painel de Administração</h2>
            <p>Bem-vindo, {adminNome}!</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
                <button className="botao-principal" onClick={() => navigate('/admin/usuarios')}>
                    <FaUser /> Gerenciar Usuários
                </button>
                <button className="botao-principal" onClick={() => navigate('/admin/perguntas')} style={{ backgroundColor: '#007bff' }}>
                    <FaQuestionCircle /> Gerenciar Questões
                </button>
                <button className="botao-principal" onClick={() => navigate('/admin/categorias')} style={{ backgroundColor: '#ff9800' }}>
                    <FaListAlt /> Gerenciar Categorias {/* NOVO BOTÃO */}
                </button>
                <button className='botao-principal' onClick={() => navigate('/admin/salas')} style={{ backgroundColor: '#009bff'}}>
                    <FaUsers /> Gerenciar Salas
                </button>
            </div>

            <button onClick={handleLogout} style={{ marginTop: '50px', backgroundColor: '#dc3545' }}>
                <FaSignOutAlt /> Sair
            </button>
        </div>
    );
};

export default AdminDashboard;