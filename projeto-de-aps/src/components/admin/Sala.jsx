import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaPlus, FaTrash, FaEdit, FaSave, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sala = () => {
    const navigate = useNavigate();
    const [salas, setSalas] = useState([]);
    const [nomeSala, setNomeSala] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentSalaId, setCurrentSalaId] = useState(null);

    useEffect(() => {
        fetchSalas();
    }, []);

    const fetchSalas = async () => {
        try {
            // Assumimos que existe uma tabela 'salas' com colunas id, nome, status, capacidade
            const { data, error } = await supabase
                .from('salas')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setSalas(data);
        } catch (error) {
            console.error('Erro ao buscar salas:', error.message);
            setSalas([]);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!nomeSala.trim()) return;

        try {
            if (isEditing) {
                // Atualizar
                const { error } = await supabase
                    .from('salas')
                    .update({ nome: nomeSala })
                    .eq('id', currentSalaId);
                if (error) throw error;
                alert(`Sala "${nomeSala}" atualizada!`);
            } else {
                // Inserir Nova Sala
                const { error } = await supabase
                    .from('salas')
                    .insert([{ nome: nomeSala, status: 'Aberto', capacidade: 10 }]); // Adicione campos padrão
                if (error) throw error;
                alert(`Sala "${nomeSala}" criada!`);
            }

            resetForm();
            fetchSalas();
        } catch (error) {
            console.error('Erro ao salvar sala:', error.message);
            alert(`Erro ao salvar sala: ${error.message}`);
        }
    };

    const handleEdit = (sala) => {
        setNomeSala(sala.nome);
        setCurrentSalaId(sala.id);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar esta sala?')) {
            try {
                const { error } = await supabase
                    .from('salas')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                alert('Sala deletada com sucesso!');
                fetchSalas();
            } catch (error) {
                console.error('Erro ao deletar sala:', error.message);
                alert(`Erro ao deletar sala: ${error.message}`);
            }
        }
    };

    const resetForm = () => {
        setNomeSala('');
        setCurrentSalaId(null);
        setIsEditing(false);
    };

    return (
        <div className="tela-container">
            <h2><FaUsers /> Gerenciar Salas Multiplayer</h2>
            <button onClick={() => navigate('/admin/dashboard')} style={{ backgroundColor: '#6c757d' }}>
                <FaArrowLeft /> Voltar
            </button>

            {/* Formulário de Criação/Edição */}
            <form onSubmit={handleSave} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div className="input-group">
                    <label htmlFor="nomeSala">Nome da Sala</label>
                    <input
                        id="nomeSala"
                        type="text"
                        value={nomeSala}
                        onChange={(e) => setNomeSala(e.target.value)}
                        required
                        placeholder="Ex: Sala Química Turma A"
                    />
                </div>
                <button type="submit" className="botao-principal">
                    <FaSave /> {isEditing ? 'Salvar Edição' : 'Criar Sala'}
                </button>
                {isEditing && (
                    <button
                        onClick={resetForm}
                        className="botao-principal"
                        style={{ backgroundColor: '#6c757d', marginLeft: '10px' }}
                    >
                        <FaPlus /> Nova Sala
                    </button>
                )}
            </form>

            {/* Lista de Salas */}
            <h3>Salas Ativas ({salas.length})</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {salas.map(sala => (
                    <li key={sala.id} style={{ border: '1px solid #ddd', margin: '10px 0', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                        <div>
                            <strong>{sala.nome}</strong>
                            <span style={{ marginLeft: '10px', color: sala.status === 'Aberto' ? 'green' : 'red' }}>
                                ({sala.status} - Cap: {sala.capacidade})
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => handleEdit(sala)}
                                style={{ backgroundColor: '#2196F3', padding: '8px' }}
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => handleDelete(sala.id)}
                                style={{ backgroundColor: '#f44336', padding: '8px' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sala;