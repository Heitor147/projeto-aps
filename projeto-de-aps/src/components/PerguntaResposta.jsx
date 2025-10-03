import React, { useState, useEffect } from "react";

const safeParseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

export default function PerguntaResposta({ pergunta, resposta }) {
  useEffect(() => {
    try {
      localStorage.setItem("Quiz", JSON.stringify({ pergunta, resposta }));
    } catch (err) {
      console.error("Erro salvando pergunta no localStorage:", err);
    }
  }, [pergunta, resposta]);

  const perguntas = safeParseJSON(localStorage.getItem("perguntas")) || [];
  const respostas = safeParseJSON(localStorage.getItem("respostas")) || [];
  const [categoria, setCategoria] = useState("");
  const respostasDoUsuario =
    safeParseJSON(localStorage.getItem("respostasDoUsuario")) || [];
  const acertos = respostas.filter(
    (resposta) => resposta.respostaCorretaId === true
  );

  const gerarId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID === "function") {
      return crypto.randomUUID();
    } else {
      return (
        "id-" +
        Math.random().toString(36).substring(2, 9) +
        Date.now().toString(36)
      );
    }
  };

  const adicionarPergunta = (id, nome, categoria, respostaCorretaId) => {
    const categoriaLimpa = (categoria || "").trim();
    if (!categoriaLimpa) {
      console.error("Categoria não pode estar vazia.");
      return;
    }

    const respostaCorreta = respostas.find(
      (resposta) => resposta.id === respostaCorretaId
    );

    if (!respostaCorreta) {
      console.error("Resposta correta não encontrada.");
      return;
    }

    const novaPergunta = {
      id: gerarId(),
      nome,
      categoria: categoriaLimpa,
      respostaCorreta,
    };
    const novasPerguntas = [...perguntas, novaPergunta];

    try {
      localStorage.setItem("perguntas", JSON.stringify(novasPerguntas));
      console.log("Pergunta adicionada com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar nova pergunta no localStorage:", err);
    }
  };

  const adicionarResposta = (id, nome, respostaCorretaId = false) => {
    const novaResposta = { id, nome, respostaCorretaId };
    const novasRespostas = [...respostas, novaResposta];

    try {
      localStorage.setItem("respostas", JSON.stringify(novasRespostas));
      console.log("Resposta adicionada com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar nova resposta no localStorage:", err);
    }
  };

  const definirRespostaCorreta = (index) => {
    if (index < 0 || index >= respostas.length) {
      console.error("Índice inválido.");
      return;
    }

    const respostaSelecionada = respostas[index];
    respostaSelecionada.respostaCorretaId = true;

    const novasRespostas = [...respostas];
    novasRespostas[index] = respostaSelecionada;

    try {
      localStorage.setItem("respostas", JSON.stringify(novasRespostas));
      console.log("Resposta correta definida com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar resposta no localStorage:", err);
    }
  };

  const [indiceRespostaCorreta, setIndiceRespostaCorreta] = useState("");

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
      <h2>Gerenciar Perguntas e Respostas</h2>

      <form>
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>Pergunta</span>
            <input
              type="text"
              placeholder="Digite sua pergunta"
              value={perguntaText}
              onChange={(e) => setPerguntaText(e.target.value)}
            />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>Categoria</span>
            <input
              type="text"
              placeholder="Ex.: Geografia, História, Ciências..."
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </label>

          <button onClick={adicionarPergunta}>Adicionar Pergunta</button>
        </div>

        <hr style={{ margin: "16px 0" }} />

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>Resposta</span>
            <input
              type="text"
              placeholder="Digite uma resposta"
              value={respostaText}
              onChange={(e) => setRespostaText(e.target.value)}
            />
          </label>

          <button onClick={adicionarResposta}>Adicionar Resposta</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>Índice da resposta correta (0 baseado)</span>
            <input
              type="number"
              placeholder="Ex.: 0 para a primeira resposta"
              value={indiceRespostaCorreta}
              onChange={(e) => setIndiceRespostaCorreta(e.target.value)}
              min={0}
            />
          </label>

          <button onClick={definirRespostaCorreta}>
            Definir Resposta Correta
          </button>
        </div>
      </form>

      {/* Opcional: ajuda visual para encontrar o índice correto */}
      {respostas.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Respostas cadastradas (índice - texto):</strong>
          <ol style={{ marginTop: 8 }}>
            {respostas.map((r, i) => (
              <li key={r.id}>
                {i} - {r.nome} {r.respostaCorretaId ? " (correta)" : ""}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Opcional: resumo de perguntas por categoria */}
      {perguntas.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Total de perguntas cadastradas:</strong> {perguntas.length}
        </div>
      )}
    </div>
  );
}
