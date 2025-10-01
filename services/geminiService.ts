
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "O nome da receita."
    },
    description: {
      type: Type.STRING,
      description: "Uma descrição curta e atraente do prato."
    },
    prepTime: {
        type: Type.STRING,
        description: "Tempo de preparo estimado, ex: '15 minutos'."
    },
    cookTime: {
        type: Type.STRING,
        description: "Tempo de cozimento estimado, ex: '25 minutos'."
    },
    servings: {
        type: Type.STRING,
        description: "Número de porções que a receita rende, ex: '4 porções'."
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "O nome do ingrediente, ex: 'Peito de Frango'."
          },
          quantity: {
            type: Type.STRING,
            description: "A quantidade do ingrediente, ex: '1 kg' ou '1 xícara'."
          },
        },
        required: ["name", "quantity"],
      },
      description: "Uma lista dos ingredientes necessários para a receita, incluindo as quantidades."
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Instruções passo a passo para o preparo do prato."
    },
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"],
};

export const generateRecipe = async (ingredients: string): Promise<Recipe> => {
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

    // Basic validation to ensure the response matches the expected structure
    if (!recipeData.recipeName || !Array.isArray(recipeData.ingredients) || !Array.isArray(recipeData.instructions)) {
        throw new Error("Formato de receita inválido recebido da API.");
    }
    
    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Falha ao gerar a receita. O modelo pode estar indisponível ou os ingredientes eram muito incomuns. Por favor, tente novamente.");
  }
};
