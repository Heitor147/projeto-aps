import React, { useState, useEffect } from 'react'

const safeParseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

export default function Pergunta() {
  const [perguntas, setPerguntas] = useState(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("Quiz");
    const parsed = safeParseJSON(raw);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [inputPerguntas, setInputPerguntas] = useState('');
  const [EditPerguntaId, setEditPerguntaId] = useState(null);


  useEffect(() => {
    try {
      localStorage.setItem("Quiz", JSON.stringify(perguntas));
    } catch (err) {
      console.error("Erro salvando pergunta no localStorage:", err);
    }
  }, [perguntas])

  const validarPergunta = (pergunta) => {
    if (!pergunta) {
      alert("Por favor, insira uma pergunta.");
      return false;
    }
  }

  const gerarId = () => {
    typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Date.now().toString();
  }

  const adicionarPergunta = () => {
    const pergunta = inputPerguntas.trim();
    if (!validarPergunta(pergunta)) return;

    const novaPergunta = {
      id: gerarId(),
      name: pergunta,
    };

    setPerguntas((prev) => [...prev, novaPergunta]);
    setInputPerguntas("");
  };

  const editarPergunta = (id) => {
    const pergunta = perguntas.find((c) => c.id === id);
    if (!pergunta) return;
    setEditPerguntaId(id);
    setInputPerguntas(pergunta.name);
  };

  const salvarEdicaoPergunta = () => {
    const pergunta = inputPerguntas.trim();
    if (EditPerguntaId === null) return;
    if (!validarPergunta(pergunta)) return;

    setPerguntas((prev) => 
      prev.map((c) => 
        c.id === EditPerguntaId ? { ...c, id: gerarId(), name: perguntas } : c
      )
    );

    setEditPerguntaId(null);
    setInputPerguntas("");
  };

  const removerPergunta = (id) => {
    const pergunta = perguntas.find((c) => c.id === id);
    const confirmPer = pergunta 
      ? `Remover ${pergunta.name}?` 
      : "Remover pergunta?";
    if (!window.confirm(confirmPer)) return;
    setPerguntas((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (EditPerguntaId !== null) salvarEdicaoPergunta();
    else adicionarPergunta();
  };
}