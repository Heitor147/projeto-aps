import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';

// Estado inicial para uma nova pergunta
const INITIAL_PERGUNTA_STATE = {
  texto: '',
  peso: 1,
  categoria_id: '', // Agora é o ID da categoria
  respostas: [
    { texto: '', isCorreta: true },
    { texto: '', isCorreta: false },
    { texto: '', isCorreta: false },
    { texto: '', isCorreta: false },
  ],
};

const PerguntaRespostas = () => {
  const navigate = useNavigate();
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaPergunta, setNovaPergunta] = useState(INITIAL_PERGUNTA_STATE);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  // NOVOS ESTADOS PARA CATEGORIAS E FILTRO
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [filtroCategoriaId, setFiltroCategoriaId] = useState(''); // ID da categoria selecionada

  // NOVO useEffect: Busca todas as categorias disponíveis
  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) {
        console.error("Erro ao buscar categorias disponíveis:", error.message);
        return;
      }
      setCategoriasDisponiveis(data);

      // Se houver categorias, pré-seleciona a primeira no formulário de adição
      if (data.length > 0) {
        setNovaPergunta(prev => ({ ...prev, categoria_id: data[0].id }));
      }
    };
    fetchCategorias();
  }, []);

  // Função de busca de perguntas (inclui o filtro de categoria)
  const fetchPerguntas = async () => {
    setLoading(true);

    let query = supabase
      .from('quiz_admin')
      // Busca os dados da categoria relacionada
      .select('*, categoria:categorias(nome)')
      .order('id', { ascending: false });

    // APLICA O FILTRO SE UM ID DE CATEGORIA FOI SELECIONADO
    if (filtroCategoriaId) {
      query = query.eq('categoria_id', filtroCategoriaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar perguntas:', error.message);
    } else {
      setPerguntas(data || []);
    }
    setLoading(false);
  };

  // useEffect que chama fetchPerguntas() com a dependência do filtro
  useEffect(() => {
    fetchPerguntas();
  }, [filtroCategoriaId]);


  // Manipulação de respostas para o NOVO formulário
  const handleRespostaChange = (index, value, isEditing = false) => {
    const estadoAlvo = isEditing ? editData : novaPergunta;
    const setEstadoAlvo = isEditing ? setEditData : setNovaPergunta;

    const novasRespostas = estadoAlvo.respostas.map((resp, i) => {
      if (i === index) {
        return { ...resp, texto: value };
      }
      return resp;
    });

    setEstadoAlvo(prev => ({ ...prev, respostas: novasRespostas }));
  };

  // Alterna qual resposta é a correta
  const handleCorrectAnswerChange = (index, isEditing = false) => {
    const estadoAlvo = isEditing ? editData : novaPergunta;
    const setEstadoAlvo = isEditing ? setEditData : setNovaPergunta;

    const novasRespostas = estadoAlvo.respostas.map((resp, i) => ({
      ...resp,
      isCorreta: i === index, // Apenas a selecionada é true
    }));

    setEstadoAlvo(prev => ({ ...prev, respostas: novasRespostas }));
  };


  // ----------------------------------------------------
  // CRUD ACTIONS
  // ----------------------------------------------------

  const handleAddPerguntas = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica
    if (!novaPergunta.texto || !novaPergunta.categoria_id) {
      alert('Preencha o texto da pergunta e selecione a categoria.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('quiz_admin')
      .insert({
        texto: novaPergunta.texto,
        peso: novaPergunta.peso,
        categoria_id: novaPergunta.categoria_id, // Usa o ID da categoria
        respostas: novaPergunta.respostas
      });

    if (error) {
      alert(`Erro ao adicionar pergunta: ${error.message}`);
    } else {
      setNovaPergunta(INITIAL_PERGUNTA_STATE); // Limpa o formulário
      fetchPerguntas(); // Atualiza a lista
    }
    setLoading(false);
  };

  const handleEditStart = (pergunta) => {
    setEditingId(pergunta.id);
    // Garante que o formato do JSONB seja copiado corretamente
    setEditData({
      ...pergunta,
      respostas: Array.isArray(pergunta.respostas) ? pergunta.respostas : JSON.parse(pergunta.respostas),
      categoria_id: pergunta.categoria_id || (categoriasDisponiveis.length > 0 ? categoriasDisponiveis[0].id : '')
    });
  };

  const handleSave = async (id) => {
    if (!editData.texto || !editData.categoria_id) {
      alert('Preencha o texto da pergunta e selecione a categoria.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('quiz_admin')
      .update({
        texto: editData.texto,
        peso: editData.peso,
        categoria_id: editData.categoria_id,
        respostas: editData.respostas,
      })
      .eq('id', id);

    if (error) {
      alert(`Erro ao atualizar: ${error.message}`);
    } else {
      setEditingId(null);
      setEditData(null);
      fetchPerguntas();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    setLoading(true);
    const { error } = await supabase
      .from('quiz_admin')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
    } else {
      setPerguntas(perguntas.filter(p => p.id !== id));
    }
    setLoading(false);
  };

  // ----------------------------------------------------
  // RENDER (JSX)
  // ----------------------------------------------------

  if (loading && perguntas.length === 0) {
    return (
      <div className="tela-container" style={{ textAlign: 'center' }}>
        <h2><FaSpinner className="spinner" /> Carregando Questões...</h2>
      </div>
    );
  }

  // Componente auxiliar para renderizar respostas (NOVO/EDIT)
  const renderRespostaInputs = (data, handleText, handleCorrect) => (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '10px' }}>
      <h4>Respostas:</h4>
      {data.respostas.map((resp, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <input
            type="radio"
            name="correctAnswer"
            checked={resp.isCorreta}
            onChange={() => handleCorrect(index)}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder={`Resposta ${index + 1}`}
            value={resp.texto}
            onChange={(e) => handleText(index, e.target.value)}
            required
            style={{ flexGrow: 1 }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="tela-container">
      <button onClick={() => navigate('/admin/dashboard')} style={{ marginBottom: '20px', backgroundColor: '#6c757d' }}>
        <FaArrowLeft /> Voltar ao Painel
      </button>

      <h2>Gerenciamento de Questões</h2>

      {/* FORMULÁRIO DE ADIÇÃO (Exibido apenas se não estiver editando) */}
      {!editingId && (
        <form onSubmit={handleAddPerguntas} style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#e9f7ff' }}>
          <h3><FaPlus /> Adicionar Nova Pergunta</h3>

          <label>Texto da Pergunta:</label>
          <textarea value={novaPergunta.texto} onChange={(e) => setNovaPergunta({ ...novaPergunta, texto: e.target.value })} required />

          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <div style={{ flexGrow: 1 }}>
              <label>Categoria:</label>
              <select
                value={novaPergunta.categoria_id}
                onChange={(e) => setNovaPergunta({ ...novaPergunta, categoria_id: parseInt(e.target.value) })}
                required
              >
                <option value="" disabled>Selecione a Categoria</option>
                {categoriasDisponiveis.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '150px' }}>
              <label>Peso (Pontos):</label>
              <input type="number" min="1" value={novaPergunta.peso} onChange={(e) => setNovaPergunta({ ...novaPergunta, peso: parseInt(e.target.value) })} />
            </div>
          </div>

          {renderRespostaInputs(novaPergunta, (index, value) => handleRespostaChange(index, value, false), (index) => handleCorrectAnswerChange(index, false))}

          <button type="submit" className="botao-principal" disabled={loading} style={{ marginTop: '20px', width: '100%' }}>
            {loading ? <FaSpinner className="spinner" /> : <FaSave />} Salvar Pergunta
          </button>
        </form>
      )}

      {/* FILTRO */}
      <div style={{ marginBottom: '20px', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por Categoria:</label>
        <select
          value={filtroCategoriaId}
          onChange={(e) => setFiltroCategoriaId(e.target.value)}
          disabled={loading}
        >
          <option value="">Todas as Categorias</option>
          {categoriasDisponiveis.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>


      {/* LISTAGEM DE PERGUNTAS */}
      {perguntas.length === 0 && !loading ? (
        <p>Nenhuma pergunta encontrada na categoria selecionada.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>ID</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Texto</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Categoria</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Peso</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #333' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {perguntas.map((pergunta) => (
              <tr key={pergunta.id}>
                {editingId === pergunta.id ? (
                  // MODO DE EDIÇÃO
                  <td colSpan="5" style={{ padding: '15px', borderBottom: '2px solid #ffc107', backgroundColor: '#fffbe6' }}>
                    <label>Texto:</label>
                    <textarea value={editData.texto} onChange={(e) => setEditData({ ...editData, texto: e.target.value })} required />

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                      <div style={{ flexGrow: 1 }}>
                        <label>Categoria:</label>
                        <select
                          value={editData.categoria_id}
                          onChange={(e) => setEditData({ ...editData, categoria_id: parseInt(e.target.value) })}
                          required
                        >
                          {categoriasDisponiveis.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: '150px' }}>
                        <label>Peso:</label>
                        <input type="number" min="1" value={editData.peso} onChange={(e) => setEditData({ ...editData, peso: parseInt(e.target.value) })} />
                      </div>
                    </div>

                    {renderRespostaInputs(editData, (index, value) => handleRespostaChange(index, value, true), (index) => handleCorrectAnswerChange(index, true))}

                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleSave(pergunta.id)} style={{ marginRight: '10px', backgroundColor: '#28a745' }} disabled={loading}>
                        <FaSave /> Salvar
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#dc3545' }} disabled={loading}>
                        <FaTimes /> Cancelar
                      </button>
                    </div>
                  </td>
                ) : (
                  // MODO DE VISUALIZAÇÃO
                  <>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{pergunta.id}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd', maxWidth: '300px', textAlign: 'left' }}>{pergunta.texto.substring(0, 100)}...</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      {/* Exibe o nome da categoria vindo do JOIN */}
                      {pergunta.categoria ? pergunta.categoria.nome : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{pergunta.peso}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <button onClick={() => handleEditStart(pergunta)} style={{ marginRight: '5px', backgroundColor: '#ffc107' }}>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(pergunta.id)} style={{ backgroundColor: '#dc3545' }}>
                        <FaTrash />
                      </button>
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

export default PerguntaRespostas;