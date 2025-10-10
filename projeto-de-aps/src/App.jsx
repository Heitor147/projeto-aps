import React from 'react';
import Perguntas from './components/Perguntas';
import { getQuestions } from './services/storageService'; 
// Use getQuestions para testar se o LocalStorage está salvando!

function App() {
  const handleLoadQuestions = () => {
    const questions = getQuestions();
    console.log("Perguntas Salvas:", questions);
    alert(`Total de perguntas salvas: ${questions.length}. Veja o console para detalhes.`);
  };

  return (
    <div className="App">
      <h1>Projeto Quiz - Administração</h1>
      <button onClick={handleLoadQuestions} style={{ marginBottom: '20px', padding: '10px' }}>
        Ver Perguntas Salvas (Console)
      </button>
      <Perguntas />
      
      {/* Aqui você adicionará as rotas para o Quiz e Ranking */}
    </div>
  );
}

export default App;