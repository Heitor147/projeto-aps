import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GerenciamentoCategorias = () => {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editNome, setEditNome] = useState('');
    const [editDescricao, setEditDescricao] = useState('');

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar categorias:', error.message);
            alert('Não foi possível carregar a lista de categorias.');
        } else {
            setCategorias(data);
        }
        setLoading(false);
    };

    const handleAddCategoria = async () => {
        if (!novaCategoriaNome.trim()) {
            alert('O nome da categoria não pode estar vazio.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('categorias')
            .insert([{ nome: novaCategoriaNome.trim() }])
            .select()
            .single();

        if (error) {
            alert(`Erro ao adicionar categoria: ${error.message}.`);
        } else {
            setCategorias([...categorias, data]);
            setNovaCategoriaNome('');
        }
        setLoading(false);
    };

    const handleEditStart = (categoria) => {
        setEditingId(categoria.id);
        setEditNome(categoria.nome);
        setEditDescricao(categoria.descricao || '');
    };

    const handleSave = async (id) => {
        if (!editNome.trim()) {
            alert('O nome não pode ser vazio.');
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('categorias')
            .update({ nome: editNome.trim(), descricao: editDescricao.trim() })
            .eq('id', id);

        if (error) {
            alert(`Erro ao atualizar: ${error.message}.`);
        } else {
            setCategorias(categorias.map(c => c.id === id ? { ...c, nome: editNome.trim(), descricao: editDescricao.trim() } : c));
            setEditingId(null);
        }
        setLoading(false);
    };

    const handleDelete = async (id, nome) => {
        if (!window.confirm(`ATENÇÃO: Deseja remover a categoria "${nome}"? Isso falhará se houver perguntas ativas associadas.`)) return;

        setLoading(true);
        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id);

        if (error) {
            alert(`Erro ao excluir: ${error.message}. Há perguntas associadas. Remova-as primeiro.`);
        } else {
            setCategorias(categorias.filter(c => c.id !== id));
        }
        setLoading(false);
    };

    if (loading) {
        return (
             <div className="tela-container" style={{ textAlign: 'center' }}>
                <h2><FaSpinner className="spinner" /> Carregando Categorias...</h2>
            </div>
        );
    }

    return (
        <div className="tela-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Gerenciamento de Categorias</h2>
                <button onClick={() => navigate('/admin/dashboard')} style={{ backgroundColor: '#6c757d' }}>
                    <FaArrowLeft /> Voltar
                </button>
            </div>
            
            {/* Formulário de Adição */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <h3>Adicionar Nova</h3>
                <input 
                    type="text" 
                    placeholder="Nome da Nova Categoria (ex: História Medieval)" 
                    value={novaCategoriaNome}
                    onChange={(e) => setNovaCategoriaNome(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <button onClick={handleAddCategoria} className="botao-principal" style={{ backgroundColor: '#28a745' }}>
                    <FaPlus /> Adicionar
                </button>
            </div>

            {/* Lista de Categorias */}
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Nome</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Descrição</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((cat) => (
                        <tr key={cat.id}>
                            {editingId === cat.id ? (
                                <>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><input value={editNome} onChange={(e) => setEditNome(e.target.value)} /></td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}><input value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} /></td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                        <button onClick={() => handleSave(cat.id)} style={{ marginRight: '5px', backgroundColor: '#28a745' }}><FaCheck /></button>
                                        <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#dc3545' }}><FaTimes /></button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{cat.nome}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{cat.descricao || '-'}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                        <button onClick={() => handleEditStart(cat)} style={{ marginRight: '5px', backgroundColor: '#ffc107' }}><FaEdit /></button>
                                        <button onClick={() => handleDelete(cat.id, cat.nome)} style={{ backgroundColor: '#dc3545' }}><FaTrash /></button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GerenciamentoCategorias;