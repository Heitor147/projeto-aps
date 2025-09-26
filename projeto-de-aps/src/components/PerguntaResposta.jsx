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
      localStorage.setItem("Quiz", JSON.stringify(pergunta, resposta));
    } catch (err) {
      console.error("Erro salvando pergunta no localStorage:", err);
    }
  }, [pergunta, resposta]);

  const perguntas = safeParseJSON(localStorage.getItem("perguntas")) || [];
  const respostas = safeParseJSON(localStorage.getItem("respostas")) || [];

  const adicionarPergunta = (id, nome, categoria, respostaCorretaId) => {
    const respostaCorreta = respostas.find((resposta) => resposta.id === respostaCorretaId);

    if (!respostaCorreta) {
      console.error("Resposta correta não encontrada.");
      return;
    }

    const novaPergunta = { id, nome, categoria, respostaCorreta };
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
}
