// Deprecated: Genkit has been removed. This file is kept only to avoid import errors.
// Do not import from this file. Use direct providers under src/ai/flows/* instead.
export const ai = {
  // Any accidental usage will throw clearly at runtime
  generate: async () => {
    throw new Error('Genkit has been removed. Use the direct Gemini SDK instead.');
  },
};
