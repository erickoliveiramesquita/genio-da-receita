import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- From types.ts ---
interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string[];
}

// --- From services/geminiService.ts ---
const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: "O nome da receita." },
    description: { type: Type.STRING, description: "Uma descrição curta e atraente do prato." },
    prepTime: { type: Type.STRING, description: "Tempo de preparo estimado, ex: '15 minutos'." },
    cookTime: { type: Type.STRING, description: "Tempo de cozimento estimado, ex: '25 minutos'." },
    servings: { type: Type.STRING, description: "Número de porções que a receita rende, ex: '4 porções'." },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "O nome do ingrediente, ex: 'Peito de Frango'." },
          quantity: { type: Type.STRING, description: "A quantidade do ingrediente, ex: '1 kg' ou '1 xícara'." },
        },
        required: ["name", "quantity"],
      },
      description: "Uma lista dos ingredientes necessários para a receita, incluindo as quantidades."
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Instruções passo a passo para o preparo do prato."
    },
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"],
};

const generateRecipe = async (ingredients: string): Promise<Recipe> => {
    if (!ai) {
        throw new Error("A chave da API Gemini não está configurada.");
    }

  const prompt = `
    Você é um chef criativo. Com base nos seguintes ingredientes, crie uma receita deliciosa e fácil de seguir.
    Se um ingrediente parecer insuficiente para uma refeição completa (por exemplo, apenas 'sal'), sinta-se à vontade para sugerir uma receita simples que o utilize ou presuma que itens básicos da despensa como óleo, sal, pimenta e água estão disponíveis.
    
    Ingredientes: ${ingredients}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    if (!recipeData.recipeName || !Array.isArray(recipeData.ingredients) || !Array.isArray(recipeData.instructions)) {
        throw new Error("Formato de receita inválido recebido da API.");
    }
    
    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Falha ao gerar a receita. O modelo pode estar indisponível ou os ingredientes eram muito incomuns. Por favor, tente novamente.");
  }
};


// --- From components/Header.tsx ---
const ChefHatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19.8 12.7c.6-.5 1-1.2 1.2-2.1.2-.9.4-2.1-.2-3.8-.5-1.7-1.5-3.1-3-4.2C16.3 1.5 14.5 1 12 1s-4.3.5-5.8 1.6c-1.5 1.1-2.5 2.5-3 4.2-.6 1.7-.3 2.9-.2 3.8.2.9.6 1.6 1.2 2.1" />
    <path d="M6 13.3c-1.4 0-2.8.5-3.8 1.5-2 2-2 5.3 0 7.3 2 2 5.3 2 7.3 0" />
    <path d="M18 13.3c1.4 0 2.8.5 3.8 1.5 2 2 2 5.3 0 7.3-2 2-5.3 2-7.3 0" />
    <path d="M12 21v-8" />
    <path d="M12 21a2.8 2.8 0 0 0 2.5-1.5" />
    <path d="M12 21a2.8 2.8 0 0 1-2.5-1.5" />
  </svg>
);
const Header: React.FC = () => (
  <header className="text-center">
    <div className="flex items-center justify-center gap-3">
      <ChefHatIcon className="w-10 h-10 text-orange-500" />
      <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
        Gênio da Receita
      </h1>
    </div>
    <p className="mt-3 text-lg text-slate-600">
      Transforme seus ingredientes em uma obra-prima.
    </p>
  </header>
);

// --- From components/RecipeCard.tsx ---
const InfoPill: React.FC<{ icon: React.ReactElement, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center p-3 bg-amber-100 rounded-lg">
        <div className="text-orange-500">{icon}</div>
        <span className="text-xs text-slate-500 mt-1">{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
    </div>
);
const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
    <div className="p-6 sm:p-8">
      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{recipe.recipeName}</h2>
      <p className="mt-2 text-slate-600">{recipe.description}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 border-t border-b border-slate-200 py-4">
          <InfoPill 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Preparo"
              value={recipe.prepTime}
          />
          <InfoPill 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1014.12 11.88l-4.242 4.242z" /></svg>}
              label="Cozimento"
              value={recipe.cookTime}
          />
          <InfoPill 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              label="Porções"
              value={recipe.servings}
          />
      </div>
    </div>
    <div className="bg-slate-50/50 px-6 sm:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Ingredientes</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-500 mr-2">&#10003;</span>
                <span className="text-slate-700"><span className="font-semibold">{ingredient.quantity}</span> {ingredient.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Instruções</h3>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 bg-orange-500 text-white font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full mr-4">{index + 1}</span>
                <span className="text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </div>
);

// --- From components/LoadingSpinner.tsx ---
const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center p-8">
    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-semibold text-slate-700">Preparando uma receita para você...</p>
    <p className="text-slate-500">Isso pode levar um momento.</p>
  </div>
);

// --- From components/ErrorDisplay.tsx ---
const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
    <div className="flex">
      <div className="py-1">
        <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM9 15v-2h2v2H9zm2-4H9V5h2v6z"/>
        </svg>
      </div>
      <div>
        <p className="font-bold">Oops! Algo deu errado.</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  </div>
);

// --- From App.tsx ---
const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyIsMissing] = useState(!process.env.API_KEY);

  const handleGenerateRecipe = useCallback(async () => {
    if (apiKeyIsMissing) {
      setError("A chave da API Gemini não está configurada. Por favor, defina a variável de ambiente API_KEY nas configurações do seu projeto Vercel.");
      return;
    }

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
  }, [ingredients, apiKeyIsMissing]);

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

  if (apiKeyIsMissing) {
      return (
          <div className="min-h-screen font-sans text-slate-800 antialiased flex items-center justify-center p-4">
              <main className="container mx-auto">
                   <div className="max-w-2xl mx-auto">
                        <ErrorDisplay message="A chave da API Gemini não está configurada. Por favor, adicione a variável de ambiente API_KEY nas configurações do seu projeto Vercel para que este aplicativo funcione." />
                   </div>
              </main>
          </div>
      )
  }

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


// --- Original index.tsx rendering logic ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
