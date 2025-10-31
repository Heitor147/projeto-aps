// src/components/admin/GerenciamentoUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GerenciamentoUsuarios = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        // NOTA: Como você está no painel admin, você deve ter a permissão RLS para ver todos.
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nome, equipe, turma, admin');

        if (error) {
            console.error('Erro ao buscar usuários:', error.message);
            alert('Não foi possível carregar a lista de usuários.');
            setLoading(false);
            return;
        }

        setUsuarios(data);
        setLoading(false);
    };

    // Inicia a edição de um usuário
    const handleEdit = (usuario) => {
        setEditingId(usuario.id);
        setEditData({ ...usuario }); // Copia os dados para edição
    };

    // Salva as alterações
    const handleSave = async (id) => {
        if (!editData.nome || !editData.equipe || !editData.turma) {
            alert('Preencha todos os campos.');
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('usuarios')
            .update({ 
                nome: editData.nome,
                equipe: editData.equipe,
                turma: editData.turma,
                admin: editData.admin // Permite alternar o status de administrador
            })
            .eq('id', id);

        if (error) {
            alert(`Erro ao atualizar: ${error.message}`);
        } else {
            // Atualiza o estado local e sai do modo de edição
            setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...editData } : u));
            setEditingId(null);
            setEditData(null);
        }
        setLoading(false);
    };

    // Remove um usuário
    const handleDelete = async (id, nome) => {
        if (!window.confirm(`Tem certeza que deseja remover o usuário ${nome}?`)) return;

        setLoading(true);
        // NOTA: Se o usuário tiver FKs em outras tabelas (ex: quiz_player_attempts),
        // a exclusão pode falhar, a menos que você configure a exclusão em cascata no BD.
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) {
            alert(`Erro ao excluir: ${error.message}. Verifique dependências.`);
        } else {
            setUsuarios(usuarios.filter(u => u.id !== id));
        }
        setLoading(false);
    };
    
    // Função para adicionar um novo usuário (apenas perfil)
    // NOTA: Para adicionar usuários com login, use o painel Supabase ou a tela de registro.
    // Esta função é para adicionar perfis sem a necessidade de passar pela autenticação do Auth.
    const handleAddUsuario = async () => {
        const novoNome = prompt("Digite o nome do novo usuário (Apenas perfil):");
        if (!novoNome) return;
        
        const novaEquipe = prompt("Digite a equipe:");
        const novaTurma = prompt("Digite a turma:");

        if (novoNome && novaEquipe && novaTurma) {
            setLoading(true);
            const { data, error } = await supabase
                .from('usuarios')
                .insert([{ nome: novoNome, equipe: novaEquipe, turma: novaTurma, admin: false }])
                .select()
                .single();
                
            if (error) {
                alert(`Erro ao adicionar: ${error.message}`);
            } else {
                setUsuarios([...usuarios, data]);
            }
            setLoading(false);
        }
    };


    if (loading) {
        return (
             <div className="tela-container" style={{ textAlign: 'center' }}>
                <h2><FaSpinner className="spinner" /> Carregando Usuários...</h2>
            </div>
        );
    }

    return (
        <div className="tela-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Gerenciamento de Usuários</h2>
                <button onClick={() => navigate('/admin/dashboard')} style={{ backgroundColor: '#6c757d' }}>
                    <FaArrowLeft /> Voltar
                </button>
            </div>
            
            <button className="botao-principal" onClick={handleAddUsuario} style={{ marginBottom: '20px', backgroundColor: '#28a745' }}>
                Adicionar Novo Jogador (Perfil)
            </button>

            {usuarios.length === 0 ? (
                <p>Nenhum usuário encontrado.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Nome</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Equipe</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Admin</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                {editingId === usuario.id ? (
                                    <>
                                        {/* Modo de Edição */}
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><input value={editData.nome} onChange={(e) => setEditData({ ...editData, nome: e.target.value })} /></td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><input value={editData.equipe} onChange={(e) => setEditData({ ...editData, equipe: e.target.value })} /></td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><input type="checkbox" checked={editData.admin} onChange={(e) => setEditData({ ...editData, admin: e.target.checked })} /></td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                            <button onClick={() => handleSave(usuario.id)} style={{ marginRight: '5px', backgroundColor: '#28a745' }}><FaCheck /></button>
                                            <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#dc3545' }}><FaTimes /></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        {/* Modo de Visualização */}
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{usuario.nome}</td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{usuario.equipe}</td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd', color: usuario.admin ? 'green' : 'red' }}>{usuario.admin ? 'SIM' : 'NÃO'}</td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                            <button onClick={() => handleEdit(usuario)} style={{ marginRight: '5px', backgroundColor: '#ffc107' }}><FaEdit /></button>
                                            <button onClick={() => handleDelete(usuario.id, usuario.nome)} style={{ backgroundColor: '#dc3545' }}><FaTrash /></button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default GerenciamentoUsuarios;