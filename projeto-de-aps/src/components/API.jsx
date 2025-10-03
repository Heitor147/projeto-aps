import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Lê JSON com segurança
const safeParseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

export default function API() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ajuste o nome da tabela conforme o seu schema no Supabase
  // Esta tabela precisa ter ao menos a coluna: acertos (integer)
  const TABLE = 'perguntas';

  const URL = 'https://jcuchztitjbyakpkckdq.supabase.co';
  const KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdWNoenRpdGpieWFrcGtja2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODk1OTUsImV4cCI6MjA3NTA2NTU5NX0.mFm8eEPGjRc9HcEqScMnCNwmsuXK4VEBnKiF8eiqQyc';
  const supabase = createClient(URL, KEY);

  // Lê os "acertos" da mesma fonte usada em PerguntaResposta (localStorage)
  const getAcertosFromLocalStorage = () => {
    const respostas = safeParseJSON(localStorage.getItem('respostas')) || [];
    return respostas.filter((r) => r?.respostaCorretaId === true).length;
  };

  const salvarResultado = async (acertosCount) => {
    // Insere o resultado atual no banco
    const { error: insertError } = await supabase
      .from(TABLE)
      .insert([{ acertos: acertosCount }]);

    if (insertError) {
      throw new Error(insertError.message || 'Falha ao salvar resultado.');
    }
  };

  const carregarRanking = async () => {
    // Busca todos os resultados ordenados por acertos desc
    const { data, error: fetchError } = await supabase
      .from(TABLE)
      .select('*')
      .order('acertos', { ascending: false });

    if (fetchError) {
      throw new Error(fetchError.message || 'Falha ao carregar ranking.');
    }

    // Mapeia a pontuação (ex.: 10 pontos por acerto) e posição
    const lista = (data || []).map((row, idx) => ({
      ...row,
      posicao: idx + 1,
      pontuacao: (row?.acertos || 0) * 10,
    }));

    setRanking(lista);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const acertosCount = getAcertosFromLocalStorage();
        await salvarResultado(acertosCount);
        await carregarRanking();
      } catch (err) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  // Render simples do estado do ranking (opcional)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {loading && <span>Processando...</span>}
      {error && (
        <span style={{ color: 'red' }}>Erro: {error}</span>
      )}

      {!loading && !error && (
        <div>
          <h3>Ranking</h3>
          <ol>
            {ranking.map((item) => (
              <li key={item.id || `${item.posicao}-${item.acertos}`}>
                Posição {item.posicao} — Acertos: {item.acertos} — Pontuação: {item.pontuacao}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
