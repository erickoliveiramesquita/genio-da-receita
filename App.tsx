
import React, { useState, useCallback } from 'react';
import type { Recipe } from './types';
import { generateRecipe } from './services/geminiService';
import Header from './components/Header';
import RecipeCard from './components/RecipeCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipe = useCallback(async () => {
    if (!ingredients.trim()) {
      setError('Por favor, insira alguns ingredientes.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const generatedRecipe = await generateRecipe(ingredients);
      setRecipe(generatedRecipe);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleGenerateRecipe();
    }
  };

  const exampleIngredients = [
    'peito de frango, arroz, brócolis, molho de soja',
    'ovos, queijo, espinafre, pão',
    'carne moída, macarrão, molho de tomate, cebola',
    'grão de bico, tahine, limão, alho',
  ];

  const handleExampleClick = (example: string) => {
    setIngredients(example);
  };


  return (
    <div className="min-h-screen font-sans text-slate-800 antialiased">
      <main className="container mx-auto px-4 py-8">
        <Header />

        <div className="max-w-2xl mx-auto mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
          <label htmlFor="ingredients" className="block text-lg font-semibold text-slate-700 mb-2">
            Quais ingredientes você tem?
          </label>
          <p className="text-slate-500 mb-4">Digite os ingredientes separados por vírgulas. Quanto mais você listar, melhor a receita!</p>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ex: peito de frango, brócolis, alho, azeite de oliva"
            className="w-full h-28 p-4 text-base border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition duration-200 resize-none"
            disabled={isLoading}
          />

          <div className="mt-4">
            <p className="text-sm text-slate-500 mb-2">Ou tente um exemplo:</p>
            <div className="flex flex-wrap gap-2">
              {exampleIngredients.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition-colors duration-200 disabled:opacity-50"
                >
                  {example.split(',')[0]}...
                </button>
              ))}
            </div>
          </div>


          <button
            onClick={handleGenerateRecipe}
            disabled={isLoading || !ingredients.trim()}
            className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Gerando...' : 'Gerar Receita'}
          </button>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          {recipe && (
             <div className="animate-fade-in">
              <RecipeCard recipe={recipe} />
            </div>
          )}
           {!isLoading && !error && !recipe && (
            <div className="text-center text-slate-500 mt-16">
              <p className="text-xl">Sua criação culinária o aguarda!</p>
              <p>Insira seus ingredientes acima para começar.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Com tecnologia Gemini. Cozinhe algo incrível hoje!</p>
      </footer>
    </div>
  );
};

export default App;
