import { supabase } from '../supabaseClient'

/**
 * Obtém todas as perguntas e respostas da tabela 'quiz_admin'.
 * Assume que a tabela 'quiz_admin' tem as colunas:
 * id, created_at, texto, categoria, respostas (JSONB)
 * @returns {Array} Lista de perguntas ou array vazio em caso de erro.
 */
export async function getPerguntas() {
  try {
    const { data, error } = await supabase
      .from('quiz_admin')
      .select('*')
      .order('id', { ascending: true }) // Ordena como preferir

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar perguntas do Supabase:', error.message)
    return []
  }
}

// Outras funções CRUD (criarPergunta, editarPergunta, deletarPergunta)
// seriam adicionadas aqui, e seriam usadas no componente PerguntaResposta.jsx.