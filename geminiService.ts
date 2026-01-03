
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DecisionInput, DecisionResult, ChatMessage } from "./types";

const SYSTEM_INSTRUCTION = `
You are DECIDO, an AI-powered decision engine. 
You are not a chatbot, not an advisor, and not a motivational assistant. 
Your sole purpose is to evaluate decisions through structured multi-agent reasoning and deliver a clear, justified outcome.

RULES:
1. Never give a single-perspective answer.
2. Never skip reasoning.
3. Never invent missing data. Explicitly state if info is insufficient.
4. Execute every enabled role fully.
5. Output must always be JSON format.
6. Identity: Truth over confidence. Clarity over comfort. Debate before deciding.
7. If Google Search is enabled, use it to find the most recent and accurate data to ground your evaluation.
8. CRITICAL: You must provide all textual content within the JSON response in the REQUESTED LANGUAGE.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    decisionSummary: { type: Type.STRING },
    biasAndAssumptions: {
      type: Type.OBJECT,
      properties: {
        detectedBias: { type: Type.STRING },
        assumptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              strength: { type: Type.STRING, enum: ['Strong', 'Weak', 'Unknown'] }
            },
            required: ['text', 'strength']
          }
        }
      },
      required: ['detectedBias', 'assumptions']
    },
    roleBasedInsights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          insights: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['role', 'insights']
      }
    },
    riskExposure: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        justification: { type: Type.STRING }
      },
      required: ['level', 'justification']
    },
    scenarioOutcomes: {
      type: Type.OBJECT,
      properties: {
        bestCase: { type: Type.STRING },
        worstCase: { type: Type.STRING },
        mostLikely: { type: Type.STRING }
      },
      required: ['bestCase', 'worstCase', 'mostLikely']
    },
    finalVerdict: { type: Type.STRING, enum: ['Proceed', 'Do Not Proceed', 'Proceed With Conditions'] },
    conditions: { type: Type.ARRAY, items: { type: Type.STRING } },
    confidenceScore: {
      type: Type.OBJECT,
      properties: {
        percentage: { type: Type.NUMBER },
        explanation: { type: Type.STRING }
      },
      required: ['percentage', 'explanation']
    },
    whatsMissing: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          info: { type: Type.STRING },
          impact: { type: Type.STRING }
        },
        required: ['info', 'impact']
      }
    },
    overconfidenceCheck: { type: Type.STRING }
  },
  required: ['decisionSummary', 'biasAndAssumptions', 'roleBasedInsights', 'riskExposure', 'scenarioOutcomes', 'finalVerdict', 'confidenceScore', 'whatsMissing']
};

export async function evaluateDecision(input: DecisionInput): Promise<DecisionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const parts: any[] = [
    { text: `Decision Question: ${input.question}` },
    { text: `Context / Background: ${input.context}` },
    { text: `Enabled Roles: ${input.enabledRoles.join(', ')}` },
    { text: `Decision Depth: ${input.depth}` },
    { text: `Explanation Level: ${input.level}` },
    { text: `Constraints: ${input.constraints || 'None specified'}` },
    { text: `OUTPUT LANGUAGE: ${input.language}` }
  ];

  if (input.media) {
    input.media.forEach(m => {
      parts.push({ inlineData: { data: m.data.split(',')[1], mimeType: m.mimeType } });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 32768 },
        tools: [{ googleSearch: {} }]
      },
    });

    const result = JSON.parse(response.text || '{}') as DecisionResult;
    
    // Extract grounding URLs
    const chunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      result.groundingUrls = chunks.map((c: any) => ({
        title: c.web?.title || 'Source',
        uri: c.web?.uri || '#'
      }));
    }

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Evaluation failed. The logic engine was unable to parse the context.");
  }
}

export async function generateDecisionVisual(prompt: string, aspectRatio: string = "16:9"): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A conceptual, professional, symbolic representation of: ${prompt}. Minimalist, futuristic, slate and emerald color palette.` }]
    },
    config: {
      imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : '';
}

export async function generateDecisionVideo(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic conceptual video representing the decision: ${prompt}. Smooth camera movement, slate and emerald tones.`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
}

export async function transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Transcribe the audio accurately. Only return the transcription text." }
      ]
    }
  });
  return response.text || '';
}

export async function generateSpeech(text: string, language: string = 'English'): Promise<Uint8Array> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  // Note: For multi-lingual TTS, we just pass the text. Gemini 2.5 TTS is robust.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `In ${language}, read this neutral summary: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
      }
    }
  });
  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("Audio generation failed");
  
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function chatWithDecido(messages: ChatMessage[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are the conversational interface for DECIDO. You answer questions about reasoning processes, explain decision logic, and help clarify inputs. Be concise, clinical, and objective.",
      history: history as any
    }
  });

  const lastMsg = messages[messages.length - 1].text;
  const response = await chat.sendMessage({ message: lastMsg });
  return response.text || '';
}

export async function fastExplain(concept: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `Briefly explain this decision engine term: ${concept}`
  });
  return response.text || '';
}
