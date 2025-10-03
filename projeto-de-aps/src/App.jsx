import React, { useEffect, useMemo, useState } from "react";
import "/styles/App.css";
import PerguntaResposta from "./components/PerguntaResposta";
import API from "./components/API";
// Observação: Os dados de perguntas e respostas são esperados no localStorage,
// normalmente cadastrados pelo componente PerguntaResposta.

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export default function App() {
  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [respostasDoUsuario, setRespostasDoUsuario] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [mostrarTopCategoria, setMostrarTopCategoria] = useState(false);

  // Carrega perguntas/respostas previamente salvas pelo componente PerguntaResposta
  useEffect(() => {
    const loadedPerguntas = safeParseJSON(localStorage.getItem("perguntas")) || [];
    const loadedRespostas = safeParseJSON(localStorage.getItem("respostas")) || [];
    const loadedRespostasUsuario =
      safeParseJSON(localStorage.getItem("respostasDoUsuario")) || [];

    setPerguntas(loadedPerguntas);
    setRespostas(loadedRespostas);
    setRespostasDoUsuario(loadedRespostasUsuario);
    setIndiceAtual(0);
    setFinalizado(false);
    setMostrarTopCategoria(false);
  }, []);

  // Lista de respostas marcadas como corretas (opcional, útil para depuração ou estatísticas)
  const aceitos = useMemo(
    () => respostas.filter((r) => r.respostaCorretaId === true),// Observação: Os dados de perguntas e respostas são esperados no localStorage,
    // normalmente cadastrados pelo componente PerguntaResposta.
    [respostas]
  );

  // Pergunta atual
  const perguntaAtual = perguntas[indiceAtual] || null;

  // Total de perguntas e acertos
  const totalPerguntas = perguntas.length;
  const acertos = useMemo(
    () => respostasDoUsuario.filter((r) => r.correta === true).length,
    [respostasDoUsuario]
  );

  // Trata a seleção de uma resposta e avança
  const handleSelecionarResposta = (respostaId) => {
    if (!perguntaAtual) return;

    const corretaId = perguntaAtual?.respostaCorreta?.id;
    const correta = respostaId === corretaId;

    const registro = {
      perguntaId: perguntaAtual.id,
      respostaId,
      correta,
      timestamp: Date.now(),
    };

    const novasRespostasUsuario = [...respostasDoUsuario, registro];
    setRespostasDoUsuario(novasRespostasUsuario);
    try {
      localStorage.setItem(
        "respostasDoUsuario",
        JSON.stringify(novasRespostasUsuario)
      );
    } catch (err) {
      console.error("Erro ao salvar respostasDoUsuario:", err);
    }

    const proximo = indiceAtual + 1;
    if (proximo < totalPerguntas) {
      setIndiceAtual(proximo);
    } else {
      setFinalizado(true);
    }
  };

  // Reinicia o quiz (opcional)
  const handleReiniciar = () => {
    setRespostasDoUsuario([]);
    try {
      localStorage.setItem("respostasDoUsuario", JSON.stringify([]));
    } catch (err) {
      console.error("Erro ao limpar respostasDoUsuario:", err);
    }
    setIndiceAtual(0);
    setFinalizado(false);
    setMostrarTopCategoria(false);
  };

  // Ranking de categorias por acertos
  // Gera uma lista [{ categoria, acertos }] ordenada por acertos desc
  const rankingCategorias = useMemo(() => {
    if (!perguntas.length || !respostasDoUsuario.length) return [];

    // Mapa categoria -> contagem de acertos
    const mapa = new Map();

    for (const r of respostasDoUsuario) {
      if (!r.correta) continue;
      const pergunta = perguntas.find((p) => p.id === r.perguntaId);
      const categoria =
        (pergunta && pergunta.categoria) ? pergunta.categoria : "Sem categoria";

      const atual = mapa.get(categoria) || 0;
      mapa.set(categoria, atual + 1);
    }

    return Array.from(mapa.entries())
      .map(([categoria, total]) => ({ categoria, acertos: total }))
      .sort((a, b) => b.acertos - a.acertos);
  }, [perguntas, respostasDoUsuario]);

  // Top categoria(s) e total correspondente; trata empates
  const topCategoriasInfo = useMemo(() => {
    if (!rankingCategorias.length) return { totalTop: 0, categorias: [] };
    const max = rankingCategorias[0].acertos;
    const categorias = rankingCategorias
      .filter((c) => c.acertos === max)
      .map((c) => c.categoria);
    return { totalTop: max, categorias };
  }, [rankingCategorias]);

  // Caso não haja dados
  if (totalPerguntas === 0 || respostas.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Quiz</h2>
        <p>
          Nenhuma pergunta/resposta encontrada. Cadastre-as usando o componente
          de gerenciamento (PerguntaResposta) e recarregue a página.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {!finalizado && perguntaAtual && (
        <div>
          <div style={{ marginBottom: 8 }}>
            Pergunta {indiceAtual + 1} de {totalPerguntas}
          </div>
          <h2 style={{ marginTop: 0 }}>{perguntaAtual.nome}</h2>

          <form>
            <div role="radiogroup" aria-label="Opções de resposta">
              {respostas.map((opcao) => (
                <label
                  key={opcao.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={`pergunta-${perguntaAtual.id}`}
                    value={opcao.id}
                    onChange={() => handleSelecionarResposta(opcao.id)}
                  />
                  <span>{opcao.nome}</span>
                </label>
              ))}
            </div>
          </form>
        </div>
      )}

      {finalizado && (
        <div>
          <h2>Resultado</h2>
          <p>Total de perguntas: {totalPerguntas}</p>
          <p>Acertos: {acertos}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <button onClick={handleReiniciar}>Reiniciar</button>
            <button onClick={() => setMostrarTopCategoria((v) => !v)}>
              {mostrarTopCategoria ? "Ocultar categoria com mais acertos" : "Mostrar categoria com mais acertos"}
            </button>
          </div>

          {mostrarTopCategoria && (
            <div style={{ marginTop: 12 }}>
              <strong>Categoria(s) com mais acertos:</strong>
              {topCategoriasInfo.totalTop > 0 ? (
                <div style={{ marginTop: 6 }}>
                  <div>
                    {topCategoriasInfo.categorias.join(", ")}{" "}
                    {`(${topCategoriasInfo.totalTop} acerto${topCategoriasInfo.totalTop > 1 ? "s" : ""})`}
                  </div>
                  <details style={{ marginTop: 8 }}>
                    <summary>Ranking completo por categoria</summary>
                    <ul style={{ marginTop: 8 }}>
                      {rankingCategorias.map((c) => (
                        <li key={c.categoria}>
                          {c.categoria}: {c.acertos}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ) : (
                <div style={{ marginTop: 6 }}>Nenhum acerto registrado.</div>
              )}
            </div>
          )}

          {/* Extra opcional: mostra estatísticas rápidas */}
          <details style={{ marginTop: 12 }}>
            <summary>Detalhes</summary>
            <div style={{ marginTop: 8 }}>
              <div>Respostas corretas configuradas: {aceitos.length}</div>
              <div>
                IDs das corretas:{" "}
                {aceitos.map((a) => a.id).join(", ") || "—"}
              </div>
            </div>
          </details>

          <div style={{ marginTop: 16 }}>
            <API />
          </div>
        </div>
      )}
    </div>
  );
}