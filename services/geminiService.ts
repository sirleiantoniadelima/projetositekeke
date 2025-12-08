import { GoogleGenAI } from "@google/genai";
import { AdTheme } from "../types";

/**
 * Função simplificada para capturar a API Key.
 * Tenta ler de todas as fontes possíveis sem burocracia.
 */
const getApiKey = (): string | undefined => {
  let key: string | undefined = undefined;

  // 1. Tenta ambiente Vite (Padrão moderno)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
    }
  } catch (e) {}

  // 2. Se não achou, tenta ambiente Process (Node/Antigo)
  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        key = process.env.VITE_API_KEY || 
              process.env.REACT_APP_API_KEY || 
              process.env.GOOGLE_API_KEY || 
              process.env.API_KEY;
      }
    } catch (e) {}
  }

  return key;
};

/**
 * Uses Gemini 2.5 Flash Image to edit/generate a scene based on the product image.
 */
export const generateAdScene = async (
  base64Image: string,
  narrative: string,
  theme: AdTheme,
  mode: 'generate' | 'edit' = 'generate',
  aspectRatio: string = '1:1'
): Promise<string> => {
  try {
    const apiKey = getApiKey();

    // Se não tiver chave, lançamos um erro simples orientando
    if (!apiKey) {
        throw new Error(
            "Chave de API não encontrada. Verifique se VITE_API_KEY está configurada nas variáveis de ambiente do Netlify."
        );
    }
    
    // REMOVIDA: A validação 'startsWith("AIza")' que estava travando o app.
    // Agora passamos a chave direto para o Google. Se estiver errada, o Google avisará.

    const ai = new GoogleGenAI({ apiKey });

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    let fullPrompt = '';

    if (mode === 'edit') {
       fullPrompt = `
        Generate an edited image.
        You are an expert advertising photographer and image editor.
        Task: Edit the provided image based strictly on the user's instruction.
        
        IMPORTANT: The user may provide instructions in Portuguese. Follow them precisely.
        User Instruction: "${narrative}"
        
        Requirements:
        1. Maintain the high quality and photorealism of the original image.
        2. Apply the requested change (e.g., filter, object removal, addition, lighting change) naturally.
        3. Do not add text to the image itself.
        4. If the user asks to remove something, fill the space naturally (inpainting).
        5. If the user asks to add a filter (e.g. retro, black and white), apply it globally.
      `;
    } else {
      const themeInstruction = getThemeInstruction(theme);
      
      fullPrompt = `
        Generate an image.
        You are an expert advertising photographer and editor.
        Task: Create a stunning product advertisement using the provided product image.
        
        IMPORTANT: The user may provide instructions in Portuguese. Interpret them for the visual context.
        User Narrative/Request: "${narrative}"
        Visual Style: ${themeInstruction}
        
        Instructions:
        1. Keep the main product from the input image clearly visible and central.
        2. CONTEXT AWARENESS: If the narrative implies a person or usage (e.g. "woman holding it", "man wearing it"), generate a realistic human model/avatar interacting with the product naturally.
        3. ENVIRONMENT: Completely transform the background and lighting to match the 'Visual Style' and 'User Narrative'.
        4. OUTPUT QUALITY: Ensure high quality, photorealistic output suitable for social media ads.
        5. Do not add text to the image itself.
        6. COMPOSITION: Ensure the product is the focal point.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: cleanBase64,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio as any, // 1:1, 3:4, 4:3, 9:16, 16:9
        }
      }
    });

    let generatedImageBase64 = '';
    let textOutput = '';
    
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                generatedImageBase64 = part.inlineData.data;
            } else if (part.text) {
                textOutput += part.text;
            }
        }
    }

    if (!generatedImageBase64) {
      if (textOutput) {
         throw new Error(`A IA não gerou a imagem. Resposta: "${textOutput}"`);
      }
      throw new Error("A IA não retornou nenhuma imagem. Tente uma narrativa diferente.");
    }

    return `data:image/png;base64,${generatedImageBase64}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Erro na IA: ${error.message || "Falha desconhecida"}`);
  }
};

const getThemeInstruction = (theme: AdTheme): string => {
  switch (theme) {
    case AdTheme.MINIMAL:
      return "Clean, soft lighting, solid or subtle gradient background, modern shadows, ample whitespace, minimalistic studio.";
    case AdTheme.LUXURY:
      return "Dark moody lighting, gold or marble accents, expensive textures, silk, high contrast, elegant atmosphere.";
    case AdTheme.SUMMER:
      return "Bright sunlight, beach or pool background, blue skies, palm trees, warm saturation, vacation vibes.";
    case AdTheme.FASHION:
      return "Urban street photography style, dynamic angles, concrete textures, trendy outfit context, high fashion editorial.";
    case AdTheme.RETRO:
      return "Vintage film grain, 90s pastel colors, polaroid aesthetic, flash photography look, nostalgic.";
    case AdTheme.FUTURISTIC:
      return "Neon lights, dark tech background, cyber aesthetics, glowing elements, sci-fi atmosphere.";
    default:
      return "Professional studio lighting.";
  }
};