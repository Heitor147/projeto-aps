import { supabase } from '../supabaseClient'

/**
 * Cadastra um novo jogador na tabela 'usuarios' e retorna o ID do novo usuário.
 * @param {object} userData - Dados do jogador (nome, equipe, turma).
 * @returns {string | null} O ID do usuário cadastrado ou null em caso de erro.
 */
export async function cadastrarJogador(userData) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        { 
          nome: userData.nome, 
          equipe: userData.equipe, 
          turma: userData.turma 
        },
      ])
      .select('id') // Seleciona apenas o ID do registro inserido
      .single()

    if (error) {
      throw error
    }

    console.log('Jogador cadastrado com sucesso:', data.id)
    return data.id // Retorna o ID do usuário
  } catch (error) {
    console.error('Erro ao cadastrar jogador:', error.message)
    alert(`Erro ao cadastrar: ${error.message}. Verifique a conexão e as permissões da tabela 'usuarios'.`)
    return null
  }
}