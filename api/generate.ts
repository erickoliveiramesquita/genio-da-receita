import { GoogleGenAI, Type } from "@google/genai";

// This tells Vercel to run this function as an Edge Function for faster responses.
export const config = {
  runtime: 'edge',
};

// This function is the secure backend endpoint.
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'A chave da API não está configurada no servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ai = new GoogleGenAI({ apiKey });

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

  try {
    const { ingredients } = await req.json();

    if (!ingredients || typeof ingredients !== 'string' || ingredients.trim() === '') {
      return new Response(JSON.stringify({ error: 'Os ingredientes são necessários.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `
      Você é um chef criativo. Com base nos seguintes ingredientes, crie uma receita deliciosa e fácil de seguir.
      Se um ingrediente parecer insuficiente para uma refeição completa (por exemplo, apenas 'sal'), sinta-se à vontade para sugerir uma receita simples que o utilize ou presuma que itens básicos da despensa como óleo, sal, pimenta e água estão disponíveis.
      
      Ingredientes: ${ingredients}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.7,
      },
    });

    // The response.text is a JSON string, which we can pass directly.
    const jsonText = response.text;
    
    return new Response(jsonText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
    return new Response(JSON.stringify({ error: `Falha ao gerar a receita: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
