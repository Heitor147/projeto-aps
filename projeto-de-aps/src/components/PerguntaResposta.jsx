// src/components/PerguntaResposta.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaTrash, FaEdit, FaPlus, FaSave, FaList } from 'react-icons/fa';

// Mock de dados para localStorage caso o Supabase falhe ou para teste inicial
const MOCK_CATEGORIAS = ["Química", "Tecnologia", "História", "Geral"];
const LOCAL_STORAGE_KEY = 'quiz_admin_perguntas';

// --- Funções CRUD de Perguntas (No Supabase e LocalStorage) ---

// Função auxiliar para buscar do Supabase (reforça o APISupa.jsx)
async function fetchPerguntas() {
  try {
    const { data, error } = await supabase.from('quiz_admin').select('*');
    if (error) throw error;
    // Se o Supabase funcionar, salva no localStorage como backup
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); 
    return data;
  } catch (error) {
    console.error("Erro Supabase, usando localStorage:", error.message);
    // Tenta carregar do localStorage se o Supabase falhar
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }
}

// Função para Salvar/Atualizar no Supabase e localStorage
async function savePerguntaToDB(pergunta) {
  try {
    const { id, created_at, ...dataToSave } = pergunta; // Ignora id e created_at na inserção/atualização
    
    let result;
    if (id) {
      // Atualizar
      result = await supabase
        .from('quiz_admin')
        .update(dataToSave)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Inserir
      result = await supabase
        .from('quiz_admin')
        .insert([dataToSave])
        .select()
        .single();
    }

    if (result.error) throw result.error;
    
    // Atualiza o localStorage após sucesso no Supabase
    const all = await fetchPerguntas(); // Recarrega todas para atualizar o localStorage
    return result.data;

  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error.message);
    alert(`Erro ao salvar: ${error.message}. Tente novamente.`);
    return null;
  }
}

// Função para deletar no Supabase e localStorage
async function deletePerguntaFromDB(id) {
  try {
    const { error } = await supabase
      .from('quiz_admin')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Recarrega todas para atualizar o localStorage
    await fetchPerguntas(); 
    return true;
  } catch (error) {
    console.error('Erro ao deletar no Supabase:', error.message);
    alert(`Erro ao deletar: ${error.message}.`);
    return false;
  }
}

// --- Componente Principal ---

const PerguntaResposta = () => {
  const [perguntas, setPerguntas] = useState([]);
  const [currentPergunta, setCurrentPergunta] = useState(null); // Para edição
  const [view, setView] = useState('list'); // 'list' ou 'form'

  // Novo estado para o formulário
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState(MOCK_CATEGORIAS[0]);
  const [respostas, setRespostas] = useState([
    { texto: '', isCorreta: true },
    { texto: '', isCorreta: false },
    { texto: '', isCorreta: false },
  ]);

  useEffect(() => {
    loadPerguntas();
  }, []);

  const loadPerguntas = async () => {
    const data = await fetchPerguntas();
    setPerguntas(data);
  };

  const handleRespostaChange = (index, value) => {
    const newRespostas = [...respostas];
    newRespostas[index].texto = value;
    setRespostas(newRespostas);
  };

  const handleCorretaChange = (index) => {
    const newRespostas = respostas.map((resp, i) => ({
      ...resp,
      isCorreta: i === index, // Marca apenas o selecionado como true
    }));
    setRespostas(newRespostas);
  };

  const resetForm = () => {
    setCurrentPergunta(null);
    setTexto('');
    setCategoria(MOCK_CATEGORIAS[0]);
    setRespostas([
      { texto: '', isCorreta: true },
      { texto: '', isCorreta: false },
      { texto: '', isCorreta: false },
    ]);
  };

  const handleEdit = (pergunta) => {
    setCurrentPergunta(pergunta);
    setTexto(pergunta.texto);
    setCategoria(pergunta.categoria);
    setRespostas(pergunta.respostas); // Carrega as respostas JSONB
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta pergunta?')) {
      const success = await deletePerguntaFromDB(id);
      if (success) {
        loadPerguntas();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!respostas.some(r => r.isCorreta)) {
      alert("Pelo menos uma resposta deve ser marcada como correta.");
      return;
    }
    if (respostas.some(r => r.texto.trim() === '')) {
       alert("Todas as alternativas devem ser preenchidas.");
      return;
    }

    const novaPergunta = {
      id: currentPergunta ? currentPergunta.id : null,
      texto: texto,
      categoria: categoria,
      respostas: respostas, // JSONB
    };

    const saved = await savePerguntaToDB(novaPergunta);
    if (saved) {
      alert(`Pergunta ${currentPergunta ? 'atualizada' : 'criada'} com sucesso!`);
      resetForm();
      loadPerguntas();
      setView('list');
    }
  };
  
  // Renderiza a lista de perguntas
  if (view === 'list') {
    return (
      <div className="tela-container">
        <h2>Lista de Perguntas (CRUD)</h2>
        <button 
            onClick={() => { resetForm(); setView('form'); }} 
            className="botao-principal"
        >
          <FaPlus /> Adicionar Nova Pergunta
        </button>

        {perguntas.length === 0 ? (
          <p>Nenhuma pergunta cadastrada.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {perguntas.map(p => (
              <li key={p.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', borderRadius: '5px', backgroundColor: '#fff' }}>
                <p><strong>{p.texto}</strong> (Categoria: {p.categoria})</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => handleEdit(p)} 
                        style={{ backgroundColor: '#2196F3' }}
                    >
                        <FaEdit /> Editar
                    </button>
                    <button 
                        onClick={() => handleDelete(p.id)} 
                        style={{ backgroundColor: '#f44336' }}
                    >
                        <FaTrash /> Apagar
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Renderiza o formulário de Adição/Edição
  return (
    <div className="tela-container">
      <h2>{currentPergunta ? 'Editar Pergunta' : 'Adicionar Nova Pergunta'}</h2>
      <button 
          onClick={() => setView('list')} 
          className="botao-principal"
          style={{ backgroundColor: '#6c757d' }}
      >
          <FaList /> Voltar à Lista
      </button>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div className="input-group">
          <label htmlFor="texto">Texto da pergunta</label>
          <input
            id="texto"
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
            placeholder="Quem é o pai da internet?"
          />
        </div>

        <div className="input-group">
          <label htmlFor="categoria">Categoria</label>
          <select 
            id="categoria" 
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
          >
            {MOCK_CATEGORIAS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <p><strong>Alternativas:</strong> (Marque a correta abaixo)</p>
        {respostas.map((resposta, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="radio"
              id={`correta-${index}`}
              name="correta"
              checked={resposta.isCorreta}
              onChange={() => handleCorretaChange(index)}
              style={{ flexShrink: 0 }}
            />
            <label htmlFor={`correta-${index}`}>Correta</label>
            <input
              type="text"
              value={resposta.texto}
              onChange={(e) => handleRespostaChange(index, e.target.value)}
              required
              placeholder={`Alternativa ${index + 1}`}
              style={{ flexGrow: 1 }}
            />
          </div>
        ))}

        <button type="submit" className="botao-principal" style={{ width: '100%', marginTop: '15px' }}>
          <FaSave /> {currentPergunta ? 'Salvar Edição' : 'Criar Pergunta'}
        </button>
      </form>
    </div>
  );
};

export default PerguntaResposta;