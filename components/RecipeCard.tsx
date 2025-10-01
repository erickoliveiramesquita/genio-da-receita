
import React from 'react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

// FIX: Changed icon prop type from JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const InfoPill: React.FC<{ icon: React.ReactElement, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center p-3 bg-amber-100 rounded-lg">
        <div className="text-orange-500">{icon}</div>
        <span className="text-xs text-slate-500 mt-1">{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
    </div>
);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
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
};

export default RecipeCard;
